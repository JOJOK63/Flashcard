import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  // for phone test
  build: {
    rollupOptions: {
      input: {
        main: "./index.html", // or your main entry file
      },
    },
  },

  optimizeDeps: {
    include: ["react", "react-dom"], // add your main dependencies here
  },
});
