import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ServerStyleSheet, ThemeProvider } from 'styled-components';
import { Song } from '@/domain/models';
import { defaultTheme } from '@/presentation/styles/themes/default';
import { GlobalStyles } from '@/presentation/styles/global';
import { SongComponent } from './song.component';

beforeEach(() => {
  const payload = btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 }));
  localStorage.setItem(
    'account',
    JSON.stringify({ access_token: `header.${payload}.signature`, username: 'test-user' }),
  );
});

afterEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});

jest.mock('@/presentation/pages/sheet-music/sheet-music.page', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('@/presentation/components/modal-song-list/modal-song-list.component', () => ({
  ModalSongsListComponent: () => null,
}));

jest.mock('@/presentation/components/fullscreen-button/fullscreen-button.component', () => ({
  __esModule: true,
  default: () => null,
}));

const renderSong = (
  originalKey = 'C',
  dataKey: string | null = null,
  blockTitle = 'Verse',
  updateSong = jest.fn().mockResolvedValue(undefined),
  lyrics = 'Primeiro verso\n\nRefrão',
) => {
  const sheet = new ServerStyleSheet();
  const song: Song = {
    id: 'song-1',
    name: 'Test song',
    author: 'Test author',
    key: originalKey,
    bpm: '120',
    rhythm: 'Pop',
    lyrics,
    content: [{ block: blockTitle, notes: [`${originalKey}/E`] }],
  };

  render(
    sheet.collectStyles(
      <MemoryRouter>
        <ThemeProvider theme={defaultTheme}>
          <GlobalStyles />
          <SongComponent
            data={song}
            dataKey={dataKey}
            loadAllSongsRequest={{ execute: jest.fn() }}
            loadSetlistRequest={{ execute: jest.fn() }}
            updateSongRequest={{ execute: updateSong }}
            handleSetlistButton={jest.fn()}
            handleNextSongButton={jest.fn()}
            handlePreviousSongButton={jest.fn()}
          />
        </ThemeProvider>
      </MemoryRouter>,
    ),
  );
  return sheet;
};

describe('SongComponent metadata editing', () => {
  test('allows anonymous viewing but hides editing and singer management', () => {
    localStorage.clear();
    sessionStorage.clear();
    renderSong();

    expect(screen.getByRole('heading', { name: 'Test song' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Orientações' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Editar' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Cantores' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
  });

  test('replaces metadata with inputs and submits the edited values', async () => {
    const updateSong = jest.fn().mockResolvedValue(undefined);
    renderSong('C', null, 'Verse', updateSong);

    expect(screen.queryByText('BPM', { exact: true })).not.toBeInTheDocument();
    expect(screen.queryByText('RHYTHM', { exact: true })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Editar' }));

    const fields = [
      ['Título', 'Test song', 'Updated song'],
      ['Subtítulo', 'Test author', 'Updated author'],
      ['BPM', '120', '96'],
      ['Tom', 'C', 'G'],
      ['Ritmo', 'Pop', 'Samba'],
    ];
    fields.forEach(([label, originalValue, value]) => {
      const input = screen.getByRole('textbox', { name: label });
      expect(input).toHaveValue(originalValue);
      fireEvent.change(input, { target: { value } });
    });

    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    await waitFor(() => {
      expect(updateSong).toHaveBeenCalledWith(
        'song-1',
        expect.objectContaining({
          name: 'Updated song',
          author: 'Updated author',
          bpm: '96',
          key: 'G',
          rhythm: 'Samba',
          content: JSON.stringify([{ block: 'Verse', notes: ['C/E'] }]),
        }),
      );
      expect(screen.queryByRole('textbox', { name: 'Título' })).not.toBeInTheDocument();
    });
    expect(screen.getByRole('heading', { name: 'Updated song' })).toBeInTheDocument();
    expect(screen.getByText('Updated author')).toBeInTheDocument();
    expect(screen.getByLabelText('Tom atual')).toHaveTextContent('G');
    expect(screen.getByText('Samba')).toBeInTheDocument();
  });

  test('keeps metadata editable when lyrics mode is active', () => {
    renderSong();
    fireEvent.click(screen.getByRole('button', { name: 'Letra' }));
    fireEvent.click(screen.getByRole('button', { name: 'Editar' }));

    ['Título', 'Subtítulo', 'BPM', 'Tom', 'Ritmo'].forEach((label) => {
      expect(screen.getByRole('textbox', { name: label })).toBeInTheDocument();
    });
  });
});

describe('SongComponent lyrics editing', () => {
  test('shows a large textarea in lyrics mode and saves lyrics without changing chords', async () => {
    const updateSong = jest.fn().mockResolvedValue(undefined);
    renderSong('C', null, 'Verse', updateSong);
    fireEvent.click(screen.getByRole('button', { name: 'Letra' }));
    expect(screen.queryByRole('textbox', { name: 'Letra da música' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Editar' }));

    const input = screen.getByRole('textbox', { name: 'Letra da música' });
    expect(input).toHaveValue('Primeiro verso\n\nRefrão');
    expect(input).toHaveAttribute('rows', '16');
    expect(screen.queryByRole('button', { name: 'Seção' })).not.toBeInTheDocument();
    fireEvent.change(input, { target: { value: 'Novo verso\n\nNovo refrão' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    await waitFor(() =>
      expect(updateSong).toHaveBeenCalledWith(
        'song-1',
        expect.objectContaining({
          lyrics: 'Novo verso\n\nNovo refrão',
          content: JSON.stringify([{ block: 'Verse', notes: ['C/E'] }]),
        }),
      ),
    );
    await waitFor(() => expect(screen.queryByRole('textbox', { name: 'Letra da música' })).not.toBeInTheDocument());
    expect(screen.getByText('Novo verso Novo refrão')).toBeInTheDocument();
  });

  test('cancelling restores the previous lyrics and does not send an update', () => {
    const updateSong = jest.fn();
    renderSong('C', null, 'Verse', updateSong);
    fireEvent.click(screen.getByRole('button', { name: 'Letra' }));
    fireEvent.click(screen.getByRole('button', { name: 'Editar' }));
    fireEvent.change(screen.getByRole('textbox', { name: 'Letra da música' }), { target: { value: 'Discard this' } });
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(screen.queryByText('Discard this')).not.toBeInTheDocument();
    expect(screen.getByText('Primeiro verso Refrão')).toBeInTheDocument();
    expect(updateSong).not.toHaveBeenCalled();
  });

  test('allows writing and saving lyrics for a song without existing lyrics', async () => {
    const updateSong = jest.fn().mockResolvedValue(undefined);
    renderSong('C', null, 'Verse', updateSong, '');
    fireEvent.click(screen.getByRole('button', { name: 'Letra' }));
    fireEvent.click(screen.getByRole('button', { name: 'Editar' }));
    const input = screen.getByRole('textbox', { name: 'Letra da música' });
    expect(input).toHaveValue('');
    fireEvent.change(input, { target: { value: 'New lyrics' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    await waitFor(() =>
      expect(updateSong).toHaveBeenCalledWith('song-1', expect.objectContaining({ lyrics: 'New lyrics' })),
    );
  });
});

describe('SongComponent block titles', () => {
  test.each([
    ['**Verse**', 'bold'],
    ['*Verse*', 'bold'],
    ['Verse', 'normal'],
  ])('renders %s with %s text despite the global font reset', (blockTitle, fontWeight) => {
    const sheet = renderSong('C', null, blockTitle);

    const heading = screen.getByRole('heading', { name: 'Verse' });
    const className = heading.classList.item(1);
    const styles = sheet.getStyleTags();

    expect(styles).toMatch(new RegExp(`\\.${className}\\{[^}]*font-weight:${fontWeight};`));
    expect(styles).toMatch(new RegExp(`\\.${className} span\\{[^}]*font-weight:inherit;`));
    sheet.seal();
  });
});

describe('SongComponent key controls', () => {
  test('places the current key between the transpose buttons', () => {
    renderSong();

    const decrease = screen.getByRole('button', { name: 'Diminuir tom' });
    const currentKey = screen.getByLabelText('Tom atual');
    const increase = screen.getByRole('button', { name: 'Aumentar tom' });

    expect(decrease.nextElementSibling).toBe(currentKey);
    expect(currentKey.nextElementSibling).toBe(increase);
    expect(screen.queryByText('KEY', { exact: true })).not.toBeInTheDocument();
  });

  test.each([
    ['C', 'Aumentar tom', 'C#', 'C#/F'],
    ['C', 'Diminuir tom', 'B', 'B/D#'],
    ['B', 'Aumentar tom', 'C', 'C/F'],
    ['Bb', 'Aumentar tom', 'B', 'B/F'],
    ['Am', 'Aumentar tom', 'A#m', 'A#m/F'],
  ])('updates %s with %s to %s', (originalKey, action, expectedKey, expectedChord) => {
    renderSong(originalKey);

    fireEvent.click(screen.getByRole('button', { name: action }));

    expect(screen.getByText(expectedKey, { exact: true })).toBeInTheDocument();
    expect(screen.getByText(expectedChord, { exact: true })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: `Original: ${originalKey}` })).toBeEnabled();
  });

  test('restores the original key and chords after repeated changes', () => {
    renderSong();
    expect(screen.getByRole('button', { name: 'Original: C' })).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: 'Aumentar tom' }));
    fireEvent.click(screen.getByRole('button', { name: 'Aumentar tom' }));
    expect(screen.getByText('D', { exact: true })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Original: C' }));

    expect(screen.getByLabelText('Tom atual')).toHaveTextContent(/^C$/);
    expect(screen.getByText('C/E', { exact: true })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Original: C' })).toBeDisabled();
  });

  test('tracks changes from a setlist key and can return to the stored original', () => {
    renderSong('C', 'D');
    expect(screen.getByText('D', { exact: true })).toBeInTheDocument();
    expect(screen.getByText('D/F#', { exact: true })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Aumentar tom' }));
    expect(screen.getByText('D#', { exact: true })).toBeInTheDocument();
    expect(screen.getByText('D#/G', { exact: true })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Original: C' }));
    expect(screen.getByLabelText('Tom atual')).toHaveTextContent(/^C$/);
    expect(screen.getByText('C/E', { exact: true })).toBeInTheDocument();
  });
});
