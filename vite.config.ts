import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [
      react(), 
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
        manifest: {
          name: 'Nepali Mart',
          short_name: 'NepaliMart',
          description: 'Authentic Nepali products at your doorstep',
          theme_color: '#ff4646',
          background_color: '#ffffff',
          display: 'standalone',
          display_override: ['standalone', 'fullscreen'],
          start_url: '/',
          orientation: 'portrait',
          icons: [
            {
              src: 'https://images.unsplash.com/photo-1590073242678-70ee3fc28e8e?q=80&w=192&h=192&auto=format&fit=crop',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: 'https://images.unsplash.com/photo-1590073242678-70ee3fc28e8e?q=80&w=512&h=512&auto=format&fit=crop',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable'
            }
          ]
        },
        devOptions: {
          enabled: true
        }
      })
    ],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
