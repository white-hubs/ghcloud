# Cube Grid Vis SDK 使用手册

## 1. 概述

**Cube Grid Vis SDK** 是一款专为 Web 端设计的 3D 模型可视化与交互开发包。基于 Babylon.js 引擎构建，提供了高性能的模型加载、智能视角控制、自动化标签标注以及完善的资源生命周期管理功能。特别适用于网格化管理、数字孪生、建筑可视化等场景。

### 1.1 功能简介

*   **智能模型加载**：支持 `.glb` / `.gltf` 格式，内置加载动画，支持多模型追加与合并。
*   **自动化标签系统**：自动识别模型节点并生成跟随式 2D 标签，支持自定义前缀过滤。
*   **智能相机控制**：提供 "Smart Camera"（45度俯视）和 "Top View"（垂直俯视）两种标准化视角，支持平滑过渡动画。
*   **性能监控与管理**：内置 FPS 监控，低帧率自动预警，提供显式资源销毁接口防止内存泄漏。
*   **截图功能**：支持高精度场景截图。

### 1.2 适用平台与环境要求

*   **浏览器兼容性**：Chrome 80+, Firefox 80+, Safari 13+, Edge 80+ (需支持 WebGL 2.0 或 WebGL 1.0)。
*   **运行环境**：任何现代前端框架 (React, Vue, Angular) 或原生 HTML/TS 项目。
*   **依赖项**：
    *   `@babylonjs/core`: ^6.0.0
    *   `@babylonjs/loaders`: ^6.0.0
    *   `@babylonjs/gui`: ^6.0.0
    *   `gsap`: ^3.0.0 (用于相机动画)

### 1.3 版本历史

| 版本 | 日期 | 更新说明 |
| :--- | :--- | :--- |
| v1.0.0 | 2025-12-29 | 初始版本发布，支持模型加载与基础交互。 |

---

## 2. 快速开始

### 2.1 安装指南

使用 npm 或 yarn 安装 SDK 及其对等依赖：

```bash
# 安装核心依赖
npm install @babylonjs/core @babylonjs/loaders @babylonjs/gui gsap

# 安装 SDK (假设发布在私有源或本地引入)
npm install cube-grid-vis-sdk
```

### 2.2 最小化示例代码

在 HTML 中准备一个 Canvas 容器：

```html
<!-- index.html -->
<canvas id="renderCanvas" style="width: 100%; height: 100%;"></canvas>
```

在 TypeScript/JavaScript 中初始化 SDK：

```typescript
import { CubeGridVis } from 'ghcloud/cube-grid-vis-sdk';

// 1. 获取 Canvas 元素
const canvas = document.getElementById('renderCanvas') as HTMLCanvasElement;

// 2. 实例化 SDK
const sdk = new CubeGridVis(canvas);

// 3. 初始化并加载模型
async function start() {
    await sdk.init();
    
    try {
        // 加载远程模型
        await sdk.loadModel('https://example.com/models/building.glb');
    } catch (error) {
        (function(){})('加载失败:', error);
    }
}

start();
```

### 2.3 运行验证

1.  启动本地开发服务器 (如 `vite`, `webpack-dev-server`)。
2.  访问页面，若看到加载动画并成功渲染模型，且控制台无报错，即表示集成成功。

---

## 3. 核心功能

### 3.1 API 详解

#### `constructor(canvas: HTMLCanvasElement, options?: CubeGridVisOptions)`
初始化 SDK 实例。
*   **参数**: 
    *   `canvas`: 用于渲染的 DOM Canvas 元素。
    *   `options` (可选): SDK 初始化配置项。

```typescript
interface CubeGridVisOptions {
    /** 默认俯视角度（度），默认 60 度 */
    pitchDegrees?: number;
    /** 低帧率阈值（FPS），默认 30 */
    lowFpsThreshold?: number;
    /** 持续低帧率判定帧数，默认 15 */
    lowFpsFrameCount?: number;
    /** 加载动画配置 */
    loadingOptions?: {
        size?: number; // 默认 64
        color?: string; // 默认 #4285F4
        zIndex?: number; // 默认 9999
    };
}
```

#### `init(): Promise<this>`
异步初始化方法（目前主要用于占位，保留未来扩展能力）。
*   **返回值**: Promise<this>

#### `loadModel(url: string, pluginExtension?: string, releasePreviousModel: boolean = true): Promise<void>`
加载 3D 模型文件。
*   **参数**:
    *   `url`: 模型文件的 URL 路径或 Blob URL。
    *   `pluginExtension` (可选): 指定文件扩展名（如 `.glb`），当 URL 无法推断类型时使用。
    *   `releasePreviousModel` (可选, 默认 `true`): 
        *   `true`: 销毁当前场景中的旧模型，释放内存。
        *   `false`: 保留旧模型，将新模型追加到场景中（多模型共存模式）。
*   **异常**: 加载失败将抛出 Error。

#### `addLabelsToSubGrids(prefix: string = 'sub_grid_'): void`
为场景中符合命名规则的节点添加 2D 悬浮标签。
*   **参数**:
    *   `prefix` (可选, 默认 `'sub_grid_'`): 节点名称的前缀过滤条件。
*   **说明**: 标签将自动显示为去除前缀后的名称（例如节点名为 `sub_grid_A1`，标签显示 `A1`）。

#### `enableSmartCamera(animate: boolean = false): void`
切换到智能俯视视角（45度）。
*   **参数**: `animate` - 是否启用过渡动画。

#### `enableTopView(animate: boolean = true): void`
切换到垂直顶视视角（90度）。
*   **参数**: `animate` - 是否启用过渡动画。

#### `takeScreenshot(): Promise<string>`
截取当前画布内容。
*   **返回值**: Promise<Base64 格式的图片字符串>。

#### `dispose(): void`
⚠️ **重要**：销毁 SDK 实例，释放所有显存、内存、事件监听器及 DOM 元素。建议在组件卸载时调用。

#### `getFps(): number`
获取当前渲染帧率。

### 3.2 事件监听

SDK 提供了统一的事件监听接口，支持精确匹配和通配符匹配。

#### `on(pattern: string, callback: (event: CubeGridVisEvent) => void): void`
注册事件监听器。

*   **参数**:
    *   `pattern`: 事件名称或匹配模式（支持 `*` 通配符，如 `label-click:*`）。
    *   `callback`: 事件回调函数。

#### `off(pattern: string, callback: (event: CubeGridVisEvent) => void): void`
移除事件监听器。

#### 支持的事件类型

##### 1. 标签点击事件 (`label-click`)

当用户点击由 `addLabelsToSubGrids` 生成的标签时触发。

*   **事件名称格式**: `label-click:[labelId]` (例如 `label-click:A1`)
*   **通配符监听**: 使用 `label-click:*` 监听所有标签点击。
*   **事件对象结构**:

```typescript
interface CubeGridVisEvent {
    eventName: string; // 事件名称，如 label-click:A1
    data: {
        labelId: string;    // 标签ID (Mesh Name)
        gridId: string;     // 网格ID (标签文本)
    };
    stopPropagation: () => void; // 阻止事件传播
}
```

*   **冒泡机制**:
    事件会按照 **精确匹配 -> 通配符匹配** 的顺序触发。
    例如，点击标签 `A1` 时：
    1.  优先触发注册在 `label-click:A1` 上的监听器。
    2.  随后触发注册在 `label-click:*` 上的监听器。
    3.  如果在 `label-click:A1` 的回调中调用了 `event.stopPropagation()`，则 `label-click:*` 的监听器将不会收到该事件。

**示例代码**:

```typescript
// 监听所有标签点击
sdk.on('label-click:*', (event) => {
});

// 监听特定标签点击
sdk.on('label-click:A1', (event) => {
    event.stopPropagation(); // 阻止冒泡，通配符监听器将不会收到此事件
});
```

##### 2. 低帧率警告 (`onLowFpsObservable`)
帧率过低事件。当连续 15 帧低于 30 FPS 时触发。

```typescript
sdk.onLowFpsObservable.add((fps) => {
    (function(){})(`性能警告: 当前帧率仅为 ${fps.toFixed(1)}`);
});
```

---

## 4. 高级配置与性能优化

### 4.1 内存管理策略
*   **单模型模式**: 默认 `loadModel` 会自动销毁旧模型。
*   **多模型模式**: 设置 `releasePreviousModel = false` 可叠加模型。务必注意，叠加过多高精度模型会导致显存暴涨。
*   **手动清理**: 可随时调用 `sdk.dispose()` 彻底重置环境。

### 4.2 性能优化建议
1.  **模型优化**: 尽量使用 Draco 压缩的 GLB 文件，减少顶点数和贴图尺寸。
2.  **标签控制**: 避免一次性添加数千个标签，`addLabelsToSubGrids` 会创建大量 DOM/GUI 节点，建议按需生成。
3.  **FPS 监控**: 监听 `onLowFpsObservable`，在低端设备上提示用户或自动降低画质（暂需业务层实现画质降级逻辑）。

---

## 5. 最佳实践

### 典型使用模式：React 组件集成

```tsx
import React, { useEffect, useRef } from 'react';
import { CubeGridVis } from 'cube-grid-vis-sdk';

export const GridViewer = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sdkRef = useRef<CubeGridVis | null>(null);

  useEffect(() => {
    if (canvasRef.current) {
      // 初始化
      const sdk = new CubeGridVis(canvasRef.current);
      sdkRef.current = sdk;
      
      // 初始加载
      sdk.loadModel('/assets/park.glb').then(() => {
          // 加载完成后添加标签
          sdk.addLabelsToSubGrids('building_');
      });
    }

    // 卸载清理
    return () => {
      if (sdkRef.current) {
        sdkRef.current.dispose();
        sdkRef.current = null;
      }
    };
  }, []);

  return <canvas ref={canvasRef} style={{ width: '100vw', height: '100vh' }} />;
};
```

### 常见问题

*   **Q: 标签位置不正确？**
    *   A: 标签默认锚定在 Mesh 中心上方。请检查模型的原点（Pivot）设置，或确认模型是否经过了复杂的变换矩阵。
*   **Q: `dispose` 后画布未清空？**
    *   A: SDK v1.2.0 已增强清理逻辑，会强制重置 Canvas Context。如仍有残留，请检查是否有外部代码持有 Canvas 引用。

---

## 6. 附录

### 6.1 依赖项说明

| 依赖包 | 用途 |
| :--- | :--- |
| `@babylonjs/core` | 3D 渲染引擎核心 |
| `@babylonjs/loaders` | GLTF/GLB 文件加载器 |
| `@babylonjs/gui` | 2D 标签与 UI 绘制 |
| `gsap` | 相机路径平滑动画 |
