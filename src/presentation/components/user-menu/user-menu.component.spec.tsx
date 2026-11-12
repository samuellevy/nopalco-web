import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { UserMenu } from './user-menu.component';

const mockSession = { isAuthenticated: true, account: { name: 'Ana', username: 'ana' } };
const mockClearAccount = jest.fn();
jest.mock('@/main/config/session', () => ({ useSession: () => mockSession, clearAccount: () => mockClearAccount() }));

beforeEach(() => {
  mockSession.isAuthenticated = true;
  mockClearAccount.mockClear();
});

test('only displays the account menu when signed in', () => {
  mockSession.isAuthenticated = false;
  render(
    <MemoryRouter>
      <UserMenu />
    </MemoryRouter>,
  );
  expect(screen.queryByRole('button', { name: 'Menu do usuário' })).not.toBeInTheDocument();
});

test('opens profile and groups links and supports keyboard navigation', () => {
  render(
    <MemoryRouter>
      <UserMenu />
    </MemoryRouter>,
  );
  const trigger = screen.getByRole('button', { name: 'Menu do usuário' });
  fireEvent.click(trigger);
  const profile = screen.getByRole('menuitem', { name: 'Informações do usuário' });
  const groups = screen.getByRole('menuitem', { name: 'Grupos' });
  expect(profile).toHaveAttribute('href', '/account');
  expect(groups).toHaveAttribute('href', '/groups');
  expect(profile).toHaveFocus();
  fireEvent.keyDown(document, { key: 'ArrowDown' });
  expect(groups).toHaveFocus();
  fireEvent.keyDown(document, { key: 'ArrowDown' });
  expect(screen.getByRole('menuitem', { name: 'Sair da conta' })).toHaveFocus();
  fireEvent.keyDown(document, { key: 'Escape' });
  expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  expect(trigger).toHaveFocus();
});

test('dismisses the menu when clicking outside', () => {
  render(
    <MemoryRouter>
      <UserMenu />
    </MemoryRouter>,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Menu do usuário' }));
  fireEvent.mouseDown(document.body);
  expect(screen.queryByRole('menu')).not.toBeInTheDocument();
});

test('offers login inline for visitors without a separate header', () => {
  mockSession.isAuthenticated = false;
  const { container } = render(
    <MemoryRouter>
      <UserMenu inline />
    </MemoryRouter>,
  );
  expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
  expect(container.querySelector('header')).toBeNull();
});

test('opens the complete account menu inline without another header', () => {
  const { container } = render(
    <MemoryRouter>
      <UserMenu inline />
    </MemoryRouter>,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Menu do usuário' }));
  expect(screen.getByRole('menuitem', { name: 'Informações do usuário' })).toBeInTheDocument();
  expect(screen.getByRole('menuitem', { name: 'Grupos' })).toBeInTheDocument();
  expect(screen.getByRole('menuitem', { name: 'Sair da conta' })).toBeInTheDocument();
  expect(container.querySelector('header')).toBeNull();
});

test('places logout after groups, clears the session and returns home', () => {
  render(
    <MemoryRouter initialEntries={['/groups']}>
      <UserMenu />
      <Routes>
        <Route path="/groups" element={<h1>Groups page</h1>} />
        <Route path="/" element={<h1>Home page</h1>} />
      </Routes>
    </MemoryRouter>,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Menu do usuário' }));
  expect(screen.getAllByRole('menuitem').map((item) => item.textContent?.trim())).toEqual([
    'Informações do usuário',
    'Grupos',
    'Sair da conta',
  ]);
  fireEvent.click(screen.getByRole('menuitem', { name: 'Sair da conta' }));
  expect(mockClearAccount).toHaveBeenCalledTimes(1);
  expect(screen.getByRole('heading', { name: 'Home page' })).toBeInTheDocument();
  expect(screen.queryByRole('menu')).not.toBeInTheDocument();
});
