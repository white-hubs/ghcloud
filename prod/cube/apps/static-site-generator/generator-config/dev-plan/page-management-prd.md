# 页面管理 PRD

---

## 1. 需求概述

页面管理用于创建和维护静态站点的页面，包括页面布局配置和页面内容编辑。

---

## 2. 路由设计

| 路由 | 说明 |
|------|------|
| `/page-management/list` | 页面列表 |
| `/page-management/layout-list` | 页面布局列表 |
| `/page-management/layout-design` | 页面布局设计 |
| `/page-management/design` | 页面内容编辑（新增和编辑） |

---

## 3. 页面说明

### 3.1 页面列表 (`/page-management/list`)

- **表格列**
  | 列 | 说明 |
  |--|--|
  | 页面名称 | - |
  | 页面路由 | - |
  | 页面标题 | - |
  | 绑定布局 | - |
  | 创建时间 | - |
  | 更新时间 | - |
  | 操作 | 编辑、删除 |

- **操作按钮**
  - 新增：跳转到页面内容设计（新增模式）
  - 编辑：跳转到页面内容设计（编辑模式）
  - 删除：确认后删除

### 3.2 页面布局列表 (`/page-management/layout-list`)

- **表格列**
  | 列 | 说明 |
  |--|--|
  | 布局名称 | - |
  | 创建时间 | - |
  | 更新时间 | - |
  | 操作 | 编辑、删除 |

- **操作按钮**
  - 新增：跳转到页面布局设计（新增模式）
  - 编辑：跳转到页面布局设计（编辑模式）
  - 删除：确认后删除

### 3.3 页面布局设计 (`/page-management/layout-design`)

- **设计组件**（Design Panel，页面管理、文章管理、咨询管理复用）
  - Tab 1：页面信息（名称、路由、TDK、navStyle）
  - Tab 2：页面设计（拖拽配置、组件属性配置）
- **组件库**：复用 `ssg-components` 提供的组件
- **样式配置**：`ssg-components` 提供 TailwindCSS 配置
- **页面信息**
  - 页面名称
  - 页面路由（可禁用编辑，内置路由不可修改）
  - 页面级 TDK（title、description、keywords）
  - 页面 navStyle（light / dark）
- **页面设计**
  - 拖拽配置：左侧组件面板 + 中间画布 + 右侧属性面板
  - 组件属性配置
- **JSON 配置**
  - 网页版 vscode 编辑 JSON
  - 组件参考 `ssg-components`

- **操作**
  - 保存
  - 返回

### 3.4 页面内容设计 (`/page-management/design`)

- **表单字段**
  | 字段 | 类型 | 说明 |
  |--|--|--|
  | 页面名称 | Input | 必填 |
  | 页面路由 | Input | 必填 |
  | 页面标题 | Input | - |
  | 关键词 | Input | - |
  | 描述 | Textarea | - |
  | 绑定布局 | Select | 选择页面布局 |
  | Components 配置 | JSON / 可视化 | 与布局设计一致 |

- **操作**
  - 保存
  - 返回

---

## 4. 数据模型

### 4.1 页面 (Page)

```typescript
interface Page {
  id: string;
  pageName: string;        // 页面名称
  pageRoute: string;        // 页面路由
  pageTitle: string;       // 页面标题
  pageKeywords: string;    // 关键词
  pageDescription: string; // 描述
  layout: string;          // 绑定的布局 ID
  components: ComponentInstance[]; // 组件配置
  meta: {
    title?: string;
    description?: string;
    keywords?: string;
    navStyle?: string;
  };
  createdTime: string;
  updatedTime: string;
}
```

### 4.2 页面布局 (Layout)

```typescript
interface Layout {
  id: string;
  layoutName: string;     // 布局名称
  config: string;        // 布局配置 JSON
  createdTime: string;
  updatedTime: string;
}
```

---

## 5. API 设计

### 5.1 页面管理

| 接口 | 方法 | 说明 |
|------|------|------|
| `/page/list` | GET | 获取页面列表 |
| `/page/add` | POST | 新增页面 |
| `/page/update` | PUT | 编辑页面 |
| `/page/delete` | DELETE | 删除页面 |

### 5.2 布局管理

| 接口 | 方法 | 说明 |
|------|------|------|
| `/layout/list` | GET | 获取布局列表 |
| `/layout/add` | POST | 新增布局 |
| `/layout/update` | PUT | 编辑布局 |
| `/layout/delete` | DELETE | 删除布局 |

---

## 6. 注意事项

> ⚠️ 组件参考 `ssg-components`，每个组件有 scheme.ts 定义 props 类型
> ⚠️ 组件 props 描述文档待补充
> ⚠️ Components 配置支持两种模式：JSON 配置（vscode）和可视化拖拽配置
> ⚠️ 布局中已包含导航组件，页面无需单独关联导航
> ⚠️ **设计组件**：页面管理、文章管理、咨询管理共用，支持页面信息配置和页面设计
> ⚠️ **内置路由**：`/information`（文章列表）、`/information/detail-{id}.html`（文章详情）、`/consultation`（咨询）作为后端内置路由，前端在列表页禁用删除、在设计页禁用路由编辑
> ⚠️ **组件面板**：`page` 模式排除布局组件（NavMenu/SiteFooter/FloatingSidebar），布局由绑定的布局统一提供
> ⚠️ **系统字段**：`NewsSection.news`、`CategoryTabs.categories` 等后台数据字段标记 `system: true`，设计器显示只读提示