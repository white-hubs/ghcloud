// oxlint-disable no-console
import Client from "basic-ftp";

import type { ProviderConfig, Provider } from "../types";
import type { DeployProvider, DeployResult } from "./base";

export class FTPProvider implements DeployProvider {
  readonly name: Provider = "ftp";

  async deploy(config: ProviderConfig, localPath: string, onProgress: (progress: number) => void): Promise<DeployResult> {
    const client = new (Client as any)();

    try {
      const { host, port, username, password, remotePath } = config;

      if (!host || !username || !password) {
        return { success: false, error: "Missing required config: host, username, password" };
      }

      await client.access({
        host,
        port: port || 21,
        user: username,
        password,
        secure: false,
      });
      console.log(`[ftp] connected ${host}:${port || 21}`);

      const remoteBasePath = remotePath || "/";
      const dirName = localPath.split("/").pop() || "site";
      const targetPath = remoteBasePath.endsWith("/") ? remoteBasePath + dirName : remoteBasePath + "/" + dirName;

      console.log(`[ftp] uploading ${localPath} -> ${remotePath}`);
      await client.uploadDir(localPath, remotePath, {
        recursive: true,
      });

      console.log(`[ftp] upload complete -> ${targetPath}`);
      onProgress(100);
      return { success: true, output: targetPath };
    } catch (error) {
      console.error(`[ftp] failed: ${error instanceof Error ? error.message : String(error)}`);
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    } finally {
      client.close();
    }
  }
}
