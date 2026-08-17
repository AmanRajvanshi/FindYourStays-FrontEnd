import { createBrowserRouter, RouterProvider } from 'react-router';
import { adminRoutes } from './routes';
import { Toaster } from 'react-hot-toast';

const router = createBrowserRouter([
  ...adminRoutes
]);

function App() {
  return (
    <>
      <Toaster position="top-center" />
      <RouterProvider router={router} />
    </>
  );
}

export default App;
