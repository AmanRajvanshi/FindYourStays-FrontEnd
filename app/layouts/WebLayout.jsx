// layouts/WebLayout.jsx
import Header from '../components/layoutComponents/Header';
import Footer from '../components/layoutComponents/Footer';
import { Outlet } from 'react-router';
import { environment } from '../../envConfig';

export default function WebLayout() {
  return (
    <div className="d-flex flex-column min-vh-100 wrapper mm-page mm-slideout">
      <Header />
      <div className="flex-grow-1">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}
