import { describe, expect, test } from "bun:test";

import { readGeneratedImages, resolveGeneratedMediaUrl } from "./assistant-generated-media";

describe("resolveGeneratedMediaUrl", () => {
  test("keeps absolute URLs unchanged", () => {
    expect(resolveGeneratedMediaUrl("https://cdn.example.com/agentic/media/a.png", "https://engine.example.com/api/ai-center/agent")).toBe(
      "https://cdn.example.com/agentic/media/a.png",
    );
  });

  test("resolves engine-hosted relative media URLs against engine origin", () => {
    expect(resolveGeneratedMediaUrl("/agentic/media/a.png", "https://engine.example.com/api/ai-center/agent")).toBe(
      "https://engine.example.com/agentic/media/a.png",
    );
  });
});

describe("readGeneratedImages", () => {
  test("extracts image.qwen outputs and normalizes relative URLs", () => {
    expect(
      readGeneratedImages(
        {
          images: [
            { url: "/agentic/media/a.png", fileName: "a.png" },
            { url: "https://cdn.example.com/b.png", fileName: "b.png" },
          ],
        },
        "https://engine.example.com/api/ai-center/agent",
      ),
    ).toEqual([
      {
        url: "https://engine.example.com/agentic/media/a.png",
        fileName: "a.png",
      },
      {
        url: "https://cdn.example.com/b.png",
        fileName: "b.png",
      },
    ]);
  });

  test("ignores non-conforming outputs", () => {
    expect(readGeneratedImages({ images: [{ url: 1 }, null] }, "https://engine.example.com")).toEqual([]);
  });
});
