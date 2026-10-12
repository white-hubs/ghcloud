import { GitLabClient } from "../clients/gitlab-client";
import { ChatOpsService } from "../services/chatops.service";
import { CommentCommandService } from "../services/comment-command.service";
import { OpenCubeService, type OpenIMCallbackAfterSendGroupMsgBody, type OpenIMQuoteMessage } from "../services/open-cube.service";
import { Body, Controller, POST, Inject, LOGGER_TOKEN, CONFIG_SERVICE_TOKEN, ConfigService, type Logger } from "@dangao/bun-server";

/**
 * OpenIM 群消息发送后回调的预期响应格式
 */
const OPENIM_CALLBACK_SUCCESS = {
  actionCode: 0,
  errCode: 0,
  errMsg: "",
  errDlt: "",
  nextCode: "",
};

/**
 * OpenIM 回调控制器
 * 接收 OpenIM callbackAfterSendGroupMsgCommand（实际为预处理后的数据），转发到三方 Webhook
 * 支持处理引用消息中的 GitLab MR 命令
 */
@Controller()
export class OpenImCallbackController {
  private readonly openimSendId: string;

  constructor(
    private readonly openCubeService: OpenCubeService,
    private readonly chatOpsService: ChatOpsService,
    private readonly commentCommandService: CommentCommandService,
    private readonly gitlabClient: GitLabClient,
    @Inject(CONFIG_SERVICE_TOKEN) private readonly configService: ConfigService,
    @Inject(LOGGER_TOKEN) private readonly logger: Logger,
  ) {
    const config = this.configService.get<any>("app");
    this.openimSendId = config.openim?.sendId ?? "chatops-bot";
  }

  /**
   * 解析 GitLab MR URL，提取项目路径和 MR IID
   * @param url GitLab MR URL，如: http://git.guhecloud.com:8000/ghcloud/ghcloud-test/-/merge_requests/14
   * @returns { projectPath: string, mrIid: number } 或 null
   */
  private parseGitLabMRUrl(url: string): { projectPath: string; mrIid: number } | null {
    try {
      // 匹配 GitLab MR URL 格式：{baseUrl}/{namespace}/{project}/-/merge_requests/{iid}
      const mrRegex = /\/([^/]+\/[^/]+)\/-\/merge_requests\/(\d+)/;
      const match = url.match(mrRegex);

      const PROJECT_PATH_INDEX = 1;
      const MR_IID_INDEX = 2;
      const RADIX_DECIMAL = 10;

      if (match && match[PROJECT_PATH_INDEX] && match[MR_IID_INDEX]) {
        return {
          projectPath: match[PROJECT_PATH_INDEX],
          mrIid: Number.parseInt(match[MR_IID_INDEX], RADIX_DECIMAL),
        };
      }
      return null;
    } catch (_ignoreError) {
      this.logger.debug(`Failed to parse GitLab MR URL: ${url}`);
      return null;
    }
  }

  /**
   * 从 rawContent 中提取引用消息
   * @param rawContent 原始消息内容（JSON 字符串）
   * @returns OpenIMQuoteMessage 或 null
   */
  private extractQuoteMessage(rawContent?: string): OpenIMQuoteMessage | null {
    if (!rawContent) {
      return null;
    }

    try {
      const parsed = JSON.parse(rawContent);
      return parsed.quoteMessage || null;
    } catch (error) {
      this.logger.debug(`Failed to parse rawContent as JSON: ${error}`);
      return null;
    }
  }

  /**
   * 从引用消息中提取 GitLab MR URL
   * @param quoteMessage 引用消息对象
   * @returns GitLab MR URL 或 null
   */
  private extractGitLabMRUrlFromQuote(quoteMessage: OpenIMQuoteMessage): string | null {
    // 从 atTextElem.text 中提取 URL
    const text = quoteMessage.atTextElem?.text;
    if (!text) {
      return null;
    }

    // 匹配 GitLab URL 格式
    const urlRegex = /(https?:\/\/[^\s]+\/-\/merge_requests\/\d+)/;
    const match = text.match(urlRegex);

    const URL_MATCH_INDEX = 1;
    return match?.[URL_MATCH_INDEX] || null;
  }

  /**
   * 发送响应消息到 OpenIM 群
   * @param groupID 群 ID
   * @param content 消息内容
   */
  private async sendResponseToGroup(groupID: string, content: string): Promise<void> {
    if (!this.openCubeService.isOpenApiSendEnabled()) {
      this.logger.debug("OpenIM API is not configured, cannot send response");
      return;
    }

    try {
      // OpenIM 消息类型常量
      const CONTENT_TYPE_TEXT = 101;
      const SESSION_TYPE_GROUP = 3;

      // 使用配置的 sendID
      const result = await this.openCubeService.forwardSendMessageToWebhookServer({
        sendID: this.openimSendId,
        groupID,
        content,
        contentType: CONTENT_TYPE_TEXT,
        sessionType: SESSION_TYPE_GROUP,
      });

      if (result.errCode === 0) {
        this.logger.info(`Response sent to OpenIM group ${groupID}`);
      } else {
        this.logger.error(`Failed to send response to OpenIM: ${result.errMsg}`);
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error sending response to OpenIM: ${msg}`);
    }
  }

  /**
   * OpenIM 群消息发送后回调
   * URL: {WEBHOOK_ADDRESS}/callbackAfterSendGroupMsgCommand?contenttype=json
   * 注意：实际接收到的数据已经是预处理后的格式，包含 event, timestamp, botUserID, cleanedContent 等字段
   */
  @POST("callbackAfterSendGroupMsgCommand")
  public async handleCallbackAfterSendGroupMsg(@Body() body: OpenIMCallbackAfterSendGroupMsgBody): Promise<typeof OPENIM_CALLBACK_SUCCESS> {
    // 提取已预处理的字段
    const {
      event = "",
      groupID = "",
      botUserID = "",
      cleanedContent = "",
      sendID = "",
      senderNickname,
      rawContent,
      timestamp = new Date().toISOString(),
    } = body;

    // 验证事件类型
    if (event !== "bot_at") {
      this.logger.debug(`OpenIM callback ignored: event=${event}`);
      return OPENIM_CALLBACK_SUCCESS;
    }

    // 验证必需字段
    if (!groupID || !botUserID || !cleanedContent) {
      this.logger.debug("OpenIM callback ignored: missing required fields (groupID, botUserID, or cleanedContent)");
      return OPENIM_CALLBACK_SUCCESS;
    }

    // 1. 尝试解析引用消息，如果是引用 GitLab MR 的消息，则处理命令
    const quoteMessage = this.extractQuoteMessage(rawContent);
    if (quoteMessage) {
      this.logger.info(`OpenIM callback contains quote message, attempting to process as GitLab MR command`);

      // 从引用消息中提取 GitLab MR URL
      const mrUrl = this.extractGitLabMRUrlFromQuote(quoteMessage);
      if (mrUrl) {
        this.logger.info(`Extracted GitLab MR URL from quote: ${mrUrl}`);

        // 解析 URL 获取项目路径和 MR IID
        const parsed = this.parseGitLabMRUrl(mrUrl);
        if (parsed) {
          const { projectPath, mrIid } = parsed;
          this.logger.info(`Parsed GitLab MR: project=${projectPath}, iid=${mrIid}`);

          // 清理命令文本：去除 @机器人ID 部分，保留命令
          // cleanedContent 格式可能是 "@7388116624 submit" 或 "submit"
          let commandText = cleanedContent.trim();

          // 如果以 @ 开头，去除 @userID 部分
          if (commandText.startsWith("@")) {
            // 匹配 @数字或字母 + 空格 + 命令
            commandText = commandText.replace(/^@[\w-]+\s+/, "");
          }

          // 将命令格式化为 /command 格式，方便 CommentCommandService 解析
          if (!commandText.startsWith("/") && !commandText.startsWith(">")) {
            commandText = `/${commandText}`;
          }

          this.logger.debug(`Formatted command text: ${commandText}`);

          // 解析命令
          const { command } = this.commentCommandService.parseCommand(commandText);
          if (command) {
            this.logger.info(`Processing command ${command} for MR !${mrIid} in project ${projectPath}`);

            try {
              // 使用项目路径（URL 编码）作为 projectId
              const projectId = encodeURIComponent(projectPath);

              // 调用 ChatOps 服务处理命令
              const result = await this.chatOpsService.handleCommentCommand(projectId, mrIid, commandText);

              if (result) {
                // 发送处理结果到 OpenIM 群
                await this.sendResponseToGroup(groupID, result);
                this.logger.info(`Command ${command} processed successfully, response sent to group ${groupID}`);
              } else {
                this.logger.debug(`Command ${command} returned no response`);
              }

              // 命令处理完成，直接返回（不再转发到三方 Webhook）
              return OPENIM_CALLBACK_SUCCESS;
            } catch (error: unknown) {
              const msg = error instanceof Error ? error.message : String(error);
              this.logger.error(`Failed to process command ${command}: ${msg}`);

              // 发送错误消息到群
              const errorMessage = `❌ 命令执行失败：${msg}`;
              await this.sendResponseToGroup(groupID, errorMessage);

              return OPENIM_CALLBACK_SUCCESS;
            }
          } else {
            this.logger.debug(`No valid command found in cleanedContent: ${cleanedContent}, formatted: ${commandText}`);
          }
        } else {
          this.logger.debug(`Failed to parse GitLab MR URL: ${mrUrl}`);
        }
      } else {
        this.logger.debug(`No GitLab MR URL found in quote message`);
      }
    }

    // 2. 如果不是引用 GitLab MR 的消息，或者没有有效命令，则转发到三方 Webhook（如果配置）
    if (!this.openCubeService.isWebhookForwardEnabled()) {
      this.logger.debug("OpenIM webhook forward not configured, skipping forward");
      return OPENIM_CALLBACK_SUCCESS;
    }

    // 构建转发载荷（数据已经是处理好的格式）
    const payload = {
      event: "bot_at",
      timestamp,
      groupID,
      botUserID,
      cleanedContent,
      sendID,
      senderNickname,
      rawContent,
    };

    try {
      await this.openCubeService.forwardToThirdParty(payload);
      this.logger.info(`OpenIM callback forwarded to third party webhook`);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.error(`OpenIM webhook forward failed: ${msg}`);
      // 仍返回成功，避免 OpenIM 重试；错误已打日志
    }

    return OPENIM_CALLBACK_SUCCESS;
  }
}
