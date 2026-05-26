import { motion } from 'framer-motion';
import 'owl.carousel/dist/assets/owl.carousel.css';
import 'owl.carousel/dist/assets/owl.theme.default.css';
import 'quill/dist/quill.snow.css';
import { Toaster } from 'react-hot-toast';
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from 'react-router';
import 'rsuite/dist/rsuite-no-reset.min.css';

export default function Layout() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        <link rel="stylesheet" href="/css/bootstrap.min.css" />
        <link rel="stylesheet" href="/css/style.css" />
        <link rel="stylesheet" href="/css/responsive.css" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/favicon_io/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon_io/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon_io/favicon-16x16.png"
        />
        <link rel="manifest" href="/favicon_io/site.webmanifest" />
      </head>
      <body>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.3 }}
        >
          <Outlet />
          <Toaster position="bottom-right" reverseOrder={true} gutter={2} />
        </motion.div>
        <ScrollRestoration />
        <Scripts />
        <script src="/js/jquery-3.3.1.js" />
        <script src="/js/ace-responsive-menu.js" />
        <script src="/js/bootstrap.min.js" />
        <script src="/js/jquery-migrate-3.0.0.min.js" />
        <script src="/js/jquery-scrolltofixed-min.js" />
        <script src="/js/jquery.mmenu.all.js" />
        <script src="/js/script.js" />
      </body>
    </html>
  );
}

export function ErrorBoundary({ error }) {
  return (
    <html>
      <head>
        <title>Oops!</title>
        <Meta />
        <Links />
      </head>
      <body>
        <h1>Oops!</h1>
        <p>Sorry, an unexpected error has occurred.</p>
        <p>
          <i>{error.message}</i>
        </p>
        <Scripts />
      </body>
    </html>
  );
}
