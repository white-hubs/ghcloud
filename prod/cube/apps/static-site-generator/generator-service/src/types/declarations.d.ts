declare module 'uuid' {
  export function v4(): string;
}

declare module 'ssh2-sftp-client' {
  interface ConnectOptions {
    host: string;
    port?: number;
    username: string;
    password?: string;
    privateKey?: string;
    readyTimeout?: number;
  }
  interface SftpClient {
    connect(options: ConnectOptions): Promise<void>;
    uploadDir(localPath: string, remotePath: string): Promise<void>;
    mkdir(path: string, recursive: boolean): Promise<void>;
    exists(path: string): Promise<boolean | string>;
    end(): void;
  }
  interface SftpClientConstructor {
    new (): SftpClient;
  }
  const SftpClient: SftpClientConstructor;
  export = SftpClient;
}