# 生成规则

**定义：** 假设生成目录为 `xxx`

## 1. 生成文章配置

从数据中读取文章分类和文章列表。
在 `xxx` 下新建目录 `articles`，结构如下：

```text
articles/
├── [文章id].json
└── index.json (文章数据引用)
```

## 2. 生成布局配置

从数据中读取页面布局列表。
在 `xxx` 下新建目录 `layout`，结构如下：

```text
layout/
└── [布局名称或id].json (后续需与引用保持一致)
```

## 3. 生成页面配置

从数据中读取页面列表。
在 `xxx` 下新建目录 `pages`，结构如下：

```text
pages/
└── [页面路由].json (根路由为 index.json)
```

## 4. 生成 site.config.json

生成 `site.config.json`（目前该部分生成是正确的）。

## 5. 生成 schema.json

```json
{
  "$schema": "./schema.json",
  "siteConfig": "./site.config.json",
  "tenant": "租户code",
  "layouts": {
    "default": "./layouts/default.json"
  },
  "articleDetailTemplate": {
    "$ref": "./pages/information/detail-{id}.json"
  },
  "pages": []
}
```

### 说明
- **`layouts`**：即对应的 layout 文件，名字和路径对应上即可。
- **`articleDetailTemplate`**：直接硬编码为 `"$ref": "./pages/information/detail-{id}.json"` 即可。
- **`pages`**：确保路径正确即可。
