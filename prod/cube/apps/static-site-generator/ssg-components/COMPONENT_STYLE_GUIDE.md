# 组件样式开发规范

## 1. 架构概述

```
SSG 阶段：
├── Astro SSR 渲染组件 → 生成 HTML 内容
├── 保留 astro-island 标签 → SEO 友好 ✅
└── fluid font-size 脚本 → 流体设计

客户端阶段：
└── Vue runtime → 找到 astro-island → 原生 hydration ✅
```

**关键点**：
- 无需 post-build.mjs
- 保留 astro-island 标签（不影响 SEO）
- 组件使用 `client:load` 自动 hydration

---

## 2. 目录结构

```
ssg-components/src/
├── index.ts                    # 组件注册导出
├── types.ts                   # 类型定义
├── utils/
│   └── binding.ts            # Props 绑定解析
└── components/
    ├── dynamic-component/    # 动态组件加载器（必需）
    │   └── dynamic-component.vue
    ├── nav-menu/
    │   ├── nav-menu.vue
    │   ├── schema.ts
    │   └── *.webp           # 静态资源
    └── swiper-carousel/
        ├── swiper-carousel.vue
        └── schema.ts
```

**注意**：
- 所有组件必须放在 `components/` 目录下
- `dynamic-component` 用于渲染交互式组件（必须保留）
- 组件的 `.vue` 文件和 `schema.ts` 放在同一个目录下

---

## 3. 主题色配置

### 3.1 配置位置

在 `schema.json` 的 `site` 部分添加 `primaryColor`：

```json
{
  "site": {
    "name": "古河云科技",
    "primaryColor": "#1578FF"
  }
}
```

### 3.2 注入机制

在 `[...slug].astro` 中通过 `define:vars` 注入 CSS 变量：

```astro
<style define:vars={{ primaryColor: site.primaryColor || '#1578FF' }}>
  :root {
    --primary: var(--primaryColor);
  }
</style>
```

### 3.3 Tailwind 配置

在 `tailwind.config.mjs` 中添加 `primary` 颜色：

```js
theme: {
  extend: {
    colors: {
      primary: 'var(--primary)',
    },
    // ... 其他配置
  },
}
```

### 3.4 组件中使用主题色

**方式一**：使用 Tailwind 类
```vue
<button class="bg-primary text-white">按钮</button>
<a class="text-primary hover:text-primary-dark">链接</a>
```

**方式二**：使用内联样式
```vue
<a :style="{ backgroundColor: 'var(--primary)' }">按钮</a>
```

---

## 4. 组件配置

### 4.1 交互组件

在 `schema.json` 中，需要客户端交互的组件必须添加 `interactive: true`：

```json
{
  "name": "NavMenu",
  "interactive": true,
  "props": { ... }
}
```

### 4.2 非交互组件

静态组件无需添加 `interactive`：

```json
{
  "name": "StaticComponent",
  "props": { ... }
}
```

---

## 5. 动态组件加载器

`dynamic-component.vue` 是用于动态渲染交互式组件的加载器。

### 5.1 glob 模式

```js
// 必须使用 ** 匹配多层目录
const components = import.meta.glob('~components/**/*.vue', { eager: true })
```

### 5.2 组件注册名

组件名通过目录名转换：`nav-menu` → `NavMenu`

```js
const name = dirName
  .split('-')
  .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
  .join('')
```

---

## 6. 流体设计（Fluid Design）

### 6.1 Root Font-Size

在 `[...slug].astro` 模板中设置：

```astro
<head>
  <script is:inline>
    (function() {
      var html = document.documentElement;
      function update() {
        var width = window.innerWidth;
        var size = Math.round(Math.max((width / 1920) * 16, 12) * 100) / 100;
        if (html.getAttribute('data-fontsize') != size) {
          html.style.fontSize = size + 'px';
          html.setAttribute('data-fontsize', size);
        }
      }
      update();
      window.addEventListener('resize', update);
    })();
  </script>
</head>
```

### 6.2 流体类定义（Tailwind）

在 `tailwind.config.mjs` 中定义：

```js
theme: {
  extend: {
    fontSize: {
      'fluid-xs': 'clamp(0.75rem, 0.6vw, 0.875rem)',
      'fluid-sm': 'clamp(0.875rem, 1vw, 1.25rem)',
      'fluid-base': 'clamp(1rem, 0.8vw, 1.125rem)',
      'fluid-lg': 'clamp(1.125rem, 1vw, 1.25rem)',
      'fluid-xl': 'clamp(1.25rem, 1.2vw, 1.5rem)',
      'fluid-2xl': 'clamp(1.5rem, 1.5vw, 1.875rem)',
      'fluid-3xl': 'clamp(1.875rem, 2vw, 2.25rem)',
      'fluid-4xl': 'clamp(2rem, 2.5vw, 3rem)',
      'fluid-5xl': 'clamp(2.5rem, 3.5vw, 4rem)',
    },
    height: {
      'fluid-nav': 'clamp(3.5rem, 4vw, 5rem)',
      'fluid-logo': 'clamp(1.5rem, 2vw, 2rem)',
      'fluid-carousel': 'clamp(20rem, 40vw, 37.5rem)',
    },
    width: {
      'fluid-2': 'clamp(0.5rem, 0.5vw, 0.5rem)',
      'fluid-3': 'clamp(0.75rem, 0.8vw, 0.75rem)',
      'fluid-4': 'clamp(1rem, 1vw, 1rem)',
      'fluid-6': 'clamp(1.5rem, 1.5vw, 1.5rem)',
      'fluid-8': 'clamp(2rem, 2vw, 2rem)',
      'fluid-10': 'clamp(2.5rem, 2.5vw, 2.5rem)',
    },
    spacing: {
      'fluid-1': 'clamp(0.25rem, 0.3vw, 0.25rem)',
      'fluid-2': 'clamp(0.5rem, 0.5vw, 0.5rem)',
      'fluid-3': 'clamp(0.75rem, 0.8vw, 0.75rem)',
      'fluid-4': 'clamp(1rem, 1vw, 1rem)',
      'fluid-5': 'clamp(1.25rem, 1.2vw, 1.25rem)',
      'fluid-6': 'clamp(1.5rem, 1.5vw, 1.5rem)',
      'fluid-8': 'clamp(2rem, 2vw, 2rem)',
      'fluid-10': 'clamp(2.5rem, 2.5vw, 2.5rem)',
      'fluid-12': 'clamp(3rem, 3vw, 3rem)',
      'fluid-16': 'clamp(4rem, 4vw, 4rem)',
    },
  },
}
```

---

## 7. 组件开发

### 7.1 创建组件

1. 在 `ssg-components/src/components/` 下创建组件目录
2. 编写 Vue 组件（如 `MyComponent.vue`）
3. 定义 schema（如 `schema.ts`）
4. 在 `ssg-components/src/index.ts` 中注册

### 7.2 组件命名

- 目录：kebab-case（如 `nav-menu`）
- 组件名：PascalCase（如 `NavMenu`）

### 7.3 组件结构

```vue
<template>
  <header class="fixed top-0 left-0 right-0 z-50 bg-white">
    <!-- 组件内容 -->
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// 组件逻辑
const menuOpen = ref(false)
</script>
```

### 7.4 注意事项

- **无需添加 `data-hydrate`**：Astro 会自动处理
- **无需导出初始化函数**：Vue 原生 hydration
- **无需 post-build 处理**：已移除

---

## 8. 响应式设计

### 8.1 断点选择

| 断点 | 宽度 | 用途 |
|------|------|------|
| lg | 1024px | 移动端/桌面端分界 |

### 8.2 移动端导航

```vue
<!-- 桌面端导航 -->
<ul class="hidden lg:flex">

<!-- 移动端 hamburger -->
<button class="lg:hidden">
```

---

## 9. 定位与布局

### 9.1 导航栏

```vue
<header class="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm max-w-[100vw]">
  <nav class="flex items-center h-fluid-nav px-4 lg:px-6">
    <!-- 内容 -->
  </nav>
</header>
```

### 9.2 下拉菜单定位

- **简单下拉菜单**：`absolute top-full left-0`
- **复杂下拉菜单（全屏）**：`fixed top-fluid-nav left-0`

### 9.3 移动端菜单

```vue
<!-- 全屏侧边菜单 -->
<div class="fixed top-fluid-nav right-0 w-full h-[calc(100vh-4rem)] bg-white">
```

---

## 10. 图标与文字

### 10.1 流体图标

```vue
<svg class="w-fluid-4 h-fluid-4">
```

### 10.2 流体文字

```vue
<a class="text-fluid-sm">文字</a>
```

### 10.3 流体高度

```vue
<div class="h-fluid-nav">
```

---

## 11. 开发流程

### 11.1 新增交互组件

1. 在 `ssg-components/src/components/` 创建组件目录
2. 编写 Vue 组件和 schema
3. 在 `ssg-components/src/index.ts` 中注册组件
4. 在 `schema.json` 中配置，添加 `"interactive": true`
5. 使用流体类设计样式
6. 运行 `bun run build` 测试

### 11.2 测试清单

| 检查项 | 验证方式 |
|--------|---------|
| astro-island 标签 | 检查 HTML 源码 |
| 组件内容完整 | 检查 HTML 源码 |
| Vue hydration | 浏览器控制台无错误 |
| 移动端交互 | 实际设备测试 |

---

## 12. 常见问题

### Q: 移动端组件点击无反应

**原因**：组件没有 `interactive: true`

**解决**：在 schema.json 中添加：

```json
{
  "name": "NavMenu",
  "interactive": true,
  "props": { ... }
}
```

### Q: 字体大小不变化

**原因**：root font-size 脚本未生效

**解决**：检查 `[...slug].astro` 中是否有 fluid font-size 脚本

### Q: 下拉菜单位置错误

**原因**：父元素高度不正确

**解决**：确保父元素有正确的高度，使用 `flex items-center h-fluid-nav`

### Q: 页面空白，组件未渲染

**原因**：`dynamic-component.vue` 中的 glob 模式不正确

**解决**：确保使用 `'~components/**/*.vue'`（双星号匹配多层目录）

### Q: 主题色不生效

**原因**：
1. `primaryColor` 未在 `schema.json` 的 `site` 部分配置
2. Tailwind 类的颜色值需要是 CSS 变量格式

**解决**：
1. 在 `site` 部分添加 `"primaryColor": "#1578FF"`
2. 使用 `bg-primary` 而非 `bg-blue-500`

---

## 13. 文件清单

| 文件 | 作用 |
|------|------|
| `[...slug].astro` | 页面模板，包含 fluid font-size 和主题色注入 |
| `tailwind.config.mjs` | 流体类定义和主题色配置 |
| `astro.config.mjs` | alias 配置（`~components` 指向组件目录） |
| `schema.json` | 页面配置，包含 interactive 标记和主题色 |
| `ssg-components/src/index.ts` | 组件注册导出 |
| `ssg-components/src/components/*` | Vue 组件源码 |
