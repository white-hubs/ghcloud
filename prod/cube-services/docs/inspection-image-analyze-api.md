# 巡检图片 AI 分析接口

## 接口

- Method: `POST`
- Path: `/gw-bff/inspection/image/analyze`
- SDK: `inspectionAiClient.analyzeInspectionImage`

## 请求示例

```json
{
  "id": "2057430000000000001",
  "objId": "2057430000000000002",
  "images": "2056638315683213313"
}
```

`images` 是单个文件 ID 字符串。BFF 会先调用日常巡检后端 `/inspect-task/{id}/performInspection` 获取巡检对象和标准，再通过文件服务 `/file/getByte/{id}` 获取图片字节，上传到 AI Application Flow 后调用 Flow 执行。

## 成功响应

```json
{
  "targetName": "公司大门",
  "images": ["2057434655713050625"],
  "safetyTips": ["佩戴安全帽", "断电后操作"],
  "totalCount": 1,
  "normalCount": 1,
  "abnormalCount": 0,
  "unrecognizedCount": 0,
  "normalItems": [
    {
      "standardId": "standard_001",
      "standardName": "公司大门日常巡检标准",
      "standardItems": [
        {
          "itemId": "item_001",
          "itemName": "检查配电柜柜门是否关闭",
          "resultVO": {
            "id": "result_001",
            "name": "巡检结果",
            "options": [
              { "itemName": "正常", "itemValue": "0", "errorFlag": false },
              { "itemName": "异常", "itemValue": "1", "errorFlag": true }
            ]
          },
          "result": {
            "id": "result_001",
            "name": "巡检结果",
            "itemName": "正常",
            "itemValue": "0",
            "errorFlag": false
          }
        }
      ],
      "problemDescription": "",
      "evidence": "监控画面显示公司右侧的玻璃大门处于关闭状态，门体无明显损坏或异常。",
      "confidence": 0.95,
      "needManualReview": false
    }
  ],
  "abnormalItems": [],
  "unrecognizedItems": []
}
```

## 失败响应

```json
{
  "code": "INVALID_PARAM",
  "message": "请求参数不合法",
  "traceId": "trace_...",
  "errors": [
    { "code": "INVALID_PARAM", "message": "images 必须为非空文件 ID 字符串" }
  ]
}
```

## 规则

结果按顶层 `normalItems`、`abnormalItems`、`unrecognizedItems` 分类返回。

`needManualReview` 规则：

- 异常项和未识别项固定为 `true`
- 正常项置信度 `< 0.8` 时为 `true`
- 正常项置信度 `>= 0.8` 时为 `false`

## Flow 配置

巡检图片分析不直接调用大模型，不在 BFF 中拼接 prompt。Flow 编排内部负责 prompt、模型选择和图文解析。

- `FILE_SERVICE_URL`：文件服务 Base URL，默认 `http://localhost:3200`
- `DAILY_INSPECTION_URL`：日常巡检后端服务 Base URL，默认 `http://localhost:3200/maintain`
- `AI_APPLICATION_URL`：AI Application 服务 Base URL，默认 `http://localhost:3100`

Flow ID 通过字典获取：

- `itemCode=BUSINESS_AI_FLOW`
- `code=INSPECTION_AI_FLOW`
- `variable` JSON 中读取 `inspectExecute`

示例：

```bash
FILE_SERVICE_URL=http://localhost:3200
DAILY_INSPECTION_URL=http://localhost:3200/maintain
AI_APPLICATION_URL=http://localhost:3100
```

BFF 通过 Flow SDK 的 console/studio 调用方式上传图片并执行 Flow，对应路径由 SDK 生成：

- `POST {AI_APPLICATION_URL}/flow/console/studio/{flowId}/files`
- `POST {AI_APPLICATION_URL}/flow/console/studio/{flowId}/run`

Flow run payload 只包含 `input.query` 和 `input.files`，不再手写请求旧的 `/ai/flows` HTTP 接口。

Flow 仅返回扁平分析结果，标准名称、标准项名称、分组、统计和兜底未识别都由 BFF 按后端 `performInspection` 返回的原始 `standardVOS` 回填。
