# Components

## Web design system

`packages/ui-web` re-exports the controls the screens use:

- Button, input, textarea, select, switch, checkbox, tabs
- Dialog, alert dialog, dropdown menu, popover, tooltip, command palette
- Card, badge, separator, skeleton, spinner
- `BotAvatar`, `GroupAvatar`, `Wordmark`
- `ModelThinkingOptions`

Import them from `@tampletgrok/ui-web`. Styles come from `@tampletgrok/ui-web/styles.css`, which pulls in the token CSS.

`Wordmark` renders `brand.logoText` from `@tampletgrok/ui-tokens`.

## Chat

- Web: `@tampletgrok/chat-ui/web`
- Native: `@tampletgrok/chat-ui/native`

Both render the message blocks the thread screens already pass in. Link icons are optional. The demo favicon procedure returns no icon, so links fall back to the globe.

## Web feature components

`apps/web/src/components` holds call cards, the computer workspace, integration setup, teaching overlays, and tool-activity disclosures. `apps/web/src/pages` holds the shell, settings overlays, artifacts, the board, routines, and auth. These are the extracted screens, not a new layout.

## Mobile

`apps/mobile/app` is the Expo Router tree. `apps/mobile/components` holds the composer, avatars, glass surfaces, native switches, voice cards, and computer cards. Platform files such as `glass-surface.ios.tsx` are the original native variants.

To reuse a native component in another Expo app, copy the component and its `lib` helper, or depend on the mobile package only if that app uses the same Expo SDK.

## Tokens

`packages/ui-tokens` is the shared palette. Web maps those values to Tailwind variables in `packages/ui-web/src/styles.css`. Mobile reads `tokensForAppearance()` from `apps/mobile/lib/theme.ts`.
