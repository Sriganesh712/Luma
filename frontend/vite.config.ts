import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-supabase': ['@supabase/supabase-js'],
          'vendor-markdown': [
            'react-markdown', 'remark-gfm', 'remark-math',
            'rehype-katex', 'katex',
          ],
          'vendor-syntax': ['react-syntax-highlighter'],
          'vendor-ui': ['lucide-react', 'react-hot-toast', 'zustand'],
        },
      },
    },
  },
});
