import { ConfigModule, LoggerModule, Module } from "@dangao/bun-server";

import { FetchService } from "./services/fetch.service";
import { HealthController } from "./transport/health.controller";
import { FetchController } from "./transport/rest/fetch.controller";

@Module({
  imports: [
    ConfigModule,
    LoggerModule.forRoot({
      enableRequestLogging: true,
      requestLoggingPrefix: "[Fetch]",
    }),
  ],
  controllers: [HealthController, FetchController],
  providers: [FetchService],
})
export class AppModule {}
