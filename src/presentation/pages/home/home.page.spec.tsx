import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { defaultTheme } from '@/presentation/styles/themes/default';
import { Setlist } from '@/domain/models/setlist';
import { RemoteLoadAllSetlistsRequest } from '@/data/usecases/setlists/remote-load-all-setlists-request';
import { HomePage } from './home.page';

const mockSession = {
  isAuthenticated: true,
  account: { username: 'ana', name: 'Ana', type: 'admin' as 'admin' | 'user' | undefined },
};
jest.mock('@/main/config/session', () => ({ useSession: () => mockSession, clearAccount: jest.fn() }));
jest.mock('@/presentation/components/modal-song-list/modal-song-list.component', () => ({
  ModalSongsListComponent: () => null,
}));

const own: Setlist = {
  id: 'mine',
  name: 'Meu evento',
  description: '',
  address: 'Local',
  items: [],
  groupId: 'group-1',
  group: { id: 'group-1', name: 'Minha banda' },
};
const other: Setlist = {
  ...own,
  id: 'other',
  name: 'Outro evento',
  groupId: 'group-2',
  group: { id: 'group-2', name: 'Outra banda' },
};
const ungrouped: Setlist = { ...own, id: 'ungrouped', name: 'Evento sem grupo', groupId: null, group: null };

const renderHome = () => {
  const execute = jest.fn().mockImplementation(async (all: boolean) => (all ? [own, other, ungrouped] : [own]));
  const props = { loadAllSetlistsRequest: { execute }, loadAllSongsRequest: { execute: jest.fn() } };
  const page = () => (
    <MemoryRouter>
      <ThemeProvider theme={defaultTheme}>
        <HomePage {...props} />
      </ThemeProvider>
    </MemoryRouter>
  );
  return { ...render(page()), page, execute };
};

beforeEach(() => {
  mockSession.isAuthenticated = true;
  mockSession.account.type = 'admin';
  window.env = { API: 'http://api.test' };
});

test('defaults to the current groups and toggles all setlists including ungrouped', async () => {
  const { execute } = renderHome();
  await screen.findByRole('heading', { name: 'Meu evento' });
  const flag = screen.getByRole('checkbox', { name: 'Todos os setlists' });
  expect(flag).not.toBeChecked();
  expect(execute).toHaveBeenLastCalledWith(false);
  expect(screen.queryByRole('heading', { name: 'Outro evento' })).not.toBeInTheDocument();

  fireEvent.click(flag);
  await screen.findByRole('heading', { name: 'Evento sem grupo' });
  expect(screen.getByRole('heading', { name: 'Outro evento' })).toBeInTheDocument();
  expect(execute).toHaveBeenLastCalledWith(true);

  fireEvent.click(flag);
  await screen.findByRole('heading', { name: 'Meu evento' });
  expect(execute).toHaveBeenLastCalledWith(false);
  expect(screen.queryByRole('heading', { name: 'Evento sem grupo' })).not.toBeInTheDocument();
});

test('does not request the authenticated listing for a visitor', () => {
  mockSession.isAuthenticated = false;
  const { execute } = renderHome();
  expect(execute).not.toHaveBeenCalled();
  expect(screen.queryByRole('checkbox', { name: 'Todos os setlists' })).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
});

test.each(['user', undefined] as const)('does not offer all setlists for type %s', async (type) => {
  mockSession.account.type = type;
  const { execute } = renderHome();
  await screen.findByRole('heading', { name: 'Meu evento' });
  expect(screen.queryByRole('checkbox', { name: 'Todos os setlists' })).not.toBeInTheDocument();
  expect(execute).toHaveBeenLastCalledWith(false);
});

test('clears all mode when the account loses admin permissions', async () => {
  const view = renderHome();
  await screen.findByRole('heading', { name: 'Meu evento' });
  fireEvent.click(screen.getByRole('checkbox', { name: 'Todos os setlists' }));
  await screen.findByRole('heading', { name: 'Outro evento' });

  mockSession.account.type = 'user';
  view.rerender(view.page());

  await waitFor(() => expect(view.execute).toHaveBeenLastCalledWith(false));
  expect(screen.queryByRole('checkbox', { name: 'Todos os setlists' })).not.toBeInTheDocument();
  expect(screen.queryByRole('heading', { name: 'Outro evento' })).not.toBeInTheDocument();
});

test('clears previously loaded results when signing out', async () => {
  const view = renderHome();
  await screen.findByRole('heading', { name: 'Meu evento' });
  fireEvent.click(screen.getByRole('checkbox', { name: 'Todos os setlists' }));
  await screen.findByRole('heading', { name: 'Outro evento' });

  mockSession.isAuthenticated = false;
  view.rerender(view.page());

  await waitFor(() => expect(screen.queryByRole('heading', { name: 'Meu evento' })).not.toBeInTheDocument());
  expect(screen.queryByRole('heading', { name: 'Outro evento' })).not.toBeInTheDocument();
});

test('sends all=true only when requested', async () => {
  const request = jest.fn().mockResolvedValue({ statusCode: 200, body: [] });
  const service = new RemoteLoadAllSetlistsRequest({ request });
  await service.execute();
  expect(request).toHaveBeenLastCalledWith({ url: 'http://api.test/setlists', method: 'get' });
  await service.execute(true);
  expect(request).toHaveBeenLastCalledWith({ url: 'http://api.test/setlists', method: 'get', params: { all: true } });
});
