import React, { Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router';
import LoginLayout from './layouts/LoginLayout';
import AdminLayout from './layouts/AdminLayout';

const RootRedirect = React.lazy(() => import('./pages/admin/rootRedirect'));
const Login = React.lazy(() => import('./pages/admin/login'));
const Dashboard = React.lazy(() => import('./pages/admin/dashboard'));
const States = React.lazy(() => import('./pages/admin/states'));
const Cities = React.lazy(() => import('./pages/admin/cities'));
const Area = React.lazy(() => import('./pages/admin/area'));
const Amenities = React.lazy(() => import('./pages/admin/amenities'));
const NearbyLocations = React.lazy(() => import('./pages/admin/nearbyLocations'));
const Properties = React.lazy(() => import('./pages/admin/properties'));
const Brands = React.lazy(() => import('./pages/admin/brands'));
const PropertyTypes = React.lazy(() => import('./pages/admin/propertyTypes'));
const AddProperty = React.lazy(() => import('./pages/admin/propertyPages/addProperty'));
const EditProperty = React.lazy(() => import('./pages/admin/propertyPages/editProperty'));
const Enquiries = React.lazy(() => import('./pages/admin/enquiries'));
const ContactQueries = React.lazy(() => import('./pages/admin/contactQueries'));
const UserListingsEnquiries = React.lazy(() => import('./pages/admin/userListingsEnquiries'));
const BlogsAndArticles = React.lazy(() => import('./pages/admin/blogsAndArticles'));
const AddBlogs = React.lazy(() => import('./pages/admin/blogPages/addBlogs'));
const EditBlogs = React.lazy(() => import('./pages/admin/blogPages/editBlogs'));
const CustomPages = React.lazy(() => import('./pages/admin/customPages'));
const AdminProfile = React.lazy(() => import('./pages/admin/adminProfile'));
const Testimonials = React.lazy(() => import('./pages/admin/testimonials'));
const Counters = React.lazy(() => import('./pages/admin/counters'));
const Users = React.lazy(() => import('./pages/admin/users'));
const Faqs = React.lazy(() => import('./pages/admin/faqs'));

const adminRoutes = [
  {
    element: <LoginLayout />,
    children: [
      { index: true, element: <Suspense fallback={<div />}><RootRedirect /></Suspense> },
      { path: '/admin', element: <Suspense fallback={<div />}><RootRedirect /></Suspense> },
      { path: '/admin/login', element: <Suspense fallback={<div />}><Login /></Suspense> },
    ],
  },
  {
    element: <AdminLayout />,
    children: [
      { path: '/admin/dashboard', element: <Suspense fallback={<div />}><Dashboard /></Suspense> },
      { path: '/admin/state', element: <Suspense fallback={<div />}><States /></Suspense> },
      { path: '/admin/city', element: <Suspense fallback={<div />}><Cities /></Suspense> },
      { path: '/admin/area', element: <Suspense fallback={<div />}><Area /></Suspense> },
      { path: '/admin/amenities', element: <Suspense fallback={<div />}><Amenities /></Suspense> },
      { path: '/admin/nearbyLocations', element: <Suspense fallback={<div />}><NearbyLocations /></Suspense> },
      { path: '/admin/properties', element: <Suspense fallback={<div />}><Properties /></Suspense> },
      { path: '/admin/brands', element: <Suspense fallback={<div />}><Brands /></Suspense> },
      { path: '/admin/propertyTypes', element: <Suspense fallback={<div />}><PropertyTypes /></Suspense> },
      { path: '/admin/add-property', element: <Suspense fallback={<div />}><AddProperty /></Suspense> },
      { path: '/admin/edit-property/:slug', element: <Suspense fallback={<div />}><EditProperty /></Suspense> },
      { path: '/admin/enquiries', element: <Suspense fallback={<div />}><Enquiries /></Suspense> },
      { path: '/admin/contact-queries', element: <Suspense fallback={<div />}><ContactQueries /></Suspense> },
      { path: '/admin/user-listings-enquiries', element: <Suspense fallback={<div />}><UserListingsEnquiries /></Suspense> },
      { path: '/admin/blogs-and-articles', element: <Suspense fallback={<div />}><BlogsAndArticles /></Suspense> },
      { path: '/admin/add-blogs', element: <Suspense fallback={<div />}><AddBlogs /></Suspense> },
      { path: '/admin/edit-blogs/:id', element: <Suspense fallback={<div />}><EditBlogs /></Suspense> },
      { path: '/admin/custom-pages', element: <Suspense fallback={<div />}><CustomPages /></Suspense> },
      { path: '/admin/admin-profile', element: <Suspense fallback={<div />}><AdminProfile /></Suspense> },
      { path: '/admin/testimonials', element: <Suspense fallback={<div />}><Testimonials /></Suspense> },
      { path: '/admin/counters', element: <Suspense fallback={<div />}><Counters /></Suspense> },
      { path: '/admin/users', element: <Suspense fallback={<div />}><Users /></Suspense> },
      { path: '/admin/faqs', element: <Suspense fallback={<div />}><Faqs /></Suspense> },
    ],
  },
];

const router = createBrowserRouter(adminRoutes);

export default function AppRoutes() {
  return <RouterProvider router={router} />;
}


