import { describe, expect, test } from "bun:test";

import { extractImageUrlFromReplyText, WorkflowReplyContent } from "./workflow-reply-content";

describe("extractImageUrlFromReplyText", () => {
  test("parses markdown image syntax", () => {
    expect(extractImageUrlFromReplyText("![Generated image](https://example.com/a.png)")).toBe("https://example.com/a.png");
  });

  test("parses bare dashscope image url", () => {
    const url = "https://dashscope-result-sh.oss-cn-shanghai.aliyuncs.com/x.png?Expires=1";
    expect(extractImageUrlFromReplyText(url)).toBe(url);
  });

  test("returns null for plain text", () => {
    expect(extractImageUrlFromReplyText("hello")).toBeNull();
  });
});

describe("WorkflowReplyContent", () => {
  test("renders markdown blocks as structured nodes", () => {
    const vnode = WorkflowReplyContent({
      text: '# 标题\n\n- 第一项\n- **第二项**\n\n```json\n{"ok":true}\n```',
      proseClass: "prose",
      imageClass: "image",
    }) as { type: string; children: { type: string; children?: unknown }[] };

    expect(vnode.type).toBe("div");
    expect(vnode.children.map((child) => child.type)).toEqual(["h1", "ul", "pre"]);
  });
});
