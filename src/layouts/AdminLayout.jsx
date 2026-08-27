import { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router';
import AdminSidebar from '../../src/components/layoutComponents/AdminSidebar';
import AdminTopbar from '../../src/components/layoutComponents/AdminTopbar';
import { AuthContext } from '../AuthContextProvider';
import { apiUrl } from '../envConfig';

export function meta() {
  return [{ title: 'Admin | CostaHQ' }];
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
      <div className="min-h-screen flex items-center justify-center bg-section">
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
      <div className="flex min-h-screen bg-section font-body text-left text-ink">
        <aside className="fixed left-0 top-0 w-64 h-screen bg-white border-r border-border shadow-sm overflow-y-auto">
          <AdminSidebar />
        </aside>

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden ml-64">
          <header className="h-16 border-b border-border shadow-sm z-10">
            <AdminTopbar />
          </header>

          <main className="flex-1 overflow-y-auto p-6 sm:p-8 lg:p-12 bg-section">
            <div className="max-w-7xl mx-auto w-full">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </AuthContext.Provider>
  );
}