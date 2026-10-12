import { LoggerManager } from "@dangao/logsmith";

// 在配置加载阶段，LoggerModule 可能还未初始化，使用 LoggerManager 获取全局 logger
const configLogger = LoggerManager.getLogger();

/**
 * GitLab 用户到钉钉手机号的映射配置
 * 支持多对一映射（多个 GitLab 用户对应同一个钉钉手机号）
 */
export interface UserMappingConfig {
  /**
   * GitLab 用户名 -> 钉钉手机号数组的映射
   * 一个 GitLab 用户可以对应多个钉钉手机号（多对一）
   */
  [gitlabUsername: string]: string[];
}

/**
 * GitLab 用户到 OpenIM userID 的映射配置
 * 用于后续消息中 @ 用户（atUserList）
 * 环境变量格式：GITLAB_OPENIM_MAPPING='{"gitlab_user1":"openim_user_id_1","gitlab_user2":["openim_id_2"]}'
 * 值支持 string 或 string[]，内部会规范为 string[]
 */
export type OpenimUserMappingConfig = Record<string, string | string[]>;

/**
 * 默认用户映射配置
 * 可以通过环境变量或配置文件覆盖
 */
const DEFAULT_USER_MAPPING: UserMappingConfig = {
  // 示例配置
  // "gitlab_user1": ["13800000001"],
  // "gitlab_user2": ["13800000002", "13800000003"],
};

/**
 * 从环境变量加载用户映射配置
 * 环境变量格式：GITLAB_DINGTALK_MAPPING='{"gitlab_user1":["13800000001"],"gitlab_user2":["13800000002"]}'
 */
function loadUserMappingFromEnv(): UserMappingConfig {
  const mappingStr = process.env.GITLAB_DINGTALK_MAPPING;
  if (!mappingStr) {
    return {};
  }

  try {
    return JSON.parse(mappingStr) as UserMappingConfig;
  } catch (error) {
    configLogger.warn("Failed to parse GITLAB_DINGTALK_MAPPING:", error);
    return {};
  }
}

/**
 * 从配置文件加载用户映射配置
 * 配置文件路径：通过环境变量 USER_MAPPING_FILE 指定，默认为 ./user-mapping.json
 */
async function loadUserMappingFromFile(): Promise<UserMappingConfig> {
  const filePath = process.env.USER_MAPPING_FILE || "./user-mapping.json";

  try {
    const file = Bun.file(filePath);
    if (await file.exists()) {
      const content = await file.text();
      return JSON.parse(content) as UserMappingConfig;
    }
  } catch (error) {
    configLogger.warn(`Failed to load user mapping from file ${filePath}:`, error);
  }

  return {};
}

/**
 * 加载用户映射配置
 * 优先级：环境变量 > 配置文件 > 默认配置
 */
export async function loadUserMappingConfig(): Promise<UserMappingConfig> {
  const envMapping = loadUserMappingFromEnv();
  const fileMapping = await loadUserMappingFromFile();

  // 合并配置，环境变量优先级更高
  return {
    ...DEFAULT_USER_MAPPING,
    ...fileMapping,
    ...envMapping,
  };
}

/**
 * 从环境变量加载 OpenIM userID 映射
 * 环境变量格式：GITLAB_OPENIM_MAPPING='{"gitlab_user1":"openim_id_1","gitlab_user2":["openim_id_2"]}'
 * 值支持 string 或 string[]
 */
function loadOpenimMappingFromEnv(): OpenimUserMappingConfig {
  const mappingStr = process.env.GITLAB_OPENIM_MAPPING;
  if (!mappingStr) {
    return {};
  }
  try {
    return JSON.parse(mappingStr) as OpenimUserMappingConfig;
  } catch (error) {
    configLogger.warn("Failed to parse GITLAB_OPENIM_MAPPING:", error);
    return {};
  }
}

/**
 * 将 OpenIM 映射配置规范为 Record<string, string[]>
 */
function normalizeOpenimMapping(raw: OpenimUserMappingConfig): Record<string, string[]> {
  const result: Record<string, string[]> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (Array.isArray(value)) {
      result[key] = value.filter((v): v is string => typeof v === "string");
    } else if (typeof value === "string") {
      result[key] = [value];
    }
  }
  return result;
}

/**
 * 加载 OpenIM userID 映射配置（当前仅支持环境变量）
 * 用于后续消息中 @ 用户
 */
export async function loadOpenimMappingConfig(): Promise<Record<string, string[]>> {
  const raw = loadOpenimMappingFromEnv();
  return normalizeOpenimMapping(raw);
}

/**
 * 用户映射服务（钉钉 + OpenIM）
 */
export class UserMappingService {
  private mapping: UserMappingConfig;
  private openimMapping: Record<string, string[]>;

  constructor(mapping: UserMappingConfig, openimMapping?: Record<string, string[]>) {
    this.mapping = mapping;
    this.openimMapping = openimMapping ?? {};
  }

  /**
   * 根据 GitLab 用户名获取对应的钉钉手机号列表
   * @param gitlabUsername GitLab 用户名
   * @returns 钉钉手机号数组，如果未找到则返回空数组
   */
  getDingTalkMobiles(gitlabUsername: string): string[] {
    return this.mapping[gitlabUsername] || [];
  }

  /**
   * 批量获取多个 GitLab 用户对应的钉钉手机号列表（去重）
   * @param gitlabUsernames GitLab 用户名数组
   * @returns 去重后的钉钉手机号数组
   */
  getDingTalkMobilesBatch(gitlabUsernames: string[]): string[] {
    const mobiles = new Set<string>();

    for (const username of gitlabUsernames) {
      const userMobiles = this.getDingTalkMobiles(username);
      for (const mobile of userMobiles) {
        mobiles.add(mobile);
      }
    }

    return Array.from(mobiles);
  }

  /**
   * 根据 GitLab 用户名获取对应的 OpenIM userID 列表
   * 用于后续消息中 @ 用户（atUserList）
   */
  getOpenimUserIds(gitlabUsername: string): string[] {
    return this.openimMapping[gitlabUsername] ?? [];
  }

  /**
   * 批量获取多个 GitLab 用户对应的 OpenIM userID 列表（去重）
   */
  getOpenimUserIdsBatch(gitlabUsernames: string[]): string[] {
    const ids = new Set<string>();
    for (const username of gitlabUsernames) {
      for (const id of this.getOpenimUserIds(username)) {
        ids.add(id);
      }
    }
    return Array.from(ids);
  }

  /**
   * 获取所有映射关系
   */
  getAllMappings(): UserMappingConfig {
    return { ...this.mapping };
  }
}
