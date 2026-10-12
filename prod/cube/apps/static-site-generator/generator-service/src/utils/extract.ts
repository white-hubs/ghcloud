import { execFile } from "node:child_process";
import { mkdir, unlink } from "node:fs/promises";
import { readFileSync } from "node:fs";

export type ArchiveType = 'gzip' | 'zip' | 'tar' | 'tar-gzip' | 'unknown';

export async function extract(
  archivePath: string,
  destDir: string
): Promise<void> {
  await mkdir(destDir, { recursive: true });
  const type = detectArchiveType(archivePath);

  switch (type) {
    case 'zip':
      await extractZip(archivePath, destDir);
      break;
    case 'tar-gzip':
    case 'gzip':
      await extractTarGz(archivePath, destDir);
      break;
    case 'tar':
      await extractTar(archivePath, destDir);
      break;
    default:
      throw new Error(`Unsupported archive type: ${type}`);
  }

  await unlink(archivePath);
}

export function detectArchiveType(filePath: string): ArchiveType {
  const fd = readFileSync(filePath, { encoding: null });
  const header = Buffer.isBuffer(fd) ? fd.slice(0, 6) : Buffer.alloc(0);

  if (header[0] === 0x1f && header[1] === 0x8b) {
    return 'gzip';
  }

  if (header[0] === 0x50 && header[1] === 0x4b && header[2] === 0x03 && header[3] === 0x04) {
    return 'zip';
  }

  if (header[0] === 0x75 && header[1] === 0x73 && header[2] === 0x74 && header[3] === 0x61 && header[4] === 0x72) {
    return 'tar';
  }

  return 'unknown';
}

export async function extractZip(
  archivePath: string,
  destDir: string
): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    execFile(
      "unzip",
      ["-o", archivePath, "-d", destDir],
      (error, stdout, stderr) => {
        if (error) reject(new Error(`unzip failed: ${stderr || error.message}`));
        else resolve();
      }
    );
  });
}

export async function extractTarGz(
  archivePath: string,
  destDir: string
): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    execFile(
      "tar",
      ["-xzf", archivePath, "-C", destDir],
      (error, stdout, stderr) => {
        if (error) reject(new Error(`tar extract failed: ${stderr || error.message}`));
        else resolve();
      }
    );
  });
}

export async function extractTar(
  archivePath: string,
  destDir: string
): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    execFile(
      "tar",
      ["-xf", archivePath, "-C", destDir],
      (error, stdout, stderr) => {
        if (error) reject(new Error(`tar extract failed: ${stderr || error.message}`));
        else resolve();
      }
    );
  });
}