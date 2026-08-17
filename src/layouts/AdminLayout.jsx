// layouts/AdminLayout.jsx
import { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router';
import { AuthContext } from '../AuthContextProvider';
import AdminFooter from '../components/layoutComponents/AdminFooter';
import AdminSidebar from '../components/layoutComponents/AdminSidebar';
import AdminTopbar from '../components/layoutComponents/AdminTopbar';
import { apiUrl } from '../envConfig';

export function meta() {
  return [{ title: 'Admin | Find Your Stays' }];
}

export default function AdminLayout() {
  const [is_login, setIs_login] = useState(false);
  const [authData, setAuthData] = useState({});
  const [loader, setLoader] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const items = JSON.parse(localStorage.getItem('@authLoginData'));
    if (items !== null) {
      getProfile(items.token);
    } else {
      logout();
    }
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    // Redirect to login if not logged in and not already on login page
    if (!loader && !is_login && location.pathname !== '/admin/login') {
      navigate('/admin/login');
    }
    // eslint-disable-next-line
  }, [is_login, loader, location.pathname]);

  const getProfile = (token) => {
    fetch(apiUrl + 'admin/get-profile', {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: token,
      },
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.status) {
          login(json.data, token);
        } else {
          logout();
        }
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setLoader(false);
      });
  };

  const login = (userData, token) => {
    setAuthData({ userData, token });
    setIs_login(true);
  };

  const logout = () => {
    localStorage.removeItem('@authLoginData');
    setAuthData({});
    setIs_login(false);
    setLoader(false);
  };

  if (loader) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="loader" />
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        login: login,
        logout: logout,
        authData: authData,
        is_login: is_login,
        getProfile: getProfile,
        loader: loader,
      }}
    >
      <div className="flex h-screen bg-section font-body text-left text-ink">
        <aside className="w-64 flex-shrink-0 bg-paper border-r border-line shadow-sm overflow-y-auto">
          <AdminSidebar />
        </aside>
        
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <header className="bg-paper border-b border-line shadow-sm z-10">
            <AdminTopbar />
          </header>
          
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-section">
            <div className="max-w-7xl mx-auto w-full">
              <Outlet />
            </div>
          </main>
          
          <footer className="bg-paper border-t border-line p-4 shrink-0 text-center text-sm text-muted">
            <AdminFooter />
          </footer>
        </div>
      </div>
    </AuthContext.Provider>
  );
}
