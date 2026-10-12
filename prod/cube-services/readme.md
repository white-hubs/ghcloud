# Cube Services 开发指南

Cube Services 是一个三层架构的服务体系，提供统一的类型定义、BFF 网关服务和前端客户端 SDK。

> 这是 Cube 服务契约的最新默认规范。现存项目中仍可能存在自定义 `api` 目录或同级 `service` 模块，这些属于历史实践或迁移遗留，不作为新增服务、新 BFF、新 SDK 或前端接口调用的参考模板。

## 架构概览

```
┌─────────────────────────────────────────────────────────┐
│                    前端应用                              │
│  (使用 @ghcloud/cube-services-client)                   │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP 请求
                     ↓
┌─────────────────────────────────────────────────────────┐
│              Gateway BFF 服务                           │
│  (@ghcloud/cube-gateway-server)                         │
│  - 实现 Gateway 接口                                     │
│  - 认证透传                                              │
│  - 请求代理                                              │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP 请求（带认证）
                     ↓
┌─────────────────────────────────────────────────────────┐
│                 后端服务                                 │
│  (视频监控、设备中心、元数据、OUAA 等)                   │
└─────────────────────────────────────────────────────────┘

类型定义层（共享）:
┌─────────────────────────────────────────────────────────┐
│         @ghcloud/cube-service-interface                 │
│  - Gateway 接口定义                                      │
│  - 请求/响应类型                                         │
│  - 枚举类型                                              │
└─────────────────────────────────────────────────────────┘
```

## 目录结构

```
prod/cube-services/
├── interfaces/          # 类型定义包 (@ghcloud/cube-service-interface)
│   ├── src/
│   │   ├── base/        # 基础类型（分页、请求、响应等）
│   │   ├── video-monitor/  # 视频监控服务类型
│   │   ├── device-center/ # 设备中心服务类型
│   │   ├── metadata/      # 元数据服务类型
│   │   └── ouaa/          # Ouaa 服务类型
│   └── package.json
│
├── gateway/             # BFF 网关服务 (@ghcloud/cube-gateway-server)
│   ├── src/
│   │   ├── main.ts      # 应用入口
│   │   ├── app.module.ts # 应用模块
│   │   ├── controllers/  # 控制器（实现 Gateway 接口）
│   │   ├── services/     # 服务层（代理逻辑）
│   │   ├── clients/      # HTTP 客户端
│   │   └── ...
│   ├── package.json
│   └── readme.md        # Gateway 详细文档
│
└── client/              # 前端客户端 SDK (@ghcloud/cube-services-client)
    ├── src/
    │   ├── index.ts
    │   ├── video-monitor.client.ts
    │   ├── metadata.client.ts
    │   ├── ouaa.client.ts
    │   └── auth-request.ts
    ├── package.json
    └── dist/            # 构建产物
```

## 模块说明

### 1. Interfaces - 类型定义包

**包名**: `@ghcloud/cube-service-interface`

**作用**: 定义所有服务的类型契约，包括 Gateway 接口、请求/响应类型、枚举等。

**导出**:
- `@ghcloud/cube-service-interface/base` - 基础类型
- `@ghcloud/cube-service-interface/video-monitor` - 视频监控类型
- `@ghcloud/cube-service-interface/device-center` - 设备中心类型
- `@ghcloud/cube-service-interface/metadata` - 元数据类型
- `@ghcloud/cube-service-interface/ouaa` - Ouaa 类型

**使用示例**:

```typescript
import type {
  VideoMonitorAuthGateway,
  AuthGroupModifyParam,
  DeviceAuth,
} from '@ghcloud/cube-service-interface/video-monitor';
import type { Pagination } from '@ghcloud/cube-service-interface/base';

// 实现 Gateway 接口
class MyController implements VideoMonitorAuthGateway {
  async createAuthGroup(params: AuthGroupModifyParam): Promise<string> {
    // ...
  }
}
```

### 2. Gateway - BFF 网关服务

**包名**: `@ghcloud/cube-gateway-server`

**作用**: 
- 实现 `interfaces` 中定义的 Gateway 接口
- 提供统一的 API 代理和认证透传能力
- 作为前端和后端服务之间的中间层

**核心功能**:
- 认证透传（`@CubeAuthProxy` 装饰器）
- 请求代理（`ProxyClient`）
- 错误处理
- 日志记录

**快速开始**:

```bash
# 进入 gateway 目录
cd gateway

# 安装依赖
bun install

# 启动服务
bun run start

# 开发模式（带热重载）
bun run dev
```

**详细文档**: 参见 [gateway/readme.md](./gateway/readme.md)

### 3. Client - 前端客户端 SDK

**包名**: `@ghcloud/cube-services-client`

**作用**: 提供前端调用 Gateway 服务的便捷 SDK，封装 HTTP 请求逻辑。

**导出**:
- `.` - 默认导出（包含所有客户端）
- `./video-monitor.client` - 视频监控客户端
- `./metadata.client` - 元数据客户端
- `./ouaa.client` - Ouaa 客户端
- `./auth-request` - 认证请求工具

**使用示例**:

```typescript
import { videoMonitorClient } from '@ghcloud/cube-services-client';

// 创建摄像头授权
const id = await videoMonitorClient.createCameraAuth({
  name: '测试授权组',
  // ...
});

// 获取授权列表
const list = await videoMonitorClient.listAuthGroup({
  page: 1,
  pageSize: 10,
});
```

**构建**:

```bash
cd client
bun run build
```

## 开发流程

### 添加新的服务模块

#### 步骤 1: 在 interfaces 中定义类型

```typescript
// interfaces/src/my-service/gateway.ts
export interface MyServiceGateway {
  getData: (id: string) => Promise<Data>;
  createData: (params: CreateDataParams) => Promise<string>;
}

// interfaces/src/my-service/request.ts
export interface CreateDataParams {
  name: string;
  // ...
}

// interfaces/src/my-service/response.ts
export interface Data {
  id: string;
  name: string;
  // ...
}

// interfaces/src/my-service/main.ts
export * from './gateway';
export * from './request';
export * from './response';
```

#### 步骤 2: 在 gateway 中实现接口

参考 [gateway/readme.md](./gateway/readme.md) 中的"添加新的代理服务"章节。

主要步骤：
1. 创建 `ProxyService`（代理服务）
2. 创建 `Controller`（实现 Gateway 接口）
3. 在 `app.module.ts` 中注册
4. 添加配置项

#### 步骤 3: 在 client 中提供 SDK

```typescript
// client/src/my-service.client.ts
import { makeGETRequest, makeCreateRequest } from '@ghcloud/cube-gateway';
import type { MyServiceGateway } from '@ghcloud/cube-service-interface/my-service';

export const getData: MyServiceGateway['getData'] = async (id) => {
  const resp = await makeGETRequest({
    url: `/gw-bff/my-service/data/${id}`,
  }).send();
  return resp.json();
};

export const createData: MyServiceGateway['createData'] = async (params) => {
  const resp = await makeCreateRequest({
    url: '/gw-bff/my-service/data',
    payload: params,
  }).send();
  return resp.text();
};
```

```typescript
// client/src/index.ts
export * as myServiceClient from './my-service.client';
```

## 依赖关系

```
interfaces (无依赖)
    ↑
    │ (被依赖)
    ├── gateway (依赖 interfaces)
    └── client (依赖 interfaces, gateway)
```

- **interfaces**: 独立包，不依赖其他模块
- **gateway**: 依赖 `interfaces`，实现 Gateway 接口
- **client**: 依赖 `interfaces` 和 `gateway`，提供前端 SDK

## 工作区配置

所有模块都在同一个 monorepo 工作区中，使用 workspace 协议引用：

```json
{
  "dependencies": {
    "@ghcloud/cube-service-interface": "workspace:^"
  }
}
```

## 开发工具

### 安装依赖

在项目根目录执行：

```bash
bun install
```

### 构建

```bash
# 构建 interfaces（通常不需要，直接使用源码）
cd interfaces

# 构建 gateway
cd gateway
bun run build

# 构建 client
cd client
bun run build
```

### 调试

Gateway 服务支持调试模式：

```bash
cd gateway
bun run dev  # 开发模式，带热重载和调试端口
```

## 最佳实践

### 1. 类型安全

- 所有接口定义都在 `interfaces` 中
- Gateway 实现必须实现对应的 Gateway 接口
- Client SDK 必须遵循 Gateway 接口的类型定义

### 2. 认证透传

- 在 Gateway 的 Controller 方法上使用 `@CubeAuthProxy()` 装饰器
- 确保前端请求包含必要的认证 headers（authorization、tenant、terminal）

### 3. 错误处理

- Gateway 中使用 `passthroughError: true` 可以原样透传后端错误
- Client SDK 中统一处理错误响应

### 4. 命名规范

- Gateway 路由统一使用 `/gw-bff` 前缀
- Controller 类名以 `Controller` 结尾
- ProxyService 类名以 `ProxyService` 结尾
- Client 文件名以 `.client.ts` 结尾

## 相关资源

- [Gateway 详细文档](./gateway/readme.md)
- [@dangao/bun-server 文档](https://github.com/dangaogit/bun-server)
- [Bun 官方文档](https://bun.sh/docs)

## 常见问题

### Q: 如何添加新的后端服务代理？

A: 参考 [gateway/readme.md](./gateway/readme.md) 中的"添加新的代理服务"章节。

### Q: 如何在前端使用新的服务？

A: 在 `client` 中添加对应的客户端方法，参考现有的 `video-monitor.client.ts`。

### Q: 如何修改接口定义？

A: 在 `interfaces` 中修改对应的类型定义，然后更新 `gateway` 和 `client` 中的实现。

### Q: 如何调试 Gateway 服务？

A: 使用 `bun run dev` 启动开发模式，或使用 VS Code 的调试配置（需要安装 Bun 插件）。
