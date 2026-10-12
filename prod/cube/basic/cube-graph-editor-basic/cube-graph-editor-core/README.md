# @graph-editor/core

核心图形编辑器包，提供通用的图形编辑能力，不包含任何业务逻辑。

## 特性

- ✅ 基于 AntV X6 的画布渲染
- ✅ 左中右三栏布局，支持插槽自定义
- ✅ 拖拽创建节点
- ✅ 选择、多选、框选
- ✅ 撤销/重做
- ✅ 缩放与平移
- ✅ 网格与对齐线
- ✅ Pinia 状态管理
- ✅ TypeScript 类型支持

## 安装

```bash
bun add @graph-editor/core
```

## 基础使用

```typescript
import { Editor } from "@graph-editor/core";

<Editor
  options={{
    grid: true,
    panning: true,
    mousewheel: true,
    snapline: true,
    selecting: true,
    history: true,
  }}
  onReady={(graph) => {
  }}
/>;
```

## 自定义面板

```typescript
import { Editor, ElementLibrary } from '@graph-editor/core'

<Editor>
  {{
    'left-panel': () => <ElementLibrary elements={myElements} />,
    'right-panel': ({ selection }) => <MyPropertyPanel selection={selection} />,
  }}
</Editor>
```

## Composables

核心包提供了多个 composable 函数：

- `useGraph` - Graph 实例管理
- `useDragDrop` - 拖拽功能
- `useSelection` - 选择与多选
- `useHistory` - 撤销重做
- `useZoom` - 缩放与平移
- `useConnect` - 连线管理

## 类型定义

```typescript
import type {
  EdgeData,
  EditorOptions,
  ElementDefinition,
  NodeData,
} from "@graph-editor/core";
```
