import { useEffect, useState } from 'react';
import { ArrowLeft, Check, Plus, RotateCcw, Users, X, UserPlus, Send } from 'lucide-react';
import { GroupInvitation, UserGroup } from '@/domain/models/user-profile';
import {
  createGroup,
  loadGroups,
  loadGroupInvitations,
  inviteGroupUser,
  respondGroupInvitation,
} from '@/data/services/account-service';
import * as S from './account.styles';

export const GroupsPage = () => {
  const [groups, setGroups] = useState<UserGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [createError, setCreateError] = useState('');
  const [refresh, setRefresh] = useState(0);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [invitations, setInvitations] = useState<GroupInvitation[]>([]);
  const [invitingGroup, setInvitingGroup] = useState<string | null>(null);
  const [username, setUsername] = useState('');
  const [sendingInvite, setSendingInvite] = useState(false);
  const [inviteError, setInviteError] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState('');
  const [responding, setResponding] = useState<string | null>(null);
  const [responseError, setResponseError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setLoadError(false);
    Promise.all([loadGroups(), loadGroupInvitations()]).then(
      ([result, receivedInvitations]) => {
        if (active) {
          setGroups(result);
          setInvitations(receivedInvitations);
          setLoading(false);
        }
      },
      () => {
        if (active) {
          setLoadError(true);
          setLoading(false);
        }
      },
    );
    return () => {
      active = false;
    };
  }, [refresh]);

  const cancel = () => {
    setCreating(false);
    setName('');
    setDescription('');
    setCreateError('');
  };

  const save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (saving || loading || loadError) return;
    if (!name.trim()) {
      setCreateError('Informe o nome do grupo.');
      return;
    }
    setSaving(true);
    setCreateError('');
    try {
      const group = await createGroup(name.trim(), description.trim());
      setGroups((current) =>
        [...current, group].sort((first, second) =>
          first.name.localeCompare(second.name, 'pt-BR', { sensitivity: 'base' }),
        ),
      );
      cancel();
    } catch {
      setCreateError('Não foi possível criar o grupo. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const sendInvitation = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!invitingGroup || !username.trim() || sendingInvite) return;
    setSendingInvite(true);
    setInviteError('');
    try {
      await inviteGroupUser(invitingGroup, username.trim());
      setInviteSuccess(`Convite enviado para ${username.trim()}.`);
      setUsername('');
      setInvitingGroup(null);
    } catch (error) {
      setInviteError(error instanceof Error ? error.message : 'Não foi possível enviar o convite.');
    } finally {
      setSendingInvite(false);
    }
  };

  const respond = async (invitationId: string, accept: boolean) => {
    if (responding) return;
    setResponding(invitationId);
    setResponseError('');
    try {
      await respondGroupInvitation(invitationId, accept);
      setInvitations((current) => current.filter((invitation) => invitation.id !== invitationId));
      setRefresh((current) => current + 1);
    } catch (error) {
      setResponseError(error instanceof Error ? error.message : 'Não foi possível responder ao convite.');
    } finally {
      setResponding(null);
    }
  };

  return (
    <S.Page>
      <S.Back to="/">
        <ArrowLeft size={16} /> Home
      </S.Back>
      <S.Header>
        <S.Title>
          <Users size={24} /> Grupos
        </S.Title>
        {!creating && (
          <S.Action type="button" $primary disabled={loading || loadError} onClick={() => setCreating(true)}>
            <Plus size={18} /> Novo grupo
          </S.Action>
        )}
      </S.Header>
      {creating && (
        <S.Form aria-label="Novo grupo" onSubmit={save}>
          <S.Field>
            Nome
            <input
              autoFocus
              required
              maxLength={100}
              value={name}
              disabled={saving}
              onChange={(event) => setName(event.target.value)}
            />
          </S.Field>
          <S.Field>
            Descrição
            <textarea
              rows={2}
              maxLength={1000}
              value={description}
              disabled={saving}
              onChange={(event) => setDescription(event.target.value)}
            />
          </S.Field>
          {createError && <S.Error role="alert">{createError}</S.Error>}
          <S.Actions>
            <S.Action type="submit" $primary disabled={saving}>
              <Check size={18} /> {saving ? 'Criando...' : 'Criar grupo'}
            </S.Action>
            <S.Action type="button" disabled={saving} onClick={cancel}>
              <X size={18} /> Cancelar
            </S.Action>
          </S.Actions>
        </S.Form>
      )}
      {loading && <S.Status role="status">Carregando grupos...</S.Status>}
      {loadError && (
        <>
          <S.Error role="alert">Não foi possível carregar os grupos.</S.Error>
          <S.Action type="button" onClick={() => setRefresh((current) => current + 1)}>
            <RotateCcw size={16} /> Tentar novamente
          </S.Action>
        </>
      )}
      {!loading && !loadError && (
        <>
          {responseError && <S.Error role="alert">{responseError}</S.Error>}
          {invitations.length > 0 && (
            <section aria-label="Convites recebidos">
              <S.SectionTitle>Convites recebidos</S.SectionTitle>
              <S.Groups>
                {invitations.map((invitation) => (
                  <li key={invitation.id}>
                    <h2>{invitation.group.name}</h2>
                    <p>Convidado por {invitation.inviter.name}</p>
                    <S.Actions>
                      <S.Action
                        type="button"
                        $primary
                        disabled={!!responding}
                        aria-label={`Aceitar convite para ${invitation.group.name}`}
                        onClick={() => respond(invitation.id, true)}
                      >
                        <Check size={18} /> Aceitar
                      </S.Action>
                      <S.Action
                        type="button"
                        disabled={!!responding}
                        aria-label={`Recusar convite para ${invitation.group.name}`}
                        onClick={() => respond(invitation.id, false)}
                      >
                        <X size={18} /> Recusar
                      </S.Action>
                    </S.Actions>
                  </li>
                ))}
              </S.Groups>
            </section>
          )}
          {inviteSuccess && <S.Success role="status">{inviteSuccess}</S.Success>}
          {!groups.length && <S.Status>Nenhum grupo.</S.Status>}
          <S.Groups aria-label="Seus grupos">
            {groups.map((group) => (
              <li key={group.id}>
                <S.GroupHeader>
                  <h2>{group.name}</h2>
                  {group.canInvite && (
                    <S.Action
                      type="button"
                      title="Convidar usuário"
                      aria-label={`Convidar para ${group.name}`}
                      disabled={sendingInvite}
                      onClick={() => {
                        setInvitingGroup(group.id);
                        setUsername('');
                        setInviteError('');
                        setInviteSuccess('');
                      }}
                    >
                      <UserPlus size={18} /> Convidar
                    </S.Action>
                  )}
                </S.GroupHeader>
                {group.description && <p>{group.description}</p>}
                <small>Criado por {group.owner.name}</small>
                {invitingGroup === group.id && (
                  <S.Form aria-label={`Convidar para ${group.name}`} onSubmit={sendInvitation}>
                    <S.Field>
                      Nome de usuário
                      <input
                        autoFocus
                        required
                        maxLength={100}
                        autoComplete="off"
                        autoCapitalize="none"
                        spellCheck={false}
                        value={username}
                        disabled={sendingInvite}
                        onChange={(event) => setUsername(event.target.value)}
                      />
                    </S.Field>
                    {inviteError && <S.Error role="alert">{inviteError}</S.Error>}
                    <S.Actions>
                      <S.Action type="submit" $primary disabled={sendingInvite || !username.trim()}>
                        <Send size={18} /> {sendingInvite ? 'Enviando...' : 'Enviar convite'}
                      </S.Action>
                      <S.Action
                        type="button"
                        disabled={sendingInvite}
                        onClick={() => {
                          setInvitingGroup(null);
                          setInviteError('');
                        }}
                      >
                        <X size={18} /> Cancelar
                      </S.Action>
                    </S.Actions>
                  </S.Form>
                )}
              </li>
            ))}
          </S.Groups>
        </>
      )}
    </S.Page>
  );
};
