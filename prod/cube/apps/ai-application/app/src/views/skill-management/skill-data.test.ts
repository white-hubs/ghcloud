import { describe, expect, test } from "bun:test";

import { buildSkillActivation, resolveSkillActivationState } from "./skill-activation";

describe("skill activation content", () => {
  test("submits alpha.13 activation instead of legacy trigger", () => {
    const content: Record<string, unknown> = {
      activation: buildSkillActivation({ activationMode: "manual", activationGlobs: [] }),
    };

    expect(content.activation).toEqual({ mode: "manual" });
    expect(content).not.toHaveProperty("trigger");
  });

  test("submits path activation with non-empty globs", () => {
    const content: Record<string, unknown> = {
      activation: buildSkillActivation({ activationMode: "path", activationGlobs: ["src/**/*.ts", "docs/**/*.md"] }),
    };

    expect(content.activation).toEqual({ mode: "path", globs: ["src/**/*.ts", "docs/**/*.md"] });
  });

  test("rejects path activation without globs", () => {
    expect(() => buildSkillActivation({ activationMode: "path", activationGlobs: [] })).toThrow("路径匹配激活方式必须填写至少一个路径规则");
  });

  test("maps existing activation content back to form state", () => {
    expect(resolveSkillActivationState({ activation: { mode: "path", globs: ["prod/**"] } })).toEqual({
      activationMode: "path",
      activationGlobs: ["prod/**"],
    });
  });

  test("maps legacy explicit trigger to manual activation for editing old rows", () => {
    expect(resolveSkillActivationState({ trigger: "explicit" })).toEqual({
      activationMode: "manual",
      activationGlobs: [],
    });
  });
});
