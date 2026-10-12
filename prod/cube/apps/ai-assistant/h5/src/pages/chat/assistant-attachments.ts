export function resolveAttachmentPreviewSrc(previewUrl: string, mediaBaseUrl: string): string {
  if (
    previewUrl.startsWith("http://") ||
    previewUrl.startsWith("https://") ||
    previewUrl.startsWith("blob:") ||
    previewUrl.startsWith("data:")
  ) {
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
