// layouts/AdminLayout.jsx
import { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router';
import { AuthContext } from '../AuthContextProvider';
import AdminFooter from '../components/layoutComponents/AdminFooter';
import AdminSidebar from '../components/layoutComponents/AdminSidebar';
import AdminTopbar from '../components/layoutComponents/AdminTopbar';
import { apiUrl } from '../../envConfig';

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
      <div id="global-loader">
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
      <div className="d-flex flex-column min-vh-100 admin-sidebar bg-light border-end">
        <AdminSidebar />
        <div className="flex-grow-1 ml250 sm-ml-0">
          <AdminTopbar />
          <section className="bgc-f7 pb50 p-4">
            <div className="container-fluid">
              <Outlet />
            </div>
          </section>
        </div>
        <div className="ml250">
          <AdminFooter />
        </div>
      </div>
    </AuthContext.Provider>
  );
}
