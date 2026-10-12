# SCADA Studio Service 部署说明

`scada-studio-service` 为 `scada-studio` / `scada-demo` 提供 REST API：

- `/scada/api/projects`
- `/scada/api/pages`
- `/scada/api/elements`

OCD nginx 会将上述路径转发到 `http://scada-studio-service:3100`，且**不会**去掉 `/scada/api` 前缀，因此服务在前端 nginx 所在网络中须能以该 DNS 名称与端口访问。

## 镜像仓库与 Tag 规则

| 项 | 约定 |
| --- | --- |
| 镜像仓库 | `nexus.guhecloud.com:5001` |
| 镜像名 | `scada-studio-service` |
| Tag 规则 | `YYYYMMDD`（按构建/发布日期，8 位数字） |
| 完整地址示例 | `nexus.guhecloud.com:5001/scada-studio-service:20260821` |

说明：

- 同一天多次发布时，可复用当天日期 tag（覆盖推送），或在日期后追加序号，例如 `20260821.1`。
- 本地构建默认还会产出 `scada-studio-service:latest`，推仓库时以日期 tag 为准，不要只依赖 `latest`。

### 构建并推送

在仓库根目录执行：

```sh
# 1. 构建本地镜像
./prod/cube/scada/buildx.sh --services scada-studio-service

# 2. 打上仓库地址与日期 tag（示例：20260821）
docker tag scada-studio-service:latest nexus.guhecloud.com:5001/scada-studio-service:20260821

# 3. 推送到 Nexus
docker push nexus.guhecloud.com:5001/scada-studio-service:20260821
```

### 服务器拉取与运行

```sh
docker pull nexus.guhecloud.com:5001/scada-studio-service:20260821

docker run -d --name scada-studio-service \
  -p 3100:3100 \
  -e HOST=0.0.0.0 -e PORT=3100 \
  -v scada-studio-service-data:/app/prod/cube/scada/scada-studio-service/data \
  --restart unless-stopped \
  nexus.guhecloud.com:5001/scada-studio-service:20260821
```

## 本地构建（非 Docker）

```sh
bun install
bun run --cwd prod/cube/scada/scada-studio-service build
```

## 运行时环境变量

```sh
HOST=0.0.0.0
PORT=3100
```

源码启动：

```sh
HOST=0.0.0.0 PORT=3100 bun run --cwd prod/cube/scada/scada-studio-service start
```

构建产物启动：

```sh
cd prod/cube/scada/scada-studio-service
HOST=0.0.0.0 PORT=3100 bun dist/main.js
```

## 数据持久化

SQLite 数据目录：

```txt
prod/cube/scada/scada-studio-service/data/scada.db
```

服务器上请将该 `data` 目录挂到持久卷，不要放在会被发版覆盖或删除的目录里。

## Nginx 网络要求

若使用 Docker Compose，请把本服务与前端 nginx 放在同一网络，并将服务/容器命名为 `scada-studio-service`；否则需同步修改：

`ocd/environment/deploy/front-end/nginx/conf/other/scada-studio.conf`
