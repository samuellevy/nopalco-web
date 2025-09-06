import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage, SongPage, SongsPage } from '@/presentation/pages';
import { PrivateRoute } from './private-route';
import AdminLayout from '@/presentation/layouts/admin/admin.layout';
import ScrollToTop from '@/presentation/components/scrolltotop';
import { RemoteLoadAllSongsRequest } from '@/data/usecases/songs/remote-load-all-songs-request';
import { AxiosHttpClient } from '@/infra/http/axios-http-client/axios-http-client';
import { RemoteLoadSongRequest } from '@/data/usecases/songs/remote-load-song-request';
import { RemoteLoadAllSetlistsRequest } from '@/data/usecases/setlists/remote-load-all-setlists-request';
import { RemoteLoadSetlistRequest } from '@/data/usecases/setlists/remote-load-setlist-request';
import { SetlistPage } from '@/presentation/pages/setlists/setlist.page';
import { SongsSmallPage } from '@/presentation/pages/songs-small/songs.page';
import { SongSmallPage } from '@/presentation/pages/songs-small/song/song.page';
import { RemoteUpdateSongRequest } from '@/data/usecases/songs/remote-update-song-request';
import { SetlistCreatePage } from '@/presentation/pages/setlists/create/setlist-create.page';

export const Router: React.FC = () => {
  const axiosHttpClient = new AxiosHttpClient();
  const loadAllSongsRequest = new RemoteLoadAllSongsRequest('/songs', axiosHttpClient);
  const loadSongRequest = new RemoteLoadSongRequest('/songs', axiosHttpClient);

  const loadAllSetlistsRequest = new RemoteLoadAllSetlistsRequest(axiosHttpClient);
  const loadSetlistRequest = new RemoteLoadSetlistRequest(axiosHttpClient);
  const updateSongRequest = new RemoteUpdateSongRequest(axiosHttpClient);

  return (
    <BrowserRouter>
      <Routes>
        {/* <Route path="/" element={<Configs />} /> */}

        <Route path="/" element={<PrivateRoute />}>
          <Route path="/" element={<AdminLayout />}>
            <Route path="/" element={<HomePage loadAllSetlistsRequest={loadAllSetlistsRequest} />} />
            <Route path="/songs" element={<SongsPage loadAllSongsRequest={loadAllSongsRequest} />} />
            <Route
              path="/songs/:songId"
              element={
                <SongPage
                  loadSongRequest={loadSongRequest}
                  loadAllSongsRequest={loadAllSongsRequest}
                  loadSetlistRequest={loadSetlistRequest}
                  updateSongRequest={updateSongRequest}
                />
              }
            />
            <Route path="/setlists/create" element={<SetlistCreatePage loadAllSongsRequest={loadAllSongsRequest} />} />
            <Route path="/setlists/:setlistId" element={<SetlistPage loadSetlistRequest={loadSetlistRequest} />} />

            <Route path="/songs-small" element={<SongsSmallPage loadAllSongsRequest={loadAllSongsRequest} />} />
            <Route
              path="/songs-small/:songId"
              element={<SongSmallPage loadSongRequest={loadSongRequest} loadAllSongsRequest={loadAllSongsRequest} />}
            />
          </Route>
        </Route>
      </Routes>
      <ScrollToTop />
    </BrowserRouter>
  );
};
