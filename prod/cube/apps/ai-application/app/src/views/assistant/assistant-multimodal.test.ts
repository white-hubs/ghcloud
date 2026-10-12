import { describe, expect, test } from "bun:test";

import {
  buildAgenticEngineRequestHeaders,
  isAllowedImageMime,
  pendingToImageAttachments,
  resolveAttachmentPreviewSrc,
  type ComposerPendingAttachment,
} from "./assistant-multimodal";

describe("assistant multimodal helpers", () => {
  test("isAllowedImageMime accepts contract whitelist", () => {
    expect(isAllowedImageMime("image/png")).toBe(true);
    expect(isAllowedImageMime("image/jpeg")).toBe(true);
    expect(isAllowedImageMime("application/pdf")).toBe(false);
  });

  test("resolveAttachmentPreviewSrc joins relative preview paths", () => {
    expect(resolveAttachmentPreviewSrc("/files/f1/preview", "https://engine.example.com/api/ai-center/agent")).toBe(
      "https://engine.example.com/api/ai-center/agent/files/f1/preview",
    );
    expect(resolveAttachmentPreviewSrc("https://cdn/x.png", "https://engine.example.com")).toBe("https://cdn/x.png");
  });

  test("buildAgenticEngineRequestHeaders adds tenant, terminal, and Bearer", () => {
    expect(buildAgenticEngineRequestHeaders({ tenant: 1, terminal: 2, token: "abc" })).toEqual({
      tenant: "1",
      terminal: "2",
      Authorization: "Bearer abc",
    });
  });

  test("pendingToImageAttachments maps composer pending to API attachments", () => {
    const pending: ComposerPendingAttachment[] = [
      {
        attachmentId: "att_1",
        fileId: "file_1",
        mimeType: "image/png",
        previewUrl: "/files/file_1/preview",
      },
    ];
    expect(pendingToImageAttachments(pending)).toEqual([
      {
        attachmentId: "att_1",
        kind: "image",
        fileId: "file_1",
        mimeType: "image/png",
        previewUrl: "/files/file_1/preview",
      },
    ]);
  });
});
