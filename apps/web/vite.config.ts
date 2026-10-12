/**
 * Modified by Tampletgrok.
 * The upstream Vite config proxied /api, /rpc, and noVNC to the Rakazo server
 * and desktop stack. This config builds the interface by itself.
 */
import path from "node:path";
import { lingui } from "@lingui/vite-plugin";
import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
import { brand } from "../../packages/ui-tokens/src/brand.ts";

const webPort = Number(process.env.WEB_PORT ?? 5173);

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, path.resolve(import.meta.dirname), "");
  const appName = env.VITE_APP_NAME || brand.name;
  return {
    plugins: [
      react(),
      babel({ plugins: ["@lingui/babel-plugin-lingui-macro"] }),
      lingui(),
      tailwindcss(),
      {
        name: "tampletgrok-brand",
        transformIndexHtml(html: string) {
          return html.replaceAll("__APP_NAME__", appName);
        },
      },
    ],
    server: {
      host: "127.0.0.1",
      port: webPort,
      strictPort: false,
    },
    preview: {
      host: "127.0.0.1",
      port: webPort,
      strictPort: false,
    },
  };
});
