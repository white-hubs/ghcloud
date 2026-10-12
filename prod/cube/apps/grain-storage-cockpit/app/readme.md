# 储粮驾驶舱

集团储量安全驾驶舱 Cube 子应用，业务数据全部为本地 Mock。

## 路由与运行模式

- 省级驾驶舱：`/`
- 库区详情：`/details`
- qiankun 基址：`/portal/grain-storage-cockpit`
- 独立应用基址：`/grain-storage-cockpit`

资源默认从 `/grain-storage-cockpit/` 加载。若 qiankun 或 nginx 将构建产物部署到其他资源前缀，构建时注入对应的 `PUBLIC_PATH`（例如 `PUBLIC_PATH=/apps/grain-storage-cockpit/`）；该值需以 `/` 结尾。

```bash
bun run dev
bun run test
bun run typecheck
bun run build:prod
```
