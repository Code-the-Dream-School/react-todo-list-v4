import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');

  // Use VITE_BACK_END as proxy target, fallback to localhost
  const proxyTarget = env.VITE_BACK_END || 'http://localhost:3000';

  const proxyConfig = {
    target: proxyTarget,
    changeOrigin: true,
    secure: proxyTarget.startsWith('https://'),
    configure: (proxy) => {
      proxy.on('proxyReq', (proxyReq) => {
        // Set the Origin header to match the target for cookie handling
        proxyReq.setHeader('Origin', proxyTarget);
      });
    },
  };

  return {
    plugins: [react()],
    server: {
      port: 3001,
      proxy: {
        '/api': proxyConfig,
      },
    },
  };
});
