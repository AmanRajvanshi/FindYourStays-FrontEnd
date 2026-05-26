import { AuthContext } from '../AuthContextProvider';
import { useState } from 'react';
import { Outlet } from 'react-router';

export function meta() {
  return [{ title: 'Admin | Find Your Stays' }];
}

export default function LoginLayout() {
  // Minimal context for login page
  const [authData, setAuthData] = useState({});
  const login = (user, token) => setAuthData({ user, token });
  const logout = () => setAuthData({});

  return (
    <AuthContext.Provider value={{ login, logout, authData }}>
      <div className="d-flex flex-column justify-content-center align-items-center min-vh-100 bg-light px-3">
        <div className="text-center">
          <img src="/logos/full_logo.png" alt="Logo" height="50" />
        </div>
        <div className="w-100">
          <Outlet />
        </div>
      </div>
    </AuthContext.Provider>
  );
}
