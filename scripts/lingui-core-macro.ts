/** Lingui's macro compiles away in the app build. Tests render the English template. */
export function t(strings: TemplateStringsArray, ...values: unknown[]): string {
  return String.raw(strings, ...values);
}
