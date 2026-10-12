import { describe, expect, it } from "vitest";
import type { ChatAdapter } from "@tampletgrok/contracts";
import { dispatchDemoProcedure, getAppAdapters, resetDemoAdapters, setAppAdapters } from "./store.js";

describe("demo workspace", () => {
  it("lists sample assistants and answers a message locally", async () => {
    resetDemoAdapters();
    const bootstrap = (await dispatchDemoProcedure("bootstrap", {})) as {
      bots: Array<{ name: string }>;
      thread: { messages: unknown[] };
    };
    expect(bootstrap.bots.map((bot) => bot.name)).toContain("Ada");
    expect(bootstrap.thread.messages.length).toBeGreaterThan(0);

    const sent = (await dispatchDemoProcedure("threads/send", {
      botId: "bot_ada",
      text: "Hello from the template",
    })) as { runId: string };
    expect(sent.runId).toBeTruthy();

    const messages = await getAppAdapters().chat.getMessages("bot_ada");
    expect(messages.some((message) => message.content.includes("Hello from the template"))).toBe(true);
    expect(messages.some((message) => message.simulated && message.role === "assistant")).toBe(true);
  });

  it("shows a custom backend through the existing thread screen procedure", async () => {
    const chat: ChatAdapter = {
      async getConversations() {
        return [];
      },
      async getMessages() {
        return [
          {
            id: "custom-1",
            conversationId: "thread_bot_ada",
            role: "assistant",
            content: "From the custom backend",
            createdAt: new Date().toISOString(),
          },
        ];
      },
      async sendMessage(_conversationId, content) {
        return {
          id: "custom-2",
          conversationId: "thread_bot_ada",
          role: "user",
          content,
          createdAt: new Date().toISOString(),
        };
      },
    };
    setAppAdapters({ chat });
    const snap = (await dispatchDemoProcedure("threads/get", { botId: "bot_ada" })) as {
      messages: Array<{ blocks: Array<{ text?: string }> }>;
    };
    expect(snap.messages[0]?.blocks[0]?.text).toBe("From the custom backend");
    resetDemoAdapters();
    const restored = (await dispatchDemoProcedure("threads/get", { botId: "bot_ada" })) as {
      messages: Array<{ blocks: Array<{ text?: string }> }>;
    };
    expect(restored.messages.some((message) => message.blocks[0]?.text?.includes("launch notes"))).toBe(
      true,
    );
  });

  it("keeps model selection inside the demo catalog", async () => {
    const selected = await getAppAdapters().models.selectModel("anthropic", "claude-demo");
    expect(selected.simulated).toBe(true);
    const me = (await dispatchDemoProcedure("me")) as { defaultModel: string };
    expect(me.defaultModel).toBe("claude-demo");
  });
});
