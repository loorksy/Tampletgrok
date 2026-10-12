# Architecture

Tampletgrok keeps the Rakazo screen tree and replaces the network edge.

```text
screens (apps/web, apps/mobile)
  -> existing procedure calls (rpc.* / rpc("name"))
    -> packages/mock-adapters dispatch
      -> AppAdapters
        -> demo workspace, or your adapters
```

Web and mobile do not import the Rakazo API, database, or agent packages. They still import `@tampletgrok/contracts` for message, assistant, and settings types, and `@tampletgrok/core` for presentation helpers such as markdown previews, cron labels, and thread updates. Those helpers are pure functions. They do not start a model or a sandbox.

`@orpc/contract` remains only because the extracted contract file describes procedure inputs and outputs with it. There is no oRPC server and no oRPC HTTP client in the web app.

`packages/core` no longer includes the upstream updater, Docker image update, server secret guard, sandbox command timeout, screen lease, terminal server, desktop runtime, or root env loader. Those modules were not imported by any screen. Chart rendering (`@tampletgrok/core/plot`), message quotes, and the other presentation helpers the screens import are still there. `infra/sandboxes` was removed with the noVNC proxy; the computer panel remains a visual screen and reports that no computer is connected.

## Packages

| Package | Role |
| --- | --- |
| `@tampletgrok/web` | Browser application |
| `@tampletgrok/mobile` | Expo Router application |
| `@tampletgrok/ui-web` | Shared web controls and avatars |
| `@tampletgrok/ui-tokens` | Semantic colors, radius, brand |
| `@tampletgrok/chat-ui` | Web and native markdown |
| `@tampletgrok/contracts` | Domain types and adapter interfaces |
| `@tampletgrok/core` | UI helpers copied with the screens |
| `@tampletgrok/mock-adapters` | Demo workspace and `setAppAdapters` |

Native components stay in `apps/mobile/components`. Several files are `.ios.tsx` and depend on Expo. Moving them into a second package would split the Metro graph without making them easier to reuse.

There is no import cycle. `contracts` does not import apps. `mock-adapters` imports `contracts` only. Apps import `mock-adapters`. `ui-web` imports tokens and core, not the apps.

## Demo session

`apps/web/src/lib/auth.ts` holds an in-memory user so the shell opens immediately. It is not Better Auth. Replace that module when you add a real session.

`apps/web/src/lib/rpc.ts` is a proxy with the same call shape the screens already use (`rpc.threads.send`, `rpc.models.list`). Each call goes to `dispatchDemoProcedure`.

Mobile `rpc()` does the same while demo mode is on. `subscribeThread` listens to the in-memory event bus instead of a server-sent stream.

## What a screen can do offline

Navigation, search over sample messages, creating an assistant, editing settings that call the procedure layer, selecting a catalog model, and sending a chat message all update the in-memory workspace. A refresh in the browser starts again from the seed data. The mobile demo session is also in memory unless the user saves a real server URL.
