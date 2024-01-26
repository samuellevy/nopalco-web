import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Configs, HomePage, SongPage, SongsPage } from '@/presentation/pages';
import { PrivateRoute } from './private-route';
import AdminLayout from '@/presentation/layouts/admin/admin.layout';
import ScrollToTop from '@/presentation/components/scrolltotop';

export const Router: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Configs />} />

        <Route path="/" element={<PrivateRoute />}>
          <Route path="/" element={<AdminLayout />}>
            <Route path="/home" element={<HomePage />} />
            <Route path="/songbook/songs" element={<SongsPage />} />
            <Route path="/songs/123" element={<SongPage />} />
          </Route>
        </Route>
      </Routes>
      <ScrollToTop />
    </BrowserRouter>
  );
};
