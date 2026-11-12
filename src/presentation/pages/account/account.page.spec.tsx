import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AccountPage } from './account.page';
import { GroupsPage } from './groups.page';

const mockLoadProfile = jest.fn();
const mockLoadGroups = jest.fn();
const mockCreateGroup = jest.fn();
const mockLoadInvitations = jest.fn();
const mockInvite = jest.fn();
const mockRespond = jest.fn();
jest.mock('@/data/services/account-service', () => ({
  loadProfile: () => mockLoadProfile(),
  loadGroups: () => mockLoadGroups(),
  createGroup: (...args: unknown[]) => mockCreateGroup(...args),
  loadGroupInvitations: () => mockLoadInvitations(),
  inviteGroupUser: (...args: unknown[]) => mockInvite(...args),
  respondGroupInvitation: (...args: unknown[]) => mockRespond(...args),
}));

const group = {
  id: 'group-1',
  name: 'Band A',
  description: 'Rehearsal',
  createdAt: '2026-11-12',
  owner: { id: 1, name: 'Ana' },
  canInvite: true,
};

beforeEach(() => {
  jest.resetAllMocks();
  mockLoadProfile.mockResolvedValue({ id: 1, name: 'Ana', username: 'ana', email: 'ana@example.com' });
  mockLoadGroups.mockResolvedValue([group]);
  mockCreateGroup.mockResolvedValue({ ...group, id: 'group-2', name: 'Band B' });
  mockLoadInvitations.mockResolvedValue([]);
  mockInvite.mockResolvedValue(undefined);
  mockRespond.mockResolvedValue(undefined);
});

test('displays the current user information', async () => {
  render(
    <MemoryRouter>
      <AccountPage />
    </MemoryRouter>,
  );
  expect(await screen.findByText('ana@example.com')).toBeInTheDocument();
  expect(screen.getByText('Ana')).toBeInTheDocument();
  expect(screen.getByText('ana')).toBeInTheDocument();
});

test('keeps existing groups when creating another group', async () => {
  render(
    <MemoryRouter>
      <GroupsPage />
    </MemoryRouter>,
  );
  await screen.findByRole('heading', { name: 'Band A' });
  fireEvent.click(screen.getByRole('button', { name: 'Novo grupo' }));
  fireEvent.change(screen.getByRole('textbox', { name: 'Nome' }), { target: { value: ' Band B ' } });
  fireEvent.change(screen.getByRole('textbox', { name: 'Descrição' }), { target: { value: ' Rehearsal ' } });
  fireEvent.click(screen.getByRole('button', { name: 'Criar grupo' }));

  await screen.findByRole('heading', { name: 'Band B' });
  expect(screen.getByRole('heading', { name: 'Band A' })).toBeInTheDocument();
  expect(mockCreateGroup).toHaveBeenCalledWith('Band B', 'Rehearsal');
  expect(screen.queryByRole('form', { name: 'Novo grupo' })).not.toBeInTheDocument();
});

test('preserves the form when group creation fails', async () => {
  mockCreateGroup.mockRejectedValueOnce(new Error('Network'));
  render(
    <MemoryRouter>
      <GroupsPage />
    </MemoryRouter>,
  );
  await screen.findByRole('heading', { name: 'Band A' });
  fireEvent.click(screen.getByRole('button', { name: 'Novo grupo' }));
  fireEvent.change(screen.getByRole('textbox', { name: 'Nome' }), { target: { value: 'Band B' } });
  fireEvent.click(screen.getByRole('button', { name: 'Criar grupo' }));

  expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível criar');
  expect(screen.getByRole('textbox', { name: 'Nome' })).toHaveValue('Band B');
  expect(screen.getByRole('heading', { name: 'Band A' })).toBeInTheDocument();
});

test('lets the group owner invite a user by username', async () => {
  render(
    <MemoryRouter>
      <GroupsPage />
    </MemoryRouter>,
  );
  await screen.findByRole('heading', { name: 'Band A' });
  fireEvent.click(screen.getByRole('button', { name: 'Convidar para Band A' }));
  fireEvent.change(screen.getByRole('textbox', { name: 'Nome de usuário' }), { target: { value: ' beto ' } });
  fireEvent.click(screen.getByRole('button', { name: 'Enviar convite' }));

  expect(await screen.findByRole('status')).toHaveTextContent('Convite enviado para beto.');
  expect(mockInvite).toHaveBeenCalledWith('group-1', 'beto');
  expect(screen.queryByRole('textbox', { name: 'Nome de usuário' })).not.toBeInTheDocument();
});

test('does not offer invitation actions to a nonowner', async () => {
  mockLoadGroups.mockResolvedValue([{ ...group, canInvite: false }]);
  render(
    <MemoryRouter>
      <GroupsPage />
    </MemoryRouter>,
  );
  await screen.findByRole('heading', { name: 'Band A' });
  expect(screen.queryByRole('button', { name: 'Convidar para Band A' })).not.toBeInTheDocument();
});

test('preserves the recipient when sending an invitation fails', async () => {
  mockInvite.mockRejectedValueOnce(new Error('Usuário não encontrado.'));
  render(
    <MemoryRouter>
      <GroupsPage />
    </MemoryRouter>,
  );
  await screen.findByRole('heading', { name: 'Band A' });
  fireEvent.click(screen.getByRole('button', { name: 'Convidar para Band A' }));
  fireEvent.change(screen.getByRole('textbox', { name: 'Nome de usuário' }), { target: { value: 'beto' } });
  fireEvent.click(screen.getByRole('button', { name: 'Enviar convite' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Usuário não encontrado.');
  expect(screen.getByRole('textbox', { name: 'Nome de usuário' })).toHaveValue('beto');
});

test.each([true, false])('responds to an invitation and refreshes groups when accept=%s', async (accept) => {
  mockLoadInvitations.mockResolvedValueOnce([
    {
      id: 'invite-1',
      status: 'pending',
      createdAt: '2026-11-12',
      group: { id: 'group-2', name: 'Band B' },
      inviter: { id: 2, name: 'Beto' },
    },
  ]);
  if (accept)
    mockLoadGroups
      .mockResolvedValueOnce([group])
      .mockResolvedValue([group, { ...group, id: 'group-2', name: 'Band B', canInvite: false }]);
  render(
    <MemoryRouter>
      <GroupsPage />
    </MemoryRouter>,
  );
  const action = await screen.findByRole('button', { name: `${accept ? 'Aceitar' : 'Recusar'} convite para Band B` });
  fireEvent.click(action);

  await waitFor(() => expect(mockLoadGroups).toHaveBeenCalledTimes(2));
  expect(mockRespond).toHaveBeenCalledWith('invite-1', accept);
  await waitFor(() => expect(screen.queryByRole('region', { name: 'Convites recebidos' })).not.toBeInTheDocument());
  if (accept) expect(await screen.findByRole('heading', { name: 'Band B' })).toBeInTheDocument();
  else expect(screen.queryByRole('heading', { name: 'Band B' })).not.toBeInTheDocument();
});
