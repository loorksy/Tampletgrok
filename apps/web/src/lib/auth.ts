/**
 * Modified by Tampletgrok.
 * Upstream used the Better Auth browser client against the Rakazo API.
 * Demo mode keeps a local session so the interface opens without that server.
 * Replace this module when you connect a real identity provider.
 */
import { useSyncExternalStore } from "react";

export interface DemoUser {
  id: string;
  email: string;
  name: string;
}

interface SessionSnapshot {
  data: { user: DemoUser } | null;
  isPending: boolean;
  error: { status?: number; message?: string } | null;
}

type AuthError = {
  message?: string;
  status?: number;
  code?: string;
  statusText?: string;
} | null;

type AuthData = {
  url?: string;
  redirect?: boolean;
  user?: DemoUser;
  success?: boolean;
  status?: boolean;
} | null;

type AuthResult = { data: AuthData; error: AuthError };

const listeners = new Set<() => void>();
let signedIn = true;
let user: DemoUser = {
  id: "user_demo",
  email: "avery@example.com",
  name: "Avery Chen",
};

function currentSnapshot(): SessionSnapshot {
  return {
    data: signedIn ? { user } : null,
    isPending: false,
    error: null,
  };
}

let cachedSnapshot = currentSnapshot();

function emit(): void {
  cachedSnapshot = currentSnapshot();
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function useSession() {
  const value = useSyncExternalStore(subscribe, () => cachedSnapshot, () => cachedSnapshot);
  return { ...value, refetch: async () => undefined };
}

async function signInEmail(input: { email: string; password: string }): Promise<AuthResult> {
  signedIn = true;
  user = { ...user, email: input.email, name: input.email.split("@")[0] || user.name };
  emit();
  return { data: { user }, error: null };
}

async function signUpEmail(input: {
  email: string;
  password: string;
  name?: string;
}): Promise<AuthResult> {
  signedIn = true;
  user = { id: "user_demo", email: input.email, name: input.name || "User" };
  emit();
  return { data: { user }, error: null };
}

async function unavailable(message: string): Promise<AuthResult> {
  return { data: null, error: { message } };
}

export const authClient = {
  useSession,
  async signOut(): Promise<AuthResult> {
    signedIn = false;
    emit();
    return { data: { success: true }, error: null };
  },
  async changePassword(_input?: unknown): Promise<AuthResult> {
    return unavailable("Password changes are simulated in the demo and are not saved.");
  },
  async requestPasswordReset(_input?: unknown): Promise<AuthResult> {
    return unavailable("Password reset email is not sent in the demo.");
  },
  async resetPassword(_input?: unknown): Promise<AuthResult> {
    return { data: { status: true }, error: null };
  },
  async deleteUser(_input?: unknown): Promise<AuthResult> {
    signedIn = false;
    emit();
    return { data: { success: true }, error: null };
  },
  async linkSocial(_input?: unknown): Promise<AuthResult> {
    return unavailable("Social sign-in is not connected in the demo.");
  },
  signIn: {
    email: signInEmail,
    social: async (_input?: unknown): Promise<AuthResult> =>
      unavailable("Social sign-in is not connected in the demo."),
  },
  signUp: {
    email: signUpEmail,
  },
};
