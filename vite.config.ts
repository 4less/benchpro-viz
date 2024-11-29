import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import { visualizer } from 'rollup-plugin-visualizer';


// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), nodePolyfills(), visualizer({ open: true, filename: 'bundle-visualization.html' })],
  base: '/benchpro-viz/',
  build: {
    rollupOptions: {
      treeshake: true  // Ensure tree shaking is enabled
    }
  }
})
