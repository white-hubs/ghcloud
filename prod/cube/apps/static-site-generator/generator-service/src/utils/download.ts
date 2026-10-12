import { createWriteStream } from "node:fs";
import { mkdir } from "node:fs/promises";
import { dirname } from "node:path";

export async function downloadFile(url: string, destPath: string, headers?: Record<string, string>): Promise<void> {
  const dir = dirname(destPath);
  await mkdir(dir, { recursive: true });

  const response = await fetch(url, { headers });
  if (!response.ok) {
    throw new Error(`Failed to download ${url}: ${response.status} ${response.statusText}`);
  }

  const file = createWriteStream(destPath);
  const reader = response.body!.getReader();
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      if (!file.write(value)) {
        await new Promise<void>((resolve) => file.once("drain", resolve));
      }
    }
  } finally {
    file.end();
    await new Promise<void>((resolve, reject) => {
      file.on("finish", resolve);
      file.on("error", reject);
    });
  }
}
