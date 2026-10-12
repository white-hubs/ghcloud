/**
 * 应用配置
 */
export interface AppConfig {
  /**
   * 服务端口
   * @default 3000
   */
  port: number;

  /**
   * 主机名
   * @default '0.0.0.0'
   */
  hostname?: string;

  /**
   * 日志级别
   * @default 'info'
   */
  logLevel?: "debug" | "info" | "warn" | "error";

  /**
   * GitLab API 地址
   */
  gitlabUrl: string;

  /**
   * GitLab API Token
   */
  gitlabToken: string;

  /**
   * GitLab Webhook Secret Token（用于验证 webhook 请求）
   */
  gitlabWebhookSecret?: string;

  /**
   * 钉钉机器人 Webhook URL
   */
  dingtalkWebhookUrl?: string;

  /**
   * 钉钉机器人 Secret（用于签名验证）
   */
  dingtalkSecret?: string;

  /**
   * 是否启用钉钉通知
   * @default true
   */
  enableDingtalkNotification?: boolean;

  /**
   * 是否启用 OpenIM 通知
   * @default true
   */
  enableOpenimNotification?: boolean;

  /**
   * Open-Cube / OpenIM 渠道配置（与钉钉渠道并存）
   */
  openim?: {
    /**
     * 三方 Webhook URL：收到 @ 机器人时 POST 推送；不配置则不推送
     */
    webhookForwardUrl?: string;

    /**
     * 三方调用发送消息接口的鉴权 Key；不配置则 /openapi/msg/send 不可用
     */
    openapiApiKey?: string;

    /**
     * 监听的群 ID，逗号分隔
     */
    webhookGroupIds?: string[];

    /**
     * 监听的机器人 userID，逗号分隔
     */
    webhookBotUserIds?: string[];

    /**
     * Webhook Server 提供的发送消息 OpenAPI 地址（本服务收到 /openapi/msg/send 后转发到此 URL，不直接对接 OpenIM）
     * 例如 https://webhook-server/openapi/msg/send
     */
    openapiSendUrl?: string;

    /**
     * 调用 Webhook Server OpenAPI 时的鉴权 Key（若对方需要）
     * 可选：X-API-Key 或 Authorization: Bearer
     */
    openapiForwardApiKey?: string;

    /**
     * 发送消息时使用的 sendID（机器人 ID）
     * @default 'chatops-bot'
     */
    sendId?: string;

    /**
     * 是否在消息文本中显示 @ 标记（如：@张三）
     * 当启用时，会在消息文本开头添加 @ 用户的标记
     * 注意：实际的 @ 功能由 atUserList 控制，此选项仅影响文本显示
     * @default false
     */
    showAtMentionInText?: boolean;
  };

  /**
   * 事件记录文件路径（可选，如果不配置则不记录事件）
   * @default undefined
   */
  eventLogFilePath?: string;

  /**
   * 机器人账号列表（用于 @机器人账号 命令格式）
   * 支持多个机器人账号，用逗号分隔
   * @default []
   */
  botUsernames?: string[];

  /**
   * OpenAI/百炼 API 配置
   */
  openai?: {
    /**
     * API Key
     */
    apiKey?: string;

    /**
     * API Base URL（用于百炼等兼容 OpenAI 的 API）
     * @default 'https://dashscope.aliyuncs.com/compatible-mode/v1'
     */
    baseURL?: string;

    /**
     * 模型名称
     * @default 'qwen-plus'
     */
    model?: string;

    /**
     * CR 审查提示词模板文件路径（可选，如果不配置则使用默认模板）
     * 支持相对路径（相对于项目根目录）或绝对路径
     * 如果文件不存在，将使用默认模板
     */
    crPromptTemplatePath?: string;

    /**
     * 代码审查时包含的文件列表（支持文件名或路径模式，用逗号分隔）
     * 如果配置了包含列表，只有匹配包含模式的文件才会被审查
     * 如果未配置，则所有文件都会被审查（除非在排除列表中）
     * @default undefined
     */
    includeFiles?: string[];

    /**
     * 代码审查时排除的文件列表（支持文件名或路径模式，用逗号分隔）
     * 默认排除：bun.lock, yarn.lock, package-lock.json, pnpm-lock.yaml
     * 排除列表优先级高于包含列表：即使文件在包含列表中，如果在排除列表中也会被排除
     * @default ['bun.lock', 'yarn.lock', 'package-lock.json', 'pnpm-lock.yaml']
     */
    excludeFiles?: string[];
  };
}

/**
 * 从环境变量加载配置
 */
function getCliArg(name: string): string | undefined {
  const argv = (typeof Bun !== "undefined" ? Bun.argv : process.argv).slice(2).map((v) => String(v ?? ""));

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg) {
      continue;
    }
    if (arg.startsWith(`--${name}=`)) {
      return arg.substring(name.length + 3);
    }
    if (arg === `--${name}` && i + 1 < argv.length) {
      return argv[i + 1];
    }
  }
  return undefined;
}

export function loadAppConfig(): AppConfig {
  const cliPort = getCliArg("port");
  const cliHostname = getCliArg("hostname");
  const cliLogLevel = getCliArg("log-level");
  const cliGitlabUrl = getCliArg("gitlab-url");
  const cliGitlabToken = getCliArg("gitlab-token");
  const cliGitlabWebhookSecret = getCliArg("gitlab-webhook-secret");
  const cliDingtalkWebhookUrl = getCliArg("dingtalk-webhook-url");
  const cliDingtalkSecret = getCliArg("dingtalk-secret");
  const cliEventLogFilePath = getCliArg("event-log-file-path");
  const cliBotUsernames = getCliArg("bot-usernames");
  const cliOpenaiApiKey = getCliArg("openai-api-key");
  const cliOpenaiBaseURL = getCliArg("openai-base-url");
  const cliOpenaiModel = getCliArg("openai-model");
  const cliCrPromptTemplatePath = getCliArg("cr-prompt-template-path");
  const cliIncludeFiles = getCliArg("cr-include-files");
  const cliExcludeFiles = getCliArg("cr-exclude-files");
  const cliOpenimWebhookForwardUrl = getCliArg("openim-webhook-forward-url");
  const cliOpenimOpenapiApiKey = getCliArg("openim-openapi-api-key");
  const cliOpenimWebhookGroupIds = getCliArg("openim-webhook-group-ids");
  const cliOpenimWebhookBotUserIds = getCliArg("openim-webhook-bot-user-ids");
  const cliOpenimOpenapiSendUrl = getCliArg("openim-openapi-send-url");
  const cliOpenimOpenapiForwardApiKey = getCliArg("openim-openapi-forward-api-key");
  const cliOpenimSendId = getCliArg("openim-send-id");
  const cliOpenimShowAtMentionInText = getCliArg("openim-show-at-mention-in-text");
  const cliEnableDingtalkNotification = getCliArg("enable-dingtalk-notification");
  const cliEnableOpenimNotification = getCliArg("enable-openim-notification");

  // 解析逗号分隔字符串为字符串数组
  const parseCommaList = (value?: string): string[] | undefined => {
    if (!value) {
      return undefined;
    }
    const list = value
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    return list.length > 0 ? list : undefined;
  };

  // 解析机器人账号列表（支持逗号分隔）
  const parseBotUsernames = (value?: string): string[] => {
    if (!value) {
      return [];
    }
    return value
      .split(",")
      .map((username) => username.trim())
      .filter((username) => username.length > 0);
  };

  // 解析包含文件列表（支持逗号分隔）
  const parseIncludeFiles = (value?: string): string[] | undefined => {
    if (!value) {
      return undefined;
    }
    const files = value
      .split(",")
      .map((file) => file.trim())
      .filter((file) => file.length > 0);
    return files.length > 0 ? files : undefined;
  };

  // 解析排除文件列表（支持逗号分隔）
  const parseExcludeFiles = (value?: string): string[] => {
    if (!value) {
      // 默认排除的锁文件
      return ["bun.lock", "yarn.lock", "package-lock.json", "pnpm-lock.yaml"];
    }
    return value
      .split(",")
      .map((file) => file.trim())
      .filter((file) => file.length > 0);
  };

  // 解析布尔值配置
  const parseBool = (value?: string, defaultValue: boolean = true): boolean => {
    if (!value) {
      return defaultValue;
    }
    const lowerValue = value.toLowerCase().trim();
    return lowerValue === "true" || lowerValue === "1" || lowerValue === "yes";
  };

  return {
    port: parseInt(cliPort ?? process.env.PORT ?? "3000", 10),
    hostname: cliHostname ?? process.env.HOSTNAME ?? "0.0.0.0",
    logLevel: (cliLogLevel as any) ?? (process.env.LOG_LEVEL as any) ?? "info",
    gitlabUrl: cliGitlabUrl ?? process.env.GITLAB_URL ?? "https://gitlab.com",
    gitlabToken: cliGitlabToken ?? process.env.GITLAB_TOKEN ?? "",
    gitlabWebhookSecret: cliGitlabWebhookSecret ?? process.env.GITLAB_WEBHOOK_SECRET,
    dingtalkWebhookUrl: cliDingtalkWebhookUrl ?? process.env.DINGTALK_WEBHOOK_URL,
    dingtalkSecret: cliDingtalkSecret ?? process.env.DINGTALK_SECRET,
    enableDingtalkNotification: parseBool(cliEnableDingtalkNotification ?? process.env.ENABLE_DINGTALK_NOTIFICATION, true),
    enableOpenimNotification: parseBool(cliEnableOpenimNotification ?? process.env.ENABLE_OPENIM_NOTIFICATION, true),
    eventLogFilePath: cliEventLogFilePath ?? process.env.EVENT_LOG_FILE_PATH,
    botUsernames: parseBotUsernames(cliBotUsernames ?? process.env.BOT_USERNAMES),
    openai: {
      apiKey: cliOpenaiApiKey ?? process.env.OPENAI_API_KEY,
      baseURL: cliOpenaiBaseURL ?? process.env.OPENAI_BASE_URL ?? "https://dashscope.aliyuncs.com/compatible-mode/v1",
      model: cliOpenaiModel ?? process.env.OPENAI_MODEL ?? "qwen-plus",
      crPromptTemplatePath: cliCrPromptTemplatePath ?? process.env.CR_PROMPT_TEMPLATE_PATH ?? "cr-prompt-template.md",
      includeFiles: parseIncludeFiles(cliIncludeFiles ?? process.env.CR_INCLUDE_FILES),
      excludeFiles: parseExcludeFiles(cliExcludeFiles ?? process.env.CR_EXCLUDE_FILES),
    },
    openim: {
      webhookForwardUrl: cliOpenimWebhookForwardUrl ?? process.env.OPENIM_WEBHOOK_FORWARD_URL,
      openapiApiKey: cliOpenimOpenapiApiKey ?? process.env.OPENIM_OPENAPI_API_KEY,
      webhookGroupIds: parseCommaList(cliOpenimWebhookGroupIds ?? process.env.OPENIM_WEBHOOK_GROUP_IDS),
      webhookBotUserIds: parseCommaList(cliOpenimWebhookBotUserIds ?? process.env.OPENIM_WEBHOOK_BOT_USER_IDS),
      openapiSendUrl: cliOpenimOpenapiSendUrl ?? process.env.OPENIM_OPENAPI_SEND_URL,
      openapiForwardApiKey: cliOpenimOpenapiForwardApiKey ?? process.env.OPENIM_OPENAPI_FORWARD_API_KEY,
      sendId: cliOpenimSendId ?? process.env.OPENIM_SEND_ID ?? "chatops-bot",
      showAtMentionInText: parseBool(cliOpenimShowAtMentionInText ?? process.env.OPENIM_SHOW_AT_MENTION_IN_TEXT, false),
    },
  };
}
