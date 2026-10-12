import { describe, expect, test } from "bun:test";

import { fetchSessionAgentId, pickSessionAgentId } from "./assistant-session-agent";

describe("assistant session agent", () => {
  test("pickSessionAgentId trims and falls back to empty", () => {
    expect(pickSessionAgentId({ agentId: "  agt_1  " })).toBe("agt_1");
    expect(pickSessionAgentId({ agentId: "" })).toBe("");
    expect(pickSessionAgentId({ agentId: null })).toBe("");
    expect(pickSessionAgentId(null)).toBe("");
  });

  test("fetchSessionAgentId reads agentId from getSession", async () => {
    const agentId = await fetchSessionAgentId(async () => ({ agentId: "agt_hist" }), "sess_1");
    expect(agentId).toBe("agt_hist");
  });

  test("fetchSessionAgentId returns empty when sessionId blank", async () => {
    let called = false;
    const agentId = await fetchSessionAgentId(async () => {
      called = true;
      return { agentId: "agt_x" };
    }, "  ");
    expect(agentId).toBe("");
    expect(called).toBe(false);
  });
});
