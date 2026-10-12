# 咨询管理 PRD

---

## 1. 需求概述

咨询管理用于查看用户提交的咨询留言，以及配置咨询表单显示。

---

## 2. 路由设计

| 路由 | 说明 |
|------|------|
| `/consultation/list` | 咨询列表 |

---

## 3. 页面说明

### 3.1 咨询列表 (`/consultation/list`)

- **表格列**
  | 列 | 说明 |
  |--|--|
  | 姓名 | - |
  | 联系方式 | - |
  | 企业名称 | - |
  | 应用场景 | - |
  | 创建时间 | - |
  | 操作 | 删除 |

- **操作**
  - 删除：确认后删除

### 3.2 咨询页面设计（已统一到页面管理）

- 咨询页面不再提供独立的设计路由
- 在「页面管理」中维护内置页面：
  - 咨询页：内置路由 `/consultation`，默认配置 `generator-cli/test-site/pages/consultation.json`
- 页面路由不可编辑，组件面板排除布局组件

---

## 4. 数据模型

### 4.1 咨询 (Consultation)

```typescript
interface Consultation {
  id: string;
  name: string;         // 姓名
  contact: string;      // 联系方式
  company: string;    // 企业名称
  scene: string;      // 应用场景
  createdTime: string;
}
```

---

## 5. API 设计

### 5.1 咨询管理

| 接口 | 方法 | 说明 |
|------|------|------|
| `/consultation/list` | GET | 获取咨询列表 |
| `/consultation/delete` | DELETE | 删除咨询 |

---

## 6. 注意事项

> ⚠️ **内置功能**：咨询属于内置功能，占用 `/consultation` 路由，不能自定义路由
> ⚠️ **设计组件**：咨询页面的设计统一到「页面管理」的 Design Panel 中维护