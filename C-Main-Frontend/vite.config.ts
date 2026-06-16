import { defineConfig } from 'vite';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// Work around Vite mis-parsing "#" in the parent folder name (c# project).
const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)));

export default defineConfig({
  root: projectRoot,
  cacheDir: resolve(projectRoot, 'node_modules', '.vite'),
  server: {
    fs: {
      strict: false,
      allow: [projectRoot, resolve(projectRoot, '..')],
    },
  },
});
