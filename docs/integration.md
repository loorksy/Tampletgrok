# Integration

The UI asks a small set of ports for data. They live in `packages/contracts/src/adapters.ts`.

```ts
export interface ChatAdapter {
  getConversations(): Promise<Conversation[]>;
  getMessages(conversationId: string): Promise<ChatMessage[]>;
  sendMessage(conversationId: string, content: string): Promise<ChatMessage>;
}

export interface AssistantAdapter {
  listAssistants(): Promise<Assistant[]>;
  getAssistant(id: string): Promise<Assistant>;
  createAssistant(input: Pick<Assistant, "name"> & Partial<Assistant>): Promise<Assistant>;
  updateAssistant(id: string, patch: Partial<Assistant>): Promise<Assistant>;
}

export interface SettingsAdapter {
  getSettings(): Promise<UISettings>;
  updateSettings(settings: Partial<UISettings>): Promise<UISettings>;
}

export interface ModelAdapter {
  listModels(): Promise<ModelChoice[]>;
  selectModel(provider: string, modelId: string): Promise<ModelChoice>;
}

export interface RoutineAdapter {
  listRoutines(assistantId?: string): Promise<RoutineSummary[]>;
}

export interface ActivityAdapter {
  listActivity(): Promise<ActivityItem[]>;
}
```

`AppAdapters` is those six ports together.

## Install your own

```ts
import { setAppAdapters } from "@tampletgrok/mock-adapters";

setAppAdapters({
  chat: myChatAdapter,
});
```

Omitted ports keep the demo implementation. Call this before the first screen loads. On the web, `apps/web/src/main.tsx` is the place to do it. On mobile, do it before the root layout fetches the inbox.

`examples/api-integration/src/http-adapters.ts` maps the ports onto JSON routes under a base URL. Copy that file or depend on the example package. It sends `Authorization` only if you pass a `headers` function. It does not embed a credential.

## Errors and loading

Adapters should reject with an `Error` whose message is safe to show. Screens already catch many procedure failures and render their existing empty, error, and loading states. A hanging promise leaves the existing skeleton up. Do not resolve a fake assistant message unless a model actually produced it. The demo copy is explicit that it is local.

## Procedure-compatible mobile API

If `EXPO_PUBLIC_API_URL` is set, or the user saves a server URL, mobile `rpc()` posts to `{base}/rpc/{procedure}` again. That is the original procedure shape, kept so a compatible API can be attached without rewriting screens. The header `x-rakazo-space-id` is still sent on that path because the extracted client and the Android notification module use it. New backends should prefer the adapter ports.

## Auth

The web demo session is local. Replace `apps/web/src/lib/auth.ts` with your session hook. Keep the `useSession()` result shape the shell already reads: `{ data, isPending, error, refetch }`.

Mobile sign-in in demo mode accepts any email and password and stores `tampletgrok-demo-session` in memory. A saved API base turns that shortcut off and uses the existing email sign-in request.
