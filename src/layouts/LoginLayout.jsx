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
      <div className="min-h-screen bg-section flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-coral text-white font-bold text-2xl shadow-coral mb-4">
            C
          </div>
          <h1 className="text-3xl font-extrabold text-ink mb-1">Costahq Admin</h1>
          <p className="text-sm text-muted">Sign in to your dashboard</p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <Outlet />
        </div>
      </div>
    </AuthContext.Provider>
  );
}
