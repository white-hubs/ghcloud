# 制品构建工具

基于 Node.js 开发的自动化构建推送工具，支持快速完成以下操作：
- 📦 项目打包构建
- 🚀 自动推送制品到 Nexus 仓库

## 使用指南

### 环境要求
- Node.js v16+
- npm-publisher 账号权限

### 操作步骤
1. 进入项目根目录
   ```bash
   cd /path/to/project-root
   ```

2. 执行构建工具
   ```bash
   node package-publish-tool.js
   ```

3. 输入构建包名（示例）
   ```text
   @ghcloud/cube-ai-assistant-app
   ```

4. 自动推送流程
   ```mermaid
   sequenceDiagram
       构建工具->>Nexus: 身份验证
       构建工具->>构建系统: 执行打包
       构建系统-->>构建工具: 生成制品
       构建工具->>Nexus: 推送制品
   ```

## 注意事项
- 🔑 请确保已通过 `npm login` 完成 npm-publisher 账号认证
- ⚠️ 构建过程中请保持网络连接稳定
- 📁 制品默认输出路径：`/dist`