/**
 * Backend-agnostic ports for the extracted interface.
 *
 * UI components keep calling the existing screen data layer. That layer
 * delegates here, so an integration replaces these adapters instead of
 * rewriting screens.
 *
 * Added by Tampletgrok. These contracts are not part of upstream Rakazo.
 */

export interface Conversation {
  id: string;
  assistantId: string | null;
  title: string;
  preview: string;
  updatedAt: string;
  unread: boolean;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: string;
  /** True when the text was produced locally and no model was called. */
  simulated?: boolean;
}

export interface Assistant {
  id: string;
  name: string;
  title: string;
  description: string;
  instructions: string;
  color: string;
  archived: boolean;
}

export interface UISettings {
  appearance: "system" | "light" | "dark";
  locale: string;
  displayName: string;
  email: string;
  avatarStyle: "robot" | "organic";
}

export interface ModelChoice {
  provider: string;
  providerName: string;
  id: string;
  label: string;
  billing: string;
  connected: boolean;
  simulated: boolean;
}

export interface RoutineSummary {
  id: string;
  assistantId: string;
  name: string;
  prompt: string;
  schedule: string;
  active: boolean;
}

export interface ActivityItem {
  id: string;
  assistantId: string;
  assistantName: string;
  title: string;
  status: string;
  updatedAt: string;
  simulated: boolean;
}

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

export interface AppAdapters {
  chat: ChatAdapter;
  assistants: AssistantAdapter;
  settings: SettingsAdapter;
  models: ModelAdapter;
  routines: RoutineAdapter;
  activity: ActivityAdapter;
}
