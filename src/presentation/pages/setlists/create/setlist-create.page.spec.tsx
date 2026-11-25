import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { SetlistCreatePage } from './setlist-create.page';

jest.mock('@/presentation/components/loader/loader', () => () => null);

jest.mock('@/presentation/components/setlist-group-select/setlist-group-select.component', () => ({
  SetlistGroupSelect: () => null,
}));

describe('SetlistCreatePage', () => {
  test('handles songs without optional fields and allows retrying after a failed save', async () => {
    const createSetlist = jest.fn().mockRejectedValue(new Error('Request failed'));
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

    try {
      render(
        <MemoryRouter>
          <SetlistCreatePage
            loadAllSongsRequest={{ execute: jest.fn().mockResolvedValue({ songs: [{ id: 'song-1', name: 'Song' }] }) }}
            createSetlistRequest={{ execute: createSetlist }}
          />
        </MemoryRouter>,
      );

      await screen.findByRole('heading', { name: 'Song' });
      fireEvent.change(screen.getByPlaceholderText('Filtrar por título ou autor'), { target: { value: 'missing' } });
      expect(screen.queryByRole('heading', { name: 'Song' })).not.toBeInTheDocument();
      fireEvent.change(screen.getByPlaceholderText('Filtrar por título ou autor'), { target: { value: '' } });
      fireEvent.click(screen.getByRole('heading', { name: 'Song' }));
      fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));

      await waitFor(() => expect(createSetlist).toHaveBeenCalledTimes(1));
      expect(createSetlist).toHaveBeenCalledWith(
        expect.objectContaining({
          date: undefined,
          items: [{ pureTitle: 'Song', songId: 'song-1', order: '1', key: '' }],
        }),
      );
      await waitFor(() => expect(screen.getByRole('button', { name: 'Salvar' })).toBeEnabled());
    } finally {
      consoleError.mockRestore();
    }
  });

  test('navigates home from the footer', async () => {
    render(
      <MemoryRouter initialEntries={['/setlists/create']}>
        <Routes>
          <Route
            path="/setlists/create"
            element={
              <SetlistCreatePage
                loadAllSongsRequest={{ execute: jest.fn().mockResolvedValue({ songs: [] }) }}
                createSetlistRequest={{ execute: jest.fn() }}
              />
            }
          />
          <Route path="/" element={<h1>Página inicial</h1>} />
        </Routes>
      </MemoryRouter>,
    );

    fireEvent.click(await screen.findByRole('link', { name: 'Início' }));
    expect(screen.getByRole('heading', { name: 'Página inicial' })).toBeInTheDocument();
  });
});
