# 三方 Webhook 与 OpenAPI 文档

本文档面向**第三方业务服务**：说明本服务如何向三方推送「@
机器人」消息（Webhook），以及三方如何调用本服务**发送消息**（OpenAPI）。

---

## 一、概述

- **本服务角色**：接收 OpenIM 群消息回调；当用户在某群内 @
  配置的机器人时，将清洗后的消息 **POST 推送到三方配置的 Webhook
  URL**。本服务**不再自动回复**，由三方根据业务决定是否回复及回复内容。
- **三方需提供**：一个可公网访问的 Webhook URL（本服务会 POST 推送 payload）。
- **三方可调用**：本服务提供的
  **OpenAPI：发送消息**，用于以机器人身份在群内发送消息（需配置 API Key）。

---

## 二、Webhook（本服务 → 三方）

### 2.1 何时推送

当同时满足以下条件时，本服务会向三方配置的 `OPENIM_WEBHOOK_FORWARD_URL` 发起一次
**POST** 请求：

1. OpenIM 回调为群消息发送后（`callbackAfterSendGroupMsgCommand`）；
2. 消息所在群 ID 在配置的 `OPENIM_WEBHOOK_GROUP_IDS` 中；
3. 消息的 `atUserList` 中包含配置的机器人
   userID（`OPENIM_WEBHOOK_BOT_USER_IDS`）。

### 2.2 请求说明

| 项目    | 说明                                                            |
| ------- | --------------------------------------------------------------- |
| 方法    | `POST`                                                          |
| URL     | 由本服务配置的 `OPENIM_WEBHOOK_FORWARD_URL`（即三方的接收地址） |
| Headers | `Content-Type: application/json`                                |
| Body    | JSON，结构见下方                                                |

### 2.3 Body 结构（ThirdPartyWebhookPayload）

| 字段             | 类型   | 说明                                                                                |
| ---------------- | ------ | ----------------------------------------------------------------------------------- |
| `event`          | string | 固定为 `"bot_at"`                                                                   |
| `timestamp`      | string | 服务端生成时间，ISO 8601                                                            |
| `groupID`        | string | 群 ID                                                                               |
| `botUserID`      | string | 被 @ 的机器人 userID                                                                |
| `cleanedContent` | string | 清洗后的消息文本（已去掉 @ 提及并 trim，如 `"@机器人 1 号 /submit"` → `"/submit"`） |
| `sendID`         | string | 发送者 userID                                                                       |
| `senderNickname` | string | 发送者昵称（可选）                                                                  |
| `rawContent`     | string | 原始 content 字符串（可选，便于排查）                                               |

### 2.4 示例（三方接收到的 Body）

```json
{
  "event": "bot_at",
  "timestamp": "2026-01-31T12:00:00.000Z",
  "groupID": "490056108",
  "botUserID": "7388116624",
  "cleanedContent": "/submit",
  "sendID": "7662119666",
  "senderNickname": "admin",
  "rawContent": "{\"text\":\"@机器人 1 号 /submit\",\"atUserList\":[\"7388116624\"],\"atUsersInfo\":[{\"atUserID\":\"7388116624\",\"groupNickname\":\"机器人 1 号\"}]}"
}
```

### 2.5 三方接口建议

- **响应**：建议三方在收到 Webhook 后尽快返回
  **2xx**，本服务仅做推送，不解析响应体；超时或非 2xx 会打错误日志。
- **幂等**：可根据 `timestamp` + `groupID` + `sendID` + `cleanedContent`
  等做去重，避免重复处理。
- **安全**：可在本服务与三方之间约定 Header 签名或固定
  Token（需本服务扩展），当前版本为明文 POST。

---

## 三、OpenAPI：发送消息（三方 → 本服务）

三方在收到 Webhook
后，若需以机器人身份在群内回复，可调用本服务提供的**发送消息**接口。

### 3.1 鉴权

| 方式          | 说明                                     |
| ------------- | ---------------------------------------- |
| **X-API-Key** | 请求头 `X-API-Key: <API_KEY>`，推荐      |
| **Bearer**    | 请求头 `Authorization: Bearer <API_KEY>` |

`<API_KEY>` 由本服务配置的 `OPENIM_OPENAPI_API_KEY` 提供，三方需妥善保管。

### 3.2 发送消息

**请求**

| 项目    | 说明                                                                          |
| ------- | ----------------------------------------------------------------------------- |
| 方法    | `POST`                                                                        |
| URL     | `{BASE_URL}/openapi/msg/send`，例如 `http://localhost:10006/openapi/msg/send` |
| Headers | `Content-Type: application/json`，以及鉴权头（见上）                          |
| Body    | JSON，见下表                                                                  |

**Body 参数**

| 字段             | 类型                  | 必填 | 说明                                                                                                      |
| ---------------- | --------------------- | ---- | --------------------------------------------------------------------------------------------------------- |
| `sendID`         | string                | 是   | 发送者 userID（如机器人 userID）                                                                          |
| `groupID`        | string                | 是   | 群 ID                                                                                                     |
| `content`        | string \| object      | 是   | 消息内容：<br/>- `contentType=101`（文本）：字符串<br/>- `contentType=106`（@ 消息）：对象，见下文说明 |
| `contentType`    | number                | 否   | 消息类型：<br/>- `101`：文本消息（默认）<br/>- `106`：@ 消息<br/>- 其他：见 OpenIM 文档                  |
| `sessionType`    | number                | 否   | 会话类型，默认 `3`（群聊）                                                                                |
| `senderNickname` | string                | 否   | 发送者昵称                                                                                                |
| `senderFaceURL`  | string                | 否   | 发送者头像 URL                                                                                            |

**@ 消息 content 对象格式**（当 `contentType=106` 时）

| 字段         | 类型     | 必填 | 说明                                                  |
| ------------ | -------- | ---- | ----------------------------------------------------- |
| `text`       | string   | 是   | 消息文本内容，可包含 `@用户名` 标记（用于展示）       |
| `atUserList` | string[] | 是   | 需要 @ 的 OpenIM userID 列表，使用 `"AtAllTag"` 表示 @ 所有人 |
| `isAtSelf`   | boolean  | 否   | 是否 @ 自己，默认 `false`                             |

**成功响应示例**（HTTP 200）

```json
{
  "errCode": 0,
  "errMsg": "",
  "data": {
    "serverMsgID": "8698dd5d163dd79b8fdfa333fee06f40",
    "clientMsgID": "1ca0e4cf279ad5cce6b28331b2b42092",
    "sendTime": 1679558582010
  }
}
```

**失败响应示例**

- 鉴权失败（401）：`errCode` 非 0 或框架返回 401。
- 参数错误（400）：`errCode: 400, errMsg: "sendID, groupID, content are required"`。
- 服务端错误（500）：`errCode: 500, errMsg: "<错误信息>"`。

### 3.3 调用示例

#### 3.3.1 发送普通文本消息

**cURL（X-API-Key）**

```bash
curl -X POST "http://localhost:10006/openapi/msg/send" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: YOUR_API_KEY" \
  -d '{
    "sendID": "7388116624",
    "groupID": "490056108",
    "content": "收到，正在处理 /submit"
  }'
```

**cURL（Bearer）**

```bash
curl -X POST "http://localhost:10006/openapi/msg/send" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "sendID": "7388116624",
    "groupID": "490056108",
    "content": "收到，正在处理 /submit"
  }'
```

#### 3.3.2 发送 @ 消息

**cURL（@ 单个用户）**

```bash
curl -X POST "http://localhost:10006/openapi/msg/send" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: YOUR_API_KEY" \
  -d '{
    "sendID": "7388116624",
    "groupID": "490056108",
    "contentType": 106,
    "content": {
      "text": "@张三 你好，请查看这个消息",
      "atUserList": ["user_123"],
      "isAtSelf": false
    }
  }'
```

**cURL（@ 多个用户）**

```bash
curl -X POST "http://localhost:10006/openapi/msg/send" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: YOUR_API_KEY" \
  -d '{
    "sendID": "7388116624",
    "groupID": "490056108",
    "contentType": 106,
    "content": {
      "text": "@张三 @李四 大家好，请关注这个重要通知",
      "atUserList": ["user_123", "user_456"],
      "isAtSelf": false
    }
  }'
```

**cURL（@ 所有人）**

```bash
curl -X POST "http://localhost:10006/openapi/msg/send" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: YOUR_API_KEY" \
  -d '{
    "sendID": "7388116624",
    "groupID": "490056108",
    "contentType": 106,
    "content": {
      "text": "@所有人 重要通知：系统将在今晚进行维护",
      "atUserList": ["AtAllTag"],
      "isAtSelf": false
    }
  }'
```

**JavaScript (fetch) - 文本消息**

```javascript
const res = await fetch("http://localhost:10006/openapi/msg/send", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-API-Key": process.env.OPENIM_OPENAPI_API_KEY,
  },
  body: JSON.stringify({
    sendID: "7388116624",
    groupID: "490056108",
    content: "收到，正在处理 /submit",
  }),
});
const data = await res.json();
if (data.errCode === 0) {
} else {
  (function(){})("发送失败", data.errMsg);
}
```

**JavaScript (fetch) - @ 消息**

```javascript
// @ 单个用户
const res = await fetch("http://localhost:10006/openapi/msg/send", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-API-Key": process.env.OPENIM_OPENAPI_API_KEY,
  },
  body: JSON.stringify({
    sendID: "7388116624",
    groupID: "490056108",
    contentType: 106, // @ 消息类型
    content: {
      text: "@张三 你好，请查看这个消息",
      atUserList: ["user_123"],
      isAtSelf: false,
    },
  }),
});
const data = await res.json();
if (data.errCode === 0) {
} else {
  (function(){})("发送失败", data.errMsg);
}
```

**Python (requests) - 文本消息**

```python
import os
import requests

url = "http://localhost:10006/openapi/msg/send"
headers = {
    "Content-Type": "application/json",
    "X-API-Key": os.environ.get("OPENIM_OPENAPI_API_KEY"),
}
payload = {
    "sendID": "7388116624",
    "groupID": "490056108",
    "content": "收到，正在处理 /submit",
}
r = requests.post(url, json=payload, headers=headers)
data = r.json()
if data.get("errCode") == 0:
    print("发送成功", data.get("data"))
else:
    print("发送失败", data.get("errMsg"))
```

**Python (requests) - @ 消息**

```python
import os
import requests

url = "http://localhost:10006/openapi/msg/send"
headers = {
    "Content-Type": "application/json",
    "X-API-Key": os.environ.get("OPENIM_OPENAPI_API_KEY"),
}

# @ 单个用户
payload = {
    "sendID": "7388116624",
    "groupID": "490056108",
    "contentType": 106,  # @ 消息类型
    "content": {
        "text": "@张三 你好，请查看这个消息",
        "atUserList": ["user_123"],
        "isAtSelf": False,
    },
}
r = requests.post(url, json=payload, headers=headers)
data = r.json()
if data.get("errCode") == 0:
    print("@ 消息发送成功", data.get("data"))
else:
    print("发送失败", data.get("errMsg"))
```

---

## 四、本服务配置摘要（供运维参考）

| 环境变量                          | 说明                                                                                                       |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `OPENIM_WEBHOOK_FORWARD_URL`      | 三方 Webhook URL，收到 @ 机器人时 POST 推送；不配置则不推送                                                |
| `OPENIM_OPENAPI_API_KEY`          | 三方调用发送消息接口的鉴权 Key；不配置则接口不可用                                                         |
| `OPENIM_WEBHOOK_GROUP_IDS`        | 监听的群 ID，逗号分隔                                                                                      |
| `OPENIM_WEBHOOK_BOT_USER_IDS`     | 监听的机器人 userID，逗号分隔                                                                              |
| `OPENIM_SHOW_AT_MENTION_IN_TEXT`  | 是否在消息文本中显示 @ 标记（如：@张三），默认 `false`。启用后会在消息开头添加 @ 用户名标记（仅影响显示） |
| `GITLAB_OPENIM_MAPPING`           | GitLab 用户名到 OpenIM userID 的映射，用于后续消息中 @ 用户；JSON，如 `{"gitlab_user1":"openim_id_1"}`    |

更多配置见项目根目录 `.env.example` 与 `README.md`。

---

## 五、流程小结

1. 用户在群内 @ 机器人并发送消息。
2. OpenIM 回调本服务；本服务匹配群 + 机器人后，将清洗后的内容 POST 到三方
   `OPENIM_WEBHOOK_FORWARD_URL`。
3. 三方收到 Webhook，根据 `cleanedContent`、`groupID`、`botUserID`
   等执行业务逻辑。
4. 若需回复，三方调用本服务 `POST /openapi/msg/send`，携带 `X-API-Key`，传入
   `sendID`（机器人）、`groupID`、`content` 等，由本服务代为调用 OpenIM
   发送消息。
