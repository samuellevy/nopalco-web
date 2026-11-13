import { useState } from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { Editor } from '@tiptap/core';
import { ThemeProvider } from 'styled-components';
import { defaultTheme } from '@/presentation/styles/themes/default';
import { SetlistObservations } from './setlist-observations.component';
import { readObservationsDocument } from './observations-document';

const getEditor = () =>
  (screen.getByRole('textbox', { name: 'Observações do item' }) as HTMLElement & { editor: Editor }).editor;
const writeText = (value: string) =>
  act(() => {
    getEditor().commands.setContent(readObservationsDocument(value), true);
  });

beforeAll(() => {
  Object.defineProperty(Range.prototype, 'getBoundingClientRect', { configurable: true, value: () => new DOMRect() });
  Object.defineProperty(Range.prototype, 'getClientRects', { configurable: true, value: () => [] });
});

beforeEach(() => {
  jest.spyOn(window, 'requestAnimationFrame').mockImplementation(() => 0);
  const payload = btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 }));
  localStorage.setItem('account', JSON.stringify({ username: 'ana', access_token: `header.${payload}.signature` }));
});

afterEach(() => {
  jest.restoreAllMocks();
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
            setObservations('NOVO TEXTO\nSEGUNDA LINHA');
          }}
        />
      </ThemeProvider>
    );
  };

  render(<ControlledEditor />);
  writeText('Novo texto\nSegunda linha');
  fireEvent.click(screen.getByRole('button', { name: 'Salvar observações' }));

  await waitFor(() => expect(screen.queryByRole('textbox')).not.toBeInTheDocument());
  expect(readObservationsDocument(saved.mock.calls[0][0])).toEqual(
    readObservationsDocument('Novo texto\nSegunda linha'),
  );
  expect(screen.getByText('NOVO TEXTO')).toBeInTheDocument();
  expect(screen.getByText('SEGUNDA LINHA')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Editar pelo cabeçalho' }));
  expect(getEditor().getText({ blockSeparator: '\n' })).toBe('NOVO TEXTO\nSEGUNDA LINHA');
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
  expect(getEditor().getText()).toBe('Salvo no servidor');
});

test('does not overwrite typing when observations update during editing', () => {
  const onSave = jest.fn();
  const content = (observations: string, editing: boolean) => (
    <ThemeProvider theme={defaultTheme}>
      <SetlistObservations observations={observations} editing={editing} onSave={onSave} />
    </ThemeProvider>
  );
  const view = render(content('Antigo', true));
  writeText('Rascunho');
  view.rerender(content('Atualizado no servidor', true));
  expect(getEditor().getText()).toBe('Rascunho');

  view.rerender(content('Atualizado no servidor', false));
  view.rerender(content('Atualizado no servidor', true));
  expect(getEditor().getText()).toBe('Atualizado no servidor');
});

test('preserves the draft when saving fails', async () => {
  render(
    <ThemeProvider theme={defaultTheme}>
      <SetlistObservations observations="Antigo" editing onSave={jest.fn().mockRejectedValue(new Error('Network'))} />
    </ThemeProvider>,
  );
  writeText('Não perder\neste texto');
  fireEvent.click(screen.getByRole('button', { name: 'Salvar observações' }));
  await screen.findByRole('alert');
  expect(getEditor().getText({ blockSeparator: '\n' })).toBe('Não perder\neste texto');
});

test('saves bold formatting and displays it again without raw HTML', async () => {
  const saved = jest.fn().mockResolvedValue(undefined);
  const content = (observations: string, editing: boolean) => (
    <ThemeProvider theme={defaultTheme}>
      <SetlistObservations observations={observations} editing={editing} onSave={saved} />
    </ThemeProvider>
  );
  const view = render(content('Texto importante', true));
  act(() => {
    getEditor().commands.setTextSelection({ from: 1, to: 6 });
  });
  fireEvent.click(screen.getByRole('button', { name: 'Negrito' }));
  expect(screen.getByRole('button', { name: 'Negrito' })).toHaveAttribute('aria-pressed', 'true');
  fireEvent.click(screen.getByRole('button', { name: 'Salvar observações' }));
  await waitFor(() => expect(saved).toHaveBeenCalledTimes(1));
  const document = readObservationsDocument(saved.mock.calls[0][0]);
  expect(document.content?.[0].content?.[0]).toEqual({ type: 'text', text: 'Texto', marks: [{ type: 'bold' }] });

  view.rerender(content(saved.mock.calls[0][0], false));
  expect(view.container.querySelector('strong')).toHaveTextContent('Texto');
  expect(screen.queryByRole('toolbar')).not.toBeInTheDocument();
});

test('offers italic, underline, lists and history controls and preserves single Enter', () => {
  render(
    <ThemeProvider theme={defaultTheme}>
      <SetlistObservations observations="Primeira linha" editing onSave={jest.fn()} />
    </ThemeProvider>,
  );
  for (const name of [
    'Itálico',
    'Sublinhado',
    'Tachado',
    'Lista com marcadores',
    'Lista numerada',
    'Desfazer',
    'Refazer',
  ]) {
    expect(screen.getByRole('button', { name })).toBeInTheDocument();
  }
  act(() => {
    getEditor().commands.setTextSelection(getEditor().state.doc.content.size - 1);
  });
  fireEvent.keyDown(screen.getByRole('textbox', { name: 'Observações do item' }), {
    key: 'Enter',
    code: 'Enter',
    keyCode: 13,
  });
  expect(getEditor().getJSON().content).toHaveLength(2);
  fireEvent.click(screen.getByRole('button', { name: 'Lista com marcadores' }));
  expect(getEditor().isActive('bulletList')).toBe(true);
});

test('saves a quote and preserves its indentation when viewing and editing again', async () => {
  const saved = jest.fn().mockResolvedValue(undefined);
  const content = (observations: string, editing: boolean) => (
    <ThemeProvider theme={defaultTheme}>
      <SetlistObservations observations={observations} editing={editing} onSave={saved} />
    </ThemeProvider>
  );
  const view = render(content('Trecho recuado', true));
  fireEvent.click(screen.getByRole('button', { name: 'Citação / recuo' }));
  expect(getEditor().isActive('blockquote')).toBe(true);
  expect(screen.getByRole('button', { name: 'Citação / recuo' })).toHaveAttribute('aria-pressed', 'true');
  fireEvent.click(screen.getByRole('button', { name: 'Salvar observações' }));
  await waitFor(() => expect(saved).toHaveBeenCalledTimes(1));

  const document = readObservationsDocument(saved.mock.calls[0][0]);
  expect(document.content?.[0].type).toBe('blockquote');
  view.rerender(content(saved.mock.calls[0][0], false));
  expect(view.container.querySelector('blockquote')).toHaveTextContent('Trecho recuado');

  view.rerender(content(saved.mock.calls[0][0], true));
  act(() => {
    getEditor().commands.setTextSelection(2);
  });
  fireEvent.click(screen.getByRole('button', { name: 'Citação / recuo' }));
  expect(getEditor().isActive('blockquote')).toBe(false);
  expect(view.container.querySelector('blockquote')).toBeNull();
});

test('shows legacy text and HTML-like content without executing or parsing it', () => {
  const original = '<script>alert(1)</script>\n\n<img src=x onerror=alert(1)>';
  const view = render(
    <ThemeProvider theme={defaultTheme}>
      <SetlistObservations observations={original} onSave={jest.fn()} />
    </ThemeProvider>,
  );
  expect(view.container.querySelector('script')).toBeNull();
  expect(view.container.querySelector('img')).toBeNull();
  expect(Array.from(view.container.querySelectorAll('.tiptap p')).map((paragraph) => paragraph.textContent)).toEqual([
    '<script>alert(1)</script>',
    '',
    '<img src=x onerror=alert(1)>',
  ]);
});
