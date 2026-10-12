# @ghcloud/cube-electrical-safety-app

新版“电气安全管理”Cube 子应用，与 `legacy/powermonitor-migrate` 中的旧版“电气管理”相互独立。

## 应用身份

- applicationCode：`ELECTRICAL_SAFETY`
- qiankun projectName：`electrical-safety`
- 主应用路径：`/portal/electrical-safety`
- DOM 挂载点：`#ElectricalSafety`

## 页面

- `/deep-analysis`：设备深度分析
- `/facility-management`：设施管理
- `/collection-config`：采集配置
- `/remote-inspection-config`：远检配置
- `/remote-inspection-view`：远程查看

本阶段使用 Pinia 内存 Mock 数据，不调用业务后端接口，刷新页面后恢复初始状态。

## 命令

```bash
bun run dev
bun run build
```
