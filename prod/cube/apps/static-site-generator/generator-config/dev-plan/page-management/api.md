# 页面管理接口设计

---

## 页面管理

### 1. 获取页面列表

```
GET /page/list?keyword={keyword}&pageNumber={pageNumber}&pageSize={pageSize}
```

**请求参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| keyword | string | N | 搜索关键词（匹配 pageName / pageRoute） |
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

---

### 2. 获取页面详情

```
GET /page/detail?id={id}
```

**响应 data：**

```json
{
  "id": "1",
  "pageName": "首页",
  "pageRoute": "/",
  "pageTitle": "首页",
  "layout": "default",
  "meta": {
    "title": "首页 - 古河云科技",
    "description": "...",
    "keywords": "...",
    "navStyle": "dark"
  },
  "components": [
    {
      "name": "SwiperCarousel",
      "interactive": true,
      "props": { "items": [] }
    }
  ],
  "createdTime": "2024-01-15 10:00:00",
  "updatedTime": "2024-03-20 14:30:00"
}
```

---

### 3. 新增页面

```
POST /page/add
```

**请求体：**

```json
{
  "pageName": "关于我们",
  "pageRoute": "/about",
  "pageTitle": "关于我们",
  "layout": "default",
  "meta": {
    "title": "关于我们 - 古河云科技",
    "description": "",
    "keywords": "",
    "navStyle": "light"
  },
  "components": []
}
```

**约束：**
- `pageName` 必填
- `pageRoute` 必填，全局唯一
- `layout` 必填

---

### 4. 编辑页面

```
PUT /page/update
```

**请求体：**

```json
{
  "id": "2",
  "pageName": "关于我们",
  "pageRoute": "/about",
  "pageTitle": "关于我们",
  "layout": "default",
  "meta": {
    "title": "关于我们 - 古河云科技",
    "description": "",
    "keywords": "",
    "navStyle": "light"
  },
  "components": []
}
```

**约束：**
- 内置页面（`is_builtin = 1`）的 `pageRoute` 字段不可修改，后端应忽略该字段的更新
- 普通页面的 `pageRoute` 修改时需校验唯一性

---

### 5. 删除页面

```
DELETE /page/delete?id={id}
```

**约束：** 内置页面（`is_builtin = 1`）不允许删除，返回 403。

---

## 布局管理

### 6. 获取布局列表

```
GET /layout/list
```

**响应 data：**

```json
[
  {
    "id": "1",
    "layoutName": "默认布局",
    "createdTime": "2024-01-15 10:00:00",
    "updatedTime": "2024-03-20 14:30:00"
  }
]
```

---

### 7. 获取布局详情

```
GET /layout/detail?id={id}
```

**响应 data：**

```json
{
  "id": "1",
  "layoutName": "默认布局",
  "config": [
    {
      "name": "NavMenu",
      "interactive": true,
      "props": { "items": [] }
    },
    {
      "name": "__slot__",
      "props": { "slot": "main" }
    },
    {
      "name": "SiteFooter",
      "interactive": false,
      "props": {}
    }
  ],
  "createdTime": "2024-01-15 10:00:00",
  "updatedTime": "2024-03-20 14:30:00"
}
```

---

### 8. 新增布局

```
POST /layout/add
```

**请求体：**

```json
{
  "layoutName": "宽屏布局",
  "config": []
}
```

**约束：** `layoutName` 必填，全局唯一。

---

### 9. 编辑布局

```
PUT /layout/update
```

**请求体：**

```json
{
  "id": "2",
  "layoutName": "宽屏布局",
  "config": []
}
```

---

### 10. 删除布局

```
DELETE /layout/delete?id={id}
```

**约束：** 布局被页面引用时（`ghy_site_page.layout_id`），不允许删除，返回 400。

---

## 数据模型

```typescript
interface Page {
  id: string;
  pageName: string;
  pageRoute: string;
  pageTitle: string;
  layout: string;
  meta: {
    title?: string;
    description?: string;
    keywords?: string;
    navStyle?: string;
  };
  components: ComponentInstance[];
  createdTime: string;
  updatedTime: string;
}

interface Layout {
  id: string;
  layoutName: string;
  config: ComponentInstance[];
  createdTime: string;
  updatedTime: string;
}

interface ComponentInstance {
  name: string;
  interactive?: boolean;
  props: Record<string, unknown>;
}
```
