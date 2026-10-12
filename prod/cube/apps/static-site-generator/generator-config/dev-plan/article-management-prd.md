# 文章管理 PRD

---

## 1. 需求概述

文章管理用于创建和维护资讯中心的文章，支持分类管理和文章显示配置。

---

## 2. 路由设计

| 路由 | 说明 |
|------|------|
| `/article-management/list` | 文章列表 |
| `/article-management/content` | 文章内容编辑（新增和编辑） |
| `/article-management/category` | 文章分类 |

---

## 3. 页面说明

### 3.1 文章列表 (`/article-management/list`)

- **表格列**
  | 列 | 说明 |
  |--|--|
  | 标题 | - |
  | 分类 | - |
  | 创建时间 | - |
  | 更新时间 | - |
  | 操作 | 编辑、删除 |

- **操作按钮**
  - 新增：跳转到文章内容编辑（新增模式）
  - 编辑：跳转到文章内容编辑（编辑模式）
  - 删除：确认后删除
  - 排序：单元格编辑

### 3.2 文章内容编辑 (`/article-management/content`)

- **表单字段**
  | 字段 | 类型 | 说明 |
  |--|--|--|
  | 标题 | Input | 必填 |
  | 日期 | DatePicker | - |
  | 摘要 | Textarea | - |
  | 分类 | Select | 选择文章分类 |
  | 封面图 | 图片上传 | - |
  | 作者 | Input | - |
  | 正文 | 富文本编辑器 | - |

> ⚠️ 不包含点击量（click），因 SSG 无法实时回显

### 3.3 文章分类 (`/article-management/category`)

- **表格列**
  | 列 | 说明 |
  |--|--|
  | 分类名称 | - |
  | 创建时间 | - |
  | 更新时间 | - |
  | 操作 | 编辑、删除 |

- **操作**
  - 新增：一级分类
  - 编辑
  - 删除

### 3.4 文章页面设计（已统一到页面管理）

- 文章列表页和文章详情页不再提供独立的设计路由
- 在「页面管理」中维护内置页面：
  - 文章列表页：内置路由 `/information`，默认配置 `generator-cli/test-site/pages/information.json`
  - 文章详情页：内置路由 `/information/detail-{id}.html`，默认配置 `generator-cli/test-site/pages/article-detail.json`
- 页面路由不可编辑，组件面板排除布局组件

---

## 4. 数据模型

### 4.1 文章 (Article)

```typescript
interface Article {
  id: string;
  title: string;        // 标题
  date: string;         // 日期
  summary: string;     // 摘要
  category: string;     // 分类
  categoryName?: string; // 分类名称
  image: string;       // 封面图
  author: string;      // 作者
  content: string;     // 正文（HTML）
  sort: number;        // 排序
  status: number;       // 状态：1 启用 / 0 禁用
  createdTime: string;
  updatedTime: string;
}
```

### 4.2 文章分类 (ArticleCategory)

```typescript
interface ArticleCategory {
  id: string;
  categoryName: string; // 分类名称
  sort: number;        // 排序
  status: number;      // 状态：1 启用 / 0 禁用
  createdTime: string;
  updatedTime: string;
}
```

---

## 5. API 设计

### 5.1 文章管理

| 接口 | 方法 | 说明 |
|------|------|------|
| `/article/list` | GET | 获取文章列表 |
| `/article/add` | POST | 新增文章 |
| `/article/update` | PUT | 编辑文章 |
| `/article/delete` | DELETE | 删除文章 |
| `/article/sort` | PUT | 更新排序 |

### 5.2 分类管理

| 接口 | 方法 | 说明 |
|------|------|------|
| `/article/category/list` | GET | 获取分类列表 |
| `/article/category/add` | POST | 新增分类 |
| `/article/category/update` | PUT | 编辑分类 |
| `/article/category/delete` | DELETE | 删除分类 |

---

## 6. 注意事项

> ⚠️ 文章分类仅支持一级分类
> ⚠️ 文章不包含点击量（click）字段
> ⚠️ **内置功能**：文章列表页路由 `/information`、文章详情页路由 `/information/detail-{id}.html`，由 generator-cli 自动生成，不可自定义
> ⚠️ **设计组件**：文章列表页和详情页的设计统一到「页面管理」的 Design Panel 中维护
> ⚠️ **内置路由**：`/information`（文章列表）、`/information/detail-{id}.html`（文章详情），由 generator-cli 自动生成，不可自定义编辑