import { describe, expect, test } from "bun:test";

import { buildViewportCssPayload } from "./viewport-coordinator";
import { resolveViewportMetrics } from "./viewport-metrics";

describe("buildViewportCssPayload", () => {
  test("writes contain rem and disables panel transform", () => {
    const payload = buildViewportCssPayload(resolveViewportMetrics(1920, 1080));
    expect(payload.fontSize).toBe("192px");
    expect(payload.bodyFontSize).toBe("16px");
    expect(payload.dataset.viewportMode).toBe("normal");
    expect(payload.properties["--ue5-ui-scale"]).toBe("1");
    expect(payload.properties["--scale"]).toBe("1");
    expect(payload.properties["--ue5-panel-scale-x"]).toBe("none");
    expect(payload.properties["--ue5-panel-scale-y"]).toBe("none");
  });

  test("keeps compact mode at the readable scale floor", () => {
    const payload = buildViewportCssPayload(resolveViewportMetrics(1000, 600));
    expect(payload.dataset.viewportMode).toBe("compact");
    expect(Number(payload.properties["--ue5-ui-scale"])).toBe(1);
    expect(Number.parseFloat(payload.bodyFontSize)).toBe(16);
    expect(payload.fontSize).toBe("192px");
  });

  test("publishes panel width rem from widthScale, not font floor", () => {
    const laptop = buildViewportCssPayload(resolveViewportMetrics(1366, 768));
    expect(laptop.properties["--ue5-width-scale"]).toBe(String(1366 / 1920));
    expect(laptop.properties["--ue5-panel-width"]).toBe(`${((1366 / 1920) * 400) / 192}rem`);
    expect(laptop.signature).toContain(":");

    const design = buildViewportCssPayload(resolveViewportMetrics(1920, 1080));
    expect(design.properties["--ue5-panel-width"]).toBe(`${400 / 192}rem`);
  });
});
