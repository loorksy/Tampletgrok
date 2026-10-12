/**
 * In-memory demo workspace for every extracted screen.
 *
 * Added by Tampletgrok. Screen components still speak the upstream procedure
 * names; this module answers them locally and marks simulated work.
 */
import type {
  ActivityItem,
  AppAdapters,
  Assistant,
  ChatMessage,
  Conversation,
  UISettings,
} from "@tampletgrok/contracts";
import type {
  Artifact,
  ArtifactWithContent,
  Bot,
  BotSection,
  ComputerStatus,
  Connection,
  ConnectionCatalogItem,
  Group,
  Me,
  MemoryDocument,
  ModelCatalogEntry,
  ModelCredential,
  ProductEvent,
  Routine,
  RunActivityRow,
  ScratchpadItem,
  Space,
  SpaceNavigation,
  TaughtSkill,
  ThreadMessage,
  ThreadSnapshot,
  Ticket,
  VoiceCatalogEntry,
  VoiceCredential,
  VoiceInfo,
  VoiceStatus,
} from "@tampletgrok/contracts";

const SPACE_ID = "space_studio";
const USER_ID = "user_demo";
const SIMULATED_REPLY =
  "Demo reply. No model was called and nothing was sent to a provider. This local response lets you try the composer, history, and layouts. Connect your own adapter when you want a real assistant.";

type DemoMessage = {
  id: string;
  threadId: string;
  seq: number;
  role: "user" | "bot" | "system";
  text: string;
  createdAt: string;
  botId?: string;
};

type StoredArtifact = Artifact & { contentBase64: string };

type Listener = (event: ProductEvent) => void;

let sequence = 100;
function nid(prefix: string): string {
  sequence += 1;
  return `${prefix}_${sequence.toString(36)}`;
}

function now(): string {
  return new Date().toISOString();
}

function textMessage(message: DemoMessage): ThreadMessage {
  return {
    id: message.id,
    threadId: message.threadId,
    seq: message.seq,
    role: message.role,
    blocks: [{ kind: "text", text: message.text }],
    ...(message.botId ? { botId: message.botId } : {}),
    createdAt: message.createdAt,
  };
}

function makeBot(input: {
  id: string;
  name: string;
  title: string;
  description: string;
  instructions: string;
  color: string;
  preview: string;
  pinned?: boolean;
}): Bot {
  const createdAt = now();
  return {
    id: input.id,
    spaceId: SPACE_ID,
    name: input.name,
    title: input.title,
    description: input.description,
    instructions: input.instructions,
    color: input.color,
    notifyOnFinish: true,
    pinned: input.pinned ?? false,
    sectionId: null,
    archivedAt: null,
    unread: false,
    parentBotId: null,
    memoryScope: "isolated",
    threadId: `thread_${input.id}`,
    preview: input.preview,
    status: "idle",
    runErrorId: null,
    computerMode: "team",
    updatedAt: createdAt,
    createdAt,
    voiceId: null,
    autoSpeak: false,
    modelProvider: "openai",
    modelId: "gpt-demo",
    thinkingLevel: "medium",
    teamChatAmbientEnabled: false,
    teamChatRules: "",
    disabledBuiltinTools: [],
    webhookConfigured: false,
    spawnKey: null,
  };
}

const ada = makeBot({
  id: "bot_ada",
  name: "Ada",
  title: "Research lead",
  description: "Summarizes notes and drafts replies.",
  instructions: "Be concise. In this template you only have demo data.",
  color: "#6A6BF5::shape_0",
  preview: "The brief is ready for review.",
  pinned: true,
});
const nia = makeBot({
  id: "bot_nia",
  name: "Nia",
  title: "Planner",
  description: "Keeps routines and follow-ups visible.",
  instructions: "Turn loose notes into a short plan.",
  color: "#3EC5A8::shape_2",
  preview: "Tomorrow's checklist is on the board.",
});
const sol = makeBot({
  id: "bot_sol",
  name: "Sol",
  title: "Writer",
  description: "Shapes longer drafts.",
  instructions: "Prefer plain language.",
  color: "#F5A03C::shape_4",
  preview: "I left a first draft in the thread.",
});

const section: BotSection = {
  id: "section_studio",
  name: "Studio",
  position: 0,
  createdAt: now(),
  updatedAt: now(),
};
nia.sectionId = section.id;
sol.sectionId = section.id;

const group: Group = {
  id: "group_review",
  spaceId: SPACE_ID,
  name: "Launch review",
  pinned: false,
  sectionId: null,
  archivedAt: null,
  members: [
    { botId: ada.id, name: ada.name, color: ada.color, status: "idle" },
    { botId: nia.id, name: nia.name, color: nia.color, status: "idle" },
  ],
  threadId: "thread_group_review",
  preview: "Ada and Nia compared the draft.",
  unread: false,
  updatedAt: now(),
  createdAt: now(),
};

function seedMessages(threadId: string, botId: string, lines: Array<[DemoMessage["role"], string]>): DemoMessage[] {
  return lines.map(([role, text], index) => ({
    id: `${threadId}_m${index + 1}`,
    threadId,
    seq: index + 1,
    role,
    text,
    createdAt: new Date(Date.now() - (lines.length - index) * 60_000).toISOString(),
    ...(role === "bot" ? { botId } : {}),
  }));
}

const state = {
  settings: {
    appearance: "system",
    locale: "en",
    displayName: "Avery Chen",
    email: "avery@example.com",
    avatarStyle: "organic",
  } as UISettings,
  bots: [ada, nia, sol] as Bot[],
  groups: [group] as Group[],
  sections: [section] as BotSection[],
  messages: new Map<string, DemoMessage[]>([
    [
      ada.threadId,
      seedMessages(ada.threadId, ada.id, [
        ["user", "Can you summarize the launch notes?"],
        [
          "bot",
          "Demo summary: the interface is running locally. No model was called. The notes mention a sidebar, a composer, and a settings sheet.",
        ],
      ]),
    ],
    [
      nia.threadId,
      seedMessages(nia.threadId, nia.id, [
        ["user", "What should I look at next?"],
        ["bot", "Demo plan: open routines, then models. Both screens use sample data until you attach a backend."],
      ]),
    ],
    [
      sol.threadId,
      seedMessages(sol.threadId, sol.id, [
        ["bot", "Demo draft. This thread is sample content so the empty state is not the first thing you see."],
      ]),
    ],
    [
      group.threadId,
      seedMessages(group.threadId, ada.id, [
        ["user", "How does the group thread look?"],
        ["bot", "Demo group reply from Ada. Nia is in this room, and no remote agent ran."],
      ]),
    ],
  ]),
  routines: [
    {
      id: "routine_digest",
      botId: ada.id,
      name: "Morning digest",
      prompt: "Summarize overnight notes. This routine does not run on a server in the template.",
      crons: ["0 8 * * 1-5"],
      timezone: "UTC",
      active: true,
      notify: true,
      webhookEnabled: false,
      githubEnabled: false,
      messageProvider: null,
      modelProvider: null,
      modelId: null,
      thinkingLevel: null,
      lastRunAt: now(),
      nextRunAt: new Date(Date.now() + 86_400_000).toISOString(),
      createdAt: now(),
    },
  ] as Routine[],
  memories: [
    {
      id: "memory_user",
      scope: "user",
      botId: null,
      path: "profile.md",
      content: "Avery prefers short answers. This memory is sample text stored in the browser session.",
      revision: 1,
      updatedAt: now(),
    },
    {
      id: "memory_ada",
      scope: "bot",
      botId: ada.id,
      path: "voice.md",
      content: "Ada writes in plain sentences. Demo memory only.",
      revision: 1,
      updatedAt: now(),
    },
  ] as MemoryDocument[],
  artifacts: [
    {
      id: "artifact_brief",
      botId: ada.id,
      groupId: null,
      runId: null,
      name: "launch-brief.md",
      description: "Sample artifact. The file is local demo content.",
      mimeType: "text/markdown",
      size: 96,
      version: 1,
      createdAt: now(),
      contentBase64: "U2FtcGxlIGJyaWVmLiBObyBmaWxlIHN0b3JlIGlzIGNvbm5lY3RlZC4=",
    },
  ] as StoredArtifact[],
  tickets: [
    {
      id: "ticket_1",
      boardId: "board_studio",
      spaceId: SPACE_ID,
      number: 1,
      ref: "STUDIO-1",
      title: "Review the demo composer",
      description: "Sample ticket. Changing it stays in this browser session.",
      status: "doing",
      priority: "normal",
      assigneeBotId: ada.id,
      createdByBotId: null,
      createdByUserId: USER_ID,
      createdAt: now(),
      updatedAt: now(),
      completedAt: null,
    },
  ] as Ticket[],
  scratchpad: [
    {
      id: "scratch_1",
      botId: ada.id,
      title: "Open questions",
      status: "open",
      notes: "Sample scratchpad item.",
      createdAt: now(),
      updatedAt: now(),
    },
  ] as ScratchpadItem[],
  connections: [
    {
      id: "connection_calendar",
      connectorId: "calendar",
      provider: "calendar",
      displayName: "Calendar (demo)",
      status: "connected",
      capabilities: ["Read events"],
      createdAt: now(),
    },
  ] as Connection[],
  catalog: [
    entry("openai", "OpenAI", "gpt-demo", "GPT Demo"),
    entry("anthropic", "Anthropic", "claude-demo", "Claude Demo"),
    entry("google", "Google", "gemini-demo", "Gemini Demo"),
    entry("openrouter", "OpenRouter", "openrouter/demo", "OpenRouter Demo"),
    entry("openai-codex", "OpenAI Codex", "codex-demo", "Codex Demo"),
    entry("vercel-ai-gateway", "Vercel AI Gateway", "gateway-demo", "Gateway Demo"),
  ],
  credentials: [
    {
      id: "cred_demo",
      provider: "openai",
      label: "Demo credential (stored locally, never sent)",
      hasKey: true,
      isDefault: true,
      modelId: "gpt-demo",
      authKind: "api_key",
      thinkingLevel: "medium",
      reasoning: true,
    },
  ] as ModelCredential[],
  selectedProvider: "openai",
  selectedModel: "gpt-demo",
  activity: [] as RunActivityRow[],
  computers: new Map<string, ComputerStatus>(),
};

function entry(provider: string, providerName: string, id: string, label: string): ModelCatalogEntry {
  return {
    provider,
    providerName,
    id,
    label,
    billing: "Demo catalog. Selecting a model does not contact the provider.",
    auth: "api-key",
    reasoning: true,
    thinkingLevels: ["low", "medium", "high"],
  };
}

function computerFor(botId: string): ComputerStatus {
  const existing = state.computers.get(botId);
  if (existing) return existing;
  const status: ComputerStatus = {
    botId,
    mode: "team",
    kind: "fake",
    state: "stopped",
    controlHolder: "none",
    controlBotId: null,
    takeoverRequested: false,
    screenAvailable: false,
    screenWidth: 1280,
    screenHeight: 800,
    homeRevision: null,
    busyBotName: null,
    canUpdate: false,
    terminalAvailable: false,
  };
  state.computers.set(botId, status);
  return status;
}

function activeBots(): Bot[] {
  return state.bots.filter((bot) => bot.archivedAt === null);
}

function activeGroups(): Group[] {
  return state.groups.filter((group) => group.archivedAt === null);
}

function spaceRecord(): Space {
  const bots = activeBots();
  return {
    id: SPACE_ID,
    name: "Studio",
    isDefault: true,
    hasContent: bots.length + state.groups.length > 0,
    canRename: true,
    canDelete: false,
    bots,
    groups: activeGroups(),
    externalConversations: [],
    botSections: state.sections,
  };
}

function navigation(): SpaceNavigation {
  const space = spaceRecord();
  return {
    current: {
      id: space.id,
      name: space.name,
      bots: activeBots(),
      groups: activeGroups(),
      externalConversations: [],
      botSections: state.sections,
    },
    spaces: [space],
  };
}

function me(): Me {
  return {
    ticketBoardEnabled: true,
    userId: USER_ID,
    email: state.settings.email,
    name: state.settings.displayName,
    spaceId: SPACE_ID,
    isDeploymentOwner: true,
    needsModel: false,
    defaultProvider: state.selectedProvider,
    defaultModel: state.selectedModel,
    hostCredentialProvider: null,
    hostCredentialSource: null,
    computerHost: null,
    canChooseHostComputer: false,
    sandboxProvider: "none",
    avatarStyle: state.settings.avatarStyle,
    billingEnabled: false,
  };
}

function threadMessages(threadId: string): DemoMessage[] {
  return state.messages.get(threadId) ?? [];
}

function snapshot(target: { botId?: string; groupId?: string }): ThreadSnapshot {
  const bot = target.botId ? state.bots.find((item) => item.id === target.botId) : undefined;
  const room = target.groupId ? state.groups.find((item) => item.id === target.groupId) : undefined;
  const threadId = bot?.threadId ?? room?.threadId ?? "thread_missing";
  const messages = threadMessages(threadId);
  const last = messages.at(-1);
  return {
    threadId,
    cursor: last?.seq ?? -1,
    messages: messages.map(textMessage),
    olderCursor: null,
    ...(bot ? { botId: bot.id } : {}),
    ...(room
      ? { groupId: room.id, groupName: room.name, members: room.members }
      : {}),
    run: null,
    activeRuns: [],
    ...(bot ? { computer: computerFor(bot.id) } : {}),
  };
}

const listeners = new Set<Listener>();

function emit(event: ProductEvent): void {
  for (const listener of listeners) listener(event);
}

function eventFor(
  threadId: string,
  botId: string,
  seq: number,
  type: ProductEvent["type"],
  payload: Record<string, unknown>,
  runId?: string,
): ProductEvent {
  return {
    id: nid("evt"),
    spaceId: SPACE_ID,
    threadId,
    botId,
    seq,
    type,
    ...(runId ? { runId } : {}),
    createdAt: now(),
    payload,
  };
}

function pushMessage(threadId: string, role: DemoMessage["role"], text: string, botId?: string): DemoMessage {
  const messages = threadMessages(threadId);
  const seq = (messages.at(-1)?.seq ?? 0) + 1;
  const message: DemoMessage = {
    id: nid("msg"),
    threadId,
    seq,
    role,
    text,
    createdAt: now(),
    ...(botId ? { botId } : {}),
  };
  messages.push(message);
  state.messages.set(threadId, messages);
  return message;
}

function resolveThread(id: string): { threadId: string; botId?: string; groupId?: string } {
  const bot = state.bots.find((item) => item.id === id || item.threadId === id);
  if (bot) return { threadId: bot.threadId, botId: bot.id };
  const room = state.groups.find((item) => item.id === id || item.threadId === id);
  if (room) return { threadId: room.threadId, groupId: room.id };
  return { threadId: id };
}

function toChatMessage(message: DemoMessage): ChatMessage {
  return {
    id: message.id,
    conversationId: message.threadId,
    role: message.role === "bot" ? "assistant" : message.role,
    content: message.text,
    createdAt: message.createdAt,
    simulated: message.text.includes("Demo "),
  };
}

function toAssistant(bot: Bot): Assistant {
  return {
    id: bot.id,
    name: bot.name,
    title: bot.title,
    description: bot.description,
    instructions: bot.instructions,
    color: bot.color,
    archived: bot.archivedAt !== null,
  };
}

function toConversation(bot: Bot): Conversation {
  return {
    id: bot.threadId,
    assistantId: bot.id,
    title: bot.name,
    preview: bot.preview,
    updatedAt: bot.updatedAt,
    unread: bot.unread,
  };
}

function record(input: unknown): Record<string, unknown> {
  return input && typeof input === "object" ? (input as Record<string, unknown>) : {};
}

function text(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

const mockAdapters: AppAdapters = {
  chat: {
    async getConversations() {
      return [
        ...activeBots().map(toConversation),
        ...activeGroups().map((item) => ({
          id: item.threadId,
          assistantId: null,
          title: item.name,
          preview: item.preview,
          updatedAt: item.updatedAt,
          unread: item.unread,
        })),
      ];
    },
    async getMessages(conversationId) {
      const thread = resolveThread(conversationId);
      return threadMessages(thread.threadId).map(toChatMessage);
    },
    async sendMessage(conversationId, content) {
      const thread = resolveThread(conversationId);
      const bot = state.bots.find((item) => item.id === thread.botId) ?? activeBots()[0];
      pushMessage(thread.threadId, "user", content);
      const reply = pushMessage(thread.threadId, "bot", SIMULATED_REPLY, bot?.id);
      if (bot) {
        bot.preview = "Demo reply";
        bot.updatedAt = reply.createdAt;
        bot.status = "idle";
      }
      state.activity.unshift({
        runId: nid("run"),
        botId: bot?.id ?? ada.id,
        botName: bot?.name ?? "Ada",
        groupId: thread.groupId ?? null,
        groupName: thread.groupId ? (state.groups.find((item) => item.id === thread.groupId)?.name ?? null) : null,
        threadId: thread.threadId,
        status: "completed",
        trigger: "user",
        notificationsEnabled: false,
        promptSnippet: content.slice(0, 140),
        updatedAt: reply.createdAt,
      });
      return toChatMessage(reply);
    },
  },
  assistants: {
    async listAssistants() {
      return state.bots.map(toAssistant);
    },
    async getAssistant(id) {
      const bot = state.bots.find((item) => item.id === id);
      if (!bot) throw new Error("Assistant was not found in the demo workspace.");
      return toAssistant(bot);
    },
    async createAssistant(input) {
      const bot = makeBot({
        id: nid("bot"),
        name: input.name,
        title: input.title ?? "",
        description: input.description ?? "Created in the local demo.",
        instructions: input.instructions ?? input.description ?? "",
        color: input.color ?? "#3B82F6::shape_1",
        preview: "New demo assistant. No model is connected.",
      });
      state.bots.push(bot);
      state.messages.set(bot.threadId, [
        {
          id: nid("msg"),
          threadId: bot.threadId,
          seq: 1,
          role: "bot",
          text: `Demo greeting from ${bot.name}. No model was called.`,
          createdAt: now(),
          botId: bot.id,
        },
      ]);
      return toAssistant(bot);
    },
    async updateAssistant(id, patch) {
      const bot = state.bots.find((item) => item.id === id);
      if (!bot) throw new Error("Assistant was not found in the demo workspace.");
      if (patch.name !== undefined) bot.name = patch.name;
      if (patch.title !== undefined) bot.title = patch.title;
      if (patch.description !== undefined) bot.description = patch.description;
      if (patch.instructions !== undefined) bot.instructions = patch.instructions;
      if (patch.color !== undefined) bot.color = patch.color;
      if (patch.archived !== undefined) bot.archivedAt = patch.archived ? now() : null;
      bot.updatedAt = now();
      return toAssistant(bot);
    },
  },
  settings: {
    async getSettings() {
      return { ...state.settings };
    },
    async updateSettings(patch) {
      state.settings = { ...state.settings, ...patch };
      return { ...state.settings };
    },
  },
  models: {
    async listModels() {
      return state.catalog.map((item) => ({
        provider: item.provider,
        providerName: item.providerName ?? item.provider,
        id: item.id,
        label: item.label,
        billing: item.billing,
        connected: state.credentials.some((credential) => credential.provider === item.provider),
        simulated: true,
      }));
    },
    async selectModel(provider, modelId) {
      state.selectedProvider = provider;
      state.selectedModel = modelId;
      const known = state.catalog.find((item) => item.provider === provider && item.id === modelId);
      return {
        provider,
        providerName: known?.providerName ?? provider,
        id: modelId,
        label: known?.label ?? modelId,
        billing: "Selected locally. No provider was contacted.",
        connected: true,
        simulated: true,
      };
    },
  },
  routines: {
    async listRoutines(assistantId) {
      return state.routines
        .filter((routine) => !assistantId || routine.botId === assistantId)
        .map((routine) => ({
          id: routine.id,
          assistantId: routine.botId,
          name: routine.name,
          prompt: routine.prompt,
          schedule: routine.crons.join(", ") || "Manual",
          active: routine.active,
        }));
    },
  },
  activity: {
    async listActivity() {
      return [
        ...state.activity.map(toActivity),
        {
          id: "activity_seed",
          assistantId: ada.id,
          assistantName: ada.name,
          title: "Sample digest finished locally",
          status: "completed",
          updatedAt: now(),
          simulated: true,
        },
      ];
    },
  },
};

function toActivity(row: RunActivityRow): ActivityItem {
  return {
    id: row.runId,
    assistantId: row.botId,
    assistantName: row.botName,
    title: row.promptSnippet || "Demo activity",
    status: row.status,
    updatedAt: row.updatedAt,
    simulated: true,
  };
}

let adapters: AppAdapters = mockAdapters;

export function getAppAdapters(): AppAdapters {
  return adapters;
}

/** Replaces one or more ports. Unspecified ports keep the demo implementation. */
export function setAppAdapters(next: Partial<AppAdapters>): void {
  adapters = { ...adapters, ...next };
}

export function resetDemoAdapters(): void {
  adapters = mockAdapters;
}

function subscribe(signal?: AbortSignal): AsyncIterable<ProductEvent> {
  const queue: ProductEvent[] = [];
  let wake: (() => void) | undefined;
  const listener: Listener = (event) => {
    queue.push(event);
    wake?.();
  };
  listeners.add(listener);
  const onAbort = () => wake?.();
  signal?.addEventListener("abort", onAbort);
  return {
    async *[Symbol.asyncIterator]() {
      try {
        while (!signal?.aborted) {
          if (queue.length === 0) {
            await new Promise<void>((resolve) => {
              wake = resolve;
              setTimeout(resolve, 20_000);
            });
            if (signal?.aborted) return;
            if (queue.length === 0) {
              yield eventFor(ada.threadId, ada.id, 0, "heartbeat", {});
              continue;
            }
          }
          const next = queue.shift();
          if (next) yield next;
        }
      } finally {
        listeners.delete(listener);
        signal?.removeEventListener("abort", onAbort);
      }
    },
  };
}

export function watchDemoThread(
  target: { botId?: string; groupId?: string },
  onEvent: (event: ProductEvent) => void,
  signal: AbortSignal,
): Promise<void> {
  const thread = snapshot(target);
  const listener: Listener = (event) => {
    if (event.type === "heartbeat" || event.threadId !== thread.threadId) return;
    onEvent(event);
  };
  listeners.add(listener);
  return new Promise((resolve) => {
    const stop = () => {
      listeners.delete(listener);
      resolve();
    };
    if (signal.aborted) stop();
    else signal.addEventListener("abort", stop, { once: true });
  });
}

async function sendOnThread(input: Record<string, unknown>) {
  const botId = text(input.botId);
  const groupId = text(input.groupId);
  const thread = snapshot({ botId: botId || undefined, groupId: groupId || undefined });
  const bot = state.bots.find((item) => item.id === (botId || thread.botId)) ?? ada;
  const content = text(input.text) || "(attachment)";
  const reply = await adapters.chat.sendMessage(thread.threadId, content);
  const messages = threadMessages(thread.threadId);
  const userMessage = [...messages].reverse().find((message) => message.role === "user" && message.text === content);
  const runId = nid("run");
  const taskId = nid("task");
  if (userMessage) {
    emit(
      eventFor(thread.threadId, bot.id, userMessage.seq, "thread.message.created", {
        messageId: userMessage.id,
        role: "user",
        blocks: [{ kind: "text", text: content }],
      }, runId),
    );
    emit(eventFor(thread.threadId, bot.id, userMessage.seq, "run.started", { trigger: "user" }, runId));
  }
  const visibleReply = messages.find((message) => message.id === reply.id);
  if (visibleReply) {
    emit(
      eventFor(thread.threadId, bot.id, visibleReply.seq, "thread.message.created", {
        messageId: visibleReply.id,
        role: "bot",
        blocks: [{ kind: "text", text: visibleReply.text }],
      }, runId),
    );
    emit(eventFor(thread.threadId, bot.id, visibleReply.seq, "run.completed", {}, runId));
  }
  return { taskId, runId, seq: userMessage?.seq ?? 1, runIds: [runId] };
}

function voiceStatus(): VoiceStatus {
  return {
    configured: false,
    ready: false,
    transcribe: false,
    provider: null,
    voiceId: "",
  };
}

function emptySkill(): TaughtSkill {
  return {
    id: "skill_none",
    botId: ada.id,
    name: "Demo skill",
    goal: "Sample only",
    status: "saved",
    playbook: {
      whenToUse: "Demo",
      inputs: [],
      steps: ["This skill is not executed."],
      howToCheck: "Look at the draft card.",
      whatToReturn: "A note that the run was simulated.",
      approvalBoundaries: "No remote actions.",
      failureHandling: "Show the demo message.",
    },
    recording: { events: [], snapshots: [] },
    startedAt: null,
    expiresAt: null,
    stoppedAt: now(),
    createdAt: now(),
    updatedAt: now(),
  };
}

export async function dispatchDemoProcedure(
  procedure: string,
  input?: unknown,
  options?: { signal?: AbortSignal },
): Promise<unknown> {
  const key = procedure.replaceAll("/", ".");
  const body = record(input);
  if (key === "threads.subscribe" || key === "boards.subscribe") return subscribe(options?.signal);

  switch (key) {
    case "health":
      return { ok: true, version: "demo" };
    case "me":
      return me();
    case "bootstrap": {
      const botId = text(body.botId);
      const bot = state.bots.find((item) => item.id === botId) ?? activeBots()[0];
      return {
        me: me(),
        bots: activeBots(),
        groups: activeGroups(),
        botSections: state.sections,
        archivedBots: state.bots.filter((item) => item.archivedAt),
        archivedGroups: state.groups.filter((item) => item.archivedAt),
        thread: bot ? snapshot({ botId: bot.id }) : null,
        routines: state.routines.filter((routine) => !bot || routine.botId === bot.id),
        spaces: [spaceRecord()],
      };
    }
    case "spaces.list":
      return navigation();
    case "spaces.create": {
      return { ...spaceRecord(), id: nid("space"), name: text(body.name, "Space"), isDefault: false };
    }
    case "spaces.rename": {
      const space = spaceRecord();
      space.name = text(body.name, space.name);
      return { id: space.id, name: space.name };
    }
    case "spaces.remove":
      return { ok: true as const, activeSpaceId: SPACE_ID };
    case "bots.list":
      return activeBots();
    case "bots.listArchived":
      return state.bots.filter((item) => item.archivedAt);
    case "bots.create":
      return toBot(await adapters.assistants.createAssistant({
        name: text(body.name, "Assistant"),
        title: text(body.title),
        description: text(body.description),
        instructions: text(body.instructions),
        color: text(body.color),
      }));
    case "bots.update": {
      const botId = text(body.botId);
      const bot = state.bots.find((item) => item.id === botId);
      if (!bot) throw new Error("Assistant was not found in the demo workspace.");
      const patch = { ...body };
      delete patch.botId;
      if (typeof patch.name === "string") bot.name = patch.name;
      if (typeof patch.title === "string") bot.title = patch.title;
      if (typeof patch.description === "string") bot.description = patch.description;
      if (typeof patch.instructions === "string") bot.instructions = patch.instructions;
      if (typeof patch.color === "string") bot.color = patch.color;
      if (typeof patch.pinned === "boolean") bot.pinned = patch.pinned;
      if (typeof patch.sectionId === "string" || patch.sectionId === null) {
        bot.sectionId = patch.sectionId as string | null;
      }
      if (typeof patch.autoSpeak === "boolean") bot.autoSpeak = patch.autoSpeak;
      if (typeof patch.voiceId === "string" || patch.voiceId === null) bot.voiceId = patch.voiceId as string | null;
      if (typeof patch.modelProvider === "string" || patch.modelProvider === null) {
        bot.modelProvider = patch.modelProvider as string | null;
      }
      if (typeof patch.modelId === "string" || patch.modelId === null) bot.modelId = patch.modelId as string | null;
      bot.updatedAt = now();
      return bot;
    }
    case "bots.archive":
    case "bots.restore":
    case "bots.remove": {
      const botId = text(body.botId);
      const bot = state.bots.find((item) => item.id === botId);
      if (!bot) return { ok: true };
      if (key.endsWith("remove")) state.bots = state.bots.filter((item) => item.id !== botId);
      else bot.archivedAt = key.endsWith("archive") ? now() : null;
      return { ok: true };
    }
    case "bots.duplicate": {
      const bot = state.bots.find((item) => item.id === text(body.botId));
      if (!bot) throw new Error("Assistant was not found in the demo workspace.");
      return toBot(await adapters.assistants.createAssistant({ ...toAssistant(bot), name: `${bot.name} copy` }));
    }
    case "bots.reorder":
      return { ok: true };
    case "bots.rotateWebhookSecret":
      return {
        secret: "demo-webhook-secret",
        path: "/demo/webhook",
        webhookConfigured: true,
      };
    case "bots.setComputer":
      return { ok: true };
    case "groups.list":
    case "groups.listArchived":
      return key.endsWith("Archived") ? state.groups.filter((item) => item.archivedAt) : activeGroups();
    case "groups.create": {
      const created = {
        ...group,
        id: nid("group"),
        name: text(body.name, "Group"),
        threadId: nid("thread"),
        members: activeBots()
          .slice(0, 2)
          .map((bot) => ({ botId: bot.id, name: bot.name, color: bot.color, status: "idle" })),
        preview: "New demo group.",
        createdAt: now(),
        updatedAt: now(),
      } satisfies Group;
      state.groups.push(created);
      state.messages.set(created.threadId, []);
      return created;
    }
    case "groups.update": {
      const room = state.groups.find((item) => item.id === text(body.groupId));
      if (!room) throw new Error("Group was not found in the demo workspace.");
      if (typeof body.name === "string") room.name = body.name;
      if (typeof body.pinned === "boolean") room.pinned = body.pinned;
      room.updatedAt = now();
      return room;
    }
    case "groups.archive":
    case "groups.restore":
    case "groups.remove":
    case "groups.duplicate":
      return key.endsWith("duplicate") ? { ...group, id: nid("group"), name: `${group.name} copy` } : { ok: true };
    case "botSections.create": {
      const created: BotSection = {
        id: nid("section"),
        name: text(body.name, "Section"),
        position: state.sections.length,
        createdAt: now(),
        updatedAt: now(),
      };
      state.sections.push(created);
      return created;
    }
    case "botSections.update": {
      const found = state.sections.find((item) => item.id === text(body.sectionId));
      if (found && typeof body.name === "string") found.name = body.name;
      return found ?? state.sections[0];
    }
    case "threads.get":
      return snapshot({ botId: text(body.botId) || undefined, groupId: text(body.groupId) || undefined });
    case "threads.head": {
      const snap = snapshot({ botId: text(body.botId) || undefined, groupId: text(body.groupId) || undefined });
      return { threadId: snap.threadId, cursor: snap.cursor };
    }
    case "threads.messages": {
      const snap = snapshot({ botId: text(body.botId) || undefined, groupId: text(body.groupId) || undefined });
      return { threadId: snap.threadId, messages: snap.messages, olderCursor: null, coveredThroughSeq: snap.cursor };
    }
    case "threads.send":
    case "threads.followUp":
      return sendOnThread(body);
    case "threads.stop":
    case "threads.clear": {
      if (key.endsWith("clear")) {
        const snap = snapshot({ botId: text(body.botId) || undefined, groupId: text(body.groupId) || undefined });
        state.messages.set(snap.threadId, []);
        emit(eventFor(snap.threadId, text(body.botId, ada.id), 1, "thread.cleared", {}));
      }
      return { ok: true };
    }
    case "threads.markRead":
    case "threads.markUnread":
    case "threads.react":
    case "threads.answer":
    case "threads.endCall":
      return { ok: true };
    case "routines.list":
      return state.routines.filter((routine) => !body.botId || routine.botId === body.botId);
    case "routines.create":
    case "routines.update": {
      const routine: Routine = {
        id: text(body.routineId) || nid("routine"),
        botId: text(body.botId, ada.id),
        name: text(body.name, "Demo routine"),
        prompt: text(body.prompt, "Simulated routine."),
        crons: Array.isArray(body.crons) ? body.crons.filter((item): item is string => typeof item === "string") : [],
        timezone: text(body.timezone, "UTC"),
        active: body.active !== false,
        notify: body.notify !== false,
        webhookEnabled: Boolean(body.webhookEnabled),
        githubEnabled: Boolean(body.githubEnabled),
        messageProvider: null,
        modelProvider: null,
        modelId: null,
        thinkingLevel: null,
        lastRunAt: null,
        nextRunAt: null,
        createdAt: now(),
      };
      const index = state.routines.findIndex((item) => item.id === routine.id);
      if (index >= 0) state.routines[index] = { ...state.routines[index], ...routine };
      else state.routines.push(routine);
      return routine;
    }
    case "routines.remove":
      state.routines = state.routines.filter((routine) => routine.id !== body.routineId);
      return { ok: true };
    case "routines.testRun":
      return { runId: nid("run"), simulated: true };
    case "routines.history":
      return { runs: [], nextCursor: null };
    case "models.list":
      return state.catalog;
    case "models.credentials":
      return state.credentials;
    case "models.setDefault": {
      await adapters.models.selectModel(text(body.provider, state.selectedProvider), text(body.modelId, state.selectedModel));
      return { ok: true };
    }
    case "models.connect": {
      const provider = text(body.provider, "openai");
      const credential: ModelCredential = {
        id: nid("cred"),
        provider,
        label: `${provider} (demo, key not sent)`,
        hasKey: true,
        isDefault: state.credentials.length === 0,
        modelId: text(body.modelId) || undefined,
        baseUrl: text(body.baseUrl) || undefined,
        authKind: provider === "openai-compatible" ? "openai_compatible" : "api_key",
      };
      state.credentials = state.credentials.filter((item) => item.provider !== provider).concat(credential);
      return credential;
    }
    case "models.disconnect":
      state.credentials = state.credentials.filter((item) => item.provider !== body.provider);
      return { ok: true };
    case "models.backups":
      return [];
    case "models.setBackups":
      return { ok: true };
    case "models.probeOpenAiCompatible":
    case "models.probeCatalog":
      return { ok: false, simulated: true, message: "Demo mode does not contact a model server." };
    case "models.beginOAuth":
      throw new Error("Demo mode does not start a provider sign-in. Choose the local demo credential instead.");
    case "models.cancelOAuth":
    case "models.completeOAuth":
    case "models.finishOAuth":
    case "models.submitOAuthCode":
      return { ok: true };
    case "memory.list":
      return state.memories.filter((document) => {
        if (body.scope && document.scope !== body.scope) return false;
        if (body.botId && document.botId && document.botId !== body.botId) return false;
        return true;
      });
    case "memory.update": {
      const document = state.memories.find((item) => item.id === body.documentId);
      if (!document) throw new Error("Memory was not found in the demo workspace.");
      document.content = text(body.content, document.content);
      document.revision += 1;
      document.updatedAt = now();
      return document;
    }
    case "memory.providerConfig":
      return null;
    case "memory.connectProvider":
    case "memory.disconnectProvider":
    case "memory.setDefaultScope":
      return {
        provider: text(body.provider, "demo"),
        settings: {},
        defaultMemoryScope: "isolated",
        updatedAt: now(),
      };
    case "voice.status":
      return voiceStatus();
    case "voice.catalog":
      return [
        { id: "demo-voice", name: "Demo voice", description: "Not synthesized. No audio provider is connected.", transcribe: false },
      ] satisfies VoiceCatalogEntry[];
    case "voice.credentials":
      return [] satisfies VoiceCredential[];
    case "voice.voices":
      return [{ id: "demo-voice", label: "Demo voice", description: "Local placeholder." }] satisfies VoiceInfo[];
    case "voice.connect":
    case "voice.disconnect":
    case "voice.setVoice":
    case "voice.setSpeechModel":
    case "voice.prepare":
      return key === "voice.prepare" ? { ok: true, simulated: true } : voiceStatus();
    case "computer.status":
    case "computer.boot":
    case "computer.reset":
    case "computer.takeover":
    case "computer.release":
    case "computer.heartbeat":
    case "computer.releaseInterrupted":
    case "computer.dismissUpdate": {
      const status = computerFor(text(body.botId, ada.id));
      if (key === "computer.boot" || key === "computer.reset") status.state = "error";
      if (key === "computer.heartbeat" || key.endsWith("Interrupted") || key.endsWith("dismissUpdate") || key.endsWith("release")) {
        return { ok: true };
      }
      if (key === "computer.takeover") return { leaseId: nid("lease"), expiresAt: now() };
      return status;
    }
    case "computer.screenUrl":
    case "computer.terminalUrl":
      return { url: null };
    case "computer.files":
      return [];
    case "computer.updates":
      return [];
    case "computer.readFile":
    case "computer.downloadFile":
      return { path: text(body.path, "/"), content: "Demo file. No computer is connected.", contentBase64: "ZGVtbyA=" };
    case "computer.uploadFile":
    case "computer.input":
      return { ok: true };
    case "artifacts.listSpace":
      return {
        items: state.artifacts.map((artifact) => ({ ...artifact, versionCount: 1 })),
        nextCursor: null,
      };
    case "artifacts.get":
    case "artifacts.getById": {
      const artifact = state.artifacts.find((item) => item.id === body.artifactId);
      if (!artifact) throw new Error("Artifact was not found in the demo workspace.");
      return artifact satisfies ArtifactWithContent;
    }
    case "artifacts.create": {
      const created: StoredArtifact = {
        id: nid("artifact"),
        botId: text(body.botId) || null,
        groupId: text(body.groupId) || null,
        runId: null,
        name: text(body.name, "upload"),
        description: "Uploaded in the local demo. The bytes stay in memory.",
        mimeType: text(body.mimeType, "application/octet-stream"),
        size: text(body.contentBase64).length,
        version: 1,
        createdAt: now(),
        contentBase64: text(body.contentBase64),
      };
      state.artifacts.push(created);
      return created;
    }
    case "artifacts.remove":
      state.artifacts = state.artifacts.filter((item) => item.id !== body.artifactId);
      return { ok: true };
    case "runs.list":
      return {
        runs: state.activity.filter((row) => body.filter !== "active" || row.status === "running"),
      };
    case "search.query": {
      const query = text(body.q).toLowerCase();
      const hits = [];
      for (const bot of activeBots()) {
        for (const message of threadMessages(bot.threadId)) {
          if (!query || message.text.toLowerCase().includes(query)) {
            hits.push({
              kind: "message" as const,
              botId: bot.id,
              botName: bot.name,
              title: bot.name,
              snippet: message.text.slice(0, 180),
              messageId: message.id,
              seq: message.seq,
            });
          }
        }
      }
      return { hits: hits.slice(0, 25) };
    }
    case "links.favicon":
      return { icon: null, retry: false };
    case "billing.status":
      return {
        access: true,
        canManage: false,
        trialAvailable: false,
        trialDays: 0,
        state: "none",
        price: null,
        seats: 1,
        trialEndsAt: null,
        currentPeriodEndsAt: null,
        cancelAtPeriodEnd: false,
        hasCustomer: false,
      };
    case "billing.checkout":
    case "billing.portal":
      throw new Error("Billing is not connected in the demo template.");
    case "preferences.update":
      if (body.avatarStyle === "robot" || body.avatarStyle === "organic") {
        state.settings.avatarStyle = body.avatarStyle;
      }
      return me();
    case "usage.summary":
      return { inputTokens: 0, outputTokens: 0, totalTokens: 0, modelCalls: 0, runs: state.activity.length };
    case "usage.list":
      return [];
    case "skills.list":
      return [];
    case "skills.start":
    case "skills.stop":
    case "skills.save":
    case "skills.updateDraft":
    case "skills.get":
      return emptySkill();
    case "skills.testRun":
      return { runId: nid("run") };
    case "agentSkills.list":
      return [
        {
          id: "skill_welcome",
          name: "Welcome",
          description: "Sample skill shown in the knowledge screen. It is not executed.",
          source: "user",
          readOnly: false,
        },
      ];
    case "agentSkills.get":
      return {
        id: text(body.skillId, "skill_welcome"),
        name: "Welcome",
        description: "Sample skill.",
        content: "# Welcome\n\nThis skill is demo content.",
        source: "user",
        readOnly: false,
        createdAt: now(),
        updatedAt: now(),
      };
    case "agentSkills.create":
    case "agentSkills.update":
      return {
        id: text(body.skillId) || nid("skill"),
        name: "Custom skill",
        description: "Saved in the demo session.",
        content: text(body.content, "Demo skill"),
        source: "user",
        readOnly: false,
        createdAt: now(),
        updatedAt: now(),
      };
    case "agentSkills.remove":
      return { ok: true };
    case "connections.list":
      return state.connections;
    case "connections.catalog":
      return [
        { connectorId: "calendar", slug: "calendar", name: "Calendar", logo: null, connected: true, noAuth: true },
        { connectorId: "mail", slug: "mail", name: "Mail", logo: null, connected: false, noAuth: false },
      ] satisfies ConnectionCatalogItem[];
    case "connections.begin":
      return { connectionId: nid("connection"), authorizationUrl: null };
    case "connections.revoke":
      state.connections = state.connections.filter((item) => item.id !== body.connectionId);
      return { ok: true };
    case "connections.rename": {
      const connection = state.connections.find((item) => item.id === body.connectionId);
      if (connection && typeof body.displayName === "string") connection.displayName = body.displayName;
      return connection ?? state.connections[0];
    }
    case "capabilities.list":
    case "capabilities.catalogSearch":
      return [];
    case "capabilities.install":
    case "capabilities.remove":
      return { ok: true };
    case "tickets.list":
      return { tickets: state.tickets };
    case "tickets.create":
    case "tickets.update":
    case "tickets.comment":
      return state.tickets[0];
    case "scratchpad.list":
      return state.scratchpad.filter((item) => !body.botId || item.botId === body.botId);
    case "scratchpad.create":
    case "scratchpad.update":
      return state.scratchpad[0];
    case "scratchpad.remove":
      return { ok: true };
    case "approvalRules.list":
      return [];
    case "approvalRules.set":
    case "approvalRules.remove":
      return { ok: true };
    case "autoReview.get":
      return { enabled: false, checkerAvailable: false };
    case "autoReview.set":
      return { enabled: Boolean(body.enabled), checkerAvailable: false };
    case "integrationSetup.get":
      return { canConfigure: true, needsSetup: false, webUrl: "http://127.0.0.1", providers: [] };
    case "integrationSetup.save":
      return { ok: true };
    case "messaging.status":
      return { enabled: false, providers: [], openSignup: false, identities: [] };
    case "messaging.channels.list":
    case "messaging.connections.list":
    case "mcp.servers.list":
    case "mcp.assignments.all":
    case "mcp.assignments.list":
      return [];
    case "messaging.link.start":
      return { code: "DEMO", expiresAt: new Date(Date.now() + 600_000).toISOString() };
    case "mcp.oauth.begin":
      return { status: "authorization_not_requested" };
    case "updater.status":
      return {
        supported: false,
        unsupportedReason: "This template does not include the upstream updater.",
        installKind: "source",
        manualCommands: [],
        mode: "unavailable",
        strategy: null,
        strategyNote: null,
        version: "demo",
        revision: null,
        commit: null,
        branch: null,
        remoteUrl: null,
        dirty: false,
        dirtyPaths: [],
        image: null,
        imageTag: null,
        previousImageTag: null,
        canRollback: false,
        source: { repoUrl: "", branch: "", official: false },
        officialRepoUrl: "",
        restartSupervisor: "none",
        restartAdvice: "No updater is connected.",
        running: false,
        lastRun: null,
      };
    case "updater.check":
      return { status: "unavailable", reason: "Demo template", changed: [], commit: null, targetCommit: null, targetTag: null, behindBy: 0 };
    case "export.bot": {
      const bot = state.bots.find((item) => item.id === body.botId) ?? ada;
      return {
        version: 1,
        exportedAt: now(),
        bot: { name: bot.name, title: bot.title, description: bot.description, instructions: bot.instructions },
        memory: state.memories.filter((item) => item.botId === bot.id).map((item) => ({ path: item.path, content: item.content })),
        routines: state.routines.filter((item) => item.botId === bot.id).map((item) => ({
          name: item.name,
          prompt: item.prompt,
          crons: item.crons,
          timezone: item.timezone,
        })),
        files: [],
        history: threadMessages(bot.threadId).map(textMessage),
      };
    }
    case "aiConsent.status":
      return { scope: "demo", version: "demo", recipients: [], privacyUrl: "https://example.com/privacy" };
    case "aiConsent.allow":
    case "aiConsent.revoke":
      return { scope: "demo", version: "demo", recipients: [], privacyUrl: "https://example.com/privacy" };
    case "onboarding.start":
    case "onboarding.promptFocus":
    case "onboarding.choose":
    case "onboarding.dismissFocus":
    case "onboarding.appConnected":
    case "deployment.update":
      return { ok: true };
    default:
      if (key.endsWith(".list") || key.endsWith(".catalog")) return [];
      return { ok: true, simulated: true };
  }
}

function toBot(assistant: Assistant): Bot {
  return state.bots.find((item) => item.id === assistant.id) ?? ada;
}

export const demoWorkspace = state;
