import type { AgenticClient } from "@cube-ai/agent-sdk-client";
import type { ImageAttachment } from "@cube-ai/contracts";

import { randomUUID } from "../../util/crypto-random-uuid";

export const MAX_COMPOSER_IMAGES = 4;

const ALLOWED_IMAGE_MIME = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);

export interface ComposerPendingAttachment {
  attachmentId: string;
  fileId: string;
  mimeType: string;
  previewUrl: string;
  fileName?: string;
  /** Blob URL for instant composer preview; revoked on remove/send. */
  localPreviewUrl?: string;
}

export function isAllowedImageMime(mimeType: string): boolean {
  return ALLOWED_IMAGE_MIME.has(mimeType);
}

export async function readFileAsBase64(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCodePoint(bytes[i]!);
  }
  return btoa(binary);
}

export async function uploadComposerImage(client: AgenticClient, file: File): Promise<ComposerPendingAttachment> {
  if (!isAllowedImageMime(file.type)) {
    throw new Error(`不支持的图片类型：${file.type || "unknown"}`);
  }
  const base64 = await readFileAsBase64(file);
  const uploaded = await client.files.upload({
    mimeType: file.type,
    base64,
    ...(file.name ? { fileName: file.name } : {}),
  });
  return {
    attachmentId: `att_${randomUUID().replaceAll(/-/g, "")}`,
    fileId: uploaded.fileId,
    mimeType: uploaded.mimeType,
    previewUrl: uploaded.previewUrl,
    ...(file.name ? { fileName: file.name } : {}),
  };
}

export function pendingToImageAttachments(pending: readonly ComposerPendingAttachment[]): ImageAttachment[] {
  return pending.map((item) => ({
    attachmentId: item.attachmentId,
    kind: "image" as const,
    fileId: item.fileId,
    mimeType: item.mimeType,
    previewUrl: item.previewUrl,
  }));
}

export function resolveAttachmentPreviewSrc(previewUrl: string, mediaBaseUrl: string): string {
  if (previewUrl.startsWith("http://") || previewUrl.startsWith("https://")) {
    return previewUrl;
  }
  const base = mediaBaseUrl.replace(/\/+$/, "");
  const path = previewUrl.startsWith("/") ? previewUrl : `/${previewUrl}`;
  return `${base}${path}`;
}

export function buildAgenticEngineRequestHeaders(input: {
  tenant: number | string;
  terminal: number | string;
  token: string;
}): Record<string, string> {
  const headers: Record<string, string> = {
    tenant: String(input.tenant),
    terminal: String(input.terminal),
  };
  const token = input.token.trim();
  if (token !== "") {
    headers.Authorization = token.toLowerCase().startsWith("bearer ") ? token : `Bearer ${token}`;
  }
  return headers;
}

/** GET /files/:id/preview requires auth — use blob URL for <img src>. */
export async function fetchAuthenticatedPreviewBlobUrl(
  previewUrl: string,
  mediaBaseUrl: string,
  headers: Record<string, string>,
): Promise<string | null> {
  const url = resolveAttachmentPreviewSrc(previewUrl, mediaBaseUrl);
  const response = await fetch(url, { headers });
  if (!response.ok) {
    return null;
  }
  const blob = await response.blob();
  return URL.createObjectURL(blob);
}
