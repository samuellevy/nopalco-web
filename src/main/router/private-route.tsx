import { Navigate, Outlet } from 'react-router-dom';

export const PrivateRoute: React.FC = () => {
  // const isAuthenticated = !!localStorage.getItem('account');
  const isAuthenticated = true;
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};
