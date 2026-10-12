/**
 * Example integration. Added by Tampletgrok.
 *
 * Point the UI at your backend by installing these adapters before render:
 *
 *   import { setAppAdapters } from "@tampletgrok/mock-adapters";
 *   import { createHttpAdapters } from "./http-adapters";
 *   setAppAdapters(createHttpAdapters({ baseUrl: "https://api.example.com" }));
 *
 * The UI components do not need to change. Unimplemented screens keep the
 * local demo data until you replace that port too.
 *
 * Expected routes (JSON in, JSON out):
 *   GET  /conversations
 *   GET  /conversations/:id/messages
 *   POST /conversations/:id/messages   { content }
 *   GET  /assistants
 *   GET  /assistants/:id
 *   POST /assistants                   { name, title?, description?, instructions?, color? }
 *   PATCH /assistants/:id
 *   GET  /settings
 *   PATCH /settings
 *   GET  /models
 *   POST /models/selection             { provider, modelId }
 *   GET  /routines?assistantId=
 *   GET  /activity
 */
import type {
  ActivityItem,
  AppAdapters,
  Assistant,
  ChatMessage,
  Conversation,
  ModelChoice,
  RoutineSummary,
  UISettings,
} from "@tampletgrok/contracts";

export interface HttpAdapterOptions {
  baseUrl: string;
  /** Attach a bearer token or other headers. */
  headers?: () => Record<string, string> | Promise<Record<string, string>>;
  fetchImpl?: typeof fetch;
}

export function createHttpAdapters(options: HttpAdapterOptions): AppAdapters {
  const base = options.baseUrl.replace(/\/$/, "");
  const fetchImpl = options.fetchImpl ?? fetch;

  async function request<T>(path: string, init?: RequestInit): Promise<T> {
    const headers = new Headers(await options.headers?.());
    if (init?.body && !headers.has("content-type")) headers.set("content-type", "application/json");
    const response = await fetchImpl(`${base}${path}`, { ...init, headers });
    if (!response.ok) {
      throw new Error(`Request failed (${response.status}) for ${path}`);
    }
    return (await response.json()) as T;
  }

  return {
    chat: {
      getConversations: () => request<Conversation[]>("/conversations"),
      getMessages: (conversationId) =>
        request<ChatMessage[]>(`/conversations/${encodeURIComponent(conversationId)}/messages`),
      sendMessage: (conversationId, content) =>
        request<ChatMessage>(`/conversations/${encodeURIComponent(conversationId)}/messages`, {
          method: "POST",
          body: JSON.stringify({ content }),
        }),
    },
    assistants: {
      listAssistants: () => request<Assistant[]>("/assistants"),
      getAssistant: (id) => request<Assistant>(`/assistants/${encodeURIComponent(id)}`),
      createAssistant: (input) =>
        request<Assistant>("/assistants", { method: "POST", body: JSON.stringify(input) }),
      updateAssistant: (id, patch) =>
        request<Assistant>(`/assistants/${encodeURIComponent(id)}`, {
          method: "PATCH",
          body: JSON.stringify(patch),
        }),
    },
    settings: {
      getSettings: () => request<UISettings>("/settings"),
      updateSettings: (settings) =>
        request<UISettings>("/settings", { method: "PATCH", body: JSON.stringify(settings) }),
    },
    models: {
      listModels: () => request<ModelChoice[]>("/models"),
      selectModel: (provider, modelId) =>
        request<ModelChoice>("/models/selection", {
          method: "POST",
          body: JSON.stringify({ provider, modelId }),
        }),
    },
    routines: {
      listRoutines: (assistantId) =>
        request<RoutineSummary[]>(
          assistantId ? `/routines?assistantId=${encodeURIComponent(assistantId)}` : "/routines",
        ),
    },
    activity: {
      listActivity: () => request<ActivityItem[]>("/activity"),
    },
  };
}
