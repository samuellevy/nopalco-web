import { useState } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { defaultTheme } from '@/presentation/styles/themes/default';
import { SetlistObservations } from './setlist-observations.component';

beforeEach(() => {
  const payload = btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 }));
  localStorage.setItem('account', JSON.stringify({ username: 'ana', access_token: `header.${payload}.signature` }));
});

afterEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});

test('uses the saved server value when reopening editing from the song header', async () => {
  const saved = jest.fn().mockResolvedValue(undefined);
  const ControlledEditor = () => {
    const [observations, setObservations] = useState('Texto antigo');
    const [editing, setEditing] = useState(true);
    return (
      <ThemeProvider theme={defaultTheme}>
        <button onClick={() => setEditing(true)}>Editar pelo cabeçalho</button>
        <SetlistObservations
          observations={observations}
          editing={editing}
          onEditingChange={setEditing}
          showEditButton={false}
          onSave={async (value) => {
            await saved(value);
            setObservations(value.toUpperCase());
          }}
        />
      </ThemeProvider>
    );
  };

  render(<ControlledEditor />);
  fireEvent.change(screen.getByRole('textbox', { name: 'Observações do item' }), {
    target: { value: 'Novo texto\nSegunda linha' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Salvar observações' }));

  await waitFor(() => expect(screen.queryByRole('textbox')).not.toBeInTheDocument());
  expect(saved).toHaveBeenCalledWith('Novo texto\nSegunda linha');
  expect(screen.getByText(/NOVO TEXTO/).textContent).toBe('NOVO TEXTO\nSEGUNDA LINHA');
  fireEvent.click(screen.getByRole('button', { name: 'Editar pelo cabeçalho' }));
  expect(screen.getByRole('textbox', { name: 'Observações do item' })).toHaveValue('NOVO TEXTO\nSEGUNDA LINHA');
});

test('refreshes an idle draft when updated observations arrive', () => {
  const onSave = jest.fn();
  const content = (observations: string, editing: boolean) => (
    <ThemeProvider theme={defaultTheme}>
      <SetlistObservations observations={observations} editing={editing} onSave={onSave} />
    </ThemeProvider>
  );
  const view = render(content('Antigo', false));
  view.rerender(content('Salvo no servidor', false));
  view.rerender(content('Salvo no servidor', true));
  expect(screen.getByRole('textbox', { name: 'Observações do item' })).toHaveValue('Salvo no servidor');
});

test('does not overwrite typing when observations update during editing', () => {
  const onSave = jest.fn();
  const content = (observations: string, editing: boolean) => (
    <ThemeProvider theme={defaultTheme}>
      <SetlistObservations observations={observations} editing={editing} onSave={onSave} />
    </ThemeProvider>
  );
  const view = render(content('Antigo', true));
  fireEvent.change(screen.getByRole('textbox', { name: 'Observações do item' }), { target: { value: 'Rascunho' } });
  view.rerender(content('Atualizado no servidor', true));
  expect(screen.getByRole('textbox', { name: 'Observações do item' })).toHaveValue('Rascunho');

  view.rerender(content('Atualizado no servidor', false));
  view.rerender(content('Atualizado no servidor', true));
  expect(screen.getByRole('textbox', { name: 'Observações do item' })).toHaveValue('Atualizado no servidor');
});

test('preserves the draft when saving fails', async () => {
  render(
    <ThemeProvider theme={defaultTheme}>
      <SetlistObservations observations="Antigo" editing onSave={jest.fn().mockRejectedValue(new Error('Network'))} />
    </ThemeProvider>,
  );
  fireEvent.change(screen.getByRole('textbox', { name: 'Observações do item' }), {
    target: { value: 'Não perder\neste texto' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Salvar observações' }));
  await screen.findByRole('alert');
  expect(screen.getByRole('textbox', { name: 'Observações do item' })).toHaveValue('Não perder\neste texto');
});
