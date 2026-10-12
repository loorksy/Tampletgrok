/**
 * Added by Tampletgrok.
 * Local demo adapters and the procedure dispatcher used by the web and mobile apps.
 */
export {
  demoWorkspace,
  dispatchDemoProcedure,
  getAppAdapters,
  resetDemoAdapters,
  setAppAdapters,
  watchDemoThread,
} from "./store.js";
export {
  DEMO_SESSION_TOKEN,
  demoSessionActive,
  isDemoMode,
  markDemoSignedOut,
  setDemoMode,
} from "./mode.js";
