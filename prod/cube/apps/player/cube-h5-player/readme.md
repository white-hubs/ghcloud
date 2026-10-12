# Cube H5 Player

基于 CubePlayer 组件的 H5 监控播放页面。

## 使用方式

通过 URL 参数传入设备 ID 进行播放：

```
http://your-domain/apps/player/cube-h5-player/?deviceId=YOUR_DEVICE_ID
```

## URL 参数

| 参数 | 说明 | 必填 |
|------|------|------|
| deviceId | 设备 ID | 是 |

## 开发

```bash
# 安装依赖
bun install

# 启动开发服务器
bun run dev

# 构建
bun run build:prod
```

