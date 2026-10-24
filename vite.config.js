import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    server: {
      port: 5175,
      open: true,
      /*
       * `npm run dev` talks to the live API through this proxy.
       *
       * The live API runs in production and, rightly, does not accept
       * http://localhost as an origin, so a browser calling it straight from
       * the dev server was refused ("blocked by CORS policy"). Through the
       * proxy the browser only ever talks to localhost, and the API sees a
       * server-to-server request. Point it at a local backend with
       * VITE_API_PROXY=http://localhost:9100 in .env.development.local.
       */
      proxy: {
        '/api': {
          target: env.VITE_API_PROXY || 'https://api.smiraclub.com',
          changeOrigin: true,
          secure: true,
          configure: (proxy) => {
            proxy.on('proxyReq', (req) => req.removeHeader('origin'));
          },
        },
      },
    },
  };
});
