// oxlint-disable no-console
import SftpClient from "ssh2-sftp-client";

import type { ProviderConfig, Provider } from "../types";
import type { DeployProvider, DeployResult } from "./base";

export class SFTPProvider implements DeployProvider {
  readonly name: Provider = "sftp";

  async deploy(config: ProviderConfig, localPath: string, onProgress: (progress: number) => void): Promise<DeployResult> {
    const sftp = new (SftpClient as any)();

    try {
      const { host, port, username, password, privateKey, remotePath } = config;

      if (!host || !username) {
        return { success: false, error: "Missing required config: host, username" };
      }

      if (!password && !privateKey) {
        return { success: false, error: "Missing required config: password or privateKey" };
      }

      const connectConfig: any = {
        host,
        port: port || 22,
        username,
        readyTimeout: 30000,
      };

      if (password) {
        connectConfig.password = password;
      } else if (privateKey) {
        connectConfig.privateKey = privateKey;
      }

      await sftp.connect(connectConfig);
      console.log(`[sftp] connected ${host}:${port || 22}`);

      const remoteBasePath = remotePath || "/";
      const dirName = localPath.split("/").pop() || "site";
      const targetPath = remoteBasePath.endsWith("/") ? remoteBasePath + dirName : remoteBasePath + "/" + dirName;

      const exists = await sftp.exists(targetPath);
      if (!exists) {
        await sftp.mkdir(targetPath, true);
      }

      console.log(`[sftp] uploading ${localPath} -> ${targetPath}`);
      await sftp.uploadDir(localPath, targetPath);

      console.log(`[sftp] upload complete -> ${targetPath}`);
      onProgress(100);
      return { success: true, output: targetPath };
    } catch (error) {
      console.error(`[sftp] failed: ${error instanceof Error ? error.message : String(error)}`);
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    } finally {
      sftp.end();
    }
  }
}
