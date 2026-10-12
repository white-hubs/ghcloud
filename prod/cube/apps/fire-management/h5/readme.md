# 隐患治理 H5

隐患治理移动端应用骨架。

## 开发

```bash
bun --cwd prod/cube/apps/hazard-governance/h5 run dev
```

## 服务调用

本项目不再新增同级 `service` 包，也不复制旧 H5 的本地请求层。业务接口优先使用统一 SDK：

```ts
import { pageHazardTypeRules } from '@ghcloud/cube-services-client/hazard-governance.client'
```
