import { GitLabClient } from "../clients/gitlab-client";
import { Injectable, Inject, CONFIG_SERVICE_TOKEN, LOGGER_TOKEN, ConfigService, type Logger } from "@dangao/bun-server";

/**
 * CI 配置缓存
 */
interface CIConfigCache {
  skipNotificationStages: string[];
  lastUpdated: number;
}

/**
 * CI 配置服务
 * 用于读取和解析项目的 .gitlab-ci.yaml 配置
 */
@Injectable()
export class CIConfigService {
  private readonly cache = new Map<string, CIConfigCache>();
  private readonly cacheTTL = 5 * 60 * 1000; // 5 分钟缓存

  constructor(
    private readonly gitlabClient: GitLabClient,
    @Inject(CONFIG_SERVICE_TOKEN) private readonly configService: ConfigService,
    @Inject(LOGGER_TOKEN) private readonly logger: Logger,
  ) {}

  /**
   * 从 YAML 内容中提取跳过的 stage 列表
   * 支持两种配置方式：
   * 1. 在 variables 中定义 SKIP_NOTIFICATION_STAGES: ["stage1", "stage2"]
   * 2. 在注释中标记，如 # skip-notification: approval-check
   */
  private parseSkipNotificationStages(yamlContent: string): string[] {
    const stages: string[] = [];

    try {
      // 方法1: 查找 variables 中的 SKIP_NOTIFICATION_STAGES
      const variablesMatch = yamlContent.match(/variables:\s*\n([\s\S]*?)(?=\n\w+:|$)/);
      if (variablesMatch) {
        const variablesContent = variablesMatch[1] as string;
        const skipStagesMatch = variablesContent.match(/SKIP_NOTIFICATION_STAGES:\s*\[(.*?)\]/);
        if (skipStagesMatch) {
          const stagesStr = skipStagesMatch[1] as string;
          const stageList = stagesStr
            .split(",")
            .map((s) => s.trim().replace(/['"]/g, ""))
            .filter(Boolean);
          stages.push(...stageList);
        }
      }

      // 方法2: 查找注释中的 skip-notification 标记
      const commentRegex = /#\s*skip-notification:\s*([^\n]+)/gi;
      let commentMatch;
      while ((commentMatch = commentRegex.exec(yamlContent)) !== null) {
        const stageNames = (commentMatch[1] as string)
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        stages.push(...stageNames);
      }

      // 去重
      return Array.from(new Set(stages));
    } catch (error: unknown) {
      this.logger.warn(`Failed to parse YAML content: ${error}`);
      return [];
    }
  }

  /**
   * 获取项目配置的跳过通知的 stage 列表
   * @param projectId 项目 ID
   * @param ref 分支或 tag（可选，默认为默认分支）
   * @returns 跳过的 stage 列表
   */
  async getSkipNotificationStages(projectId: string | number, ref?: string): Promise<string[]> {
    const cacheKey = `${projectId}:${ref || "default"}`;
    const cached = this.cache.get(cacheKey);

    // 检查缓存是否有效
    if (cached && Date.now() - cached.lastUpdated < this.cacheTTL) {
      this.logger.debug(`Using cached skip notification stages for project ${projectId}: ${cached.skipNotificationStages.join(", ")}`);
      return cached.skipNotificationStages;
    }

    try {
      // 获取 .gitlab-ci.yaml 文件内容
      const yamlContent = await this.gitlabClient.getRepositoryFile(projectId, ".gitlab-ci.yaml", ref);
      const stages = this.parseSkipNotificationStages(yamlContent);

      // 更新缓存
      this.cache.set(cacheKey, {
        skipNotificationStages: stages,
        lastUpdated: Date.now(),
      });

      if (stages.length > 0) {
        this.logger.info(`Found skip notification stages for project ${projectId}: ${stages.join(", ")}`);
      }

      return stages;
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      // 如果文件不存在或无法访问，记录警告但不抛出错误
      this.logger.warn(`Failed to get .gitlab-ci.yaml for project ${projectId}: ${errorMsg}`);
      // 返回空数组，表示没有配置跳过的 stage
      return [];
    }
  }

  /**
   * 清除指定项目的缓存
   * @param projectId 项目 ID
   */
  clearCache(projectId?: string | number): void {
    if (projectId) {
      // 清除指定项目的所有缓存（包括不同 ref）
      const keysToDelete: string[] = [];
      for (const key of this.cache.keys()) {
        if (key.startsWith(`${projectId}:`)) {
          keysToDelete.push(key);
        }
      }
      for (const key of keysToDelete) {
        this.cache.delete(key);
      }
      this.logger.debug(`Cleared cache for project ${projectId}`);
    } else {
      // 清除所有缓存
      this.cache.clear();
      this.logger.debug("Cleared all CI config cache");
    }
  }
}
