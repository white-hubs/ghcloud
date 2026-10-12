# 发送 @ 消息示例

本文档提供了使用 OpenIM @ 消息功能的完整示例，包括如何通过 OpenAPI 发送 @ 消息。

## 1. 发送文本消息（contentType=101）

普通文本消息，不 @ 任何用户。

```bash
curl -X POST http://localhost:3000/openapi/msg/send \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "sendID": "bot_123",
    "groupID": "group_456",
    "contentType": 101,
    "sessionType": 3,
    "content": "这是一条普通文本消息"
  }'
```

## 2. 发送 @ 消息（contentType=106）

### 2.1 @ 单个用户

```bash
curl -X POST http://localhost:3000/openapi/msg/send \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "sendID": "bot_123",
    "groupID": "group_456",
    "contentType": 106,
    "sessionType": 3,
    "content": {
      "text": "@张三 你好，请查看这个消息",
      "atUserList": ["user_123"],
      "isAtSelf": false
    }
  }'
```

### 2.2 @ 多个用户

```bash
curl -X POST http://localhost:3000/openapi/msg/send \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "sendID": "bot_123",
    "groupID": "group_456",
    "contentType": 106,
    "sessionType": 3,
    "content": {
      "text": "@张三 @李四 大家好，请关注这个重要通知",
      "atUserList": ["user_123", "user_456"],
      "isAtSelf": false
    }
  }'
```

### 2.3 @ 所有人

```bash
curl -X POST http://localhost:3000/openapi/msg/send \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "sendID": "bot_123",
    "groupID": "group_456",
    "contentType": 106,
    "sessionType": 3,
    "content": {
      "text": "@所有人 重要通知：系统将在今晚进行维护",
      "atUserList": ["AtAllTag"],
      "isAtSelf": false
    }
  }'
```

## 3. TypeScript/JavaScript 调用示例

### 3.1 发送文本消息

```typescript
async function sendTextMessage() {
  const response = await fetch("http://localhost:3000/openapi/msg/send", {
    method: "POST",
    headers: {
      "X-API-Key": "your-api-key",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sendID: "bot_123",
      groupID: "group_456",
      contentType: 101,
      sessionType: 3,
      content: "普通文本消息",
    }),
  });
  return await response.json();
}
```

### 3.2 发送 @ 消息

```typescript
async function sendAtMessage() {
  const response = await fetch("http://localhost:3000/openapi/msg/send", {
    method: "POST",
    headers: {
      "X-API-Key": "your-api-key",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sendID: "bot_123",
      groupID: "group_456",
      contentType: 106,
      sessionType: 3,
      content: {
        text: "@张三 请查看这个消息",
        atUserList: ["user_123"],
        isAtSelf: false,
      },
    }),
  });
  return await response.json();
}
```

### 3.3 发送 @ 多个用户

```typescript
async function sendMultipleAtMessage() {
  const response = await fetch("http://localhost:3000/openapi/msg/send", {
    method: "POST",
    headers: {
      "X-API-Key": "your-api-key",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sendID: "bot_123",
      groupID: "group_456",
      contentType: 106,
      sessionType: 3,
      content: {
        text: "@张三 @李四 大家好，请关注这个重要通知",
        atUserList: ["user_123", "user_456"],
        isAtSelf: false,
      },
    }),
  });
  return await response.json();
}
```

### 3.4 发送 @ 所有人

```typescript
async function sendAtAllMessage() {
  const response = await fetch("http://localhost:3000/openapi/msg/send", {
    method: "POST",
    headers: {
      "X-API-Key": "your-api-key",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sendID: "bot_123",
      groupID: "group_456",
      contentType: 106,
      sessionType: 3,
      content: {
        text: "@所有人 重要通知：系统将在今晚进行维护",
        atUserList: ["AtAllTag"],
        isAtSelf: false,
      },
    }),
  });
  return await response.json();
}
```

## 4. 参数说明

### content 字段（contentType=106 时）

| 字段       | 类型     | 必填 | 说明                                               |
| ---------- | -------- | ---- | -------------------------------------------------- |
| text       | string   | 是   | 消息文本内容，包含 @ 标记                          |
| atUserList | string[] | 是   | 被 @ 的用户 ID 列表，使用 "AtAllTag" 表示 @ 所有人 |
| isAtSelf   | boolean  | 否   | 是否 @ 自己，默认 false                            |

### 其他消息类型

根据 OpenIM 文档，其他消息类型的 content 结构：

- **101**：文本消息 - `{ content: "text" }` 或直接传字符串
- **102**：图片消息 - `{ sourcePath, sourcePicture, bigPicture, ... }`
- **103**：音频消息 - `{ uuid, soundPath, sourceUrl, ... }`
- **104**：视频消息 - `{ videoPath, videoUrl, ... }`
- **105**：文件消息 - `{ filePath, sourceUrl, fileName, ... }`
- **106**：@ 消息 - `{ text, atUserList, isAtSelf }`
- **109**：位置消息 - `{ description, longitude, latitude }`
- **110**：自定义消息 - `{ data, description, extension }`

## 5. 响应示例

### 成功响应

```json
{
  "errCode": 0,
  "errMsg": "",
  "data": {
    "serverMsgID": "8698dd5d163dd79b8fdfa333fee06f40",
    "clientMsgID": "1ca0e4cf279ad5cce6b28331b2b42092",
    "sendTime": 1679558586210
  }
}
```

### 失败响应

```json
{
  "errCode": 1203,
  "errMsg": "Bot 'bot_123' is not in group 'group_456'. Please add the bot to the group first via OpenIM client or REST API."
}
```

## 6. 配置说明

### 6.1 环境变量配置

在使用 @ 消息功能前，需要配置以下环境变量：

```bash
# OpenIM 配置
OPENIM_OPENAPI_API_KEY=your-secret-api-key
OPENIM_WEBHOOK_GROUP_IDS=490056108
OPENIM_WEBHOOK_BOT_USER_IDS=7388116624
OPENIM_OPENAPI_SEND_URL=http://192.168.4.126:10006/openapi/msg/send
OPENIM_OPENAPI_FORWARD_API_KEY=your-secret-api-key
OPENIM_SEND_ID=chatops-bot

# @ 消息配置（可选）
OPENIM_SHOW_AT_MENTION_IN_TEXT=false  # 是否在消息文本中显示 @ 标记

# 用户映射配置（必须配置才能使用 @ 功能）
GITLAB_OPENIM_MAPPING='{"gitlab_user1":"openim_user_id_1","gitlab_user2":"openim_user_id_2"}'
```

### 6.2 用户映射配置

要使用 @ 功能，必须配置 GitLab 用户名到 OpenIM userID 的映射：

```bash
# 格式：{"gitlab_username":"openim_userid"}
GITLAB_OPENIM_MAPPING='{"dank":"7388116624","user2":"userid2"}'
```

如果不配置用户映射，系统将只发送普通文本消息，不会 @ 任何用户。

### 6.3 消息文本中显示 @ 标记

通过设置 `OPENIM_SHOW_AT_MENTION_IN_TEXT=true`，可以在消息文本开头自动添加 `@用户名` 标记：

```bash
OPENIM_SHOW_AT_MENTION_IN_TEXT=true
```

启用后，发送的消息格式为：

```
@user1 @user2 原始消息内容
```

注意：
- 实际的 @ 功能由 `atUserList` 控制，此选项仅影响文本显示
- 默认为 `false`（不显示 @ 标记）

## 7. 注意事项

1. **机器人必须在群组中**：发送群消息前，确保机器人已加入目标群组
2. **@ 所有人权限**：某些群组可能限制 @ 所有人的权限
3. **text 字段格式**：text 中的 @ 标记（如 "@张三"）主要用于展示，实际的 @ 功能由 atUserList 控制
4. **兼容性**：系统会自动兼容旧的字符串格式（contentType=101 时）
5. **用户映射**：必须配置 `GITLAB_OPENIM_MAPPING` 才能使用 @ 功能

## 8. ChatOps 服务自动 @ 功能

ChatOps 服务在以下场景会自动发送 @ 消息：

### 8.1 MR 审核通知

当 MR 创建或审核者变更时，会自动 @ 审核者：

```typescript
// 系统会自动：
// 1. 从 GITLAB_OPENIM_MAPPING 获取审核者的 OpenIM userID
// 2. 使用 contentType=106 发送 @ 消息
// 3. 根据 OPENIM_SHOW_AT_MENTION_IN_TEXT 决定是否在文本中显示 @ 标记
```

### 8.2 Pipeline 成功/失败通知

当 Pipeline 成功或失败时，会自动 @ MR 发起人：

```typescript
// 系统会自动 @ MR 发起人，通知 Pipeline 状态
```

### 8.3 /reviewer 命令

使用 `/reviewer @user1 @user2` 命令时，会自动 @ 指定的审核者：

```bash
# 在 GitLab MR 评论中使用
/reviewer @user1 @user2
```

### 8.4 /cc 命令

使用 `/cc @user1 @user2 [消息]` 命令时，会自动 @ 指定的抄送用户：

```bash
# 在 GitLab MR 评论中使用
/cc @user1 @user2 请知悉这个变更
```

## 9. 故障排查

### 9.1 @ 消息未发送

**问题**：发送的消息没有 @ 用户

**解决方法**：
1. 检查是否配置了 `GITLAB_OPENIM_MAPPING`
2. 确认 GitLab 用户名和 OpenIM userID 映射正确
3. 查看日志，确认是否成功映射到 OpenIM userID

### 9.2 @ 消息显示不正确

**问题**：消息中看不到 @ 标记

**解决方法**：
1. 检查 `OPENIM_SHOW_AT_MENTION_IN_TEXT` 配置
2. 如果设置为 `false`，消息文本中不会显示 @ 标记（但 @ 功能仍然有效）
3. 如果需要显示 @ 标记，设置为 `true`

### 9.3 Bot 发送失败

**问题**：返回 "Bot is not in group" 错误

**解决方法**：
1. 确认机器人已加入目标群组
2. 检查 `OPENIM_WEBHOOK_GROUP_IDS` 配置是否正确
3. 通过 OpenIM 客户端或 REST API 将机器人添加到群组

### 9.4 鉴权失败

**问题**：返回 401 错误

**解决方法**：
1. 检查 `OPENIM_OPENAPI_API_KEY` 配置
2. 确认请求头中包含正确的 API Key
3. 使用 `X-API-Key` 或 `Authorization: Bearer <key>` 格式

## 10. 相关文档

- [open-cube.webhook.md](./open-cube.webhook.md) - OpenIM Webhook 和 OpenAPI 完整文档
- [readme.md](./readme.md) - ChatOps 服务使用说明
- [CHANGELOG.md](./CHANGELOG.md) - 版本更新日志
