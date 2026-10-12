# Theming

The default palette is the upstream dark and light theme. Tokens are in `packages/ui-tokens/src/index.ts`:

- `primary`, `background`, `foreground`
- `sidebar`, `sidebarForeground`, `sidebarBorder`, `sidebarAccent`
- `card`, `cardForeground`
- `border`, `input`, `ring`
- `destructive`, `muted`, `accent`
- chat bubble colors
- `RADIUS` (`0.75rem`)

Assistant identity colors are not global tokens. Each assistant has a `color` string such as `#6A6BF5::shape_0`. Change that field on the assistant record.

## Change the default

Edit `darkTokens` and `lightTokens`, then regenerate CSS:

```bash
pnpm --filter @tampletgrok/ui-tokens generate
```

That rewrites `packages/ui-tokens/src/tokens.css`. Web components read the CSS variables. Do not hardcode new hex values into component files.

## Override without regenerating

`apps/web/src/theme.overrides.css` is imported last. Uncomment the example and set variables such as `--primary` and `--radius`.

At runtime:

```ts
import { applyThemeOverrides } from "@tampletgrok/ui-tokens";

applyThemeOverrides({
  primary: "#1d4ed8",
  background: "#0b0c0e",
  sidebar: "#111215",
  radius: "1rem",
});
```

`applyThemeOverrides` also updates the object returned by `tokensForAppearance()`, which the Expo app uses. Pass `"light"` or `"dark"` as the second argument when the override should apply to one scheme only.

## Light and dark

The web boot script in `apps/web/index.html` sets `data-theme` from `rakazo.uiAppearance` in local storage (`system`, `light`, or `dark`). The storage key is the upstream key so existing preference code and tests stay valid. Mobile stores the same key in Secure Store through `apps/mobile/lib/appearance.ts`.

## Brand

`packages/ui-tokens/src/brand.ts` holds the product name, logo text, bundle ids, scheme, and privacy URL. The welcome title and wordmark read `brand.logoText`. The Vite plugin writes `brand.name` into the document title.

Replace `apps/web/public` icons and `apps/mobile/assets` when you ship a different mark. The file `packages/ui-tokens/assets/AppIcon.icon` is the upstream orange icon, renamed only as a path.
