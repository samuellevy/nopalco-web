import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Configs, HomePage, SongPage, SongsPage } from '@/presentation/pages';
import { PrivateRoute } from './private-route';
import AdminLayout from '@/presentation/layouts/admin/admin.layout';
import ScrollToTop from '@/presentation/components/scrolltotop';
import { RemoteLoadAllSongsRequest } from '@/data/usecases/songs/remote-load-all-songs-request';
import { AxiosHttpClient } from '@/infra/http/axios-http-client/axios-http-client';
import { RemoteLoadSongRequest } from '@/data/usecases/songs/remote-load-song-request';
import { RemoteLoadAllSetlistsRequest } from '@/data/usecases/setlists/remote-load-all-setlists-request';
import { RemoteLoadSetlistRequest } from '@/data/usecases/setlists/remote-load-setlist-request';
import { SetlistPage } from '@/presentation/pages/setlists/setlist.page';

export const Router: React.FC = () => {
  const axiosHttpClient = new AxiosHttpClient();
  const loadAllSongsRequest = new RemoteLoadAllSongsRequest('/songs', axiosHttpClient);
  const loadSongRequest = new RemoteLoadSongRequest('/songs', axiosHttpClient);

  const loadAllSetlistsRequest = new RemoteLoadAllSetlistsRequest(axiosHttpClient);
  const loadSetlistRequest = new RemoteLoadSetlistRequest(axiosHttpClient);

  return (
    <BrowserRouter>
      <Routes>
        {/* <Route path="/" element={<Configs />} /> */}

        <Route path="/" element={<PrivateRoute />}>
          <Route path="/" element={<AdminLayout />}>
            <Route path="/" element={<HomePage loadAllSetlistsRequest={loadAllSetlistsRequest} />} />
            <Route path="/songs" element={<SongsPage loadAllSongsRequest={loadAllSongsRequest} />} />
            <Route path="/songs/:songId" element={<SongPage loadSongRequest={loadSongRequest} />} />
            <Route path="/setlists/:setlistId" element={<SetlistPage loadSetlistRequest={loadSetlistRequest} />} />
          </Route>
        </Route>
      </Routes>
      <ScrollToTop />
    </BrowserRouter>
  );
};
