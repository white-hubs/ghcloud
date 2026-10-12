import { Injectable, Inject, CONFIG_SERVICE_TOKEN, LOGGER_TOKEN, ConfigService, type Logger } from "@dangao/bun-server";
import { appendFile, mkdir, stat } from "fs/promises";
import { dirname, join } from "path";

/**
 * 事件记录数据接口
 */
export interface EventLogData {
  /**
   * 事件类型
   */
  eventType: string;
  /**
   * 事件概要
   */
  summary: string;
  /**
   * 仓库信息
   */
  repository?: {
    id?: number;
    name?: string;
    path_with_namespace?: string;
  };
  /**
   * 发起者信息
   */
  initiator?: {
    id?: number;
    username?: string;
    name?: string;
  };
  /**
   * 时间戳（ISO 8601 格式）
   */
  timestamp: string;
  /**
   * 原始事件数据（可选，用于调试）
   */
  rawEvent?: any;
}

/**
 * 事件记录服务
 */
@Injectable()
export class EventLogService {
  private readonly configuredPath?: string;
  private resolvedFilePath?: string;

  constructor(
    @Inject(CONFIG_SERVICE_TOKEN) private readonly configService: ConfigService,
    @Inject(LOGGER_TOKEN) private readonly logger: Logger,
  ) {
    const config = this.configService.get<any>("app");
    this.configuredPath = config.eventLogFilePath;
  }

  /**
   * 解析实际的文件路径
   * 如果配置的是目录，则自动生成文件名 events.jsonl
   */
  private async resolveLogFilePath(): Promise<string | undefined> {
    if (!this.configuredPath) {
      return undefined;
    }

    // 如果已经解析过，直接返回缓存的结果
    if (this.resolvedFilePath !== undefined) {
      return this.resolvedFilePath;
    }

    try {
      const stats = await stat(this.configuredPath);
      if (stats.isDirectory()) {
        // 如果是目录，使用默认文件名 events.jsonl
        this.resolvedFilePath = join(this.configuredPath, "events.jsonl");
        this.logger.debug(`Event log path is a directory, using file: ${this.resolvedFilePath}`);
      } else {
        // 如果是文件，直接使用
        this.resolvedFilePath = this.configuredPath;
      }
    } catch (error: any) {
      // 如果路径不存在，假设是文件路径
      if (error.code === "ENOENT") {
        this.resolvedFilePath = this.configuredPath;
      } else {
        // 其他错误，记录并返回 undefined
        this.logger.warn(`Failed to resolve log file path: ${error.message || String(error)}`);
        this.resolvedFilePath = undefined;
      }
    }

    return this.resolvedFilePath;
  }

  /**
   * 记录事件
   */
  async logEvent(eventData: EventLogData): Promise<void> {
    const actualFilePath = await this.resolveLogFilePath();
    if (!actualFilePath) {
      // 如果没有配置日志文件路径，跳过记录
      this.logger.debug("Event log file path not configured, skipping event log");
      return;
    }

    try {
      // 确保目录存在
      const logDir = dirname(actualFilePath);
      await mkdir(logDir, { recursive: true });

      // 构建日志行（JSON 格式，每行一个事件）
      const logLine = `${JSON.stringify(eventData)}\n`;

      // 追加写入文件
      await appendFile(actualFilePath, logLine);
    } catch (error: any) {
      // 记录错误但不抛出，避免影响主流程
      this.logger.error(`Failed to log event: ${error.message || String(error)}`);
    }
  }

  /**
   * 从 GitLab Webhook 事件提取事件记录数据
   */
  extractEventLogData(event: unknown, eventType: string, summary: string): EventLogData {
    const eventObj = event as Record<string, unknown>;
    const project = eventObj.project as { id?: number; name?: string; path_with_namespace?: string } | undefined;
    const repository = project
      ? {
          id: project.id,
          name: project.name,
          path_with_namespace: project.path_with_namespace,
        }
      : undefined;

    // 尝试从不同位置获取发起者信息
    let initiator: EventLogData["initiator"] | undefined;
    const user = eventObj.user as { id?: number; username?: string; name?: string } | undefined;
    const mergeRequest = eventObj.merge_request as { author?: { id?: number; username?: string; name?: string } } | undefined;
    const objectAttributes = eventObj.object_attributes as { author?: { id?: number; username?: string; name?: string } } | undefined;

    if (user) {
      initiator = {
        id: user.id,
        username: user.username,
        name: user.name,
      };
    } else if (mergeRequest?.author) {
      initiator = {
        id: mergeRequest.author.id,
        username: mergeRequest.author.username,
        name: mergeRequest.author.name,
      };
    } else if (objectAttributes?.author) {
      initiator = {
        id: objectAttributes.author.id,
        username: objectAttributes.author.username,
        name: objectAttributes.author.name,
      };
    }

    return {
      eventType,
      summary,
      repository,
      initiator,
      timestamp: new Date().toISOString(),
      // 不记录原始事件数据，避免日志文件过大
      // rawEvent: event,
    };
  }
}
