import type { Provider, ProviderConfig } from '../types';

export interface DeployResult {
  success: boolean;
  output?: string;
  error?: string;
}

export interface DeployProvider {
  readonly name: Provider;
  deploy(
    config: ProviderConfig,
    localPath: string,
    onProgress: (progress: number) => void
  ): Promise<DeployResult>;
}
