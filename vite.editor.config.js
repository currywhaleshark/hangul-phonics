import { defineConfig } from "vite";
import { timingRenderPlugin } from "./tools/timing-render-plugin.js";

export default defineConfig({
  plugins: [timingRenderPlugin()],
  server: {
    host: "127.0.0.1",
    port: 3001,
    strictPort: true,
    open: false,
  },
});
