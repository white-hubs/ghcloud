# ChatOps 服务

基于 `@dangao/bun-server` 的 GitLab ChatOps 服务，提供自动化 CI/CD 和代码审核流程管理。

## 功能特性

1. **自动触发 CI**：当 Merge Request 标题或审核状态发生变化时，自动触发 CI 检查
2. **自动合并**：通过 `/submit` 命令自动检查 CI 状态，通过后自动合并 MR
3. **命令支持**：支持 `/submit`、`/help`、`/reviewer` 等命令
4. **审核通知**：通过钉钉和 OpenIM 通知指定的审核者进行代码审查
5. **CI 结果通知**：当 CI Pipeline 成功或失败时，自动通知 MR 发起人
6. **OpenIM 引用消息命令**：在 OpenIM 群中引用 MR 通知消息并回复命令，自动识别并执行（完整闭环）
7. **@ 消息支持**：OpenIM 通知支持 @ 用户，与钉钉功能对齐
8. **事件记录**：记录所有收到的 Webhook 事件，方便后续数据统计和分析
9. **Webhook 集成**：可配置到 GitLab Webhook 中供 CI/CD 配合使用

## 快速开始

### 安装依赖

```bash
bun install
```

### 启动服务

```bash
bun --cwd=standard/devops/chatops run start

# 自定义配置
bun src/main.ts \
  --port=3000 \
  --gitlab-url=https://gitlab.example.com \
  --gitlab-token=your-gitlab-token \
  --gitlab-webhook-secret=your-webhook-secret \
  --dingtalk-webhook-url=https://oapi.dingtalk.com/robot/send?access_token=xxx \
  --dingtalk-secret=your-dingtalk-secret
```

### 环境变量

支持通过环境变量或命令行参数配置：

```bash
# 环境变量
PORT=3000
HOSTNAME=0.0.0.0
GITLAB_URL=https://gitlab.example.com
GITLAB_TOKEN=your-gitlab-token
GITLAB_WEBHOOK_SECRET=your-webhook-secret
DINGTALK_WEBHOOK_URL=https://oapi.dingtalk.com/robot/send?access_token=xxx
DINGTALK_SECRET=your-dingtalk-secret

# GitLab 用户到钉钉手机号的映射配置（可选）
# 方式1: 通过环境变量（JSON 格式）
GITLAB_DINGTALK_MAPPING='{"gitlab_user1":["13800000001"],"gitlab_user2":["13800000002","13800000003"]}'

# 方式2: 通过配置文件（默认路径：./user-mapping.json）
USER_MAPPING_FILE=./user-mapping.json

# GitLab 用户到 OpenIM userID 的映射（可选，用于 Open-Cube 渠道后续消息中 @ 用户）
GITLAB_OPENIM_MAPPING='{"gitlab_user1":"openim_user_id_1","gitlab_user2":"openim_user_id_2"}'

# OpenIM @ 消息配置（可选）
OPENIM_SHOW_AT_MENTION_IN_TEXT=false  # 是否在消息文本中显示 @ 标记，默认 false

# 事件记录文件路径（可选，如果不配置则不记录事件）
EVENT_LOG_FILE_PATH=./logs/events.jsonl
```

### 用户映射配置

系统支持将 GitLab 用户名映射到钉钉手机号，支持多对一映射（多个 GitLab 用户对应同一个钉钉手机号）。

**配置文件格式** (`user-mapping.json`):

```json
{
  "gitlab_user1": ["13800000001"],
  "gitlab_user2": ["13800000002", "13800000003"],
  "dank": ["13800000001"]
}
```

**配置优先级**：
1. 环境变量 `GITLAB_DINGTALK_MAPPING`（最高优先级）
2. 配置文件（通过 `USER_MAPPING_FILE` 指定，默认 `./user-mapping.json`）
3. 默认配置（空配置）

**注意事项**：
- 如果没有配置映射，钉钉消息中不会 @ 特定用户
- 钉钉消息会使用 `atMobiles` 字段来 @ 用户，确保手机号正确

**OpenIM userID 映射**（Open-Cube 渠道）：
- 通过环境变量 `GITLAB_OPENIM_MAPPING` 配置，JSON 格式：`{"gitlab_用户名":"openim_userID"}` 或 `{"gitlab_用户名":["openim_userID1","openim_userID2"]}`
- 用于在 OpenIM 消息中 @ 用户（使用 `contentType=106` 的 @ 消息类型）
- **@ 消息功能说明**：
  - 当发送通知时，如果有 @ 用户，系统会自动使用 `contentType=106`（@ 消息类型）
  - @ 消息会通过 OpenIM 通知被 @ 的用户
  - 可选配置 `OPENIM_SHOW_AT_MENTION_IN_TEXT=true` 在消息文本开头显示 `@用户名` 标记
  - 如果没有配置用户映射，将不会 @ 任何用户（只发送普通文本消息）

## 配置 GitLab Webhook

1. 在 GitLab 项目中，导航至 **设置** > **Webhooks**
2. 添加新的 Webhook，URL 指向您的 ChatOps 服务地址：`http://your-server:3000/webhook/gitlab`
3. 选择需要触发的事件：
   - ✅ **Merge request events** - 用于监听 MR 标题和审核状态变化
   - ✅ **Comments** - 用于处理评论命令
4. 如果配置了 `GITLAB_WEBHOOK_SECRET`，在 **Secret token** 字段填入相同的值
5. 保存 Webhook 设置

## 使用说明

### 命令列表

#### `/submit`

自动检查 CI 状态，如果未通过则触发 CI，通过后自动合并 MR。

**使用示例：**
```
/submit
```

**工作流程：**
1. 检查当前 MR 的最新 Pipeline 状态
2. 如果 Pipeline 通过，自动合并 MR
3. 如果 Pipeline 失败，重新触发 Pipeline
4. 如果 Pipeline 正在运行，提示等待

#### `/help`

显示支持的命令列表和说明。

**使用示例：**
```
/help
```

#### `/reviewer @username1 @username2`

指定审核者，系统会通过钉钉通知相关人员。

**使用示例：**
```
/reviewer @zhangsan @lisi
```

**注意事项：**
- 需要在评论中使用 `@` 符号提及用户名
- 系统会自动提取所有 `@` 提及的用户
- 需要配置钉钉机器人才能发送通知

### 自动触发场景

#### 1. MR 标题变化

当 Merge Request 的标题发生变化时，系统会自动触发新的 CI Pipeline。

#### 2. 审核者变化

当 Merge Request 的审核者列表发生变化时，系统会自动触发新的 CI Pipeline。

#### 3. 批准事件

当 Merge Request 被批准时，系统会自动触发新的 CI Pipeline，但不会发送审核通知（批准后会触发 CI，CI 结果会通过通知发送）。

#### 4. CI 结果通知

当 CI Pipeline 执行完成（成功或失败）时，系统会自动通知 MR 发起人：
- **成功**：通知发起人 CI 检查通过，可以使用 `/submit` 命令提交合并
- **失败**：通知发起人 CI 检查失败，需要检查 CI 日志并修复问题

**跳过失败通知**：系统支持多种方式配置跳过失败通知：

**方式 1：通过 pipeline 级别变量（推荐用于临时场景）**

在 `.gitlab-ci.yaml` 中设置 pipeline 级别变量 `SKIP_NOTIFICATION: "true"`：

```yaml
variables:
  SKIP_NOTIFICATION: "true"  # 设置此变量时，即使 CI 失败也不发送钉钉通知

stages:
  - approval-check
  - mr-checks
```

**方式 2：通过配置跳过的 stage（推荐用于固定场景）**

在 `.gitlab-ci.yaml` 中配置需要跳过通知的 stage 列表：

```yaml
variables:
  SKIP_NOTIFICATION_STAGES: ["approval-check", "other-stage"]  # 这些 stage 失败时不发送通知

stages:
  - approval-check
  - mr-checks
```

或者使用注释方式（更灵活）：

```yaml
stages:
  - approval-check
  - mr-checks

# skip-notification: approval-check
approval-check:
  stage: approval-check
  # ... 其他配置
```

**方式 3：自动识别（向后兼容）**

系统会自动识别 `approval-check` stage 失败，不发送通知（无需配置）。

**注意**：
- 方式 1 的变量需要在 pipeline 级别设置（在 `variables` 部分），不能只在 job 级别设置
- 方式 2 支持在 `variables` 中定义数组，或在注释中使用 `# skip-notification: stage-name` 格式
- 如果所有失败的 stage 都在跳过列表中，系统将不会发送失败通知
- 如果获取配置失败（如权限问题），系统会默认发送通知，确保功能可用性
- 配置会被缓存 5 分钟，以提高性能

### OpenIM 引用消息命令（完整闭环）

系统支持在 OpenIM 群中通过引用机器人发送的 MR 通知消息来执行命令，实现完整的闭环操作。

**功能说明**：

1. **自动识别引用消息**：当用户在 OpenIM 群中引用机器人发送的 MR 通知消息并回复命令时，系统会自动识别
2. **提取 MR 信息**：从引用消息中提取 GitLab MR URL，解析项目路径和 MR IID
3. **执行命令**：调用相应的命令处理器（如 `/submit`、`/ci`、`/review` 等）
4. **回复结果**：将处理结果发送回 OpenIM 群

**使用示例**：

```
# 机器人发送 CI 失败通知
❌ 【CI】CI 检查失败
项目: ghcloud-test
合并请求: Update readme.md
链接: http://git.example.com/project/repo/-/merge_requests/14
状态: CI Pipeline 执行失败

# 用户引用上面的消息并回复
[引用消息] @机器人 submit

# 系统自动处理并回复
✅ CI 检查通过，MR 已自动合并！
```

**支持的命令**：
- `submit` / `merge` / `sm` / `9527` - 自动提交合并
- `ci` - 重新触发 CI
- `review` - AI 代码审查
- `reviewer @user1 @user2` - 指定审核者
- `cc @user1 @user2 [消息]` - 发送抄送通知
- `help` - 显示帮助信息

**详细文档**：参见 [openim-quote-command-guide.md](./openim-quote-command-guide.md)

### 事件记录

系统支持记录所有收到的 Webhook 事件，记录的信息包括：
- 事件类型（merge_request、note、pipeline 等）
- 事件概要（MR 操作、Pipeline 状态等）
- 仓库信息（项目 ID、名称、路径等）
- 发起者信息（用户 ID、用户名、姓名等）
- 时间戳（ISO 8601 格式）

事件记录以 JSON Lines 格式（每行一个 JSON 对象）保存到指定文件，方便后续进行数据统计和分析。

**配置方式**：
- 通过环境变量 `EVENT_LOG_FILE_PATH` 指定记录文件路径
- 通过命令行参数 `--event-log-file-path` 指定记录文件路径
- 如果不配置，则不记录事件（不影响其他功能）

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
│   └── webhook.controller.ts       # GitLab Webhook 处理
├── clients/                         # HTTP 客户端
│   └── gitlab-client.ts            # GitLab API 客户端
└── services/                        # 服务层
    ├── chatops.service.ts          # ChatOps 核心业务逻辑
    ├── comment-command.service.ts  # 评论命令处理
    └── dingtalk.service.ts         # 钉钉机器人服务
```

## 技术栈

- **框架**: `@dangao/bun-server` - 基于 Bun 的 Web 框架
- **运行时**: Bun
- **API**: GitLab API v4
- **通知**: 钉钉机器人

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

## 配置说明

### GitLab Token 权限

GitLab Token 需要以下权限：
- `api` - 访问 GitLab API
- `write_repository` - 触发 Pipeline 和合并 MR

### 钉钉机器人配置

1. 在钉钉群聊中添加自定义机器人
2. 获取 Webhook URL
3. 如果启用了签名验证，获取 Secret
4. 在配置中填入相应的值

## 注意事项

1. **Webhook 安全**：建议配置 `GITLAB_WEBHOOK_SECRET` 以验证 Webhook 请求的合法性
2. **GitLab Token**：确保 Token 有足够的权限执行所需操作
3. **钉钉通知**：钉钉机器人通知是可选的，如果不配置，`/reviewer` 命令会失败
4. **CI Pipeline**：确保 GitLab 项目已配置 CI/CD Pipeline
5. **错误处理**：服务会自动记录错误日志，建议配置日志收集系统

## 相关资源

- [@dangao/bun-server 文档](https://github.com/dangaogit/bun-server)
- [GitLab API 文档](https://docs.gitlab.com/ee/api/)
- [GitLab Webhooks 文档](https://docs.gitlab.com/ee/user/project/integrations/webhooks.html)
- [钉钉机器人文档](https://open.dingtalk.com/document/robots/custom-robot-access)

