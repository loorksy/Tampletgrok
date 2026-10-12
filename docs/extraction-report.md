# Extraction report

## Source

| | |
| --- | --- |
| Upstream repository | https://github.com/elie222/rakazo |
| License | Apache-2.0 |
| Commit | `c9375d4291d19ac35bbfe826255d19d976c81c38` |
| Commit subject | fix(core): keep balanced parentheses in links found by search (#1339) |
| Commit date | 2026-10-12 |

The destination is https://github.com/loorksy/Tampletgrok. The Rakazo repository was not modified.

## Extracted paths

| Upstream path | Destination |
| --- | --- |
| `apps/web` | `apps/web` |
| `apps/mobile` | `apps/mobile` |
| `packages/ui-web` | `packages/ui-web` |
| `packages/ui-tokens` | `packages/ui-tokens` |
| `packages/chat-ui` | `packages/chat-ui` |
| `packages/contracts` | `packages/contracts` |
| `packages/core` | `packages/core` |
| `infra/sandboxes/computer/embed.html` | Removed in the isolation audit. It only served the noVNC proxy test. |

Package scope `@rakazo/` was renamed to `@tampletgrok/`.

Added, and not present upstream:

| Path | Purpose |
| --- | --- |
| `packages/mock-adapters` | Demo workspace and procedure dispatcher |
| `packages/contracts/src/adapters.ts` | Backend ports |
| `packages/ui-tokens/src/brand.ts` | White-label identity |
| `examples/api-integration` | Example HTTP adapters |
| `apps/web/src/lib/auth.ts` | Replaced with a local demo session |
| `apps/web/src/lib/rpc.ts` | Replaced with the demo dispatcher |
| `apps/web/vite.config.ts` | Standalone Vite config |
| `docs/` | This documentation |

## Screens

Web page modules: 44, including the shell, welcome, auth, onboarding, artifacts, board, models, voice, memory, messaging, routines, integrations, plugins, MCP, computer-related panels, and settings overlays.

Mobile routes: 23, including inbox, sign-in, threads, groups, assistant settings, computer, artifacts, routines, and the settings stack.

## Reusable components

| Location | Modules |
| --- | --- |
| `packages/ui-web` | 29 |
| `apps/web/src/components` | 31 |
| `apps/mobile/components` | 54 |
| `packages/chat-ui` | 6 |

Count is of `.tsx` files that are not tests.

## Dependencies removed

Not copied, and not referenced by the apps:

- `apps/api`, `apps/worker`, `apps/desktop`, `apps/www`
- `packages/db`, `packages/auth`, `packages/adapters`, `packages/adapter-kit`, `packages/memory`, `packages/logging`, `packages/testkit`
- Prisma, PostgreSQL, Hono server handlers, Better Auth server, agent executor, sandbox supervisor, Docker compose, the updater service
- The upstream EAS project id and `u.expo.dev` update URL
- Playwright browser suites that drove the API

`better-auth` and `@orpc/client` are not dependencies of the web app. `@orpc/contract` stays inside `@tampletgrok/contracts` as the schema library for the extracted procedure types.

## Dependencies retained

React 19, Vite, Tailwind 4, Lingui, Expo SDK 57, React Native 0.86, React Navigation via Expo Router, the upstream UI libraries (`@base-ui/react`, `lucide-react`, `cmdk`), and the markdown stack used by chat. `packages/core` still depends on the markdown and cron libraries the screens import.

## Backend coupling removed

- Web no longer proxies `/api` or `/rpc` to a Rakazo server, and no longer proxies noVNC.
- Web no longer creates an oRPC browser client.
- Web no longer creates a Better Auth client.
- The default privacy URL is `https://example.com/privacy` instead of `https://rakazo.com/privacy/`.
- Product title, mobile name, scheme, and bundle ids default to Tampletgrok / `com.tampletgrok.app`.
- Demo chat, assistants, settings, models, routines, and activity are served by `setAppAdapters` ports.

The mobile procedure client can still post to a base URL when demo mode is off. That is an optional compatible transport, documented in `docs/integration.md`.

## Isolation audit

Reviewed after the first extraction, on the same branch:

- All 44 web page modules are still present and referenced by the app source. All 23 mobile route files are still present. `group-thread.tsx` re-exports the thread screen, which is the upstream route split.
- Removed from `packages/core` because no screen imported them: agent-skill parser, bot-to-bot hop policy, messaging prompt text, compose/self update, sandbox command timeouts, screen leases, server secret guard, and the `node/` runtime (env loader, desktop runtime, terminal server, screen proxy, approval hash). Their tests were removed with them.
- Removed `apps/web/src/screen-proxy.ts`, `novnc-html.ts`, and `infra/sandboxes`. The computer workspace component remains.
- Kept `packages/contracts` as the screen data model. It is not a server.
- Replaced remaining product-name strings in the web translation JSON files. Storage keys such as `rakazo.uiAppearance`, the header `x-rakazo-space-id`, and the `RakazoNotifications` native class stay, because renaming them would break the extracted client and its tests. Attribution in `README`, `NOTICE`, and this report still names Rakazo.
- Custom adapters are now read by the same procedures the screens already call. See `docs/integration.md`.
- No Android emulator or device was present (`adb` and `emulator` are not installed). Android runtime launch was not performed.

## Known limitations

- Demo replies are local strings. They are not model output.
- Voice, computer pixels, billing, provider OAuth, and software update do not perform those operations. The computer boot path reports an error state because no sandbox is connected.
- The in-memory demo resets on reload.
- Some internal storage keys and the space header `x-rakazo-space-id` still use the upstream prefix so the extracted client and its tests stay consistent.
- The Android notification module class remains `RakazoNotifications`.
- `userInterfaceStyle: automatic` prints an Expo prebuild note about `expo-system-ui`. Appearance is applied by the app's own palette.
- The noVNC screen proxy and sandbox embed were removed. The computer screen still renders and shows that no computer is connected.
- No Android emulator or iOS simulator was available, so native process launch was not smoke-tested. JS bundles and native project generation were.

## Testing

Commands that passed on Node v22.22.2:

| Command | Result |
| --- | --- |
| `pnpm check` | Pass. Contracts, tokens, core, ui-web, chat-ui, mock-adapters, web, mobile, and the example typecheck. |
| `pnpm test` | Pass after the isolation audit. 267 files, 2585 tests passed. The drop is the removed backend-only tests. |
| `pnpm build:web` | Pass. Vite production build. |
| `pnpm dev:web` | Pass. Serves `http://127.0.0.1:5173`. |
| Browser render of `/app` | Pass. Sidebar shows Ada, Nia, Sol, and Launch review. Sending "Hello demo" appends that text and a reply that says no model was called. |
| Dark theme | Pass. `data-theme="dark"` and body background `rgb(11, 12, 14)`. |
| 390px viewport | Pass. Ada remains visible and the composer stays inside the viewport. |
| `expo config --type public` | Pass. Name Tampletgrok, scheme `tampletgrok`, bundle id and package `com.tampletgrok.app`. |
| `expo install --check` | Pass. Dependencies match the SDK. |
| `expo export --platform android` | Pass. Hermes bundle emitted. |
| `expo export --platform ios` | Pass. Hermes bundle emitted. |
| `expo prebuild --no-install` for Android and iOS | Pass. `applicationId` and `PRODUCT_BUNDLE_IDENTIFIER` are `com.tampletgrok.app`. |

A first browser load failed closed with "Something went wrong" because the demo session hook returned a new object on every snapshot and React hit its update limit. The session snapshot is now cached. The render above is after that fix.

The isolation audit re-ran `pnpm check`, `pnpm test` (2585 passed), `pnpm build:web`, Android and iOS `expo export`, and `expo prebuild --no-install` for both platforms. `applicationId` and `PRODUCT_BUNDLE_IDENTIFIER` are `com.tampletgrok.app`. The generated Android project calls `autolinkLibrariesWithApp()`. The local notification module is declared by `apps/mobile/package.json` (`nativeModulesDir`) and `expo-module.config.json` as `RakazoNotifications`. Autolinking was not executed on a device. No emulator or `adb` binary was installed, so an Android process was not launched.

## Licensing

Apache-2.0. See `LICENSE` and `NOTICE`. Upstream copyright stays with the Rakazo authors. Tampletgrok does not claim ownership of unmodified upstream files. Modified files that replace the network or brand edge are marked in `NOTICE` and, where practical, with a short file comment.
