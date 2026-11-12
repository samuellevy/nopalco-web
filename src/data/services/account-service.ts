import { AxiosHttpClient } from '@/infra/http/axios-http-client/axios-http-client';
import { GroupInvitation, UserGroup, UserProfile } from '@/domain/models/user-profile';

const client = new AxiosHttpClient();

export const loadProfile = async (): Promise<UserProfile> => {
  const response = await client.request({ url: `${window.env.API}/auth/me`, method: 'get' });
  if (response.statusCode !== 200 || !response.body?.id) throw new Error('Não foi possível carregar o perfil.');
  return response.body;
};

export const loadGroups = async (): Promise<UserGroup[]> => {
  const response = await client.request({ url: `${window.env.API}/groups`, method: 'get' });
  if (response.statusCode !== 200 || !Array.isArray(response.body))
    throw new Error('Não foi possível carregar os grupos.');
  return response.body;
};

export const createGroup = async (name: string, description: string): Promise<UserGroup> => {
  const response = await client.request({
    url: `${window.env.API}/groups`,
    method: 'post',
    body: { name, description },
  });
  if (response.statusCode !== 201 || !response.body?.id) throw new Error('Não foi possível criar o grupo.');
  return response.body;
};

export const loadGroupInvitations = async (): Promise<GroupInvitation[]> => {
  const response = await client.request({ url: `${window.env.API}/groups/invitations`, method: 'get' });
  if (response.statusCode !== 200 || !Array.isArray(response.body))
    throw new Error('Não foi possível carregar os convites.');
  return response.body;
};

export const inviteGroupUser = async (groupId: string, username: string): Promise<void> => {
  const response = await client.request({
    url: `${window.env.API}/groups/${encodeURIComponent(groupId)}/invitations`,
    method: 'post',
    body: { username },
  });
  if (response.statusCode !== 201) {
    throw new Error(
      typeof response.body?.message === 'string' ? response.body.message : 'Não foi possível enviar o convite.',
    );
  }
};

export const respondGroupInvitation = async (invitationId: string, accept: boolean): Promise<void> => {
  const response = await client.request({
    url: `${window.env.API}/groups/invitations/${encodeURIComponent(invitationId)}/respond`,
    method: 'post',
    body: { accept },
  });
  if (response.statusCode !== 201) {
    throw new Error(
      typeof response.body?.message === 'string' ? response.body.message : 'Não foi possível responder ao convite.',
    );
  }
};
