/**
 * Modified by Tampletgrok.
 * Bundle ids, the display name, and the API base can be overridden with env
 * vars. A release build no longer requires the upstream hosted API URL.
 */
import type { ConfigContext, ExpoConfig } from "expo/config";

const RELEASE_PROFILES = new Set(["production", "android-apk"]);

export default ({ config }: ConfigContext): ExpoConfig => {
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;
  if (apiUrl && RELEASE_PROFILES.has(process.env.EAS_BUILD_PROFILE ?? "")) {
    let parsed: URL;
    try {
      parsed = new URL(apiUrl);
    } catch {
      throw new Error("EXPO_PUBLIC_API_URL must be a valid URL.");
    }
    if (parsed.protocol !== "https:") {
      throw new Error("EXPO_PUBLIC_API_URL must use HTTPS for production builds.");
    }
  }

  const name = process.env.EXPO_PUBLIC_APP_NAME || config.name || "Tampletgrok";
  return {
    ...config,
    name,
    slug: process.env.EXPO_PUBLIC_APP_SLUG || config.slug || "tampletgrok",
    scheme: process.env.EXPO_PUBLIC_URL_SCHEME || config.scheme || "tampletgrok",
    ios: {
      ...config.ios,
      bundleIdentifier:
        process.env.EXPO_PUBLIC_IOS_BUNDLE_ID || config.ios?.bundleIdentifier || "com.tampletgrok.app",
    },
    android: {
      ...config.android,
      package: process.env.EXPO_PUBLIC_ANDROID_PACKAGE || config.android?.package || "com.tampletgrok.app",
    },
  } as ExpoConfig;
};
