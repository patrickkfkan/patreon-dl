import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from "vite-plugin-svgr";
import { viteStaticCopy } from "vite-plugin-static-copy";

export default defineConfig({
  plugins: [
    react(),
    svgr(),
    // Themes
    viteStaticCopy({
      targets: [
        {
          src: "../../../node_modules/bootstrap/dist/*",
          dest: "themes/bootstrap/default",
        },
        {
          src: "../../../node_modules/bootswatch/dist/*",
          dest: "themes/bootswatch",
        }
      ]
    })
  ],
  root: 'src/browse/web',
  build: {
    outDir: '../../../dist/browse/web'
  },
  resolve: {
    alias: {
      path: 'path-browserify',
    },
  },
});