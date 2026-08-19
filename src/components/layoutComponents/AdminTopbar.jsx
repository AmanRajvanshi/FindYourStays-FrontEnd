import { useContext, useState, useRef, useEffect } from 'react';
import { Link } from 'react-router';
import { AuthContext } from '../../AuthContextProvider';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faUser, faRightFromBracket } from '@fortawesome/free-solid-svg-icons';
import toast from 'react-hot-toast';
import ChangePasswordModal from '../sharedComponents/ChangePasswordModal';

function AdminTopbar() {
  const { authData, logout } = useContext(AuthContext);
  const [openChangePasswordModal, setOpenChangePasswordModal] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const hasAccessToProfile = authData?.userData?.routes?.some(
    (route) => route === 'everything' || route === 'company-profile'
  );

  return (
    <>
      <header className="h-16 w-full flex items-center justify-end px-6 border-b border-border">
        <nav>
          <ul className="flex items-center space-x-4 m-0! p-0! list-none!">
            <li className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-2 focus:outline-none cursor-pointer rounded-full px-3 py-2 transition-colors hover:bg-coral/5"
              >
                <div className="w-8 h-8 rounded-full bg-coral-light flex items-center justify-center text-coraldark! font-bold uppercase shrink-0">
                  {authData?.userData?.name?.charAt(0) || 'A'}
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-sm font-medium text-ink m-0 leading-tight">
                    {authData?.userData?.name || 'Admin'}
                  </p>
                  <p className="text-xs text-muted m-0 leading-tight">
                    {authData?.userData?.email || 'admin@example.com'}
                  </p>
                </div>
                <svg className={`w-4 h-4 text-muted transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-border py-2 z-50">
                  {hasAccessToProfile && (
                    <Link
                      to="/admin/admin-profile"
                      className="flex items-center px-4 py-2.5 text-sm text-ink hover:bg-coral/5 hover:text-coraldark! transition-colors w-full text-left"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <FontAwesomeIcon icon={faUser} className="mr-2 text-muted w-4" />
                      Profile
                    </Link>
                  )}
                  <button
                    type="button"
                    className="flex items-center px-4 py-2.5 text-sm text-ink hover:bg-coral/5 hover:text-coraldark! transition-colors w-full text-left"
                    onClick={() => {
                      setDropdownOpen(false);
                      setOpenChangePasswordModal(true);
                    }}
                  >
                    <FontAwesomeIcon icon={faLock} className="mr-2 text-muted w-4" />
                    Change Password
                  </button>
                  <div className="border-t border-border my-1"></div>
                  <button
                    type="button"
                    className="flex items-center px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                    onClick={() => {
                      setDropdownOpen(false);
                      toast.success('Logout successful');
                      logout();
                    }}
                  >
                    <FontAwesomeIcon icon={faRightFromBracket} className="mr-2 w-4" />
                    Logout
                  </button>
                </div>
              )}
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