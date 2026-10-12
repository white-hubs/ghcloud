# @ghcloud/cube-emergency-dispatch-h5

应急指挥移动端 H5。当前页面：**入口**、**报警记录列表**、**疏散指引详情**。

## 快速开始

```bash
cd prod/cube/apps/emergency-dispatch/h5
bun install
bun run dev
```

独立开发默认 `PUBLIC_PATH=/apps/emergency-dispatch/h5`，路由 base 为 `/apps/emergency-dispatch/h5`。

## 路由

| path | 说明 |
|------|------|
| `/`、`/entry` | 入口（EntryMenu + 疏散指引入口） |
| `/alarm-records` | 报警记录列表（待处理 / 处理中） |
| `/evacuation-guide?id=` | 疏散指引详情（GIS、平面图、路线） |

## 四元组

| 项 | 值 |
|---|---|
| 包名 | `@ghcloud/cube-emergency-dispatch-h5` |
| `PUBLIC_PATH` | `/apps/emergency-dispatch/h5` |
| `applicationCode` | `emergency-dispatch` |
