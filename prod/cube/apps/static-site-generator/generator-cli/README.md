# SSG Docker Build Guide

## 构建镜像

```bash
./docker-image-build.sh
```

## 运行

```bash
docker run --rm \
  -v /path/to/site-config:/app/input \
  -v /path/to/output:/app/output \
  ghcloud/ssg-generator
```

## 配置要求

站点配置目录需包含以下文件：

- `schema.json` - 站点结构配置，需包含 `tenant` 字段
- `site.config.json` - 站点全局配置
- `pages/` - 页面配置目录
- `layouts/` - 布局配置目录

### schema.json 示例

```json
{
  "$schema": "./schema.json",
  "siteConfig": "./site.config.json",
  "tenant": "your-tenant-code",
  "layouts": {
    "default": "./layouts/default.json"
  },
  "pages": [
    { "$ref": "./pages/index.json" }
  ]
}
```

## 产物

构建完成后，产物输出到 `/app/output/` 目录：

```
sg-website-{tenant}-{YYYYMMDDHHmmss}.tgz
```

例如：`sg-website-guhecloud-20260419120404.tgz`

## Docker 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `SSG_INPUT_DIR` | 输入配置目录 | `/app/input` |

## 在 Jenkins 中使用

```groovy
pipeline {
  agent any
  stages {
    stage('Build') {
      steps {
        sh '''
          docker run --rm \
            -v ${CONFIG_DIR}:/app/input \
            -v ${OUTPUT_DIR}:/app/output \
            ghcloud/ssg-generator
        '''
      }
    }
  }
}
```
