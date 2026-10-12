export interface GeneratedImageItem {
  url: string;
  fileName: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === "object" && !Array.isArray(value);
}

function isAbsoluteUrl(url: string): boolean {
  return /^https?:\/\//i.test(url);
}

export function resolveGeneratedMediaUrl(url: string, engineBaseUrl: string): string {
  const trimmed = url.trim();
  if (trimmed === "" || isAbsoluteUrl(trimmed) || !trimmed.startsWith("/")) {
    return trimmed;
  }
  if (!trimmed.startsWith("/agentic/media/")) {
    return trimmed;
  }
  try {
    return new URL(trimmed, engineBaseUrl).toString();
  } catch {
    return trimmed;
  }
}

export function readGeneratedImages(output: unknown, engineBaseUrl: string): GeneratedImageItem[] {
  if (!isRecord(output) || !Array.isArray(output.images)) {
    return [];
  }
  return output.images.flatMap((item) => {
    if (!isRecord(item) || typeof item.url !== "string" || typeof item.fileName !== "string") {
      return [];
    }
    return [
      {
        url: resolveGeneratedMediaUrl(item.url, engineBaseUrl),
        fileName: item.fileName,
      },
    ];
  });
}
