/**
 * Demo mode is the default. Tests opt out so they can keep exercising the
 * original request code paths. A saved or configured API base opts out too.
 *
 * Added by Tampletgrok.
 */

function readEnv(name: string): string | undefined {
  const proc = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process;
  return proc?.env?.[name];
}

const testing =
  readEnv("VITEST") === "true" || readEnv("NODE_ENV") === "test" || readEnv("TAMPLETGROK_DEMO") === "0";

let forced: boolean | null = testing ? false : null;
let explicitSignedOut = false;

export const DEMO_SESSION_TOKEN = "tampletgrok-demo-session";

function underTest(): boolean {
  return readEnv("VITEST") === "true" || readEnv("NODE_ENV") === "test";
}

export function setDemoMode(enabled: boolean): void {
  if (underTest()) {
    forced = false;
    return;
  }
  forced = enabled;
  if (enabled) explicitSignedOut = false;
}

export function isDemoMode(): boolean {
  if (underTest()) return false;
  if (testing && forced === null) return false;
  if (forced !== null) return forced;
  return !testing;
}

export function markDemoSignedOut(signedOut: boolean): void {
  explicitSignedOut = signedOut;
}

/** A local session stands in for a server login while demo mode is on. */
export function demoSessionActive(): boolean {
  return isDemoMode() && !explicitSignedOut;
}
