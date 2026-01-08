// vite.config.js
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const backend = env.VITE_BACK_END;
  const isHttps = backend?.startsWith('https://');
  return defineConfig({
    plugins: [react()],
    server: {
      port: 3001,
      proxy: {
        '/remote-api': {
          target: backend,
          changeOrigin: true,
          secure: isHttps,
          rewrite: (p) => p.replace(/^\/remote-api/, ''),
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              // Manually set the Origin header to match your target
              proxyReq.setHeader('Origin', backend);
            });
          },
        },
      },
    },
  });
};
