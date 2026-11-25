import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rolldownOptions: {
      input: { home: 'index.html', catalog: 'catalog/index.html' },
    },
  },
});
