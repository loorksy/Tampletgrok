import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const nativeStubs = fileURLToPath(new URL("./packages/chat-ui/src/native-test-stubs.tsx", import.meta.url));

export default defineConfig({
  resolve: {
    alias: [
      {
        find: /^@lingui\/core\/macro$/,
        replacement: fileURLToPath(new URL("./scripts/lingui-core-macro.ts", import.meta.url)),
      },
      {
        find: /^@ronradtke\/react-native-markdown-display$/,
        replacement: fileURLToPath(
          new URL(
            "./packages/chat-ui/node_modules/@ronradtke/react-native-markdown-display/src/index.tsx",
            import.meta.url,
          ),
        ),
      },
      ...["react-native-fit-image", "@react-native-vector-icons/material-design-icons"].map((dep) => ({
        find: new RegExp(`^${dep.replace(/[/]/g, "\\/")}$`),
        replacement: nativeStubs,
      })),
    ],
  },
  test: {
    environment: "node",
    setupFiles: ["./scripts/vitest-setup.ts"],
    include: [
      "packages/*/src/**/*.test.{ts,tsx}",
      "apps/web/src/**/*.test.{ts,tsx}",
      "apps/mobile/lib/**/*.test.{ts,tsx}",
      "apps/mobile/plugins/**/*.test.js",
    ],
    testTimeout: 30_000,
  },
});
