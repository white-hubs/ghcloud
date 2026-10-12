# @ghcloud/cube-emergency-dispatch-app

应急指挥 PC 端 Cube qiankun 子应用。当前页面：**疏散路线配置**（`/evacuation-route-config`）、**疏散指挥**（`/evacuation-command`）。

## 快速开始

```bash
cd prod/cube/apps/emergency-dispatch/app
bun install
bun run dev
```

独立开发默认 `PUBLIC_PATH=/apps/emergency-dispatch`，路由 base 为 `/apps/emergency-dispatch`；接入主应用后 qiankun base 为 `/portal/emergency-dispatch`。

## qiankun 四元组

| 项 | 值 |
|---|---|
| vite `projectName` | `emergency-dispatch` |
| 挂载 id / scope | `#EmergencyDispatch` |
| 独立 dev `PUBLIC_PATH` | `/apps/emergency-dispatch` |
| 门户路由前缀 | `/portal/emergency-dispatch` |
| `applicationCode` | `emergency-dispatch` |

## 路由

- `/` → 重定向 `/evacuation-route-config`
- `/evacuation-route-config` — 疏散引导配置（区域树、平面图叠加、路线标注、监控绑定）
- `/evacuation-command` — 疏散指挥（应急事件、摄像头画面、统一 GIS+平面图+路线地图、路线卡片、人流分析）
- `/equipment-association` — 设备关联（筛选条件配置、关联设备列表）

详见 [`.agents/skills/cube-app-development/SKILL.md`](../../../.agents/skills/cube-app-development/SKILL.md)。
