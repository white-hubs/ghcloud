interface UploadElementResponse {
  success?: boolean;
  message?: string;
  error?: string;
}

async function ensureSuccessfulResponse(response: Response, errorMessage: string): Promise<void> {
  if (response.ok) {
    return;
  }

  let detail = `HTTP ${response.status}`;
  try {
    const payload = (await response.json()) as UploadElementResponse;
    detail = payload.message || payload.error || detail;
  } catch {
    // Keep the HTTP status when the service does not return JSON.
  }
  throw new Error(`${errorMessage}：${detail}`);
}

export async function uploadElementSvg(svgContent: string, errorMessage = "图片上传失败"): Promise<void> {
  const response = await fetch("/scada/api/elements/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ svgContent }),
  });

  await ensureSuccessfulResponse(response, errorMessage);
}

export async function deleteElementAsset(type: string): Promise<void> {
  const response = await fetch(`/scada/api/elements/${encodeURIComponent(type)}`, {
    method: "DELETE",
  });

  await ensureSuccessfulResponse(response, "删除图片失败");
}
