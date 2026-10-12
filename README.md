# Tampletgrok

Tampletgrok is a standalone web and Expo interface for an assistant product. It is extracted from [Rakazo](https://github.com/elie222/rakazo) at commit `c9375d4291d19ac35bbfe826255d19d976c81c38` and licensed under Apache-2.0. The screens, chat, navigation, and visual system are the upstream interface. The Rakazo server, database, agent runtime, and deployment stack are not included.

The default install runs a local demo. Sample assistants, conversations, settings, and model choices render without an API. Replies are labeled as demo text. Nothing is sent to a model provider.

## What is included

- Vite web app in `apps/web`
- Expo Router app in `apps/mobile` for Android and iOS
- Design system in `packages/ui-web` and tokens in `packages/ui-tokens`
- Shared markdown chat rendering in `packages/chat-ui`
- Domain types in `packages/contracts`
- Presentation helpers in `packages/core`
- Demo data and adapter ports in `packages/mock-adapters`
- An HTTP adapter example in `examples/api-integration`

## What was left out

The Rakazo API, worker, PostgreSQL schema, Prisma client, Better Auth server, agent executor, sandbox supervisor, Docker compose stack, updater, and hosted Expo project are not in this repository. Voice synthesis, a live computer screen, billing checkout, and provider OAuth are visible in the UI and answer locally. They do not call those services.

## Requirements

- Node.js 22.22 or newer
- pnpm 9.15
- For a device build: the Expo CLI, plus Android Studio or Xcode

## Web

```bash
pnpm install
pnpm dev:web
```

The dev server prints a local URL, by default `http://127.0.0.1:5173`. You land in the demo workspace as Avery Chen. Open Ada and send a message. The reply says that no model was called.

```bash
pnpm build:web
pnpm --filter @tampletgrok/web preview
```

Other checks:

```bash
pnpm check
pnpm test
```

## Mobile

```bash
pnpm dev:mobile
```

That runs `expo start` in `apps/mobile`. With no `EXPO_PUBLIC_API_URL`, the app uses the same local demo data. Press `a` or `i` from the Expo CLI when an emulator is available, or scan the QR code with Expo Go.

JavaScript bundles for both platforms:

```bash
pnpm export:android
pnpm export:ios
```

Native projects:

```bash
pnpm --filter @tampletgrok/mobile exec expo prebuild --no-install
pnpm --filter @tampletgrok/mobile android
pnpm --filter @tampletgrok/mobile ios
```

`android` and `ios` need a local SDK and, for a store build, your own signing credentials. This template does not ship an EAS project id or a hosted update URL.

`pnpm --filter @tampletgrok/mobile check:expo` checks that the native dependency versions match the installed Expo SDK.

## Demo mode

The web procedure client reads `packages/mock-adapters` until you call `setAppAdapters`. The mobile app uses that same demo dispatcher until `EXPO_PUBLIC_API_URL` is set or a server URL is saved in the app.

Sample content includes three assistants (Ada, Nia, Sol), a group, routines, memory notes, an artifact, a ticket, and a model catalog. Connecting a model stores a label in memory and does not transmit a key.

## Connect a backend

Implement the ports in `@tampletgrok/contracts`:

- `ChatAdapter`
- `AssistantAdapter`
- `SettingsAdapter`
- `ModelAdapter`
- `RoutineAdapter`
- `ActivityAdapter`

Install them once, before the UI renders:

```ts
import { setAppAdapters } from "@tampletgrok/mock-adapters";
import { createHttpAdapters } from "./http-adapters";

setAppAdapters(createHttpAdapters({ baseUrl: "https://api.example.com" }));
```

`examples/api-integration` is a fetch implementation of those routes. Screens keep their current components. Ports you do not replace stay on the demo data.

On mobile, saving a server URL switches `rpc()` back to HTTP `POST /rpc/<procedure>` so a procedure-compatible API can be attached later. That path is optional. The adapter ports are the supported integration.

## Theme and brand

Change `packages/ui-tokens/src/brand.ts` for the product name, logo text, bundle ids, and privacy URL. Change `packages/ui-tokens/src/index.ts` for the default palette, then run:

```bash
pnpm --filter @tampletgrok/ui-tokens generate
```

`apps/web/src/theme.overrides.css` can override CSS variables without editing components. `applyThemeOverrides()` from `@tampletgrok/ui-tokens` updates web CSS variables and the in-memory palette the mobile app reads through `tokensForAppearance()`.

The web document title follows `brand.name` through the Vite config. Mobile display name, scheme, and bundle ids also honor:

- `EXPO_PUBLIC_APP_NAME`
- `EXPO_PUBLIC_URL_SCHEME`
- `EXPO_PUBLIC_IOS_BUNDLE_ID`
- `EXPO_PUBLIC_ANDROID_PACKAGE`

See `docs/theming.md` and `docs/mobile.md`.

## Use a component in another app

`@tampletgrok/ui-web` exports buttons, dialogs, menus, inputs, and the assistant avatar. `@tampletgrok/chat-ui/web` and `@tampletgrok/chat-ui/native` export the message markdown. `@tampletgrok/ui-tokens` exports the palette. Native screens stay in `apps/mobile` because they use Expo Router and platform files (`.ios.tsx`).

## Layout

```text
apps/web          Vite application
apps/mobile       Expo application
packages/ui-web   Web components
packages/ui-tokens  Palette, radius, brand
packages/chat-ui  Message markdown
packages/contracts  Types and adapter ports
packages/core     Shared presentation helpers
packages/mock-adapters  Demo data
examples/api-integration
docs
```

## Attribution

Upstream: https://github.com/elie222/rakazo

Commit: `c9375d4291d19ac35bbfe826255d19d976c81c38`

License: Apache-2.0 (`LICENSE`, `NOTICE`). This repository does not claim ownership of unmodified upstream code.

More detail is in `docs/architecture.md`, `docs/integration.md`, and `docs/extraction-report.md`.
