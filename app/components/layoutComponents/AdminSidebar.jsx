import { useContext } from 'react';
import toast from 'react-hot-toast';
import { NavLink } from 'react-router';
import { AuthContext } from '../../AuthContextProvider';

function AdminSidebar() {
  const { logout, authData } = useContext(AuthContext);

  // Route configuration with access keys
  const sidebarRoutes = [
    {
      path: '/admin/dashboard',
      label: 'Dashboard',
      icon: 'flaticon-home',
      key: 'dashboard',
    },
    {
      path: '/admin/state',
      label: 'States',
      icon: 'flaticon-maps-and-flags',
      key: 'states',
    },
    {
      path: '/admin/city',
      label: 'Cities',
      icon: 'flaticon-maps-and-flags',
      key: 'cities',
    },
    {
      path: '/admin/area',
      label: 'Areas',
      icon: 'flaticon-maps-and-flags',
      key: 'areas',
    },
    {
      path: '/admin/amenities',
      label: 'Amenities',
      icon: 'flaticon-heart',
      key: 'amenities',
    },
    {
      path: '/admin/nearbyLocations',
      label: 'Nearby Facilities',
      icon: 'flaticon-maps-and-flags',
      key: 'nearby-facilities',
    },
    {
      path: '/admin/propertyTypes',
      label: 'Property Types',
      icon: 'flaticon-house',
      key: 'property-types',
    },
    {
      path: '/admin/properties',
      label: 'Properties',
      icon: 'flaticon-house',
      key: 'properties',
    },
    {
      path: '/admin/enquiries',
      label: 'Property Enquiries',
      icon: 'flaticon-chat',
      key: 'property-enquiries',
    },
    {
      path: '/admin/contact-queries',
      label: 'Contact Enqueries',
      icon: 'flaticon-envelope',
      key: 'contact-enqueries',
    },
    {
      path: '/admin/user-listings-enquiries',
      label: 'User Listings Enquiries',
      icon: 'flaticon-envelope',
      key: 'user-listings-enquiries',
    },
    {
      path: '/admin/blogs-and-articles',
      label: 'Blogs / Articles',
      icon: 'flaticon-document',
      key: 'blogs-articles',
    },
    {
      path: '/admin/testimonials',
      label: 'Testimonials',
      icon: 'flaticon-reply',
      key: 'testimonials',
    },
    {
      path: '/admin/custom-pages',
      label: 'Custom Pages',
      icon: 'flaticon-edit',
      key: 'custom-pages',
    },
    {
      path: '/admin/counters',
      label: 'Counters',
      icon: 'flaticon-edit',
      key: 'counters',
    },
    {
      path: '/admin/users',
      label: 'Users',
      icon: 'flaticon-user',
      key: 'users',
    },
  ];

  // Check if user has access to a specific route
  const hasAccess = (routeKey) => {
    const routes = authData?.userData?.routes || [];
    return routes.includes('everything') || routes.includes(routeKey);
  };

  return (
    <div className="dashboard_sidebar_menu dn-992">
      <ul className="sidebar-menu">
        <li className="sidebar-header">
          <img src="/logos/full_logo.png" alt="header-logo" className="px-0" />
        </li>

        <div className="sidebar-menu-list">
          {sidebarRoutes.map(({ path, label, icon, key }) =>
            hasAccess(key) ? (
              <li key={key}>
                <NavLink to={path}>
                  <i className={icon} /> <span>{label}</span>
                </NavLink>
              </li>
            ) : null
          )}
        </div>

        <li className="sidebar-footer">
          <button
            className="btn btn-danger btn-block"
            type="button"
            onClick={() => {
              toast.success('Logout successful');
              logout();
            }}
          >
            <i className="flaticon-logout" /> Logout
          </button>
        </li>
      </ul>
    </div>
  );
}

export default AdminSidebar;
