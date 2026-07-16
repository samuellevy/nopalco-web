import { Navigate, Outlet } from 'react-router-dom';

export const PrivateRoute: React.FC = () => {
  // const isAuthenticated = !!localStorage.getItem('account');
  const isAuthenticated = true; // TODO: Implement admin authentication check
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};
