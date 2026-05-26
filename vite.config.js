import { reactRouter } from '@react-router/dev/vite';

export default {
  plugins: [
    reactRouter(), // This should be the main plugin for React Router v7
  ],
  server: {
    open: true,
    port: 5173,
  },
  ssr: {
    noExternal: ['react-quilljs', 'quill'],
  }
};
