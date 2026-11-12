import { fireEvent, render, screen } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { SetlistItem } from '@/domain/models/setlist';
import { defaultTheme } from '@/presentation/styles/themes/default';
import { ModalSongsListComponent } from './modal-song-list.component';

describe('ModalSongsListComponent', () => {
  test('shows only ordered setlist entries and selects repeated songs by item ID', async () => {
    const song = { id: 'song-1', name: 'Shared song', author: 'Artist', key: 'A' };
    const items: SetlistItem[] = [
      { id: 'item-2', order: 2, key: 'G', song },
      { id: 'item-1', order: 1, key: 'C', song },
      { id: 'moment-1', order: 3, pureTitle: 'Interval', song: null },
    ];
    const loadSongs = jest.fn();
    const handleClickSong = jest.fn();

    render(
      <ThemeProvider theme={defaultTheme}>
        <ModalSongsListComponent
          loadAllSongsRequest={{ execute: loadSongs }}
          modalSongsOpen
          setModalSongsOpen={jest.fn()}
          setlistItems={items}
          handleClickSong={handleClickSong}
        />
      </ThemeProvider>,
    );

    const headings = await screen.findAllByRole('heading', { level: 1 });
    expect(headings.map((heading) => heading.textContent)).toEqual(['Shared song', 'Shared song', 'Interval']);
    expect(screen.getAllByRole('heading', { level: 2 }).map((heading) => heading.textContent)).toEqual([
      'Artist - C',
      'Artist - G',
      '',
    ]);
    expect(loadSongs).not.toHaveBeenCalled();

    fireEvent.click(headings[1]);
    expect(handleClickSong).toHaveBeenCalledWith('item-2');

    fireEvent.change(screen.getByRole('textbox', { name: 'Buscar no setlist atual' }), {
      target: { value: 'interval' },
    });
    expect(screen.queryByText('Shared song')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('heading', { name: 'Interval' }));
    expect(handleClickSong).toHaveBeenLastCalledWith('moment-1');

    fireEvent.click(screen.getByRole('button', { name: 'Limpar pesquisa' }));
    const searchInput = screen.getByRole('textbox', { name: 'Buscar no setlist atual' });
    expect(searchInput).toHaveValue('');
    expect(searchInput).toHaveFocus();
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(3);
    expect(screen.queryByRole('button', { name: 'Limpar pesquisa' })).not.toBeInTheDocument();
  });

  test('keeps the full catalogue search and close action available', async () => {
    const loadSongs = jest.fn().mockResolvedValue({
      songs: [
        { id: 'song-1', name: 'Catalogue song', author: 'Artist', key: 'F#m' },
        { id: 'song-2', name: 'Song without key', author: 'Another artist' },
      ],
    });
    const handleClickSong = jest.fn();
    const setModalSongsOpen = jest.fn();

    render(
      <ThemeProvider theme={defaultTheme}>
        <ModalSongsListComponent
          loadAllSongsRequest={{ execute: loadSongs }}
          modalSongsOpen
          setModalSongsOpen={setModalSongsOpen}
          handleClickSong={handleClickSong}
        />
      </ThemeProvider>,
    );

    fireEvent.click(await screen.findByRole('heading', { name: 'Catalogue song' }));
    expect(loadSongs).toHaveBeenCalledTimes(1);
    expect(handleClickSong).toHaveBeenCalledWith('song-1');
    expect(screen.getByRole('heading', { name: 'Artist - F#m' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Another artist' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Buscar músicas' })).toBeInTheDocument();

    const searchInput = screen.getByRole('textbox', { name: 'Buscar músicas' });
    expect(screen.queryByRole('button', { name: 'Limpar pesquisa' })).not.toBeInTheDocument();
    fireEvent.change(searchInput, { target: { value: 'no matches' } });
    expect(screen.queryByRole('heading', { name: 'Catalogue song' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Limpar pesquisa' }));
    expect(searchInput).toHaveValue('');
    expect(searchInput).toHaveFocus();
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(2);

    fireEvent.click(screen.getByRole('button', { name: 'Fechar busca' }));
    expect(setModalSongsOpen).toHaveBeenCalledWith(false);
  });
});
