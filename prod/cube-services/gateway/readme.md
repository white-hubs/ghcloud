# Gateway BFF 服务

基于 `@dangao/bun-server` 的 BFF（Backend For Frontend）网关服务，提供统一的 API
代理和认证透传能力。

## 快速开始

### 安装依赖

```bash
bun install
```

### 启动服务

```bash
bun --cwd=prod/cube-services/gateway run start

# 自定义配置
bun src/main.ts --port=3000 --video-monitor-url=http://localhost:3200
```

### 环境变量

支持通过环境变量或命令行参数配置：

```bash
# 环境变量
PORT=3000
HOSTNAME=0.0.0.0
VIDEO_MONITOR_URL=http://localhost:3200
DEVICE_CENTER_URL=http://localhost:3200
METADATA_URL=http://localhost:3200
OUAA_URL=http://localhost:3200

# 或命令行参数
bun src/main.ts \
  --port=3000 \
  --video-monitor-url=http://localhost:3200 \
  --device-center-url=http://localhost:3200 \
  --metadata-url=http://localhost:3200 \
  --ouaa-url=http://localhost:3200
```

## 项目结构

```
src/
├── main.ts                          # 应用入口
├── app.module.ts                    # 应用模块（注册控制器、服务等）
├── config/                          # 配置管理
│   ├── app.config.ts               # 应用配置
│   └── index.ts
├── controllers/                     # 控制器层
│   ├── health.controller.ts        # 健康检查
│   ├── video-monitor/              # 视频监控控制器
│   ├── metadata/                   # 元数据控制器
│   └── ouaa/                       # Ouaa 控制器
├── services/                        # 服务层
│   ├── business/                   # 业务服务
│   └── proxy/                      # 代理服务
├── clients/                         # HTTP 客户端
│   └── proxy-client.ts            # 统一代理客户端
├── decorators/                      # 装饰器
│   └── cube-auth-proxy.decorator.ts # @CubeAuthProxy 装饰器
├── interceptors/                    # 拦截器
│   └── auth-proxy.interceptor.ts  # 认证代理拦截器
├── filters/                         # 异常过滤器
│   └── response-passthrough.filter.ts
└── extensions/                      # 扩展
    └── interceptor-filter.extension.ts
```

## 核心功能

### 1. 认证透传

使用 `@CubeAuthProxy`
装饰器自动透传认证信息（authorization、tenant、terminal）到后端服务。

#### 在控制器中使用

```typescript
import { Body, Controller, POST } from "@dangao/bun-server";
import { CubeAuthProxy } from "@/decorators/cube-auth-proxy.decorator";

@Controller("/gw-bff/video-monitor/camera-auths")
export class VideoMonitorAuthController {
  @POST("/")
  @CubeAuthProxy() // 自动透传认证信息
  public async createAuthGroup(@Body() data: any): Promise<string> {
    // ...
  }
}
```

#### 在服务中使用

```typescript
import { Injectable } from "@dangao/bun-server";
import { CubeAuthProxy } from "@/decorators/cube-auth-proxy.decorator";
import { ProxyClient } from "@/clients/proxy-client";

@Injectable()
export class VideoMonitorProxyService {
  constructor(private readonly proxyClient: ProxyClient) {}

  @CubeAuthProxy() // 该方法调用后端时会自动透传认证信息
  async createCameraAuth(data: any): Promise<any> {
    const response = await this.proxyClient.post(url, data);
    return response.data;
  }
}
```

#### 自定义配置

```typescript
@CubeAuthProxy({
  // 自定义 Authorization header
  authorization: 'Bearer custom-token',
  
  // 跳过默认认证透传
  skipDefaultAuth: false,
  
  // 自定义需要透传的 headers
  authHeaders: ['authorization', 'tenant', 'terminal', 'custom-header'],
  
  // 额外添加 headers
  extraHeaders: {
    'X-Custom-Header': 'value',
    'X-Dynamic-Header': (headers) => `computed-${headers.tenant}`,
  },
})
```

### 2. 代理客户端

`ProxyClient` 提供统一的 HTTP 请求能力，自动处理认证透传、错误处理和 JSON 解析。

```typescript
import { ProxyClient } from "@/clients/proxy-client";

@Injectable()
export class MyProxyService {
  constructor(private readonly proxyClient: ProxyClient) {}

  async fetchData() {
    // GET 请求
    const response = await this.proxyClient.get<Data>(
      "http://backend/api/data",
    );
    return response.data;

    // POST 请求
    const response = await this.proxyClient.post<Result>(
      "http://backend/api/create",
      { name: "test" },
      {
        timeout: 10000, // 超时时间（毫秒）
        parseJson: true, // 自动解析 JSON
        useAuth: true, // 使用认证透传
        passthroughError: true, // 透传错误响应（原样返回给前端）
      },
    );
  }
}
```

#### 请求选项

- `timeout`: 请求超时时间（默认 60 秒）
- `parseJson`: 是否自动解析 JSON 响应（默认 true）
- `useAuth`: 是否自动添加认证 headers（默认 true）
- `passthroughError`: 是否透传错误响应（默认 false）
  - 当为 `true` 时，上游返回 4xx/5xx 时会原样返回给前端（status/headers/body
    不变）

### 3. 添加新的代理服务

#### 步骤 1: 创建代理服务

```typescript
// src/services/proxy/my-service/my-service-proxy.service.ts
import {
  CONFIG_SERVICE_TOKEN,
  ConfigService,
  Inject,
  Injectable,
} from "@dangao/bun-server";
import { ProxyClient } from "@/clients/proxy-client";
import { buildUrl } from "@/services/request-utils";

@Injectable()
export class MyServiceProxyService {
  private readonly baseUrl: string;

  constructor(
    private readonly proxyClient: ProxyClient,
    @Inject(CONFIG_SERVICE_TOKEN) private readonly configService: ConfigService,
  ) {
    this.baseUrl = this.configService.get<string>("app.myServiceUrl") || "";
  }

  async getData(id: string) {
    const url = `${this.baseUrl}/data/${id}`;
    const response = await this.proxyClient.get(url, {
      passthroughError: true,
    });
    return response.data;
  }

  async createData(data: any) {
    const url = `${this.baseUrl}/data`;
    const response = await this.proxyClient.post(url, data, {
      passthroughError: true,
    });
    return response.data;
  }
}
```

#### 步骤 2: 创建控制器

```typescript
// src/controllers/my-service/my-service.controller.ts
import { Body, Controller, GET, Param, POST } from "@dangao/bun-server";
import { CubeAuthProxy } from "@/decorators/cube-auth-proxy.decorator";
import { MyServiceProxyService } from "@/services/proxy/my-service/my-service-proxy.service";

@Controller("/gw-bff/my-service")
export class MyServiceController {
  constructor(
    private readonly myServiceProxyService: MyServiceProxyService,
  ) {}

  @GET("/data/:id")
  @CubeAuthProxy()
  public async getData(@Param("id") id: string) {
    return await this.myServiceProxyService.getData(id);
  }

  @POST("/data")
  @CubeAuthProxy()
  public async createData(@Body() data: any) {
    return await this.myServiceProxyService.createData(data);
  }
}
```

#### 步骤 3: 注册到模块

```typescript
// src/app.module.ts
import { MyServiceController } from "./controllers/my-service/my-service.controller";
import { MyServiceProxyService } from "./services/proxy/my-service/my-service-proxy.service";

@Module({
  controllers: [
    // ... 其他控制器
    MyServiceController,
  ],
  providers: [
    // ... 其他服务
    MyServiceProxyService,
  ],
})
export class AppModule {}
```

#### 步骤 4: 添加配置

```typescript
// src/config/app.config.ts
export interface AppConfig {
  // ... 其他配置
  myServiceUrl?: string;
}

export function loadAppConfig(): AppConfig {
  return {
    // ... 其他配置
    myServiceUrl: getCliArg("my-service-url") ?? process.env.MY_SERVICE_URL ??
      "http://localhost:3200",
  };
}
```

## 调用链路

```
前端请求
  ↓
Controller (接收请求，参数验证)
  ↓
@CubeAuthProxy 拦截器 (提取认证信息，存储到 Context)
  ↓
ProxyService (业务逻辑处理)
  ↓
ProxyClient (发送 HTTP 请求，自动添加认证 headers)
  ↓
后端服务
```

## 技术栈

- **框架**: `@dangao/bun-server` - 基于 Bun 的 Web 框架
- **运行时**: Bun
- **类型定义**: `@ghcloud/cube-service-interface` - 服务接口类型

## 开发指南

### 调试

使用 `debug.ts` 文件快速启动调试：

```bash
bun debug.ts
```

或使用 VS Code 调试配置（需要安装 Bun 插件）。

### 构建

```bash
# 编译 TypeScript
bun run build

# 编译为可执行文件
bun run build:pkg
```

### 健康检查

服务启动后，访问 `/health` 端点检查服务状态：

```bash
curl http://localhost:3000/health
```

## 注意事项

1. **认证透传**: 使用 `@CubeAuthProxy` 装饰器时，确保前端请求包含
   `authorization`、`tenant`、`terminal` 等 headers
2. **错误处理**:
   - 默认情况下，`ProxyClient` 会将非 2xx 响应转换为异常
   - 设置 `passthroughError: true` 可以原样透传错误响应给前端
3. **超时设置**: 默认超时时间为 60 秒，可根据需要调整
4. **路由前缀**: 统一使用 `/gw-bff` 作为路由前缀

## 相关资源

- [@dangao/bun-server 文档](https://github.com/dangaogit/bun-server)
- [Bun 官方文档](https://bun.sh/docs)
