import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Configs, Song, SongsPage } from '@/presentation/pages';
import { PrivateRoute } from './private-route';
import AdminLayout from '@/presentation/layouts/admin/admin.layout';

export const Router: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Configs />} />

        <Route path="/" element={<PrivateRoute />}>
          <Route path="/songbook" element={<AdminLayout />}>
            <Route path="/songbook/songs" element={<SongsPage />} />
            <Route path="/songbook/song/123" element={<Song />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
