import { waitForModelOAuthCompletion } from "@tampletgrok/core";
import { rpc } from "./rpc";

export type { ModelCatalogEntry, ModelCredential, ModelOAuthBegin } from "@tampletgrok/contracts";
export { cancelModelOAuthAttempt, finishModelOAuthAttempt } from "@tampletgrok/core";

export async function waitForModelOAuth(loginId: string, signal?: AbortSignal) {
  return waitForModelOAuthCompletion(() => rpc.models.completeOAuth({ loginId }, { signal }), {
    signal,
  });
}
