import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, RotateCcw, Send } from 'lucide-react';
import { SongConversationMessage } from '@/domain/models/song';
import { AxiosHttpClient } from '@/infra/http/axios-http-client/axios-http-client';
import { getAccessToken, useSession } from '@/main/config/session';
import * as S from './song-conversation.styles';

const httpClient = new AxiosHttpClient();

export const SongConversation = ({ songId }: { songId: string }) => {
  const navigate = useNavigate();
  const { isAuthenticated, account } = useSession();
  const [messages, setMessages] = useState<SongConversationMessage[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [sendError, setSendError] = useState('');
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setLoadError('');
    httpClient.request({ url: `${window.env.API}/songs/${songId}/conversation`, method: 'get' }).then(
      (response) => {
        if (!active) return;
        if (response.statusCode !== 200 || !Array.isArray(response.body)) {
          setLoadError('Não foi possível carregar as orientações.');
        } else {
          setMessages(response.body);
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
  }, [songId, refresh]);

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
        body: { text: text.trim() },
      });
      if (response.statusCode !== 201) throw new Error('Message not saved');
      setMessages((current) => [...current, response.body]);
      setText('');
    } catch {
      setSendError('Não foi possível enviar a mensagem. Tente novamente.');
    } finally {
      setSending(false);
    }
  };

  return (
    <S.Conversation aria-label="Orientações da música">
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
          {!messages.length && <S.Status>Nenhuma orientação.</S.Status>}
          <S.Messages role="log" aria-label="Mensagens de orientações" aria-live="polite">
            {messages.map((message) => (
              <S.Message key={message.id} $own={account?.username === message.author}>
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
    </S.Conversation>
  );
};
