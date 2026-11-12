import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSession } from '@/main/config/session';

export const PrivateRoute: React.FC = () => {
  const { isAuthenticated } = useSession();
  const location = useLocation();
  return isAuthenticated ? (
    <Outlet />
  ) : (
    <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
  );
};
