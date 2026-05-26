import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from './AuthContextProvider';

export const RequireAuth = ({ children }) => {
  const { is_login } = useContext(AuthContext);

  if (!is_login) {
    return <Navigate to="/admin/login" />;
  }

  return children;
};
