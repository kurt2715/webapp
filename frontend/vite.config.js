import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  server: {
    proxy: {
      "/api": {
        target: "http://8.217.7.70",
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        reader: resolve(__dirname, "reader.html"),
        login: resolve(__dirname, "login.html"),
        edit: resolve(__dirname, "edit.html"),
        admin: resolve(__dirname, "admin.html"),
      },
    },
  },
});
