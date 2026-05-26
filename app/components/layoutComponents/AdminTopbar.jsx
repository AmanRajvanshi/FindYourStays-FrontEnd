import { useContext, useState } from 'react';
import { Link } from 'react-router';
import { AuthContext } from '../../AuthContextProvider';
import ChangePasswordModal from '../sharedComponents/ChangePasswordModal';

function AdminTopbar() {
  const { authData } = useContext(AuthContext);
  const [openChangePasswordModal, setOpenChangePasswordModal] = useState(false);

  const hasAccessToProfile = authData?.userData?.routes?.some(
    (route) => route === 'everything' || route === 'company-profile'
  );

  return (
    <>
      <header className="header-nav menu_style_home_one style2 home3 main-menu w-100">
        <div className="container-fluid p0">
          <nav>
            <ul
              className="ace-responsive-menu text-right"
              data-menu-style="horizontal"
            >
              <li className="px-3">
                <span
                  className="title"
                  style={{ cursor: 'pointer' }}
                  onClick={() => setOpenChangePasswordModal(true)}
                >
                  Update Password
                </span>
              </li>
              <li>
                <Link to="/">
                  <span className="title text-thm">Website</span>
                </Link>
              </li>
              {hasAccessToProfile && (
                <li>
                  <Link to="/admin/admin-profile">
                    <span className="title">Profile</span>
                  </Link>
                </li>
              )}
            </ul>
          </nav>
        </div>
      </header>
      <ChangePasswordModal
        userId={authData?.userData?.id}
        open={openChangePasswordModal}
        onClose={() => setOpenChangePasswordModal(false)}
      />
    </>
  );
}

export default AdminTopbar;
