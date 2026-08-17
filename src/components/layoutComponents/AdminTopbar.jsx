import { useContext, useState } from 'react';
import { Link } from 'react-router';
import { AuthContext } from '../../AuthContextProvider';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faUser } from '@fortawesome/free-solid-svg-icons';
import ChangePasswordModal from '../sharedComponents/ChangePasswordModal';

function AdminTopbar() {
  const { authData } = useContext(AuthContext);
  const [openChangePasswordModal, setOpenChangePasswordModal] = useState(false);

  const hasAccessToProfile = authData?.userData?.routes?.some(
    (route) => route === 'everything' || route === 'company-profile'
  );

  return (
    <>
      <header className="h-16 w-full flex items-center justify-end px-6 bg-paper border-b border-line shadow-sm">
        <nav>
          <ul className="flex items-center space-x-4 m-0! p-0! list-none!">
            <li>
              <button
                className="text-sm font-medium text-muted hover:text-coral! hover:bg-[var(--color-coral-light)]! px-3 py-2 rounded-md transition-colors"
                onClick={() => setOpenChangePasswordModal(true)}
              >
                <FontAwesomeIcon icon={faLock} className="mr-1.5" />
                Update Password
              </button>
            </li>
            {hasAccessToProfile && (
              <li>
                <Link
                  to="/admin/admin-profile"
                  className="text-sm font-medium text-muted hover:text-coral! hover:bg-[var(--color-coral-light)]! px-3 py-2 rounded-md transition-colors flex items-center"
                >
                  <FontAwesomeIcon icon={faUser} className="mr-1.5" />
                  Profile
                </Link>
              </li>
            )}
            <li className="ml-2 pl-4 border-l border-line flex items-center">
              <div className="w-8 h-8 rounded-full bg-[var(--color-coral-light)]! flex items-center justify-center text-coraldark! font-bold uppercase shrink-0">
                {authData?.userData?.name?.charAt(0) || 'A'}
              </div>
              <div className="ml-2 hidden sm:block">
                <p className="text-sm font-medium text-gray-700 m-0 leading-tight">
                  {authData?.userData?.name || 'Admin'}
                </p>
                <p className="text-xs text-gray-500 m-0 leading-tight">
                  {authData?.userData?.email || 'admin@example.com'}
                </p>
              </div>
            </li>
          </ul>
        </nav>
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
