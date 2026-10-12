/**
 * White-label identity for the extracted template.
 * Change these values instead of editing component files.
 *
 * Modified by Tampletgrok. The default visual theme still comes from the
 * upstream Rakazo palette in ./index.ts.
 */
export const brand = {
  name: "Tampletgrok",
  tagline: "A reusable assistant interface",
  description: "Your team of always-on agents.",
  logoText: "Tampletgrok",
  mobileDisplayName: "Tampletgrok",
  iosBundleIdentifier: "com.tampletgrok.app",
  androidPackage: "com.tampletgrok.app",
  urlScheme: "tampletgrok",
  apiBaseUrl: "",
  privacyUrl: "https://example.com/privacy",
  defaultLocale: "en",
  defaultTheme: "system" as const,
};

export type Brand = typeof brand;
