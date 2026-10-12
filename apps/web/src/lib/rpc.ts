/**
 * Modified by Tampletgrok.
 * The upstream file opened an oRPC connection to the Rakazo API. This file
 * keeps the same call shape and answers it from the local demo adapters.
 */
import type { ContractRouterClient } from "@orpc/contract";
import type { AppContract } from "@tampletgrok/contracts";
import { dispatchDemoProcedure } from "@tampletgrok/mock-adapters";

const SPACE_STORAGE_KEY = "tampletgrok:space-id";

type RpcClientContext = { spaceId?: string | null };

export function selectedSpaceId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(SPACE_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function selectSpace(id: string): boolean {
  try {
    window.localStorage.setItem(SPACE_STORAGE_KEY, id);
    return true;
  } catch {
    try {
      return window.localStorage.getItem(SPACE_STORAGE_KEY) === id;
    } catch {
      return false;
    }
  }
}

export function clearSpaceSelection(): void {
  try {
    window.localStorage.removeItem(SPACE_STORAGE_KEY);
  } catch {
    // Ignore storage failures on sign-out / reset paths.
  }
}

/** Preserved so existing callers can attach a space header when they add a backend. */
export function withSpaceHeaders(
  init?: HeadersInit,
  spaceId: string | null = selectedSpaceId(),
): Headers {
  const headers = new Headers(init);
  if (spaceId) headers.set("x-tampletgrok-space-id", spaceId);
  else headers.delete("x-tampletgrok-space-id");
  return headers;
}

type Procedure = (input?: unknown, options?: { signal?: AbortSignal }) => Promise<unknown>;

function demoClient(path: string[]): Procedure {
  const call = ((input?: unknown, options?: { signal?: AbortSignal }) =>
    dispatchDemoProcedure(path.join("."), input, options)) as Procedure;
  return new Proxy(call, {
    get(_target, property) {
      if (typeof property !== "string" || property === "then") return undefined;
      return demoClient([...path, property]);
    },
    apply(_target, _thisArg, args: unknown[]) {
      return dispatchDemoProcedure(path.join("."), args[0], args[1] as { signal?: AbortSignal } | undefined);
    },
  });
}

export const rpc = demoClient([]) as unknown as ContractRouterClient<AppContract, RpcClientContext>;
