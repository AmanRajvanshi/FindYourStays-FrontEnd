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
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">costahq Admin</h1>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <Outlet />
        </div>
      </div>
    </AuthContext.Provider>
  );
}
