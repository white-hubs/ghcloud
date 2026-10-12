# 后端设计文档

> 本文档为 generator-config 静态配置端的后端库表设计与 API 接口参考，供 JAVA 后端开发使用。

---

## 一、通用规范

### 1.2 通用字段

所有业务表均包含以下字段：

| 字段名 | 类型 | 说明 |
|--------|------|------|
| `id` | BIGINT | 主键，自增 |
| `created_time` | DATETIME | 创建时间 |
| `updated_time` | DATETIME | 更新时间 |
| `created_by` | BIGINT | 创建人ID |
| `updated_by` | BIGINT | 更新人ID |
| `deleted` | TINYINT | 软删除标志：0-未删除 1-已删除 |

### 1.3 状态枚举

```java
public enum StatusEnum {
    ENABLED(1, "启用"),
    DISABLED(0, "禁用");
}

public enum TaskStatusEnum {
    PENDING("PENDING", "待处理"),
    RUNNING("RUNNING", "执行中"),
    SUCCESS("SUCCESS", "成功"),
    FAILED("FAILED", "失败");
}

public enum DeployProviderEnum {
    QINIU("qiniu", "七牛云"),
    SFTP("sftp", "SFTP"),
    FTP("ftp", "FTP");
}

public enum NavStyleEnum {
    LIGHT("light", "浅色"),
    DARK("dark", "深色");
}
```

---

## 二、库表设计

### 2.1 页面管理

#### ghy_site_page（页面表）

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| `id` | BIGINT | Y | 主键 |
| `page_name` | VARCHAR(128) | Y | 页面名称 |
| `page_route` | VARCHAR(256) | Y | 页面路由，如 `/about` |
| `page_title` | VARCHAR(256) | N | 页面标题 |
| `layout_id` | BIGINT | Y | 绑定布局ID |
| `meta_title` | VARCHAR(256) | N | SEO标题 |
| `meta_description` | VARCHAR(512) | N | SEO描述 |
| `meta_keywords` | VARCHAR(512) | N | SEO关键词 |
| `meta_nav_style` | VARCHAR(16) | N | 导航样式：light/dark |
| `components` | LONGTEXT | Y | 组件配置JSON |
| `is_builtin` | TINYINT | Y | 是否内置页面：0-否 1-是，内置页面不可删除 |
| + 通用字段 | | | |

**索引：**
- UNIQUE `uk_page_route` (`page_route`, `deleted`) — 路由唯一
- INDEX `idx_layout_id` (`layout_id`)
- INDEX `idx_is_builtin` (`is_builtin`)

#### ghy_site_layout（布局表）

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| `id` | BIGINT | Y | 主键 |
| `layout_name` | VARCHAR(128) | Y | 布局名称 |
| `config` | LONGTEXT | Y | 布局配置JSON（组件列表） |
| + 通用字段 | | | |

**索引：**
- UNIQUE `uk_layout_name` (`layout_name`, `deleted`)

---

### 2.2 文章管理

#### ghy_site_article（文章表）

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| `id` | BIGINT | Y | 主键 |
| `title` | VARCHAR(256) | Y | 标题 |
| `date` | DATE | N | 发布日期 |
| `summary` | VARCHAR(1024) | N | 摘要 |
| `category_id` | BIGINT | Y | 分类ID |
| `image` | VARCHAR(512) | N | 封面图URL |
| `author` | VARCHAR(64) | N | 作者 |
| `content` | LONGTEXT | N | 正文HTML |
| `sort` | INT | Y | 排序，默认0 |
| `status` | TINYINT | Y | 状态：1-启用 0-禁用 |
| + 通用字段 | | | |

**索引：**
- INDEX `idx_category_id` (`category_id`)
- INDEX `idx_status` (`status`)
- INDEX `idx_sort` (`sort`)

#### ghy_site_article_category（文章分类表）

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| `id` | BIGINT | Y | 主键 |
| `category_name` | VARCHAR(128) | Y | 分类名称 |
| `sort` | INT | Y | 排序，默认0 |
| `status` | TINYINT | Y | 状态：1-启用 0-禁用 |
| + 通用字段 | | | |

**索引：**
- UNIQUE `uk_category_name` (`category_name`, `deleted`)

---

### 2.3 咨询管理

#### ghy_site_consultation（咨询表）

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| `id` | BIGINT | Y | 主键 |
| `name` | VARCHAR(128) | Y | 姓名 |
| `contact` | VARCHAR(128) | Y | 联系方式 |
| `company` | VARCHAR(256) | N | 企业名称 |
| `scene` | VARCHAR(256) | N | 应用场景 |
| + 通用字段 | | | |

**索引：**
- INDEX `idx_name` (`name`)
- INDEX `idx_contact` (`contact`)

---

### 2.4 站点设置

#### ghy_site_website_setting（站点设置表）

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| `id` | BIGINT | Y | 主键 |
| `site_name` | VARCHAR(128) | Y | 网站名称 |
| `url` | VARCHAR(256) | Y | 网站地址 |
| `og_image` | VARCHAR(512) | N | 分享图URL |
| `favicon` | VARCHAR(512) | N | Favicon URL |
| `primary_color` | VARCHAR(16) | N | 主色，如 `#1578FF` |
| `nav_style` | VARCHAR(16) | N | 导航样式：light/dark |
| `default_title` | VARCHAR(256) | N | 默认SEO标题 |
| `default_description` | VARCHAR(512) | N | 默认SEO描述 |
| `default_keywords` | VARCHAR(512) | N | 默认SEO关键词 |
| + 通用字段 | | | |

**说明：** 该表通常为单条记录（全站只有一个配置）。

#### ghy_site_tracking_script（统计脚本表）

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| `id` | BIGINT | Y | 主键 |
| `setting_id` | BIGINT | Y | 站点设置ID |
| `script_content` | LONGTEXT | Y | 脚本代码 |
| `sort` | INT | Y | 排序 |
| + 通用字段 | | | |

**索引：**
- INDEX `idx_setting_id` (`setting_id`)

---

### 2.5 素材管理

#### ghy_site_material_folder（素材目录表）

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| `id` | BIGINT | Y | 主键 |
| `path_id` | BIGINT | N | 父目录ID，null为根目录 |
| `name` | VARCHAR(128) | Y | 目录名称 |
| `sort` | INT | Y | 排序，默认0 |
| + 通用字段 | | | |

**索引：**
- INDEX `idx_path_id` (`path_id`)

#### ghy_site_material（素材表）

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| `id` | BIGINT | Y | 主键 |
| `folder_id` | BIGINT | N | 所在目录ID |
| `name` | VARCHAR(256) | Y | 素材名称（不含后缀） |
| `ext` | VARCHAR(16) | N | 文件扩展名 |
| `mime_type` | VARCHAR(64) | N | MIME类型 |
| `size` | BIGINT | N | 文件大小（字节） |
| `storage_key` | VARCHAR(512) | Y | 对象存储Key（如MinIO） |
| + 通用字段 | | | |

**索引：**
- INDEX `idx_folder_id` (`folder_id`)
- INDEX `idx_name` (`name`)

---

### 2.6 部署发布

#### ghy_site_deploy_config（部署配置表）

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| `id` | BIGINT | Y | 主键 |
| `provider` | VARCHAR(16) | Y | 部署目标：qiniu/sftp/ftp |
| `provider_config` | LONGTEXT | Y | 配置JSON（AccessKey/SecretKey/Bucket等） |
| + 通用字段 | | | |

**说明：** 该表通常为单条记录。

#### ghy_site_deploy_task（构建任务表）

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| `id` | BIGINT | Y | 主键 |
| `status` | VARCHAR(16) | Y | 状态：PENDING/RUNNING/SUCCESS/FAILED |
| `output_path` | VARCHAR(512) | N | 构建输出路径 |
| `error` | TEXT | N | 错误信息 |
| + 通用字段 | | | |

**索引：**
- INDEX `idx_status` (`status`)

#### ghy_site_deploy_record（部署记录表）

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| `id` | BIGINT | Y | 主键 |
| `task_id` | BIGINT | Y | 构建任务ID |
| `provider` | VARCHAR(16) | Y | 部署目标 |
| `status` | VARCHAR(16) | Y | 状态：PENDING/RUNNING/SUCCESS/FAILED |
| `output` | TEXT | N | 部署输出 |
| `error` | TEXT | N | 错误信息 |
| + 通用字段 | | | |

**索引：**
- INDEX `idx_task_id` (`task_id`)

#### ghy_site_deploy_artifact（制品表）

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| `id` | BIGINT | Y | 主键 |
| `artifact_name` | VARCHAR(128) | Y | 制品名，如 `product-1714000000000` |
| `task_id` | BIGINT | Y | 最新构建任务ID |
| `deploy_id` | BIGINT | Y | 最新部署记录ID |
| `last_deploy_time` | DATETIME | N | 最近发布成功时间 |
| + 通用字段 | | | |

**索引：**
- INDEX `idx_artifact_name` (`artifact_name`)

---

## 三、API 接口设计

### 3.1 页面管理

#### 页面列表

```
GET /page/list
```

**请求参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| keyword | string | N | 搜索关键词（匹配pageName/pageRoute） |
| pageNumber | int | N | 页码，默认1 |
| pageSize | int | N | 页大小，默认10 |

**响应 data：**

```json
{
  "records": [
    {
      "id": "1",
      "pageName": "首页",
      "pageRoute": "/",
      "pageTitle": "首页",
      "layout": "default",
      "createdTime": "2024-01-15 10:00:00",
      "updatedTime": "2024-03-20 14:30:00"
    }
  ],
  "total": 100,
  "pages": 10
}
```

#### 获取页面详情

```
GET /page/detail?id={id}
```

**响应 data：** `Page` 完整对象（含 components JSON）

#### 新增页面

```
POST /page/add
```

**请求体：** `Page`（不含 id、createdTime、updatedTime）

#### 编辑页面

```
PUT /page/update
```

**请求体：** `Page`（含 id）

#### 删除页面

```
DELETE /page/delete?id={id}
```

**约束：** 内置页面（`is_builtin = 1`）不允许删除，返回 403。

---

#### 布局列表

```
GET /layout/list
```

#### 获取布局详情

```
GET /layout/detail?id={id}
```

#### 新增布局

```
POST /layout/add
```

**请求体：** `{ layoutName, config }`

#### 编辑布局

```
PUT /layout/update
```

#### 删除布局

```
DELETE /layout/delete?id={id}
```

---

### 3.2 文章管理

#### 文章列表

```
GET /article/list
```

**请求参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| keyword | string | N | 搜索标题 |
| categoryId | string | N | 分类ID |
| status | int | N | 状态：1-启用 0-禁用 |
| pageNumber | int | N | 页码 |
| pageSize | int | N | 页大小 |

#### 获取文章详情

```
GET /article/detail?id={id}
```

#### 新增文章

```
POST /article/add
```

#### 编辑文章

```
PUT /article/update
```

#### 删除文章

```
DELETE /article/delete?id={id}
```

#### 更新排序

```
PUT /article/sort
```

**请求体：**
```json
{
  "id": "1",
  "sort": 5
}
```

---

#### 分类列表

```
GET /article/category/list
```

#### 新增分类

```
POST /article/category/add
```

#### 编辑分类

```
PUT /article/category/update
```

#### 删除分类

```
DELETE /article/category/delete?id={id}
```

**约束：** 分类下存在文章时不允许删除，返回 400。

---

### 3.3 咨询管理

#### 咨询列表

```
GET /consultation/list
```

**请求参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| keyword | string | N | 搜索姓名/联系方式 |
| pageNumber | int | N | 页码 |
| pageSize | int | N | 页大小 |

#### 删除咨询

```
DELETE /consultation/delete?id={id}
```

---

### 3.4 站点设置

#### 获取站点设置

```
GET /website/setting/get
```

**响应 data：** `WebsiteSetting` + `trackingScripts` 数组

```json
{
  "siteName": "古河云科技",
  "url": "https://www.guhecloud.com",
  "ogImage": "...",
  "favicon": "...",
  "primaryColor": "#1578FF",
  "navStyle": "light",
  "defaultTitle": "...",
  "defaultDescription": "...",
  "defaultKeywords": "...",
  "trackingScripts": [
    "<script>...</script>",
    "<script>...</script>"
  ]
}
```

#### 保存站点设置

```
POST /website/setting/save
```

**请求体：** 同响应结构

**说明：** 不存在则新增，存在则覆盖（单条记录）。

---

### 3.5 素材管理

#### 目录相关

```
GET    /material/folder/list?pathId={pathId}   // 获取子目录列表
POST   /material/folder/add                        // 新建目录
PUT    /material/folder/update                     // 重命名目录
DELETE /material/folder/delete?id={id}             // 删除目录
GET    /material/folder/path?id={id}               // 获取目录路径（面包屑）
```

**删除目录约束：** 目录下存在子目录或素材时，不允许删除，返回 400。

#### 素材相关

```
GET    /material/list?pathId={pathId}&keyword={keyword}&type={type}&pageNumber={pageNumber}&pageSize={pageSize}
POST   /material/upload                              // 上传素材（支持批量）
PUT    /material/rename                              // 重命名素材
PUT    /material/move                                // 移动素材到目录
DELETE /material/delete?id={id}                      // 删除素材
GET    /material/detail?id={id}                      // 获取素材详情（含URL）
```

**上传响应：**
```json
{
  "id": "1",
  "name": "banner",
  "ext": "png",
  "url": "https://cdn.xxx.com/xxx.png",
  "size": 102400
}
```

---

### 3.6 部署发布

#### 获取部署配置

```
GET /deploy/config/get
```

**响应 data：**
```json
{
  "provider": "qiniu",
  "providerConfig": {
    "accessKey": "xxx",
    "secretKey": "xxx",
    "bucket": "xxx",
    "zone": "xxx",
    "domain": "xxx"
  }
}
```

#### 保存部署配置

```
POST /deploy/config/save
```

**请求体：** 同上

---

#### 执行构建和部署

```
POST /deploy/run
```

**响应 data：**
```json
{
  "taskId": "1",
  "artifactId": "1"
}
```

**说明：** 异步执行，返回任务ID，前端轮询任务状态。

#### 获取制品列表

```
GET /deploy/artifact/list?pageNumber={pageNumber}&pageSize={pageSize}
```

**响应 data：**
```json
{
  "records": [
    {
      "id": "1",
      "artifactName": "product-1714000000000",
      "taskStatus": "SUCCESS",
      "deployStatus": "SUCCESS",
      "lastDeployTime": "2024-03-20 14:30:00"
    }
  ],
  "total": 50
}
```

#### 再次发布

```
POST /deploy/artifact/redeploy
```

**请求体：**
```json
{
  "artifactId": "1"
}
```

#### 获取任务状态（轮询用）

```
GET /deploy/task/status?taskId={taskId}
```

**响应 data：**
```json
{
  "id": "1",
  "status": "RUNNING",
  "outputPath": null,
  "error": null
}
```

---

## 四、特殊说明

### 4.1 内置页面初始化

系统初始化时，应自动插入以下内置页面记录（`is_builtin = 1`）：

| 页面名称 | 页面路由 | 布局 |
|----------|----------|------|
| 文章列表页 | `/information.html` | default |
| 文章详情模板 | `/information/detail-{id}.html` | default |
| 咨询页面 | `/consultation.html` | default |

**约束：**
- 内置页面不可删除（`DELETE` 返回 403）
- 内置页面的 `pageRoute` 字段不可编辑（`PUT` 时忽略该字段）

### 4.2 组件配置 JSON 格式

`components` 字段存储 `ComponentInstance[]` 的 JSON 序列化：

```json
[
  {
    "name": "SwiperCarousel",
    "interactive": true,
    "props": {
      "items": [...]
    }
  }
]
```

### 4.3 构建发布流程

```
前端调用 POST /deploy/run
    ↓
后端创建 Task（PENDING）+ Artifact
    ↓
调用 generator-service 构建接口（异步）
    ↓
轮询构建状态 → SUCCESS/FAILED
    ↓
构建成功后调用 generator-service 部署接口
    ↓
轮询部署状态 → SUCCESS/FAILED
    ↓
更新 Artifact 的 taskStatus / deployStatus
```

### 4.4 素材 URL 生成

素材表不存储 URL，通过 `storage_key` 实时查询对象存储服务生成临时访问 URL。

```
GET /material/detail?id={id}
  → 返回 { ..., "url": "https://minio.xxx.com/bucket/key?token=xxx" }
```
