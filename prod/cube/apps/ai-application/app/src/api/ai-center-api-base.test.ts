import { describe, expect, test } from "bun:test";

import { resolveAgenticEngineBase, resolveAiCenterApiBase, type AiCenterApiBaseRuntime } from "./ai-center-api-base";

const qiankunRuntime: AiCenterApiBaseRuntime = {
  poweredByQiankun: true,
  publicPath: "http://localhost:8890/apps/@ghcloud/cube-ai-application-app/",
  locationHref: "http://mf-root.local/",
};

describe("resolveAiCenterApiBase", () => {
  test("keeps absolute configured base", () => {
    expect(resolveAiCenterApiBase("http://localhost:8890/api/ai-center", qiankunRuntime)).toBe("http://localhost:8890/api/ai-center");
  });

  test("routes qiankun relative base through sub app public origin", () => {
    expect(resolveAiCenterApiBase("/api/ai-center", qiankunRuntime)).toBe("http://localhost:8890/api/ai-center");
  });

  test("keeps relative base outside qiankun", () => {
    expect(
      resolveAiCenterApiBase("/api/ai-center", {
        poweredByQiankun: false,
        locationHref: "http://localhost:8890/",
      }),
    ).toBe("/api/ai-center");
  });
});

describe("resolveAgenticEngineBase", () => {
  test("derives agent base from current ai-center base", () => {
    expect(resolveAgenticEngineBase()).toMatch(/\/api\/ai-center\/agent$/);
  });
});
