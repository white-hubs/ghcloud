import { AppModule } from "./app.module";
import { loadAppConfig } from "./config/app.config";
import { loadUserMappingConfig, loadOpenimMappingConfig, UserMappingService } from "./config/user-mapping.config";
import { Application, ConfigModule } from "@dangao/bun-server";
import { LoggerManager } from "@dangao/logsmith";

// 在应用启动阶段，LoggerModule 可能还未初始化，使用 LoggerManager 获取全局 logger
const logger = LoggerManager.getLogger();

/**
 * 隐藏敏感信息（只显示前4位和后4位）
 */
function maskSensitiveValue(value?: string): string {
  if (!value) {
    return "(not set)";
  }
  if (value.length <= 8) {
    return "***";
  }
  return `${value.substring(0, 4)}...${value.substring(value.length - 4)}`;
}

/**
 * 打印生效的配置信息
 */
function printConfig(config: ReturnType<typeof loadAppConfig>): void {
  logger.info("=".repeat(60));
  logger.info("📋 ChatOps Server Configuration");
  logger.info("=".repeat(60));
  logger.info(`Port: ${config.port}`);
  logger.info(`Hostname: ${config.hostname || "0.0.0.0"}`);
  logger.info(`Log Level: ${config.logLevel || "info"}`);
  logger.info(`GitLab URL: ${config.gitlabUrl}`);
  logger.info(`GitLab Token: ${maskSensitiveValue(config.gitlabToken)}`);
  logger.info(`GitLab Webhook Secret: ${maskSensitiveValue(config.gitlabWebhookSecret)}`);
  logger.info(`DingTalk Webhook URL: ${config.dingtalkWebhookUrl || "(not set)"}`);
  logger.info(`DingTalk Secret: ${maskSensitiveValue(config.dingtalkSecret)}`);
  logger.info(`Event Log File Path: ${config.eventLogFilePath || "(not set)"}`);
  logger.info(`Bot Usernames: ${config.botUsernames && config.botUsernames.length > 0 ? config.botUsernames.join(", ") : "(not set)"}`);
  if (config.openai) {
    logger.info(`OpenAI API Key: ${maskSensitiveValue(config.openai.apiKey)}`);
    logger.info(`OpenAI Base URL: ${config.openai.baseURL || "(not set)"}`);
    logger.info(`OpenAI Model: ${config.openai.model || "(not set)"}`);
    logger.info(`CR Prompt Template Path: ${config.openai.crPromptTemplatePath || "(default)"}`);
    logger.info(
      `CR Include Files: ${config.openai.includeFiles && config.openai.includeFiles.length > 0 ? config.openai.includeFiles.join(", ") : "(not set)"}`,
    );
    logger.info(
      `CR Exclude Files: ${config.openai.excludeFiles && config.openai.excludeFiles.length > 0 ? config.openai.excludeFiles.join(", ") : "(default)"}`,
    );
  } else {
    logger.info(`OpenAI: (not configured)`);
  }
  logger.info("=".repeat(60));
}

// 保存应用实例，以便在需要时关闭
let appInstance: Application | null = null;

/**
 * 优雅关闭服务器
 */
async function gracefulShutdown(signal: string): Promise<void> {
  logger.info(`\n📛 Received ${signal}, shutting down gracefully...`);

  try {
    // 如果 Application 有 close 或 shutdown 方法，尝试调用它
    // 使用类型断言来检查可选的方法
    const app = appInstance as unknown as { close?: () => Promise<void>; shutdown?: () => Promise<void> };
    if (app) {
      if (typeof app.close === "function") {
        await app.close();
      } else if (typeof app.shutdown === "function") {
        await app.shutdown();
      }
    }

    logger.info("✅ Server closed successfully");
  } catch (error) {
    logger.error("Error during shutdown:", error);
  } finally {
    process.exit(0);
  }
}

/**
 * 应用启动函数
 */
async function bootstrap(): Promise<void> {
  // 加载配置
  const config = loadAppConfig();

  // 打印生效的配置
  printConfig(config);

  // 加载用户映射配置（钉钉 + OpenIM）
  const userMapping = await loadUserMappingConfig();
  const openimMapping = await loadOpenimMappingConfig();
  const userMappingService = new UserMappingService(userMapping, openimMapping);

  logger.info(`Loaded user mapping for ${Object.keys(userMapping).length} GitLab users (DingTalk)`);
  if (Object.keys(openimMapping).length > 0) {
    logger.info(`Loaded OpenIM userID mapping for ${Object.keys(openimMapping).length} GitLab users`);
  }

  // 配置 ConfigModule
  ConfigModule.forRoot({
    defaultConfig: {
      app: {
        name: "@ghcloud/chatops-server",
        ...config,
        userMappingService,
      },
    },
  });

  // 创建应用实例
  const app = new Application({
    port: config.port,
    hostname: config.hostname,
  });

  // 保存应用实例引用
  appInstance = app;

  // 注册信号处理器，确保优雅关闭
  process.on("SIGINT", () => gracefulShutdown("SIGINT"));
  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
  process.on("SIGHUP", () => gracefulShutdown("SIGHUP"));

  // 注册应用模块（统一管理控制器、服务、拦截器、过滤器和日志）
  app.registerModule(AppModule);

  // 启动服务器
  await app.listen();

  logger.info(`🚀 ChatOps server is running on http://${config.hostname || "0.0.0.0"}:${config.port}`);
  logger.info(`📋 Health check: http://${config.hostname || "0.0.0.0"}:${config.port}/health`);
}

// 启动应用
bootstrap().catch((error) => {
  logger.error("Failed to start server:", error);
  process.exit(1);
});
