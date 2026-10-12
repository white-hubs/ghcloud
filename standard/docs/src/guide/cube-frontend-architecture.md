# 开河平台前端架构与技术栈

## 产品形态
开河平台前端从产品形态上分为以下几个部分：
- **PC WEB端**：基于浏览器的桌面端应用。
- **PC 桌面端**：基于 Electron 的桌面应用。
- **移动 App端**：基于 Flutter 的跨平台移动应用。
- **移动 H5端**：基于浏览器的移动端应用。

## 业务形态
从业务形态上分为以下几个部分：
- **业务PC端**：面向 PC 用户的核心业务功能。
- **业务移动端**：面向移动用户的核心业务功能。
- **指挥调度端**：用于指挥调度的专用功能模块。
- **孪生可视端**：基于 Web3D & Unreal Engine 5.x 技术的数字孪生可视化功能。

## 技术栈
当前技术栈涵盖以下内容：
- **框架**：Vue3、React、Flutter
- **语言**：TypeScript
- **构建工具**：Vite
- **UI 组件库**：Ant Design
- **包管理工具**：pnpm
- **项目架构**：Monorepo
- **开发工具**：Electron、ESLint

## 项目仓库结构
除 Flutter 项目外，其余前端代码均位于单仓 `http://git.guhecloud.com:8000/ghcloud/ghcloud`，目录结构如下：

```
├── .vscode/              # VSCode 配置文件
│   ├── extensions.json
│   ├── settings.json
│   └── typescriptreact.code-snippets
├── legacy/               # 历史遗留项目
│   ├── bimops-fe-web-migrate
│   ├── bimops-fe-web-migrate-lib
│   └──  ......
├── prod/                 # 正在全力建设的标准项目
│   ├── cube/
│   ├────── apps/         # 应用和服务定义
│   ├────── basic/        # 基础组件 & 业务组件 & 各类 SDK
│   ├────── business/     # 准备迁移至 apps 或 customize 目录的业务项目
│   ├────── desktop/      # 桌面端项目
│   ├────── protocol/     # 前端协议
│   └── customize/        # 定制项目
├── standard/             # 基础设施与工具
│   ├── devops/           # CI 脚本
│   ├── docs/             # 文档
│   ├── eslint/           # ESLint 配置
│   └── infrastructure/   # 基础设施
│   ├────── event-bus/    # Web 端事件总线
│   ├────── gateway/      # 前端网关定义
│   ├────── helper/       # 助手工具
│   ├────── logger/       # 日志工具
├── package-publish-tool.js # 制品发布工具
├── package.json          # 项目配置文件
├── pnpm-lock.yaml        # pnpm 锁文件
├── pnpm-workspace.yaml   # pnpm 工作空间配置文件
└── work-flow.png*        # 工作流程图（美化 Markdown）
```

## 项目特点
1. **Monorepo 架构**：通过 pnpm 和 Monorepo 管理多个项目，实现依赖共享和统一配置，提升开发效率。
2. **模块化设计**：项目目录结构清晰，分为 `apps`、`basic`、`business` 等模块，便于代码复用和维护。
3. **历史遗留项目管理**：`legacy/` 目录集中管理历史遗留项目，未来可逐步迁移或重构，减少技术债务。
4. **基础设施集中化**：`standard/` 目录集中管理基础设施和工具，如事件总线、网关、路由、日志等，提升项目的可维护性。

## 未来优化方向
1. **历史项目迁移**：逐步将 `legacy/` 目录中的项目迁移至 `prod/` 目录，统一技术栈和开发规范。
3. **文档完善**：补充 `docs/` 目录中的文档，确保项目开发、部署和维护的标准化。
