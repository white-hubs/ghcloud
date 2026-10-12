import type { DeployProvider, DeployResult } from './base';
import type { Provider, ProviderConfig } from '../types';
import { QiniuProvider } from './qiniu';
import { FTPProvider } from './ftp';
import { SFTPProvider } from './sftp';

export { DeployProvider, DeployResult };

const providers: Record<Provider, DeployProvider> = {
  qiniu: new QiniuProvider(),
  ftp: new FTPProvider(),
  sftp: new SFTPProvider(),
};

export function createProvider(type: Provider): DeployProvider {
  return providers[type];
}
