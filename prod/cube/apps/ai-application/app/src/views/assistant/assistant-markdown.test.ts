import { afterEach, describe, expect, spyOn, test } from "bun:test";
import hljs from "highlight.js";

import { renderAssistantMarkdownToHtml } from "./assistant-markdown";

const restoreFns: (() => void)[] = [];

afterEach(() => {
  while (restoreFns.length > 0) {
    restoreFns.pop()?.();
  }
});

function forbidHighlightAuto(): void {
  const spy = spyOn(hljs, "highlightAuto").mockImplementation(() => {
    throw new Error("highlightAuto should not run for chart fences");
  });
  restoreFns.push(() => spy.mockRestore());
}

describe("renderAssistantMarkdownToHtml", () => {
  test("echarts fence is highlighted as json without highlightAuto", () => {
    forbidHighlightAuto();

    const html = renderAssistantMarkdownToHtml('```echarts\n{"series":[]}\n```');

    expect(html).toContain('class="hljs language-echarts"');
    expect(html).toContain("series");
  });

  test("mermaid fence escapes source without highlightAuto", () => {
    forbidHighlightAuto();

    const html = renderAssistantMarkdownToHtml("```mermaid\nflowchart TD\n  A --> B\n```");

    expect(html).toContain('class="hljs language-mermaid"');
    expect(html).toContain("flowchart TD");
  });

  test("normalizes relative generated-media image URLs against engine base", () => {
    const html = renderAssistantMarkdownToHtml("![img](/agentic/media/abc.png)", {
      mediaBaseUrl: "https://engine.example.com/api/ai-center/agent",
    });

    expect(html).toContain('src="https://engine.example.com/agentic/media/abc.png"');
  });
});
