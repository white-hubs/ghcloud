export type TaskStatus = 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED';
export type DeployStatus = 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED';
export type Provider = 'qiniu' | 'ftp' | 'sftp';

export interface ProviderConfig {
  accessKey?: string;
  secretKey?: string;
  bucket?: string;
  zone?: string;
  domain?: string;
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  privateKey?: string;
  remotePath?: string;
}

export interface Task {
  id: string;
  type: 'build';
  status: TaskStatus;
  outputPath?: string;
  error?: string;
  tenantCode: string;
  downloadStatic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Deploy {
  id: string;
  taskId: string;
  provider: Provider;
  providerConfig: ProviderConfig;
  status: DeployStatus;
  progress?: number;
  output?: string;
  error?: string;
  tenantCode: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string };
}

export interface PageResponse<T> {
  success: boolean;
  data: { records: T[]; total: number; page: number; pageSize: number };
}