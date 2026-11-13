import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { SongConversation } from './song-conversation.component';

const mockRequest = jest.fn();
jest.mock('@/infra/http/axios-http-client/axios-http-client', () => ({
  AxiosHttpClient: jest.fn().mockImplementation(() => ({ request: (...args: unknown[]) => mockRequest(...args) })),
}));

const message = {
  id: 'message-1',
  groupId: 'group-1',
  canDelete: true,
  userId: 'user-1',
  author: 'ana',
  text: 'Entrar no refrão\n<script>alert(1)</script>',
  createdAt: '2026-11-12T18:00:00Z',
};

const renderConversation = () =>
  render(
    <MemoryRouter>
      <SongConversation songId="song-1" groupId="group-1" groupName="Band A" />
    </MemoryRouter>,
  );

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  window.env = { API: 'http://api.test' };
  mockRequest.mockReset();
  mockRequest.mockResolvedValue({ statusCode: 200, body: [message] });
});

afterEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});

const login = () => {
  const payload = btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 }));
  localStorage.setItem('account', JSON.stringify({ username: 'ana', access_token: `header.${payload}.signature` }));
};

test('requires authentication before reading private group messages', () => {
  renderConversation();
  expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Entrar para acessar orientações' })).toBeInTheDocument();
  expect(mockRequest).not.toHaveBeenCalled();
});

test('shows group messages as plain text without executing HTML', async () => {
  login();
  const { container } = renderConversation();
  await screen.findByText('ana');

  expect(screen.getByText(/Entrar no refrão/)).toHaveTextContent('<script>alert(1)</script>');
  expect(container.querySelector('script')).toBeNull();
  expect(mockRequest).toHaveBeenCalledWith({
    url: 'http://api.test/songs/song-1/conversation',
    method: 'get',
    params: { groupId: 'group-1' },
  });
});

test('sends only text and appends the server-assigned author and ID', async () => {
  login();
  mockRequest.mockResolvedValueOnce({ statusCode: 200, body: [] });
  mockRequest.mockResolvedValueOnce({ statusCode: 201, body: { ...message, text: 'Nova orientação' } });
  renderConversation();
  await screen.findByText('Nenhuma orientação.');
  const input = screen.getByRole('textbox', { name: 'Mensagem de orientação' });
  fireEvent.change(input, { target: { value: '  Nova orientação  ' } });
  fireEvent.click(screen.getByRole('button', { name: 'Enviar' }));

  await screen.findByText('Nova orientação');
  expect(mockRequest).toHaveBeenLastCalledWith({
    url: 'http://api.test/songs/song-1/conversation',
    method: 'post',
    body: { text: 'Nova orientação', groupId: 'group-1' },
  });
  expect(input).toHaveValue('');
});

test('preserves the message after a failed send and rejects blank text', async () => {
  login();
  mockRequest.mockResolvedValueOnce({ statusCode: 200, body: [] });
  mockRequest.mockResolvedValueOnce({ statusCode: 500 });
  renderConversation();
  await screen.findByText('Nenhuma orientação.');
  const input = screen.getByRole('textbox', { name: 'Mensagem de orientação' });
  fireEvent.change(input, { target: { value: '   ' } });
  expect(screen.getByRole('button', { name: 'Enviar' })).toBeDisabled();
  fireEvent.change(input, { target: { value: 'Não perder esta mensagem' } });
  fireEvent.click(screen.getByRole('button', { name: 'Enviar' }));

  await screen.findByRole('alert');
  expect(input).toHaveValue('Não perder esta mensagem');
  await waitFor(() => expect(screen.getByRole('button', { name: 'Enviar' })).toBeEnabled());
});

test('deletes an authorized message and immediately updates the conversation', async () => {
  login();
  mockRequest.mockResolvedValueOnce({ statusCode: 200, body: [message] });
  mockRequest.mockResolvedValueOnce({ statusCode: 204 });
  renderConversation();
  const remove = await screen.findByRole('button', { name: 'Excluir mensagem de ana' });
  fireEvent.click(remove);

  await screen.findByText('Nenhuma orientação.');
  expect(screen.queryByText(/Entrar no refrão/)).not.toBeInTheDocument();
  expect(mockRequest).toHaveBeenLastCalledWith({
    url: 'http://api.test/songs/song-1/conversation/message-1',
    method: 'delete',
    params: { groupId: 'group-1' },
  });
});

test('keeps the message and offers retry if deletion fails', async () => {
  login();
  mockRequest.mockResolvedValueOnce({ statusCode: 200, body: [message] });
  mockRequest.mockResolvedValueOnce({ statusCode: 500 });
  renderConversation();
  fireEvent.click(await screen.findByRole('button', { name: 'Excluir mensagem de ana' }));

  expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível excluir');
  expect(screen.getByText(/Entrar no refrão/)).toBeInTheDocument();
  await waitFor(() => expect(screen.getByRole('button', { name: 'Excluir mensagem de ana' })).toBeEnabled());
});

test('does not render a deletion button without server permission', async () => {
  login();
  mockRequest.mockResolvedValueOnce({ statusCode: 200, body: [{ ...message, canDelete: false }] });
  renderConversation();
  await screen.findByText('ana');
  expect(screen.queryByRole('button', { name: 'Excluir mensagem de ana' })).not.toBeInTheDocument();
});
