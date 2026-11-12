import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { SongConversation } from './song-conversation.component';

const mockRequest = jest.fn();
jest.mock('@/infra/http/axios-http-client/axios-http-client', () => ({
  AxiosHttpClient: jest.fn().mockImplementation(() => ({ request: (...args: unknown[]) => mockRequest(...args) })),
}));

const message = {
  id: 'message-1',
  userId: 'user-1',
  author: 'ana',
  text: 'Entrar no refrão\n<script>alert(1)</script>',
  createdAt: '2026-11-12T18:00:00Z',
};

const renderConversation = () =>
  render(
    <MemoryRouter>
      <SongConversation songId="song-1" />
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

test('allows visitors to read plain text but does not offer a message input', async () => {
  const { container } = renderConversation();
  await screen.findByText('ana');

  expect(screen.getByText(/Entrar no refrão/)).toHaveTextContent('<script>alert(1)</script>');
  expect(container.querySelector('script')).toBeNull();
  expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Entrar para enviar' })).toBeInTheDocument();
  expect(mockRequest).toHaveBeenCalledWith({ url: 'http://api.test/songs/song-1/conversation', method: 'get' });
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
    body: { text: 'Nova orientação' },
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
