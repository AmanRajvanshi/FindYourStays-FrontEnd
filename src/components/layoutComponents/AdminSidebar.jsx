import {
  faBuilding,
  faComments,
  faEnvelope,
  faFileLines,
  faHeart,
  faHouse,
  faMapLocationDot,
  faPenToSquare,
  faQuoteLeft,
  faUser
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useContext } from 'react';
import { NavLink } from 'react-router';
import { AuthContext } from '../../AuthContextProvider';

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
      key: 'contact-enquiries',
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
    <div className="flex flex-col h-full bg-white">
      {/* Brand Logo Area */}
      <div className="flex items-center justify-center h-16 border-b border-border shrink-0 px-6">
        <p className="text-xl font-bold tracking-tight bg-linear-to-r from-coral to-coraldark bg-clip-text text-transparent">
          Costahq Admin
        </p>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-4 px-4 space-y-1.5 overflow-y-auto">
        {sidebarRoutes.map(({ path, label, icon, key }) =>
          hasAccess(key) ? (
            <NavLink
              key={key}
              to={path}
              className={({ isActive }) =>
                `relative flex items-center px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 group ${isActive
                  ? 'bg-coral-light! text-coraldark! shadow-xs'
                  : 'text-muted hover:bg-coral/5! hover:text-coraldark!'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute left-0 top-1/4 bottom-1/4 w-1.5 bg-coral rounded-r-md" />
                  )}
                  <FontAwesomeIcon
                    icon={icon}
                    className={`mr-3 text-base transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-coraldark!' : 'text-muted group-hover:text-coraldark!'}`}
                  />
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          ) : null
        )}
      </nav>
    </div>
  );
}

export default AdminSidebar;