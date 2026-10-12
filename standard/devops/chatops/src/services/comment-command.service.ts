import { Injectable, Inject, CONFIG_SERVICE_TOKEN, ConfigService } from "@dangao/bun-server";

/**
 * 评论命令类型
 */
export enum CommentCommand {
  SUBMIT = "/submit",
  HELP = "/help",
  REVIEWER = "/reviewer",
  CC = "/cc",
  CI = "/ci",
  REVIEW = "/review",
}

/**
 * 评论命令处理服务
 */
@Injectable()
export class CommentCommandService {
  private readonly botUsernames: Set<string>;

  constructor(@Inject(CONFIG_SERVICE_TOKEN) private readonly configService: ConfigService) {
    const config = this.configService.get<any>("app");
    const botUsernames = config.botUsernames || [];
    // 转换为 Set 以便快速查找，同时统一转换为小写以便不区分大小写匹配
    this.botUsernames = new Set(botUsernames.map((username: string) => username.toLowerCase()));
  }
  /**
   * 解析评论中的命令
   */
  parseCommand(body: string): {
    command: CommentCommand | null;
    args: string[];
  } {
    const trimmed = body.trim();

    // 支持三种格式：
    // 1. /command 或 >command（原有格式）
    // 2. @username command（新增格式：@机器人账号 + 命令）
    let commandName: string | null = null;
    let args: string[] = [];

    if (trimmed.startsWith("/") || trimmed.startsWith(">")) {
      // 原有格式：/command 或 >command
      const parts = trimmed.split(/\s+/);
      const commandStr = parts[0]?.toLowerCase();
      commandName = commandStr?.replace(/^[/>]/, "") || null;
      args = parts.slice(1);
    } else if (trimmed.startsWith("@")) {
      // 新格式：@username command
      // 匹配 @用户名 命令 的格式（用户名可以包含字母、数字、连字符和下划线）
      const mentionCommandMatch = trimmed.match(/^@([\w-]+)\s+(\w+)(?:\s+(.*))?$/);
      if (mentionCommandMatch) {
        const mentionedUsername = mentionCommandMatch[1]?.toLowerCase();
        // 验证 @ 后面的用户名是否是配置的机器人账号
        if (!mentionedUsername || !this.botUsernames.has(mentionedUsername)) {
          // 如果不是配置的机器人账号，返回空（不处理）
          return { command: null, args: [] };
        }
        // mentionCommandMatch[2] 是命令（如 submit）
        // mentionCommandMatch[3] 是剩余参数（如果有）
        commandName = mentionCommandMatch[2]?.toLowerCase() || null;
        if (mentionCommandMatch[3]) {
          args = mentionCommandMatch[3].split(/\s+/);
        }
      } else {
        // 如果不匹配 @username command 格式，返回空
        return { command: null, args: [] };
      }
    } else {
      // 不是命令格式
      return { command: null, args: [] };
    }

    // 匹配命令
    let command: CommentCommand | null = null;

    // submit 命令及其别名
    if (commandName === "submit" || commandName === "merge" || commandName === "sm" || commandName === "9527") {
      command = CommentCommand.SUBMIT;
    } else if (commandName === "help") {
      command = CommentCommand.HELP;
    } else if (commandName === "reviewer") {
      command = CommentCommand.REVIEWER;
    } else if (commandName === "cc") {
      command = CommentCommand.CC;
    } else if (commandName === "ci") {
      command = CommentCommand.CI;
    } else if (commandName === "review") {
      command = CommentCommand.REVIEW;
    }

    return { command, args };
  }

  /**
   * 获取帮助信息
   */
  getHelpMessage(): string {
    return `## ChatOps 命令帮助

支持以下命令：

- \`/submit\` 或 \`>submit\`（别名：\`merge\`、\`sm\`、\`9527\`） - 自动检查 CI 状态，如果未通过则触发 CI，通过后自动合并 MR
- \`/help\` 或 \`>help\` - 显示此帮助信息
- \`/reviewer @username1 @username2\` 或 \`>reviewer @username1 @username2\` - 指定审核者，系统会通过钉钉通知相关人员
- \`/cc @username1 @username2 [额外消息]\` 或 \`>cc @username1 @username2 [额外消息]\` - 发送抄送消息提醒到钉钉，通知相关人员，支持附带额外消息
- \`/ci\` 或 \`>ci\` - 重新触发该项目的 CI Pipeline
- \`/review\` 或 \`>review\` - 使用 AI 进行代码审查，生成审查报告

**注意**：所有命令都支持以下三种格式：
1. \`/\` 前缀：\`/submit\`
2. \`>\` 前缀：\`>submit\`
3. \`@机器人账号\` 格式：\`@ci-zhangsan submit\`

### 使用示例

\`\`\`
/submit
>submit
@ci-zhangsan submit
>merge
>sm
>9527
\`\`\`

\`\`\`
/reviewer @zhangsan @lisi
>reviewer @zhangsan @lisi
@ci-zhangsan reviewer @zhangsan @lisi
\`\`\`

\`\`\`
/cc @zhangsan @lisi
>cc @zhangsan @lisi
@ci-zhangsan cc @zhangsan @lisi
\`\`\`

\`\`\`
/cc @zhangsan 这是一条额外消息
>cc @zhangsan 这是一条额外消息
@ci-zhangsan cc @zhangsan 这是一条额外消息
\`\`\`

\`\`\`
/cc 这是一条消息 @zhangsan @lisi
>cc 这是一条消息 @zhangsan @lisi
\`\`\`

\`\`\`
/ci
>ci
@ci-zhangsan ci
\`\`\`

\`\`\`
/help
>help
@ci-zhangsan help
\`\`\`

\`\`\`
/review
>review
@ci-zhangsan review
\`\`\``;
  }

  /**
   * 从评论中提取 @ 提及的用户名
   */
  extractMentions(body: string): string[] {
    // 支持用户名包含连字符（如 ci-zhangsan）
    const mentionRegex = /@([\w-]+)/g;
    const mentions: string[] = [];
    let match;

    while ((match = mentionRegex.exec(body)) !== null) {
      mentions.push(match[1]!);
    }

    // 去重
    return [...new Set(mentions)];
  }

  /**
   * 从评论中提取额外消息（去除命令和 @ 用户）
   * @param body 评论内容
   * @param command 命令字符串（如 "/cc"）
   * @returns 额外消息内容
   */
  extractExtraMessage(body: string, command: string): string {
    // 移除命令部分
    let message = body.trim();

    // 支持 / 和 > 两种前缀
    const commandName = command.replace(/^[/>]/, "");
    if (message.startsWith(command)) {
      message = message.substring(command.length).trim();
    } else if (message.startsWith(`>${commandName}`)) {
      message = message.substring(`>${commandName}`.length).trim();
    } else if (message.startsWith(`/${commandName}`)) {
      message = message.substring(`/${commandName}`.length).trim();
    } else if (message.startsWith("@")) {
      // 支持 @机器人账号 命令 格式
      // 匹配 @用户名 命令 的格式，移除这部分
      const mentionCommandMatch = message.match(/^@([\w-]+)\s+(\w+)(?:\s+(.*))?$/);
      if (mentionCommandMatch && mentionCommandMatch[2]?.toLowerCase() === commandName.toLowerCase()) {
        // 如果匹配到 @机器人账号 命令 格式，提取剩余部分
        message = mentionCommandMatch[3] || "";
      }
      // 如果不匹配，保持原样，后续会通过正则移除 @ 用户提及
    }

    // 移除所有 @ 用户提及（包括机器人账号和其他用户）
    message = message.replace(/@[\w-]+/g, "").trim();

    // 清理多余的空格（将多个连续空格替换为单个空格）
    message = message.replace(/\s+/g, " ").trim();

    return message;
  }
}
