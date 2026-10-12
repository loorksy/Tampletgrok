import { describe, expect, it } from "vitest";
import { dispatchDemoProcedure, getAppAdapters, resetDemoAdapters } from "./store.js";

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

  it("keeps model selection inside the demo catalog", async () => {
    const selected = await getAppAdapters().models.selectModel("anthropic", "claude-demo");
    expect(selected.simulated).toBe(true);
    const me = (await dispatchDemoProcedure("me")) as { defaultModel: string };
    expect(me.defaultModel).toBe("claude-demo");
  });
});
