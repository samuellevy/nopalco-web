import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, RotateCcw, Send, X } from 'lucide-react';
import { SongConversationMessage } from '@/domain/models/song';
import { AxiosHttpClient } from '@/infra/http/axios-http-client/axios-http-client';
import { getAccessToken, useSession } from '@/main/config/session';
import * as S from './song-conversation.styles';
import { SetlistGroupSelect } from '@/presentation/components/setlist-group-select/setlist-group-select.component';

const httpClient = new AxiosHttpClient();

export const SongConversation = ({
  songId,
  groupId,
  groupName,
}: {
  songId: string;
  groupId?: string | null;
  groupName?: string;
}) => {
  const navigate = useNavigate();
  const { isAuthenticated, account } = useSession();
  const [selectedGroup, setSelectedGroup] = useState<{ username: string; id: string | null } | null>(null);
  const activeGroupId = groupId || (selectedGroup?.username === account?.username ? selectedGroup?.id : null);

  if (!isAuthenticated)
    return (
      <S.Conversation aria-label="Orientações da música">
        <S.Action
          type="button"
          onClick={() => navigate('/login', { state: { from: window.location.pathname + window.location.search } })}
        >
          <LogIn size={16} /> Entrar para acessar orientações
        </S.Action>
      </S.Conversation>
    );

  return (
    <S.Conversation aria-label="Orientações da música">
      {groupId ? (
        <S.Status>{groupName || 'Grupo do setlist'}</S.Status>
      ) : (
        <SetlistGroupSelect
          key={account?.username}
          label="Grupo das orientações"
          value={activeGroupId || null}
          onChange={(id) => setSelectedGroup({ username: account?.username || '', id })}
        />
      )}
      {activeGroupId ? (
        <GroupConversation
          key={`${songId}:${activeGroupId}:${account?.username}`}
          songId={songId}
          groupId={activeGroupId}
        />
      ) : (
        <S.Status>Nenhum grupo selecionado.</S.Status>
      )}
    </S.Conversation>
  );
};

const GroupConversation = ({ songId, groupId }: { songId: string; groupId: string }) => {
  const navigate = useNavigate();
  const { isAuthenticated, account } = useSession();
  const [messages, setMessages] = useState<SongConversationMessage[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [sendError, setSendError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState('');
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setLoadError('');
    httpClient
      .request({ url: `${window.env.API}/songs/${songId}/conversation`, method: 'get', params: { groupId } })
      .then(
        (response) => {
          if (!active) return;
          if (response.statusCode !== 200 || !Array.isArray(response.body)) {
            setLoadError(
              response.statusCode === 403
                ? 'Você não participa deste grupo.'
                : 'Não foi possível carregar as orientações.',
            );
          } else {
            setMessages(response.body.filter((message: SongConversationMessage) => message.groupId === groupId));
          }
          setLoading(false);
        },
        () => {
          if (active) {
            setLoadError('Não foi possível carregar as orientações.');
            setLoading(false);
          }
        },
      );
    return () => {
      active = false;
    };
  }, [songId, groupId, refresh]);

  const login = () => navigate('/login', { state: { from: window.location.pathname + window.location.search } });

  const send = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!getAccessToken()) {
      login();
      return;
    }
    if (!text.trim() || sending || loading || loadError) return;
    setSending(true);
    setSendError('');
    try {
      const response = await httpClient.request({
        url: `${window.env.API}/songs/${songId}/conversation`,
        method: 'post',
        body: { text: text.trim(), groupId },
      });
      if (response.statusCode !== 201 || response.body?.groupId !== groupId) throw new Error('Message not saved');
      setMessages((current) => [...current, response.body]);
      setText('');
    } catch {
      setSendError('Não foi possível enviar a mensagem. Tente novamente.');
    } finally {
      setSending(false);
    }
  };

  const deleteMessage = async (messageId: string) => {
    if (!getAccessToken()) {
      login();
      return;
    }
    if (deletingId) return;
    setDeletingId(messageId);
    setDeleteError('');
    try {
      const response = await httpClient.request({
        url: `${window.env.API}/songs/${encodeURIComponent(songId)}/conversation/${encodeURIComponent(messageId)}`,
        method: 'delete',
        params: { groupId },
      });
      if (response.statusCode !== 204) throw new Error('Message not deleted');
      setMessages((current) => current.filter((message) => message.id !== messageId));
    } catch {
      setDeleteError('Não foi possível excluir a mensagem. Tente novamente.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <S.History>
      {loading && <S.Status role="status">Carregando orientações...</S.Status>}
      {loadError && (
        <>
          <S.Error role="alert">{loadError}</S.Error>
          <S.Action type="button" onClick={() => setRefresh((current) => current + 1)}>
            <RotateCcw size={16} /> Tentar novamente
          </S.Action>
        </>
      )}
      {!loading && !loadError && (
        <>
          {deleteError && <S.Error role="alert">{deleteError}</S.Error>}
          {!messages.length && <S.Status>Nenhuma orientação.</S.Status>}
          <S.Messages role="log" aria-label="Mensagens de orientações" aria-live="polite">
            {messages.map((message) => (
              <S.Message key={message.id} $own={account?.username === message.author} $deletable={!!message.canDelete}>
                {message.canDelete && (
                  <S.DeleteMessageButton
                    type="button"
                    title="Excluir mensagem"
                    aria-label={`Excluir mensagem de ${message.author}`}
                    aria-busy={deletingId === message.id}
                    disabled={!!deletingId}
                    onClick={() => deleteMessage(message.id)}
                  >
                    <X size={16} aria-hidden="true" />
                  </S.DeleteMessageButton>
                )}
                <S.MessageHeader>
                  <S.Author>{message.author}</S.Author>
                  <time dateTime={message.createdAt}>
                    {new Date(message.createdAt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                  </time>
                </S.MessageHeader>
                <S.Text>{message.text}</S.Text>
              </S.Message>
            ))}
          </S.Messages>
        </>
      )}
      {isAuthenticated ? (
        <S.Composer onSubmit={send}>
          <S.Input
            aria-label="Mensagem de orientação"
            placeholder="Orientação"
            rows={3}
            maxLength={4000}
            value={text}
            disabled={sending}
            onChange={(event) => setText(event.target.value)}
          />
          {sendError && <S.Error role="alert">{sendError}</S.Error>}
          <S.Action type="submit" disabled={!text.trim() || sending || loading || !!loadError}>
            <Send size={16} /> {sending ? 'Enviando...' : 'Enviar'}
          </S.Action>
        </S.Composer>
      ) : (
        <S.Action type="button" onClick={login}>
          <LogIn size={16} /> Entrar para enviar
        </S.Action>
      )}
    </S.History>
  );
};
