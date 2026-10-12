# 站点设置 PRD

---

## 1. 需求概述

站点设置用于配置静态站点的基本信息、全局 SEO 参数和第三方统计脚本。

---

## 2. 路由设计

| 路由 | 说明 |
|------|------|
| `/site-setting` | 站点设置 |

---

## 3. 页面说明

### 3.1 表单配置

| 字段 | 类型 | 说明 |
|------|------|------|
| 网站名称 | Input | 必填 |
| 网站地址 | Input | 必填 |
| 分享图 | 图片上传 | OG 图片，用于社交分享 |
| Favicon | 图片上传 | 站点图标 |
| 主色 | ColorPicker | 站点主题色 |
| 导航样式 | Select | light / dark 二选一 |
| 默认标题 | Input | 全局 SEO title |
| 默认描述 | Textarea | 全局 SEO description |
| 默认关键词 | Textarea | 全局 SEO keywords |

### 3.2 统计脚本

支持配置多个统计脚本，每个脚本包含：

| 字段 | 类型 | 说明 |
|------|------|------|
| 脚本内容 | Textarea | 完整脚本代码 |

### 3.3 操作

- **保存**：校验必填项，保存配置

---

## 4. 数据模型

### 4.1 站点配置 (WebsiteSetting)

```typescript
interface WebsiteSetting {
  id?: string;
  siteName: string;           // 网站名称
  url: string;                // 网站地址
  ogImage: string;            // 分享图 URL
  favicon: string;            // Favicon URL
  primaryColor: string;       // 主色
  navStyle: 'light' | 'dark'; // 导航样式
  defaultTitle: string;       // 默认标题
  defaultDescription: string; // 默认描述
  defaultKeywords: string;    // 默认关键词
  trackingScripts: TrackingScript[]; // 统计脚本列表
}
```

### 4.2 统计脚本

`trackingScripts: string[]` - 脚本内容数组

---

## 5. API 设计

| 接口 | 方法 | 说明 |
|------|------|------|
| `/website/setting/get` | GET | 获取站点设置 |
| `/website/setting/add` | POST | 新增站点设置 |
| `/website/setting/update` | PUT | 更新站点设置 |
| `/website/setting/delete` | DELETE | 删除站点设置 |

---

## 6. 注意事项

> ⚠️ 网站名称和网站地址为必填项
> ⚠️ 分享图和 Favicon 为必填项
> ⚠️ 统计脚本支持多脚本配置