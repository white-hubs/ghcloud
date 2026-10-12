import { describe, expect, test } from "bun:test";

import { filterBindableSkillRefs } from "./agent-skill-binding";

describe("filterBindableSkillRefs", () => {
  test("drops engine-internal defaults and duplicates", () => {
    expect(filterBindableSkillRefs(["skl_a", "default-reasoning", "skl_a", "chart-output", " model-interact "])).toEqual([
      "skl_a",
      "model-interact",
    ]);
  });
});
