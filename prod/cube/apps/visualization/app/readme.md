# @ghcloud/cube-visualization-app

可视化配置 Cube 子应用。工程结构对齐 `@ghcloud/cube-video-monitor-app`。

## Qiankun

| 项 | 值 |
|---|---|
| name / projectName | `cube-visualization-app` |
| 挂载 id / prefixCls | `#cube-visualization-app` |
| 本地 PUBLIC_PATH | `http://localhost:8888/`（见 `.env`） |
| 生产 PUBLIC_PATH | `/apps/cube-visualization-app/` |

主应用注册示例：

```ts
{
  name: 'cube-visualization-app',
  entry: 'http://localhost:8888', // 本地；线上为 CDN 路径
  activeRule: '/portal/visualization',
}
```

## 本地

```bash
cd prod/cube/apps/visualization/app
bun install
bun run dev
```

独立访问：`http://localhost:8888`  
被主应用嵌入时，确保 `.env` 中 `PUBLIC_PATH=http://localhost:8888/`（相对路径 `/apps/...` 会导致资源打到主域失败）。
