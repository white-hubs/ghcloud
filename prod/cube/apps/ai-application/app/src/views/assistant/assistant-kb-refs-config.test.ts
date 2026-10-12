import { afterEach, describe, expect, test } from "bun:test";

import { filterManualComposerReferences, isAssistantKbRefsUiEnabled } from "./assistant-kb-refs-config";

const ENV_KEY = "VITE_ASSISTANT_KB_REFS_UI_ENABLED";

describe("assistant-kb-refs-config", () => {
  afterEach(() => {
    delete (import.meta.env as Record<string, string | undefined>)[ENV_KEY];
  });

  test("defaults to disabled when env unset", () => {
    delete (import.meta.env as Record<string, string | undefined>)[ENV_KEY];
    expect(isAssistantKbRefsUiEnabled()).toBe(false);
  });

  test("enables when env is true-like", () => {
    (import.meta.env as Record<string, string | undefined>)[ENV_KEY] = "true";
    expect(isAssistantKbRefsUiEnabled()).toBe(true);
  });

  test("filterManualComposerReferences drops kb when UI disabled", () => {
    delete (import.meta.env as Record<string, string | undefined>)[ENV_KEY];
    const refs = [
      { type: "kb", id: "k1" },
      { type: "skill", id: "s1" },
    ];
    expect(filterManualComposerReferences(refs)).toEqual([{ type: "skill", id: "s1" }]);
  });

  test("filterManualComposerReferences keeps kb when UI enabled", () => {
    (import.meta.env as Record<string, string | undefined>)[ENV_KEY] = "1";
    const refs = [
      { type: "kb", id: "k1" },
      { type: "skill", id: "s1" },
    ];
    expect(filterManualComposerReferences(refs)).toEqual(refs);
  });
});
