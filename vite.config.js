import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {

      output: {
        // Let Vite handle chunks automatically to avoid initialization order issues
},
    },
  },
})
