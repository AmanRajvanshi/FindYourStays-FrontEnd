import { useContext } from 'react';
import toast from 'react-hot-toast';
import { NavLink } from 'react-router';
import { AuthContext } from '../../AuthContextProvider';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHouse, 
  faMapLocationDot, 
  faHeart, 
  faBuilding, 
  faComments, 
  faEnvelope, 
  faFileLines, 
  faQuoteLeft, 
  faPenToSquare, 
  faUser,
  faRightFromBracket 
} from '@fortawesome/free-solid-svg-icons';

function AdminSidebar() {
  const { logout, authData } = useContext(AuthContext);

  // Route configuration with access keys
  const sidebarRoutes = [
    {
      path: '/admin/dashboard',
      label: 'Dashboard',
      icon: faHouse,
      key: 'dashboard',
    },
    {
      path: '/admin/state',
      label: 'States',
      icon: faMapLocationDot,
      key: 'states',
    },
    {
      path: '/admin/city',
      label: 'Cities',
      icon: faMapLocationDot,
      key: 'cities',
    },
    {
      path: '/admin/area',
      label: 'Areas',
      icon: faMapLocationDot,
      key: 'areas',
    },
    {
      path: '/admin/amenities',
      label: 'Amenities',
      icon: faHeart,
      key: 'amenities',
    },
    {
      path: '/admin/nearbyLocations',
      label: 'Nearby Facilities',
      icon: faMapLocationDot,
      key: 'nearby-facilities',
    },
    {
      path: '/admin/propertyTypes',
      label: 'Property Types',
      icon: faBuilding,
      key: 'property-types',
    },
    {
      path: '/admin/properties',
      label: 'Properties',
      icon: faBuilding,
      key: 'properties',
    },
    {
      path: '/admin/enquiries',
      label: 'Property Enquiries',
      icon: faComments,
      key: 'property-enquiries',
    },
    {
      path: '/admin/contact-queries',
      label: 'Contact Enqueries',
      icon: faEnvelope,
      key: 'contact-enqueries',
    },
    {
      path: '/admin/user-listings-enquiries',
      label: 'User Listings Enquiries',
      icon: faEnvelope,
      key: 'user-listings-enquiries',
    },
    {
      path: '/admin/blogs-and-articles',
      label: 'Blogs / Articles',
      icon: faFileLines,
      key: 'blogs-articles',
    },
    {
      path: '/admin/testimonials',
      label: 'Testimonials',
      icon: faQuoteLeft,
      key: 'testimonials',
    },
    {
      path: '/admin/custom-pages',
      label: 'Custom Pages',
      icon: faPenToSquare,
      key: 'custom-pages',
    },
    {
      path: '/admin/counters',
      label: 'Counters',
      icon: faPenToSquare,
      key: 'counters',
    },
    {
      path: '/admin/users',
      label: 'Users',
      icon: faUser,
      key: 'users',
    },
  ];

  // Check if user has access to a specific route
  const hasAccess = (routeKey) => {
    const routes = authData?.userData?.routes || [];
    return routes.includes('everything') || routes.includes(routeKey);
  };

  return (
    <div className="flex flex-col h-full bg-white text-gray-800">
      {/* Brand Logo Area */}
      <div className="flex items-center justify-center h-12 border-b border-gray-100 shrink-0">
        <p className="text-lg font-bold text-gray-900 tracking-tight">Costahq Admin</p>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {sidebarRoutes.map(({ path, label, icon, key }) =>
          hasAccess(key) ? (
            <NavLink
              key={key}
              to={path}
              className={({ isActive }) =>
                `flex items-center px-3 py-2 rounded-full text-sm font-medium transition-colors duration-200 group ${isActive
                  ? 'bg-[var(--color-coral-light)]! text-coraldark! shadow-sm font-bold'
                  : 'text-muted hover:bg-gray-50 hover:text-ink'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <FontAwesomeIcon
                    icon={icon}
                    className={`mr-3 text-lg ${isActive ? 'text-coral!' : 'text-gray-400 group-hover:text-muted'
                      }`}
                  />
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          ) : null
        )}
      </nav>

      {/* Footer Area with Logout */}
      <div className="p-4 border-t border-gray-100 shrink-0">
        <button
          className="flex w-full items-center justify-center px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 hover:text-red-700 transition-colors"
          type="button"
          onClick={() => {
            toast.success('Logout successful');
            logout();
          }}
        >
          <FontAwesomeIcon icon={faRightFromBracket} className="mr-2" /> Logout
        </button>
      </div>
    </div>
  );
}

export default AdminSidebar;
