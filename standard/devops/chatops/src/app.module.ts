import { GitLabClient } from "./clients/gitlab-client";
import { UserMappingService, loadUserMappingConfig } from "./config/user-mapping.config";
import { HealthController } from "./controllers/health.controller";
import { OpenImCallbackController } from "./controllers/openim-callback.controller";
import { WebhookController } from "./controllers/webhook.controller";
import { ChatOpsService } from "./services/chatops.service";
import { CIConfigService } from "./services/ci-config.service";
import { CodeReviewService } from "./services/code-review.service";
import { CommentCommandService } from "./services/comment-command.service";
import { DingTalkService } from "./services/dingtalk.service";
import { EventLogService } from "./services/event-log.service";
import { OpenCubeService } from "./services/open-cube.service";
import { ConfigModule, LoggerModule, LogLevel, Module } from "@dangao/bun-server";

/**
 * 应用主模块
 * 统一管理控制器、服务、拦截器、过滤器和日志
 */
@Module({
  imports: [
    ConfigModule,
    LoggerModule.forRoot({
      enableRequestLogging: true,
      requestLoggingPrefix: "[ChatOps]",
      logger: {
        level: LogLevel.INFO,
      },
    }),
  ],
  controllers: [HealthController, WebhookController, OpenImCallbackController],
  providers: [
    GitLabClient,
    DingTalkService,
    CommentCommandService,
    ChatOpsService,
    EventLogService,
    CIConfigService,
    CodeReviewService,
    OpenCubeService,
    {
      provide: UserMappingService,
      useFactory: async () => {
        const mapping = await loadUserMappingConfig();
        return new UserMappingService(mapping);
      },
    },
  ],
})
export class AppModule {}
