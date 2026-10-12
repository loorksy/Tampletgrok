# Mobile

The Expo app is a real React Native project. It is not a WebView of the website.

## Run

```bash
pnpm install
pnpm dev:mobile
```

`dev:mobile` is `expo start` in `apps/mobile`. Demo mode is the default. The inbox loads Ada, Nia, Sol, and the Launch review group from `packages/mock-adapters`.

Set `EXPO_PUBLIC_API_URL` only when you want the procedure client to call a server. A release profile that sets that variable requires `https://`.

## Identity

`apps/mobile/app.json` defaults:

| Setting | Value |
| --- | --- |
| name | Tampletgrok |
| scheme | tampletgrok |
| iOS bundle id | com.tampletgrok.app |
| Android package | com.tampletgrok.app |

`app.config.ts` overrides those from `EXPO_PUBLIC_APP_NAME`, `EXPO_PUBLIC_URL_SCHEME`, `EXPO_PUBLIC_IOS_BUNDLE_ID`, and `EXPO_PUBLIC_ANDROID_PACKAGE`.

There is no EAS project id and no `u.expo.dev` update URL. Add your own if you use EAS.

## Screens

Routes under `apps/mobile/app`:

- Inbox, sign-in, new assistant, new group, new space
- Thread, group thread, routine
- Bot settings, group settings
- Computer, artifacts, image preview
- Server URL sheet
- Settings: account, models, voice, integrations, integration setup, archived assistants, AI data sharing, change password

## Native projects

These commands were run in this extraction and completed:

```bash
pnpm --filter @tampletgrok/mobile exec expo config --type public
pnpm --filter @tampletgrok/mobile exec expo install --check
pnpm export:android
pnpm export:ios
pnpm --filter @tampletgrok/mobile exec expo prebuild --no-install --platform android
pnpm --filter @tampletgrok/mobile exec expo prebuild --no-install --platform ios
```

Prebuild wrote `apps/mobile/android` and `apps/mobile/ios` with application id `com.tampletgrok.app`. Those directories are gitignored. Generate them again on a machine with the Android SDK or Xcode before `pnpm --filter @tampletgrok/mobile android` or `ios`.

No emulator or simulator was launched here, so this extraction does not claim a device smoke test.

Prebuild prints a note that `userInterfaceStyle: automatic` wants `expo-system-ui`. The app already applies its own light and dark palette. The warning does not block the JS bundle or the native project generation.

## Permissions

Camera, photo, microphone, and speech strings in `app.json` say Tampletgrok. The local notification module is still the upstream `RakazoNotifications` class under `com.rakazo.notifications`. Renaming that Java package would break the Expo module registration. Treat it as an inherited module name, not the product name.
