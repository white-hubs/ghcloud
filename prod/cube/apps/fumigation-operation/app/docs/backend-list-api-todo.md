# 熏蒸作业列表/详情 — Java 后端字段协作清单

> **落点仓库**：`cube2-new/packages/apps/security-management/server`  
> **Java 基路径**：`{securityManagementUrl}/fumigation-operations`  
> **BFF 代理**：`prod/cube-services/gateway/.../fumigation-operation-proxy.service.ts`  
> **前端消费**：`GET /gw-bff/security-management/fumigation/works`（列表）、`GET .../works/:id`（详情）

## 0. 已实现（2026-07-03）

Java `FumigationOperationListVO` 已补齐：

- `createUserName` / `applicantName` ← 实体 `creatorId` 经 `UserClient.listUserByIds` 解析姓名（非 `createBy` 账号）
- `approvalRecords[]` ← 批量查询审批记录（列表页 `x/2`）
- `pesticideTypeName` / `applicationMethodName` 空值时按枚举 code 回退
- 关键字搜索增加 `createBy`（申请人姓名）

`FumigationApprovalRecordVO` 已增加 BFF 兼容 getter：`approvalAction`、`approvalUserName`、`operatorName`、`nodeName`。

部署 `security-management` 服务后列表字段应正常展示。

## 1. 需 Java 补齐的字段（列表 + 详情均需）

以下字段在 BFF `BackendWork` 中已定义映射；**若 Java 未返回，前端列表会出现 `--`、审批进度 `0/2` 等占位表现**。

| 前端列/用途 | BFF 输出字段 | Java 建议字段（camelCase） | snake_case 别名（BFF 已兼容） | 类型 / 枚举 | 说明 |
| --- | --- | --- | --- | --- | --- |
| 工单编号 | `code` ← `operationNo` | `operationNo` | `operation_no` | string | 业务单号，列表主键展示 |
| 仓房 | `warehouseName` | **`warehouseName`** | `warehouse_name` | string | **必填展示**；当前环境无仓房编号，勿依赖 `warehouseCode` |
| 品种 | `grainVarietyName` | `grainVarietyName` | `grain_variety_name` | string | 列表「品种」列 |
| 药剂 | `pesticideTypeName` | **`pesticideTypeName`** | `pesticide_type_name` | string | 列表「药剂」列；可与 `pesticideTypeCode` 冗余中文名 |
| 申请人 | `applicantName` | **`createUserName`** 或 `applicantName` | `create_user_name` / `applicant_name` | string | **须为创单真实用户姓名**，勿返回占位符 |
| 状态 | `status` | `status` | — | 见 §2 | 与现有状态机一致 |
| 审批进度 | `approvalRecords[]` | **`approvalRecords`** | `approval_records` | array | 见 §3；用于列表 `x/2` |

### 列表接口

```
GET /fumigation-operations?pageNumber=1&pageSize=10&keyword=&status=
```

响应分页结构（与 BFF 一致）：

```json
{
  "total": 100,
  "pages": 10,
  "records": [ { /* BackendWork 字段 */ } ]
}
```

`keyword` 建议支持：`operationNo`、`warehouseName`、申请人姓名。

---

## 2. 状态枚举（Java → BFF 已映射）

| Java `status` | 前端 `status` |
| --- | --- |
| `SAFETY_APPROVING` | 安全审批中 |
| `TECH_APPROVING` | 技术审批中 |
| `PENDING_CHECK` | 待三步校验 |
| `CHECK_FAILED` | 校验未通过 |
| `PENDING_START` | 待开始作业 |
| `EXECUTING` | 执行中 |
| `ARCHIVED` | 已归档 |
| `REJECTED` | 已驳回 |

---

## 3. 审批记录 `approvalRecords`（列表审批列 `1/2`、`2/2`）

前端逻辑：统计 `action === approved` 的记录数，上限 2（安全 + 技术各一条通过即满格）。

每条记录 Java 应返回：

| BFF 输出 | Java 建议字段 | snake_case 别名 | 取值 |
| --- | --- | --- | --- |
| `node` | `approvalNode` 或 `node` | `approval_node` / `node` | `SAFETY_APPROVAL` → 安全；`TECH_APPROVAL` → 技术 |
| `nodeName` | `nodeName` | `node_name` | 可选中文，如「安全审批」 |
| `action` | `approvalAction` 或 `action` | `approval_action` / `action` | `APPROVE` → 通过；`REJECT` → 驳回 |
| `operatorName` | `approvalUserName` 或 `operatorName` | `approval_user_name` / `operator_name` | 审批人姓名 |
| `opinion` | `approvalOpinion` 或 `opinion` | `approval_opinion` / `opinion` | 审批意见 |
| `at` | `approvalTime` 或 `at` | `approval_time` / `at` | 审批时间 |

示例（列表项内嵌即可，不必详情才带）：

```json
"approvalRecords": [
  {
    "approvalNode": "SAFETY_APPROVAL",
    "approvalAction": "APPROVE",
    "approvalUserName": "张三",
    "approvalTime": "2026-07-03 10:00:00"
  }
]
```

---

## 4. 创单时已 POST、列表应回显的字段

创单 BFF 已转发至 `POST /fumigation-operations`，Java 持久化后**列表/详情须原样返回**：

| 创单 POST 字段 | 列表/详情应返回 |
| --- | --- |
| `plannedStartTime` | 同左 |
| `expectedDurationMinutes` | 同左 |
| `pesticideTypeCode` | 同左 + **`pesticideTypeName`**（冗余中文） |
| `warehouseName` | 同左（**无需** `warehouseCode`） |
| `grainVarietyName` | 同左 |
| 创单人 | **`createUserName`**（从登录上下文写入，勿硬编码） |

---

## 5. 非阻塞 / 可后续字段

| 字段 | 说明 |
| --- | --- |
| `warehouseCode` | 当前环境无编号；BFF 会 fallback 到 `warehouseId`，前端优先 `warehouseName` |
| `remark` JSON | BFF 仍解析创单时写入的 remark 作为兜底；**不应依赖 remark 替代正式列** |
| `checkRecords` | 详情/校验页需要；列表可不返回 |
| `people` | 详情需要；列表可不返回 |

---

## 6. 验收标准（联调）

1. 列表每条记录：`warehouseName`、`pesticideTypeName`、`createUserName`/`applicantName` 非空（真实数据）。
2. 安全审批通过后：列表审批列显示 `1/2`；技术也通过后为 `2/2`。
3. BFF 未改接口契约；Java 使用 camelCase 或 snake_case 均可（BFF 已双读）。

---

## 7. 相关文档

- 全量后端协作：`docs/product-review/kaihe-fumigation-backend-interface-requests.md`
- BFF 类型契约：`prod/cube-services/interfaces/src/fumigation-operation/types.ts`
