import { describe, expect, it } from "vitest";

import {
  applyTextAspectRatioCompensation,
  createHtmlTextSizeCompensationStyle,
  createTextAspectCompensationTransform,
} from "./text-aspect-ratio";

describe("createTextAspectCompensationTransform", () => {
  it("counteracts horizontal stretching around the text anchor", () => {
    expect(createTextAspectCompensationTransform(100, 60, 200, 60, 50, 35)).toBe("translate(50 35) scale(0.5 1) translate(-50 -35)");
  });

  it("counteracts horizontal compression around the text anchor", () => {
    expect(createTextAspectCompensationTransform(100, 60, 100, 120, 50, 35)).toBe("translate(50 35) scale(2 1) translate(-50 -35)");
  });

  it("fills a non-uniformly resized html panel while keeping text pixels unchanged", () => {
    expect(createHtmlTextSizeCompensationStyle(200, 120, 180, 300)).toEqual({
      width: "90%",
      height: "250%",
      transform: "scale(1.111111, 0.4)",
      transformOrigin: "0 0",
    });
  });

  it("applies the compensation to marked SVG text", () => {
    const textAttributes = new Map([
      ["x", "50"],
      ["y", "35"],
    ]);
    const text = {
      getAttribute: (name: string) => textAttributes.get(name) ?? null,
      setAttribute: (name: string, value: string) => textAttributes.set(name, value),
    };
    const htmlStyle: Record<string, string> = {};
    const htmlContent = { style: htmlStyle };
    const svgAttributes = new Map([
      ["preserveAspectRatio", "none"],
      ["viewBox", "0 0 100 60"],
    ]);
    const svg = {
      getAttribute: (name: string) => svgAttributes.get(name) ?? null,
      querySelectorAll: (selector: string) => (selector.includes("preserve-html-text-size") ? [htmlContent] : [text]),
    };
    const root = {
      querySelector: () => svg,
    } as unknown as Element;

    applyTextAspectRatioCompensation(root, 200, 60);

    expect(textAttributes.get("transform")).toBe("translate(50 35) scale(0.5 1) translate(-50 -35)");
    expect(htmlStyle).toEqual({
      width: "200%",
      height: "100%",
      transform: "scale(0.5, 1)",
      transformOrigin: "0 0",
    });
  });
});
