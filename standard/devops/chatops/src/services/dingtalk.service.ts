import { UserMappingService } from "../config/user-mapping.config";
import { Injectable, Inject, CONFIG_SERVICE_TOKEN, LOGGER_TOKEN, ConfigService, type Logger } from "@dangao/bun-server";
import crypto from "crypto";

/**
 * 钉钉消息中的 @ 用户配置
 */
interface DingTalkAtConfig {
  atMobiles?: string[];
  atUserIds?: string[];
  isAtAll?: boolean;
}

/**
 * 钉钉机器人服务
 */
@Injectable()
export class DingTalkService {
  private readonly webhookUrl?: string;
  private readonly secret?: string;
  private readonly userMappingService?: UserMappingService;
  private readonly botUsernames?: string[];

  constructor(
    @Inject(CONFIG_SERVICE_TOKEN) private readonly configService: ConfigService,
    @Inject(LOGGER_TOKEN) private readonly logger: Logger,
  ) {
    const config = this.configService.get<any>("app");
    this.webhookUrl = config.dingtalkWebhookUrl;
    this.secret = config.dingtalkSecret;
    // 从配置中获取 UserMappingService（在 main.ts 中注入）
    this.userMappingService = config.userMappingService;
    // 从配置中获取机器人账号列表
    this.botUsernames = config.botUsernames || [];
  }

  /**
   * 生成签名（如果配置了 secret）
   */
  private generateSign(timestamp: number): string {
    if (!this.secret) {
      return "";
    }

    const stringToSign = `${timestamp}\n${this.secret}`;
    const hmac = crypto.createHmac("sha256", this.secret);
    hmac.update(stringToSign);
    const sign = encodeURIComponent(hmac.digest("base64"));
    return sign;
  }

  /**
   * 发送文本消息
   */
  async sendTextMessage(content: string, atConfig?: DingTalkAtConfig): Promise<void> {
    if (!this.webhookUrl) {
      this.logger.warn("DingTalk webhook URL is not configured, skipping message");
      return;
    }

    const timestamp = Date.now();
    const sign = this.generateSign(timestamp);
    const url = sign ? `${this.webhookUrl}&timestamp=${timestamp}&sign=${sign}` : this.webhookUrl;

    const messageBody: any = {
      msgtype: "text",
      text: {
        content,
      },
    };

    // 添加 @ 配置
    if (atConfig && (atConfig.atMobiles?.length || atConfig.atUserIds?.length || atConfig.isAtAll)) {
      messageBody.at = {
        atMobiles: atConfig.atMobiles || [],
        atUserIds: atConfig.atUserIds || [],
        isAtAll: atConfig.isAtAll || false,
      };
    }

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(messageBody),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to send DingTalk message: ${error}`);
    }

    const result = (await response.json()) as { errcode?: number; errmsg?: string };
    if (result.errcode !== 0) {
      throw new Error(`DingTalk API error: ${result.errmsg || "Unknown error"}`);
    }
  }

  /**
   * 发送 Markdown 消息
   */
  async sendMarkdownMessage(title: string, text: string, atConfig?: DingTalkAtConfig): Promise<void> {
    if (!this.webhookUrl) {
      this.logger.warn("DingTalk webhook URL is not configured, skipping message");
      return;
    }

    const timestamp = Date.now();
    const sign = this.generateSign(timestamp);
    const url = sign ? `${this.webhookUrl}&timestamp=${timestamp}&sign=${sign}` : this.webhookUrl;

    const messageBody: any = {
      msgtype: "markdown",
      markdown: {
        title,
        text,
      },
    };

    // 添加 @ 配置
    if (atConfig && (atConfig.atMobiles?.length || atConfig.atUserIds?.length || atConfig.isAtAll)) {
      messageBody.at = {
        atMobiles: atConfig.atMobiles || [],
        atUserIds: atConfig.atUserIds || [],
        isAtAll: atConfig.isAtAll || false,
      };
    }

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(messageBody),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to send DingTalk message: ${error}`);
    }

    const result = (await response.json()) as { errcode?: number; errmsg?: string };
    if (result.errcode !== 0) {
      throw new Error(`DingTalk API error: ${result.errmsg || "Unknown error"}`);
    }
  }

  /**
   * 发送审核通知
   * @param mrTitle MR 标题
   * @param mrUrl MR URL
   * @param projectName 项目名称
   * @param reviewers GitLab 用户名数组
   * @param authorUsername 发起人用户名（可选）
   * @param isFirstCreate 是否是首次创建
   * @param changes MR 变更信息（可选，仅在首次创建时使用）
   * @param description MR 描述（可选，仅在首次创建时使用）
   */
  async sendReviewNotification(
    mrTitle: string,
    mrUrl: string,
    projectName: string,
    reviewers: string[],
    authorUsername?: string,
    isFirstCreate: boolean = false,
    changes?: any,
    description?: string,
  ): Promise<void> {
    // 获取审核者对应的钉钉手机号
    let atMobiles: string[] = [];
    if (this.userMappingService && reviewers.length > 0) {
      atMobiles = this.userMappingService.getDingTalkMobilesBatch(reviewers);
      this.logger.info(`Mapped reviewers ${reviewers.join(", ")} to mobiles: ${atMobiles.join(", ")}`);
    }

    const reviewerList = reviewers.length > 0 ? reviewers.join("、") : "相关人员";

    // 在 Markdown 文本中添加 @ 手机号（钉钉支持在 Markdown 中使用 @手机号）
    let atMobilesText = "";
    if (atMobiles.length > 0) {
      atMobilesText = `\n\n${atMobiles.map((mobile) => `@${mobile}`).join(" ")}`;
    }

    // 构建发起人信息
    const authorText = authorUsername ? `\n\n**发起人**: ${authorUsername}` : "";

    // 构建标题（标识是创建还是变更）
    const titlePrefix = isFirstCreate ? "【创建】" : "【变更】";
    const notificationTitle = `【CI】${titlePrefix}代码审核通知`;

    let markdown = `## 🔔 ${notificationTitle}

**项目**: ${projectName}

**合并请求**: [${mrTitle}](${mrUrl})${authorText}

**审核者**: ${reviewerList}`;

    // 首次创建时，添加完整摘要信息
    if (isFirstCreate) {
      // 添加描述信息
      if (description) {
        markdown += `\n\n**描述**: ${description}`;
      }

      // 添加变更文件清单
      if (changes?.changes && Array.isArray(changes.changes)) {
        const fileChanges = changes.changes;
        const maxFiles = 5;
        const displayedFiles = fileChanges.slice(0, maxFiles);
        const remainingCount = fileChanges.length - maxFiles;

        if (displayedFiles.length > 0) {
          markdown += `\n\n**变更文件** (共 ${fileChanges.length} 个):\n`;
          for (const file of displayedFiles) {
            const filePath = file.new_path || file.old_path || "未知文件";
            const status = file.new_file ? "新增" : file.deleted_file ? "删除" : "修改";
            markdown += `- ${status}: \`${filePath}\`\n`;
          }
          if (remainingCount > 0) {
            markdown += `- ... 还有 ${remainingCount} 个文件`;
          }
        }
      }
    } else {
      // 后续更新时，仅提供概要描述
      markdown += `\n\n**变更内容**: 合并请求已更新，请查看最新变更。`;
    }

    markdown += `\n\n请及时进行代码审核。${atMobilesText}`;

    // 发送消息，并在 at 字段中指定手机号
    await this.sendMarkdownMessage(notificationTitle, markdown, {
      atMobiles: atMobiles.length > 0 ? atMobiles : undefined,
      isAtAll: false,
    });
  }

  /**
   * 发送 Pipeline 成功通知给发起人
   * @param mrTitle MR 标题
   * @param mrUrl MR URL
   * @param projectName 项目名称
   * @param authorUsername 发起人用户名
   */
  async sendPipelineSuccessNotification(mrTitle: string, mrUrl: string, projectName: string, authorUsername: string): Promise<void> {
    // 获取发起人对应的钉钉手机号
    let atMobiles: string[] = [];
    if (this.userMappingService) {
      atMobiles = this.userMappingService.getDingTalkMobilesBatch([authorUsername]);
      this.logger.info(`Mapped author ${authorUsername} to mobiles: ${atMobiles.join(", ")}`);
    }

    // 在 Markdown 文本中添加 @ 手机号
    let atMobilesText = "";
    if (atMobiles.length > 0) {
      atMobilesText = `\n\n${atMobiles.map((mobile) => `@${mobile}`).join(" ")}`;
    }

    // 构建命令示例：如果有配置的机器人账号，使用第一个；否则使用默认格式
    let commandExample = "`/submit` 或 `>submit`";
    if (this.botUsernames && this.botUsernames.length > 0) {
      const firstBotUsername = this.botUsernames[0];
      commandExample = `\`@${firstBotUsername} submit\``;
    }

    const markdown = `## ✅ 【CI】CI 检查通过

**项目**: ${projectName}

**合并请求**: [${mrTitle}](${mrUrl})

**状态**: CI Pipeline 已全部通过

您可以使用 ${commandExample} 命令提交合并。${atMobilesText}`;

    // 发送消息，并在 at 字段中指定手机号
    await this.sendMarkdownMessage("【CI】Pipeline 通过通知", markdown, {
      atMobiles: atMobiles.length > 0 ? atMobiles : undefined,
      isAtAll: false,
    });
  }

  /**
   * 发送 Pipeline 失败通知给发起人
   * @param mrTitle MR 标题
   * @param mrUrl MR URL
   * @param projectName 项目名称
   * @param authorUsername 发起人用户名
   */
  async sendPipelineFailureNotification(mrTitle: string, mrUrl: string, projectName: string, authorUsername: string): Promise<void> {
    // 获取发起人对应的钉钉手机号
    let atMobiles: string[] = [];
    if (this.userMappingService) {
      atMobiles = this.userMappingService.getDingTalkMobilesBatch([authorUsername]);
      this.logger.info(`Mapped author ${authorUsername} to mobiles: ${atMobiles.join(", ")}`);
    }

    // 在 Markdown 文本中添加 @ 手机号
    let atMobilesText = "";
    if (atMobiles.length > 0) {
      atMobilesText = `\n\n${atMobiles.map((mobile) => `@${mobile}`).join(" ")}`;
    }

    const markdown = `## ❌ 【CI】CI 检查失败

**项目**: ${projectName}

**合并请求**: [${mrTitle}](${mrUrl})

**状态**: CI Pipeline 执行失败

请检查 CI 日志并修复问题后重新提交。${atMobilesText}`;

    // 发送消息，并在 at 字段中指定手机号
    await this.sendMarkdownMessage("【CI】Pipeline 失败通知", markdown, {
      atMobiles: atMobiles.length > 0 ? atMobiles : undefined,
      isAtAll: false,
    });
  }

  /**
   * 发送抄送通知
   * @param mrTitle MR 标题
   * @param mrUrl MR URL
   * @param projectName 项目名称
   * @param ccUsers GitLab 用户名数组
   * @param authorUsername 发起人用户名（可选）
   * @param extraMessage 额外消息（可选）
   */
  async sendCCNotification(
    mrTitle: string,
    mrUrl: string,
    projectName: string,
    ccUsers: string[],
    authorUsername?: string,
    extraMessage?: string,
  ): Promise<void> {
    // 获取抄送用户对应的钉钉手机号
    let atMobiles: string[] = [];
    if (this.userMappingService && ccUsers.length > 0) {
      atMobiles = this.userMappingService.getDingTalkMobilesBatch(ccUsers);
      this.logger.info(`Mapped CC users ${ccUsers.join(", ")} to mobiles: ${atMobiles.join(", ")}`);
    }

    const ccUserList = ccUsers.length > 0 ? ccUsers.join("、") : "相关人员";

    // 在 Markdown 文本中添加 @ 手机号（钉钉支持在 Markdown 中使用 @手机号）
    let atMobilesText = "";
    if (atMobiles.length > 0) {
      atMobilesText = `\n\n${atMobiles.map((mobile) => `@${mobile}`).join(" ")}`;
    }

    // 构建发起人信息
    const authorText = authorUsername ? `\n\n**发起人**: ${authorUsername}` : "";

    // 构建额外消息
    const extraMessageText = extraMessage ? `\n\n**消息**: ${extraMessage}` : "";

    const markdown = `## 📢 【CI】抄送通知

**项目**: ${projectName}

**合并请求**: [${mrTitle}](${mrUrl})${authorText}

**抄送**: ${ccUserList}${extraMessageText}

请知悉。${atMobilesText}`;

    // 发送消息，并在 at 字段中指定手机号（确保正确 @ 钉钉用户）
    const atConfig: DingTalkAtConfig = {
      atMobiles: atMobiles.length > 0 ? atMobiles : undefined,
      isAtAll: false,
    };

    this.logger.debug(`Sending CC notification with atMobiles: ${atMobiles.join(", ") || "none"}`);

    await this.sendMarkdownMessage("【CI】抄送通知", markdown, atConfig);
  }
}
