import { Navigate, Outlet } from 'react-router-dom';

export const PrivateRoute: React.FC = () => {
  const isAuthenticated = !!localStorage.getItem('account');
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};
