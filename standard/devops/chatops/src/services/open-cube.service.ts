import { Injectable, Inject, CONFIG_SERVICE_TOKEN, LOGGER_TOKEN, ConfigService, type Logger } from "@dangao/bun-server";

/**
 * 推送给三方的 Webhook 载荷（见 open-cube.webhook.md）
 */
export interface ThirdPartyWebhookPayload {
  event: string;
  timestamp: string;
  groupID: string;
  botUserID: string;
  cleanedContent: string;
  sendID: string;
  senderNickname?: string;
  rawContent?: string;
}

/**
 * OpenIM 引用消息（quoteMessage）
 */
export interface OpenIMQuoteMessage {
  clientMsgID?: string;
  serverMsgID?: string;
  createTime?: number;
  sendTime?: number;
  sessionType?: number;
  sendID?: string;
  msgFrom?: number;
  contentType?: number;
  senderPlatformID?: number;
  senderNickname?: string;
  groupID?: string;
  seq?: number;
  isRead?: boolean;
  status?: number;
  atTextElem?: {
    text?: string;
    atUserList?: string[];
    atUsersInfo?: { atUserID?: string; groupNickname?: string }[];
    isAtSelf?: boolean;
  };
  attachedInfoElem?: Record<string, unknown>;
  [key: string]: unknown;
}

/**
 * OpenIM 群消息回调 Body（callbackAfterSendGroupMsgCommand）
 * 实际接收到的数据已经是预处理后的格式，与 ThirdPartyWebhookPayload 一致
 */
export interface OpenIMCallbackAfterSendGroupMsgBody {
  event?: string;
  timestamp?: string;
  groupID?: string;
  botUserID?: string;
  cleanedContent?: string;
  sendID?: string;
  senderNickname?: string;
  rawContent?: string;
  [key: string]: unknown;
}

/**
 * OpenIM content 可能为 JSON，包含 text、atUserList、atUsersInfo
 */
interface OpenIMContentJson {
  text?: string;
  atUserList?: string[];
  atUsersInfo?: { atUserID?: string; groupNickname?: string }[];
}

/**
 * OpenIM @ 消息 content 对象（contentType=106）
 */
export interface OpenIMAtMessageContent {
  text: string;
  atUserList: string[];
  isAtSelf: boolean;
}

/**
 * OpenAPI 发送消息请求体（见 open-cube.webhook.md 三、3.2）
 */
export interface OpenApiSendMsgBody {
  sendID: string;
  groupID: string;
  /**
   * 消息内容：
   * - contentType=101（文本消息）: 字符串
   * - contentType=106（@ 消息）: OpenIMAtMessageContent 对象
   * - 其他类型: 相应的对象格式
   */
  content: string | OpenIMAtMessageContent | Record<string, unknown>;
  contentType?: number;
  sessionType?: number;
  senderNickname?: string;
  senderFaceURL?: string;
}

/**
 * OpenAPI 发送消息成功响应
 */
export interface OpenApiSendMsgResponse {
  errCode: number;
  errMsg: string;
  data?: {
    serverMsgID: string;
    clientMsgID: string;
    sendTime: number;
  };
}

/**
 * Open-Cube 渠道服务：接收 OpenIM 回调并转发到三方 Webhook；发送消息时转发到 Webhook Server 的 OpenAPI（不直接对接 OpenIM）
 */
@Injectable()
export class OpenCubeService {
  private readonly webhookForwardUrl?: string;
  private readonly openapiApiKey?: string;
  private readonly webhookGroupIds: Set<string>;
  private readonly webhookBotUserIds: Set<string>;
  private readonly openapiSendUrl?: string;
  private readonly openapiForwardApiKey?: string;

  constructor(
    @Inject(CONFIG_SERVICE_TOKEN) private readonly configService: ConfigService,
    @Inject(LOGGER_TOKEN) private readonly logger: Logger,
  ) {
    const config = this.configService.get<{ openim?: AppConfigOpenim }>("app");
    const openim = config?.openim ?? {};
    this.webhookForwardUrl = openim.webhookForwardUrl;
    this.openapiApiKey = openim.openapiApiKey;
    this.webhookGroupIds = new Set(openim.webhookGroupIds ?? []);
    this.webhookBotUserIds = new Set(openim.webhookBotUserIds ?? []);
    this.openapiSendUrl = openim.openapiSendUrl;
    this.openapiForwardApiKey = openim.openapiForwardApiKey;
  }

  /**
   * 是否已配置三方 Webhook 转发（收到 @ 机器人时是否 POST 到三方）
   */
  isWebhookForwardEnabled(): boolean {
    return Boolean(this.webhookForwardUrl && this.webhookGroupIds.size > 0 && this.webhookBotUserIds.size > 0);
  }

  /**
   * 是否已配置 OpenAPI 发送消息（/openapi/msg/send 是否可用）
   * 需同时配置本服务鉴权 Key 与 Webhook Server 的发送消息 URL
   */
  isOpenApiSendEnabled(): boolean {
    return Boolean(this.openapiApiKey && this.openapiSendUrl);
  }

  /**
   * 校验 OpenAPI Key（X-API-Key 或 Authorization: Bearer &lt;key&gt;）
   */
  verifyOpenApiKey(apiKeyFromHeader: string | null, bearerFromHeader: string | null): boolean {
    if (!this.openapiApiKey) {
      return false;
    }
    if (apiKeyFromHeader && apiKeyFromHeader === this.openapiApiKey) {
      return true;
    }
    if (bearerFromHeader && bearerFromHeader === this.openapiApiKey) {
      return true;
    }
    return false;
  }

  /**
   * 判断该群 + 被 @ 用户是否命中配置：群在 webhookGroupIds 且 atUserList 包含任一 webhookBotUserIds
   * 返回命中的机器人 userID，未命中返回 null
   */
  matchGroupAndBot(groupID: string, atUserList: string[]): string | null {
    if (!this.webhookGroupIds.has(groupID) || !atUserList?.length) {
      return null;
    }
    const atSet = new Set(atUserList);
    for (const botId of this.webhookBotUserIds) {
      if (atSet.has(botId)) {
        return botId;
      }
    }
    return null;
  }

  /**
   * 从 OpenIM 回调的 content 中解析出原始文本并清洗（去掉 @ 提及并 trim）
   */
  parseAndCleanContent(rawContent: string): string {
    let text = rawContent;
    try {
      const parsed = JSON.parse(rawContent) as OpenIMContentJson;
      if (typeof parsed.text === "string") {
        ({ text } = parsed);
        const { atUsersInfo } = parsed;
        if (Array.isArray(atUsersInfo)) {
          for (const info of atUsersInfo) {
            const nickname = info.groupNickname;
            if (nickname) {
              const atMention = `@${nickname}`;
              text = text.replace(atMention, "").trim();
            }
          }
        }
      }
    } catch {
      // 非 JSON，当作纯文本
    }
    // 兜底：去掉 @xxx 形式并 trim
    text = text.replace(/@\s*[\S]+/g, "").trim();
    return text;
  }

  /**
   * 构建推送给三方的 Webhook 载荷
   */
  buildThirdPartyPayload(params: {
    groupID: string;
    botUserID: string;
    cleanedContent: string;
    sendID: string;
    senderNickname?: string;
    rawContent?: string;
  }): ThirdPartyWebhookPayload {
    return {
      event: "bot_at",
      timestamp: new Date().toISOString(),
      groupID: params.groupID,
      botUserID: params.botUserID,
      cleanedContent: params.cleanedContent,
      sendID: params.sendID,
      senderNickname: params.senderNickname,
      rawContent: params.rawContent,
    };
  }

  /**
   * 将 ThirdPartyWebhookPayload POST 到三方配置的 Webhook URL
   */
  async forwardToThirdParty(payload: ThirdPartyWebhookPayload): Promise<void> {
    if (!this.webhookForwardUrl) {
      this.logger.warn("OpenIM webhook forward URL is not configured, skipping forward");
      return;
    }
    try {
      const res = await fetch(this.webhookForwardUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        this.logger.error(`OpenIM webhook forward failed: ${res.status} ${res.statusText}, url=${this.webhookForwardUrl}`);
        return;
      }
      this.logger.info(`OpenIM webhook forwarded to third party, groupID=${payload.groupID}, sendID=${payload.sendID}`);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.error(`OpenIM webhook forward error: ${msg}`);
      throw error;
    }
  }

  /**
   * 将发送消息请求转发到 Webhook Server 的 OpenAPI（不直接对接 OpenIM）
   */
  async forwardSendMessageToWebhookServer(body: OpenApiSendMsgBody): Promise<OpenApiSendMsgResponse> {
    if (!this.openapiSendUrl) {
      return { errCode: 500, errMsg: "OpenAPI send URL is not configured" };
    }
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (this.openapiForwardApiKey) {
      headers["X-API-Key"] = this.openapiForwardApiKey;
    }
    try {
      const res = await fetch(this.openapiSendUrl, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as { errCode?: number; errMsg?: string; data?: Record<string, unknown> };
      if (!res.ok) {
        return {
          errCode: data.errCode ?? res.status,
          errMsg: data.errMsg ?? res.statusText ?? "Request failed",
        };
      }
      const d = data.data as { serverMsgID?: string; clientMsgID?: string; sendTime?: number } | undefined;
      return {
        errCode: data.errCode ?? 0,
        errMsg: data.errMsg ?? "",
        data: d
          ? {
              serverMsgID: d.serverMsgID ?? "",
              clientMsgID: d.clientMsgID ?? "",
              sendTime: d.sendTime ?? 0,
            }
          : undefined,
      };
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.error(`OpenAPI forward send message error: ${msg}`);
      return { errCode: 500, errMsg: msg };
    }
  }
}

/** 配置中的 openim 片段类型 */
interface AppConfigOpenim {
  webhookForwardUrl?: string;
  openapiApiKey?: string;
  webhookGroupIds?: string[];
  webhookBotUserIds?: string[];
  openapiSendUrl?: string;
  openapiForwardApiKey?: string;
}
