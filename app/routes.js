import { index, route, layout } from '@react-router/dev/routes';

export default [
  layout('layouts/LoginLayout.jsx', [
    index('routes/admin/rootRedirect.jsx'),
    route('/admin/login', 'routes/admin/login.jsx'),
  ]),

  layout('layouts/AdminLayout.jsx', [
    route('/admin/dashboard', 'routes/admin/dashboard.jsx'),
    route('/admin/state', 'routes/admin/states.jsx'),
    route('/admin/city', 'routes/admin/cities.jsx'),
    route('/admin/area', 'routes/admin/area.jsx'),
    route('/admin/amenities', 'routes/admin/amenities.jsx'),
    route('/admin/nearbyLocations', 'routes/admin/nearbyLocations.jsx'),
    route('/admin/properties', 'routes/admin/properties.jsx'),
    route('/admin/propertyTypes', 'routes/admin/propertyTypes.jsx'),
    route('/admin/add-property', 'routes/admin/propertyPages/addProperty.jsx'),
    route(
      '/admin/edit-property/:slug',
      'routes/admin/propertyPages/editProperty.jsx'
    ),
    route('/admin/enquiries', 'routes/admin/enquiries.jsx'),
    route('/admin/contact-queries', 'routes/admin/contactQueries.jsx'),
    route(
      '/admin/user-listings-enquiries',
      'routes/admin/userListingsEnquiries.jsx'
    ),
    route('/admin/blogs-and-articles', 'routes/admin/blogsAndArticles.jsx'),
    route('/admin/add-blogs', 'routes/admin/blogPages/addBlogs.jsx'),
    route('/admin/edit-blogs/:id', 'routes/admin/blogPages/editBlogs.jsx'),
    route('/admin/custom-pages', 'routes/admin/customPages.jsx'),
    route('/admin/admin-profile', 'routes/admin/adminProfile.jsx'),
    route('/admin/testimonials', 'routes/admin/testimonials.jsx'),
    route('/admin/counters', 'routes/admin/counters.jsx'),
    route('/admin/users', 'routes/admin/users.jsx'),
  ]),
];


