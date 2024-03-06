import { svelte } from "@sveltejs/vite-plugin-svelte";
import routify from "@roxi/routify/vite-plugin";
import { defineConfig } from "vite";
import { resolve } from "path";
import { ViteImageOptimizer } from "vite-plugin-image-optimizer";

const production = process.env.NODE_ENV === "production";

export default defineConfig({
  clearScreen: false,
  resolve: { alias: { "@": resolve("src") } },

  test: {
    environment: "jsdom",
    globals: true,
    server: {
      deps: { inline: ["@roxi/routify"] },
    },
  },
  plugins: [
    routify(),
    svelte({
      compilerOptions: {
        dev: !production,
      },
      extensions: [".svelte"],
    }),
    ViteImageOptimizer(),
  ],

  server: { host: "127.0.0.1", port: 8080 },

  define: {
    "process.env": process.env,
  },
});
