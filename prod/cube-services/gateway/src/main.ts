import {
  Application,
  ConfigModule,
} from '@dangao/bun-server';
import { loadAppConfig } from './config/app.config';
import { AppModule } from './app.module';

/**
 * 打印生效的配置信息（完整配置，单行输出）
 */
function printConfig(config: ReturnType<typeof loadAppConfig>): void {
}

/**
 * 应用启动函数
 */
async function bootstrap(): Promise<void> {
  // 加载配置
  const config = loadAppConfig();

  // 打印生效的配置
  printConfig(config);

  // 配置 ConfigModule
  ConfigModule.forRoot({
    defaultConfig: {
      app: {
        name: '@ghcloud/cube-gateway-server',
        ...config,
      },
    },
  });

  // 创建应用实例
  const app = new Application({
    port: config.port,
    hostname: config.hostname,
  });


  // 注册应用模块（统一管理控制器、服务、拦截器、过滤器和日志）
  app.registerModule(AppModule);

  // 启动服务器
  await app.listen();

}

// 启动应用
bootstrap().catch((error) => {
  process.exit(1);
});

