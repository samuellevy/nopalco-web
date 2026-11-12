import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { Setlist } from '@/domain/models/setlist';
import { Song } from '@/domain/models';
import { defaultTheme } from '@/presentation/styles/themes/default';
import { SetlistPage } from './setlist.page';

jest.mock('@/presentation/components/song-component/song.component', () => ({
  SongComponent: () => null,
}));

const renderSetlist = async (items?: Setlist['items']) => {
  const song: Song = {
    id: 'song-new',
    name: 'Added song',
    author: 'Artist',
    key: 'F#m',
    singers: [{ id: 'singer-1', name: 'Singer', key: 'G' }],
  };
  const setlist: Setlist = {
    id: 'setlist-1',
    name: 'Test show',
    description: 'Show description',
    address: 'Venue',
    items: items || [
      {
        id: 'item-1',
        order: 1,
        key: 'C',
        singer: { id: 'singer-old', name: 'Original singer', key: 'C' },
        song: {
          id: 'song-existing',
          name: 'Existing song',
          key: 'C',
          singers: [{ id: 'singer-old', name: 'Original singer', key: 'C' }],
        },
      },
    ],
  };
  const updateSetlist = jest.fn().mockResolvedValue(undefined);
  const createSetlist = jest.fn().mockResolvedValue({ id: 'setlist-copy' });
  const loadSetlist = jest
    .fn()
    .mockImplementation(async (id: string) =>
      id === 'setlist-copy' ? { ...setlist, id, name: 'Copied show' } : setlist,
    );

  render(
    <MemoryRouter initialEntries={['/setlists/setlist-1']}>
      <ThemeProvider theme={defaultTheme}>
        <Routes>
          <Route
            path="/setlists/:setlistId"
            element={
              <SetlistPage
                createSetlistRequest={{ execute: createSetlist }}
                loadSetlistRequest={{ execute: loadSetlist }}
                loadAllSongsRequest={{ execute: jest.fn().mockResolvedValue({ songs: [song] }) }}
                updateSetlistRequest={{ execute: updateSetlist }}
                updateSongRequest={{ execute: jest.fn() }}
              />
            }
          />
        </Routes>
      </ThemeProvider>
    </MemoryRouter>,
  );

  await screen.findByRole('heading', { name: 'Test show' });
  return { updateSetlist, createSetlist, loadSetlist };
};

const selectSong = async () => {
  fireEvent.click(screen.getByRole('button', { name: 'Adicionar música' }));
  const modal = await screen.findByRole('dialog', { name: 'Adicionar música ao setlist' });
  fireEvent.change(within(modal).getByRole('textbox', { name: 'Buscar músicas' }), {
    target: { value: 'Added' },
  });
  fireEvent.click(within(modal).getByRole('heading', { name: 'Added song' }));
  expect(screen.queryByRole('dialog', { name: 'Adicionar música ao setlist' })).not.toBeInTheDocument();
};

describe('SetlistPage adding songs', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    const payload = btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 }));
    localStorage.setItem(
      'account',
      JSON.stringify({ access_token: `header.${payload}.signature`, username: 'test-user' }),
    );
    window.history.replaceState({}, '', '/setlists/setlist-1');
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
    localStorage.clear();
    sessionStorage.clear();
  });

  test('renders fullscreen without nested buttons in the header', async () => {
    await renderSetlist();
    const actions = screen.getByRole('button', { name: 'Buscar músicas' }).parentElement;

    expect(within(actions).getAllByRole('button')).toHaveLength(2);
    expect(actions.querySelector('button button')).toBeNull();
  });

  test('allows anonymous viewing but hides editing and duplication', async () => {
    localStorage.clear();
    sessionStorage.clear();
    await renderSetlist();

    expect(screen.getByRole('heading', { name: 'Test show' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Existing song', level: 2 })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Editar' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Duplicar' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
  });

  test('removes a draft item and saves the remaining songs with consecutive positions', async () => {
    const { updateSetlist } = await renderSetlist();
    expect(screen.queryByRole('button', { name: /Remover música/ })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Editar' }));
    await selectSong();
    const row = screen.getByRole('button', { name: /Existing song/ });
    fireEvent.click(row);

    fireEvent.click(screen.getByRole('button', { name: 'Remover música 1 do setlist' }));

    expect(screen.queryByRole('heading', { name: 'Existing song', level: 2 })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Added song', level: 2 })).toBeInTheDocument();
    expect(screen.queryByRole('dialog', { name: 'Substituir música do setlist' })).not.toBeInTheDocument();
    expect(updateSetlist).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    await waitFor(() =>
      expect(updateSetlist).toHaveBeenCalledWith(
        'setlist-1',
        expect.objectContaining({
          items: [expect.objectContaining({ songId: 'song-new', key: 'F#m', order: 1 })],
        }),
      ),
    );
  });

  test('cancelling editing restores a removed song', async () => {
    const { updateSetlist } = await renderSetlist();
    fireEvent.click(screen.getByRole('button', { name: 'Editar' }));
    fireEvent.click(screen.getByRole('button', { name: 'Remover música 1 do setlist' }));
    expect(screen.queryByRole('heading', { name: 'Existing song', level: 2 })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(screen.getByRole('heading', { name: 'Existing song', level: 2 })).toBeInTheDocument();
    expect(updateSetlist).not.toHaveBeenCalled();
  });

  test('can remove the last song and save an empty setlist without nested buttons', async () => {
    const { updateSetlist } = await renderSetlist();
    fireEvent.click(screen.getByRole('button', { name: 'Editar' }));
    const remove = screen.getByRole('button', { name: 'Remover música 1 do setlist' });
    expect(remove.parentElement.closest('button')).toBeNull();
    fireEvent.click(remove);
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    await waitFor(() =>
      expect(updateSetlist).toHaveBeenCalledWith('setlist-1', expect.objectContaining({ items: [] })),
    );
  });

  test('loads the duplicated setlist after navigating to its ID without remounting', async () => {
    const { createSetlist, loadSetlist } = await renderSetlist();
    fireEvent.click(screen.getByRole('button', { name: 'Duplicar' }));
    const dialog = screen.getByRole('dialog', { name: 'Duplicar setlist' });
    fireEvent.change(within(dialog).getByRole('textbox', { name: 'Nome' }), {
      target: { value: 'Copied show' },
    });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Criar cópia' }));

    await screen.findByRole('heading', { name: 'Copied show' });
    expect(createSetlist).toHaveBeenCalledTimes(1);
    expect(loadSetlist).toHaveBeenCalledWith('setlist-copy');
    expect(screen.queryByRole('heading', { name: 'Test show' })).not.toBeInTheDocument();
    expect(screen.queryByRole('dialog', { name: 'Duplicar setlist' })).not.toBeInTheDocument();
  });

  test('adds a song to the draft and saves its singer, key and position', async () => {
    const { updateSetlist } = await renderSetlist();
    expect(screen.queryByRole('button', { name: 'Adicionar música' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Editar' }));

    await selectSong();

    const row = screen.getByRole('button', { name: /Added song/ });
    expect(within(row).getByRole('textbox')).toHaveValue('F#m');
    fireEvent.change(within(row).getByRole('combobox'), { target: { value: 'singer-1' } });
    expect(within(row).getByRole('textbox')).toHaveValue('G');
    fireEvent.change(within(row).getByRole('textbox'), { target: { value: 'Bb' } });
    expect(updateSetlist).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    await waitFor(() =>
      expect(updateSetlist).toHaveBeenCalledWith(
        'setlist-1',
        expect.objectContaining({
          items: [
            expect.objectContaining({ songId: 'song-existing', key: 'C', order: 1 }),
            expect.objectContaining({
              songId: 'song-new',
              pureTitle: 'Added song',
              key: 'Bb',
              singerId: 'singer-1',
              order: 2,
            }),
          ],
        }),
      ),
    );
  });

  test('discards added songs when editing is cancelled', async () => {
    const { updateSetlist } = await renderSetlist();
    fireEvent.click(screen.getByRole('button', { name: 'Editar' }));
    await selectSong();

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(screen.queryByRole('heading', { name: 'Added song', level: 2 })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Editar' }));
    expect(screen.queryByRole('heading', { name: 'Added song', level: 2 })).not.toBeInTheDocument();
    expect(updateSetlist).not.toHaveBeenCalled();
  });

  test('allows repeated songs as separate setlist items', async () => {
    const { updateSetlist } = await renderSetlist();
    fireEvent.click(screen.getByRole('button', { name: 'Editar' }));
    await selectSong();
    await selectSong();

    expect(screen.getAllByRole('heading', { name: 'Added song', level: 2 })).toHaveLength(2);
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    await waitFor(() =>
      expect(updateSetlist).toHaveBeenCalledWith(
        'setlist-1',
        expect.objectContaining({
          items: [
            expect.objectContaining({ songId: 'song-existing', order: 1 }),
            expect.objectContaining({ songId: 'song-new', order: 2 }),
            expect.objectContaining({ songId: 'song-new', order: 3 }),
          ],
        }),
      ),
    );
  });

  test('replaces the clicked song in place and clears the previous singer', async () => {
    const { updateSetlist } = await renderSetlist();
    fireEvent.click(screen.getByRole('button', { name: 'Editar' }));
    const rowToReplace = screen.getByRole('button', { name: /Existing song/ });
    fireEvent.click(rowToReplace, { detail: 1 });
    expect(screen.queryByRole('dialog', { name: 'Substituir música do setlist' })).not.toBeInTheDocument();
    fireEvent.click(rowToReplace, { detail: 2 });
    fireEvent.doubleClick(rowToReplace);

    const modal = await screen.findByRole('dialog', { name: 'Substituir música do setlist' });
    fireEvent.click(within(modal).getByRole('heading', { name: 'Added song' }));

    expect(screen.queryByRole('heading', { name: 'Existing song', level: 2 })).not.toBeInTheDocument();
    expect(screen.getAllByRole('heading', { name: 'Added song', level: 2 })).toHaveLength(1);
    const row = screen.getByRole('button', { name: /Added song/ });
    expect(within(row).getByRole('textbox')).toHaveValue('F#m');
    expect(within(row).getByRole('combobox')).toHaveValue('');
    expect(updateSetlist).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    await waitFor(() =>
      expect(updateSetlist).toHaveBeenCalledWith(
        'setlist-1',
        expect.objectContaining({
          items: [
            expect.objectContaining({
              songId: 'song-new',
              pureTitle: 'Added song',
              key: 'F#m',
              singerId: '',
              order: 1,
            }),
          ],
        }),
      ),
    );
  });

  test('closing replacement leaves the song unchanged and adding still appends', async () => {
    const { updateSetlist } = await renderSetlist();
    fireEvent.click(screen.getByRole('button', { name: 'Editar' }));
    fireEvent.doubleClick(screen.getByRole('button', { name: /Existing song/ }));

    const modal = await screen.findByRole('dialog', { name: 'Substituir música do setlist' });
    fireEvent.click(within(modal).getByRole('button', { name: 'Fechar busca' }));
    expect(screen.getByRole('heading', { name: 'Existing song', level: 2 })).toBeInTheDocument();

    await selectSong();
    expect(screen.getByRole('heading', { name: 'Existing song', level: 2 })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Added song', level: 2 })).toBeInTheDocument();
    expect(updateSetlist).not.toHaveBeenCalled();
  });

  test('swaps two clicked setlist items while retaining their keys and singers', async () => {
    const { updateSetlist } = await renderSetlist();
    fireEvent.click(screen.getByRole('button', { name: 'Editar' }));
    await selectSong();

    const originalRow = screen.getByRole('button', { name: /Existing song/ });
    fireEvent.click(originalRow);
    expect(screen.queryByRole('dialog', { name: 'Substituir música do setlist' })).not.toBeInTheDocument();
    expect(originalRow).toHaveAttribute('aria-pressed', 'true');

    fireEvent.click(screen.getByRole('button', { name: /Added song/ }));

    expect(screen.queryByRole('dialog', { name: 'Substituir música do setlist' })).not.toBeInTheDocument();
    expect(screen.getAllByRole('heading', { level: 2 }).map((heading) => heading.textContent)).toEqual([
      'Added song',
      'Existing song',
    ]);
    expect(updateSetlist).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    await waitFor(() =>
      expect(updateSetlist).toHaveBeenCalledWith(
        'setlist-1',
        expect.objectContaining({
          items: [
            expect.objectContaining({ songId: 'song-new', key: 'F#m', order: 1 }),
            expect.objectContaining({ songId: 'song-existing', key: 'C', singerId: 'singer-old', order: 2 }),
          ],
        }),
      ),
    );
  });

  test('offers an explicit replacement button without making the whole card draggable', async () => {
    await renderSetlist();
    fireEvent.click(screen.getByRole('button', { name: 'Editar' }));
    const row = screen.getByRole('button', { name: /Existing song/ });
    expect(row).not.toHaveAttribute('draggable', 'true');
    expect(row.querySelector('[draggable="true"]')).not.toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Substituir música 1' }));

    expect(await screen.findByRole('dialog', { name: 'Substituir música do setlist' })).toBeInTheDocument();
  });

  test('accepts a rapid mouse click on a different item for swapping', async () => {
    await renderSetlist();
    fireEvent.click(screen.getByRole('button', { name: 'Editar' }));
    await selectSong();
    fireEvent.click(screen.getByRole('button', { name: /Existing song/ }), { detail: 1 });
    fireEvent.click(screen.getByRole('button', { name: /Added song/ }), { detail: 2 });

    expect(screen.getAllByRole('heading', { level: 2 }).map((heading) => heading.textContent)).toEqual([
      'Added song',
      'Existing song',
    ]);
    expect(screen.queryByRole('dialog', { name: 'Substituir música do setlist' })).not.toBeInTheDocument();
  });

  test.each(['pencil', 'double click', 'double tap'])('replaces a moment with a song using %s', async (gesture) => {
    const { updateSetlist } = await renderSetlist([
      { id: 'moment-1', pureTitle: 'Opening moment', song: null, key: '', order: 1 },
      { id: 'item-2', song: { id: 'other-song', name: 'Other song' }, key: 'G', order: 2 },
    ]);
    fireEvent.click(screen.getByRole('button', { name: 'Editar' }));
    const row = screen.getByRole('button', { name: /Opening moment/ });
    if (gesture === 'pencil') {
      fireEvent.click(screen.getByRole('button', { name: 'Substituir música 1' }));
    } else if (gesture === 'double click') {
      fireEvent.click(row, { detail: 1 });
      fireEvent.click(row, { detail: 2 });
      fireEvent.doubleClick(row);
    } else {
      const touch = { identifier: 1, clientX: 40, clientY: 40 };
      fireEvent.touchStart(row, { touches: [touch] });
      fireEvent.touchEnd(row, { changedTouches: [touch], touches: [] });
      expect(row).toHaveAttribute('aria-pressed', 'true');
      fireEvent.touchStart(row, { touches: [touch] });
      fireEvent.touchEnd(row, { changedTouches: [touch], touches: [] });
    }

    const modal = await screen.findByRole('dialog', { name: 'Substituir música do setlist' });
    fireEvent.click(within(modal).getByRole('heading', { name: 'Added song' }));
    expect(screen.queryByRole('heading', { name: 'Opening moment', level: 2 })).not.toBeInTheDocument();
    expect(screen.getAllByRole('heading', { level: 2 }).map((heading) => heading.textContent)).toEqual([
      'Added song',
      'Other song',
    ]);
    expect(updateSetlist).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    await waitFor(() =>
      expect(updateSetlist).toHaveBeenCalledWith(
        'setlist-1',
        expect.objectContaining({
          items: [
            expect.objectContaining({ songId: 'song-new', pureTitle: 'Added song', key: 'F#m', order: 1 }),
            expect.objectContaining({ songId: 'other-song', key: 'G', order: 2 }),
          ],
        }),
      ),
    );
  });

  test('selects a moment first and swaps its position with a song', async () => {
    await renderSetlist([
      { id: 'moment-1', pureTitle: 'Opening moment', song: null, key: '', order: 1 },
      { id: 'item-2', song: { id: 'other-song', name: 'Other song' }, key: 'G', order: 2 },
    ]);
    fireEvent.click(screen.getByRole('button', { name: 'Editar' }));
    const row = screen.getByRole('button', { name: /Opening moment/ });
    fireEvent.click(row);
    expect(row).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(screen.getByRole('button', { name: /Other song/ }));

    expect(screen.getAllByRole('heading', { level: 2 }).map((heading) => heading.textContent)).toEqual([
      'Other song',
      'Opening moment',
    ]);
    expect(screen.queryByRole('dialog', { name: 'Substituir música do setlist' })).not.toBeInTheDocument();
  });

  test('clicking the selected item again clears selection without changing the order', async () => {
    await renderSetlist();
    fireEvent.click(screen.getByRole('button', { name: 'Editar' }));
    const row = screen.getByRole('button', { name: /Existing song/ });
    fireEvent.click(row);
    expect(screen.queryByRole('dialog', { name: 'Substituir música do setlist' })).not.toBeInTheDocument();

    fireEvent.click(row);

    expect(row).toHaveAttribute('aria-pressed', 'false');
    expect(screen.queryByRole('dialog', { name: 'Substituir música do setlist' })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Existing song', level: 2 })).toBeInTheDocument();
  });

  test('opens replacement after two touch gestures without a browser double click', async () => {
    await renderSetlist();
    fireEvent.click(screen.getByRole('button', { name: 'Editar' }));
    const row = screen.getByRole('button', { name: /Existing song/ });
    const touch = { identifier: 1, clientX: 40, clientY: 40 };

    fireEvent.touchStart(row, { touches: [touch] });
    expect(fireEvent.touchEnd(row, { changedTouches: [touch], touches: [] })).toBe(false);
    expect(row).toHaveAttribute('aria-pressed', 'true');
    expect(screen.queryByRole('dialog', { name: 'Substituir música do setlist' })).not.toBeInTheDocument();

    fireEvent.touchStart(row, { touches: [touch] });
    fireEvent.touchEnd(row, { changedTouches: [touch], touches: [] });

    expect(await screen.findByRole('dialog', { name: 'Substituir música do setlist' })).toBeInTheDocument();
  });

  test('swaps items touched once each without opening replacement', async () => {
    await renderSetlist();
    fireEvent.click(screen.getByRole('button', { name: 'Editar' }));
    await selectSong();
    const touch = { identifier: 1, clientX: 40, clientY: 40 };

    for (const name of [/Existing song/, /Added song/]) {
      const row = screen.getByRole('button', { name });
      fireEvent.touchStart(row, { touches: [touch] });
      fireEvent.touchEnd(row, { changedTouches: [touch], touches: [] });
    }

    expect(screen.getAllByRole('heading', { level: 2 }).map((heading) => heading.textContent)).toEqual([
      'Added song',
      'Existing song',
    ]);
    expect(screen.queryByRole('dialog', { name: 'Substituir música do setlist' })).not.toBeInTheDocument();
  });

  test('does not select or open replacement during scrolling', async () => {
    await renderSetlist();
    fireEvent.click(screen.getByRole('button', { name: 'Editar' }));
    const row = screen.getByRole('button', { name: /Existing song/ });
    const start = { identifier: 1, clientX: 40, clientY: 40 };
    const moved = { identifier: 1, clientX: 40, clientY: 120 };

    fireEvent.touchStart(row, { touches: [start] });
    fireEvent.touchMove(row, { touches: [moved] });
    expect(fireEvent.touchEnd(row, { changedTouches: [moved], touches: [] })).toBe(true);

    expect(row).toHaveAttribute('aria-pressed', 'false');
    expect(screen.queryByRole('dialog', { name: 'Substituir música do setlist' })).not.toBeInTheDocument();
  });

  test('clicking the singer or key field does not open replacement', async () => {
    await renderSetlist();
    fireEvent.click(screen.getByRole('button', { name: 'Editar' }));
    const row = screen.getByRole('button', { name: /Existing song/ });

    fireEvent.click(within(row).getByRole('textbox'));
    fireEvent.click(within(row).getByRole('combobox'));
    fireEvent.doubleClick(within(row).getByRole('textbox'));
    fireEvent.doubleClick(within(row).getByRole('combobox'));

    expect(screen.queryByRole('dialog', { name: 'Substituir música do setlist' })).not.toBeInTheDocument();
  });
});
