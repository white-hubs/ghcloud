/** 部署相关 Mock 数据与 API */

export type TaskStatus = "PENDING" | "RUNNING" | "SUCCESS" | "FAILED";
export type DeployProvider = "qiniu" | "sftp" | "ftp";

export interface QiniuConfig {
  accessKey: string;
  secretKey: string;
  bucket: string;
  zone: string;
  domain: string;
}

export interface DeployConfig {
  provider: DeployProvider;
  providerConfig: QiniuConfig;
}

export interface Artifact {
  id: string;
  artifactName: string;
  taskStatus: TaskStatus;
  deployStatus: TaskStatus;
  lastDeployTime?: string | undefined;
}

let deployConfig: DeployConfig = {
  provider: "qiniu",
  providerConfig: {
    accessKey: "your-access-key",
    secretKey: "your-secret-key",
    bucket: "your-bucket",
    zone: "z0",
    domain: "cdn.example.com",
  },
};

const artifactList: Artifact[] = [
  {
    id: "1",
    artifactName: "product-1714003200000",
    taskStatus: "SUCCESS",
    deployStatus: "SUCCESS",
    lastDeployTime: "2025-04-25 10:00:00",
  },
  {
    id: "2",
    artifactName: "product-1713916800000",
    taskStatus: "SUCCESS",
    deployStatus: "FAILED",
    lastDeployTime: undefined,
  },
  {
    id: "3",
    artifactName: "product-1713830400000",
    taskStatus: "RUNNING",
    deployStatus: "PENDING",
    lastDeployTime: undefined,
  },
  {
    id: "4",
    artifactName: "product-1713744000000",
    taskStatus: "SUCCESS",
    deployStatus: "SUCCESS",
    lastDeployTime: "2025-04-22 14:30:00",
  },
  {
    id: "5",
    artifactName: "product-1713657600000",
    taskStatus: "FAILED",
    deployStatus: "PENDING",
    lastDeployTime: undefined,
  },
];

const delay = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

export const mockDeployApi = {
  /** 获取部署配置 */
  async getConfig(): Promise<DeployConfig> {
    await delay(200);
    return {
      provider: deployConfig.provider,
      providerConfig: { ...deployConfig.providerConfig },
    };
  },

  /** 保存部署配置 */
  async saveConfig(config: DeployConfig): Promise<void> {
    await delay(300);
    deployConfig = {
      provider: config.provider,
      providerConfig: { ...config.providerConfig },
    };
  },

  /** 执行构建和部署 */
  async runDeploy(): Promise<void> {
    await delay(500);
    // 模拟新增一个 RUNNING 状态的制品到列表头部
    const timestamp = Date.now();
    artifactList.unshift({
      id: `artifact-${timestamp}`,
      artifactName: `product-${timestamp}`,
      taskStatus: "RUNNING",
      deployStatus: "PENDING",
      lastDeployTime: undefined,
    });
  },

  /** 获取制品列表 */
  async getArtifactList(): Promise<Artifact[]> {
    await delay(200);
    return [...artifactList];
  },

  /** 再次发布 */
  async redeploy(id: string): Promise<void> {
    await delay(500);
    const item = artifactList.find((a) => a.id === id);
    if (item) {
      item.taskStatus = "RUNNING";
      item.deployStatus = "PENDING";
      item.lastDeployTime = undefined;
    }
  },
};
