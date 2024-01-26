import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Configs, HomePage, SongPage, SongsPage } from '@/presentation/pages';
import { PrivateRoute } from './private-route';
import AdminLayout from '@/presentation/layouts/admin/admin.layout';
import ScrollToTop from '@/presentation/components/scrolltotop';
import { RemoteLoadAllSongsRequest } from '@/data/usecases/songs/remote-load-all-songs-request';
import { AxiosHttpClient } from '@/infra/http/axios-http-client/axios-http-client';

export const Router: React.FC = () => {
  const axiosHttpClient = new AxiosHttpClient();
  const loadAllSongsRequest = new RemoteLoadAllSongsRequest('/songs', axiosHttpClient);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Configs />} />

        <Route path="/" element={<PrivateRoute />}>
          <Route path="/" element={<AdminLayout />}>
            <Route path="/home" element={<HomePage />} />
            <Route path="/songs" element={<SongsPage loadAllSongsRequest={loadAllSongsRequest} />} />
            <Route path="/songs/:songId" element={<SongPage />} />
          </Route>
        </Route>
      </Routes>
      <ScrollToTop />
    </BrowserRouter>
  );
};
