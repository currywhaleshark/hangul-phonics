import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 3000,
    open: true
  },
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        timingEditor: 'timing-editor.html',
        sortingGame: 'sorting-game.html',
        vowelGame: 'vowel-game.html'
      }
    }
  }
});
