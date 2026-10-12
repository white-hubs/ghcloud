import { execFileSync } from "node:child_process";
import { dirname, basename } from "node:path";

import { ensureDir } from "./fs.ts";

export async function createZip(sourceDir: string, outputZipPath: string): Promise<void> {
  const cwd = dirname(sourceDir);
  const baseName = basename(sourceDir);
  const zipName = basename(outputZipPath);

  await ensureDir(dirname(outputZipPath));

  execFileSync("zip", ["-r", "-q", zipName, baseName], {
    cwd,
    stdio: "inherit",
  });
}
