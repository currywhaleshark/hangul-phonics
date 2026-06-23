import { defineConfig } from "vite";
import { timingRenderPlugin } from "./tools/timing-render-plugin.js";

export default defineConfig({
  plugins: [timingRenderPlugin()],
  server: {
    port: 3000,
    open: true,
  },
  build: {
    rollupOptions: {
      input: {
        main: "index.html",
        bromideEditor: "bromide-editor.html",
        timingEditor: "timing-editor.html",
        sortingGame: "sorting-game.html",
        vowelGame: "vowel-game.html",
      },
    },
  },
});
