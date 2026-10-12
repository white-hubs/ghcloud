## 0.6.1

### Patch Changes

- 版本更新: 0.6.1

# Changelog

## 未发布

### 新增功能

- **OpenIM 引用消息命令处理闭环**
  - 实现了从 OpenIM 群消息到 GitLab MR 命令的完整闭环
  - 当收到引用 GitLab MR 通知消息的回复时，自动识别并处理命令
  - 支持的场景：
    - 用户在 OpenIM 群中引用机器人发送的 MR 通知消息
    - 回复中包含命令（如 `@机器人ID submit`）
    - 系统自动解析 MR URL，提取项目和 MR 信息
    - 调用对应的命令处理器（如 `/submit`、`/ci`、`/review` 等）
    - 将处理结果发送回 OpenIM 群
  - 支持所有 GitLab MR 命令：`submit`、`ci`、`review`、`reviewer`、`cc`、`help`
  - 功能与 GitLab 评论命令完全对齐
  - 新增 `OpenIMQuoteMessage` 接口定义引用消息结构
  - 更新 `OpenImCallbackController`，添加完整的命令处理逻辑

- **OpenIM @ 消息支持**
  - 实现了与钉钉类似的 @ 消息功能
  - 当发送 OpenIM 通知时，自动使用 `contentType=106`（@ 消息类型）
  - 支持 @ 单个用户、多个用户和所有人
  - 新增环境变量 `OPENIM_SHOW_AT_MENTION_IN_TEXT`（默认 `false`）
    - 启用后会在消息文本开头显示 `@用户名` 标记
    - 实际的 @ 功能由 `atUserList` 控制，此选项仅影响文本显示
  - 更新了 `OpenApiSendMsgBody` 接口，支持 `content` 为字符串或对象格式
  - 更新了 OpenAPI 文档，添加了 @ 消息的使用示例

- 添加钉钉推送和 OpenIM 推送的开关控制
  - 新增环境变量 `ENABLE_DINGTALK_NOTIFICATION`（默认 `true`）
  - 新增环境变量 `ENABLE_OPENIM_NOTIFICATION`（默认 `true`）
  - 可以通过配置文件独立控制钉钉和 OpenIM 推送

- 支持配置 OpenIM 发送消息的机器人 ID
  - 新增环境变量 `OPENIM_SEND_ID`（默认 `chatops-bot`）
  - 允许通过配置文件自定义发送消息时使用的 sendID

### 功能修复

- 修复 OpenIM 消息未发送的问题
  - 在 `ChatOpsService` 中注入 `OpenCubeService`
  - 实现了 OpenIM 消息发送功能
  - 为以下场景添加了 OpenIM 通知：
    - MR 审核通知（创建/变更）
    - Pipeline 成功通知
    - Pipeline 失败通知
    - `/reviewer` 命令通知
    - `/cc` 命令抄送通知

### 配置说明

#### 环境变量配置

在 `.env` 文件中添加以下配置：

```bash
# 推送开关配置
ENABLE_DINGTALK_NOTIFICATION=true  # 是否启用钉钉通知
ENABLE_OPENIM_NOTIFICATION=true    # 是否启用 OpenIM 通知

# OpenIM 配置（已有）
OPENIM_OPENAPI_API_KEY=your-secret-api-key
OPENIM_WEBHOOK_GROUP_IDS=490056108
OPENIM_WEBHOOK_BOT_USER_IDS=7388116624
OPENIM_OPENAPI_SEND_URL=http://192.168.4.126:10006/openapi/msg/send
OPENIM_OPENAPI_FORWARD_API_KEY=your-secret-api-key
OPENIM_SEND_ID=chatops-bot  # OpenIM 发送消息时使用的机器人 ID（默认: chatops-bot）
OPENIM_SHOW_AT_MENTION_IN_TEXT=false  # 是否在消息文本中显示 @ 标记（默认: false）

# GitLab 用户名到 OpenIM userID 的映射配置（JSON 格式）
# 用于在 OpenIM 消息中 @ 用户
# 示例：GITLAB_OPENIM_MAPPING={"dank":"7388116624"}
GITLAB_OPENIM_MAPPING=
```

#### 用户映射配置

需要配置 GitLab 用户名到 OpenIM userID 的映射，才能在 OpenIM 消息中 @ 相应用户：

```bash
# 格式：{"gitlab_username":"openim_userid"}
GITLAB_OPENIM_MAPPING='{"dank":"7388116624","user2":"userid2"}'
```

如果不配置用户映射，OpenIM 消息仍会发送，但不会 @ 具体用户。

### 技术细节

#### 代码改动

1. **openim-callback.controller.ts**
   - 注入 `ChatOpsService`、`CommentCommandService`、`GitLabClient` 和 `ConfigService`
   - 添加 `parseGitLabMRUrl` 方法解析 GitLab MR URL
   - 添加 `extractQuoteMessage` 方法从 rawContent 提取引用消息
   - 添加 `extractGitLabMRUrlFromQuote` 方法从引用消息提取 MR URL
   - 添加 `sendResponseToGroup` 方法发送响应消息到 OpenIM 群
   - 更新 `handleCallbackAfterSendGroupMsg` 主处理逻辑：
     - 解析引用消息中的 GitLab MR URL
     - 提取项目路径和 MR IID
     - 清理并格式化命令文本
     - 调用 `ChatOpsService.handleCommentCommand` 处理命令
     - 将处理结果发送回 OpenIM 群
     - 如果不是引用 MR 的消息，则转发到三方 Webhook

2. **open-cube.service.ts**
   - 添加 `OpenIMQuoteMessage` 接口定义引用消息结构
   - 支持 `atTextElem` 字段提取消息文本和 @ 信息
   - 更新 `OpenApiSendMsgBody` 接口：
     - 将 `content` 类型从 `string` 改为 `string | OpenIMAtMessageContent | Record<string, unknown>`
     - 添加 `OpenIMAtMessageContent` 接口定义（包含 `text`、`atUserList`、`isAtSelf`）

3. **app.config.ts**
   - 添加 `enableDingtalkNotification` 和 `enableOpenimNotification` 配置项
   - 添加布尔值解析函数 `parseBool`
   - 添加 `showAtMentionInText` 配置项到 `openim` 配置中

4. **chatops.service.ts**
   - 注入 `OpenCubeService` 和 `ConfigService`
   - 添加 `sendOpenimMessage` 私有方法用于发送 OpenIM 消息
   - 实现 @ 消息功能：
     - 当有 `atUserList` 时，使用 `contentType=106`（@ 消息）
     - 构建包含 `text`、`atUserList`、`isAtSelf` 的 content 对象
     - 根据 `showAtMentionInText` 配置决定是否在文本中显示 @ 标记
   - 添加 `buildReviewNotificationOpenimContent` 方法构建审核通知内容
   - 修改所有通知方法，根据开关决定是否发送钉钉和 OpenIM 消息

#### 消息格式

OpenIM 消息格式与钉钉类似，包含：
- 通知类型（创建/变更/成功/失败/抄送）
- 项目名称
- MR 标题和链接
- 发起人/审核者信息
- 变更描述和文件清单（首次创建时）

#### @ 消息格式

当发送 OpenIM 通知时，如果有 @ 用户：
- 使用 `contentType=106`（@ 消息类型）
- `content` 为对象格式：
  ```json
  {
    "text": "消息内容",
    "atUserList": ["user_id_1", "user_id_2"],
    "isAtSelf": false
  }
  ```
- 如果启用了 `OPENIM_SHOW_AT_MENTION_IN_TEXT`，会在消息开头添加 `@用户名` 标记
- 支持 @ 单个用户、多个用户，以及使用 `"AtAllTag"` @ 所有人

#### 注意事项

1. 默认情况下，两个推送渠道都是开启的
2. 可以通过设置环境变量为 `false`、`0` 或 `no` 来禁用某个渠道
3. OpenIM 消息会发送到 `OPENIM_WEBHOOK_GROUP_IDS` 配置的第一个群
4. 需要正确配置 `OPENIM_OPENAPI_SEND_URL` 和相关鉴权信息
5. **必须配置用户映射（`GITLAB_OPENIM_MAPPING`）才能使用 @ 功能**
6. @ 消息功能说明：
   - 当有 @ 用户时，自动使用 `contentType=106`
   - 实际的 @ 功能由 `atUserList` 控制（OpenIM 会发送通知给被 @ 的用户）
   - `OPENIM_SHOW_AT_MENTION_IN_TEXT` 仅控制文本中是否显示 `@用户名` 标记，不影响 @ 功能本身
   - 如果没有配置用户映射，将不会 @ 任何用户（只发送普通文本消息）
