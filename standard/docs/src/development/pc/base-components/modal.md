# PC端弹窗组件
## 基础用法

使用 `useModal` 创建最基础的模态框。

<DemoPreview file="demo/bimops-web-manage/cube-modal/cube-modal.tsx" />

## `ModalApi` 方法

### `setConfirmLoading`
设置确认按钮的加载状态。

```typescript
public setConfirmLoading(confirmLoading: boolean): void
```

**参数**：
- `confirmLoading: boolean` - 确认按钮的加载状态。

**示例**：
```typescript
modal.setConfirmLoading(true); // 设置确认按钮为加载状态
```

---

### `setState`
更新弹窗的状态。

```typescript
public setState(state: Partial<ModalState>): void
```

**参数**：
- `state: Partial<ModalState>` - 需要更新的状态对象。

**示例**：
```typescript
modal.setState({ confirmLoading: false }); // 更新弹窗状态
```

---

### `open`
打开弹窗。

```typescript
public open(): void
```

**示例**：
```typescript
modal.open(); // 打开弹窗
```

---

### `confirm`
触发确认操作。

```typescript
public confirm(): void
```

**说明**：
- 调用 `onConfirm` 回调函数（如果存在）。

**示例**：
```typescript
modal.confirm(); // 触发确认操作
```

---

### `close`
关闭弹窗。

```typescript
public close(): void
```

**说明**：
1. 调用 `api.onBeforeClose` 回调函数（如果存在），如果返回 `false`，则阻止关闭。
2. 如果允许关闭，则设置 `isOpen` 为 `false`。

**示例**：
```typescript
modal.close(); // 关闭弹窗
```

---

### 代码示例
```typescript
const [CubeModal,modalApi] = new Modal();

// 打开弹窗
modalApi.open();

// 设置确认按钮为加载状态
modalApi.setConfirmLoading(true);

// 更新弹窗状态
modalApi.setState({ confirmLoading: false });

// 触发确认操作
modalApi.confirm();

// 关闭弹窗
modalApi.close();
```

---

### 总结
- `setConfirmLoading`：设置确认按钮的加载状态。
- `setState`：更新弹窗的状态。
- `open`：打开弹窗。
- `onConfirm`：触发确认操作。
- `close`：关闭弹窗，支持 `onBeforeClose` 回调阻止关闭。

如果需要进一步补充或修改，请随时告诉我！


## `ModalProps` 属性

| 属性名                  | 类型      | 默认值   | 描述                                   |
|-------------------------|-----------|----------|----------------------------------------|
| `appendToMain`          | `boolean` | `false`  | 是否要挂载到内容区域                   |
| `bordered`             | `boolean` | `false`  | 是否显示边框                           |
| `cancelText`           | `string`  | -        | 取消按钮文字                           |
| `centered`             | `boolean` | `false`  | 是否居中                               |
| `class`                | `string`  | -        | 自定义类名                             |
| `closable`             | `boolean` | `true`   | 是否显示右上角的关闭按钮               |
| `closeOnClickModal`    | `boolean` | `true`   | 点击弹窗遮罩是否关闭弹窗               |
| `closeOnPressEscape`   | `boolean` | `true`   | 按下 ESC 键是否关闭弹窗                |
| `confirmDisabled`      | `boolean` | -        | 禁用确认按钮                           |
| `confirmLoading`       | `boolean` | `false`  | 确定按钮 loading                       |
| `confirmText`          | `string`  | -        | 确定按钮文字                           |
| `contentClass`         | `string`  | -        | 内容区域自定义类名                     |
| `description`          | `string`  | -        | 弹窗描述                               |
| `destroyOnClose`       | `boolean`  | -        | 在关闭时销毁弹窗。仅在使用 `connectedComponent` 时有效 |
| `draggable`            | `boolean` | `false`  | 是否可拖拽                             |
| `footer`               | `boolean` | `true`   | 是否显示底部                           |
| `footerClass`          | `string`  | -        | 底部区域自定义类名                     |
| `fullscreen`           | `boolean` | `false`  | 是否全屏                               |
| `fullscreenButton`     | `boolean` | `true`   | 是否显示全屏按钮                       |
| `header`               | `boolean` | `true`   | 是否显示顶栏                           |
| `headerClass`          | `string`  | -        | 顶栏区域自定义类名                     |
| `loading`              | `boolean` | `false`  | 弹窗是否显示                           |
| `modal`                | `boolean` | `true`   | 是否显示遮罩                           |
| `openAutoFocus`        | `boolean` | -        | 是否自动聚焦                           |
| `showCancelButton`     | `boolean` | `true`   | 是否显示取消按钮                       |
| `showConfirmButton`    | `boolean` | `true`   | 是否显示确认按钮                       |
| `title`                | `string`  | -        | 弹窗标题                               |
| `titleTooltip`         | `string`  | -        | 弹窗标题提示                           |
| `zIndex`               | `number`  | -        | 弹窗层级                               |
| `width`                | `string`  | -        | 宽度                                   |


---

## `ModalApiOptions` 回调方法

| 属性名                | 类型                       | 默认值   | 描述                                   |
|-----------------------|----------------------------|----------|----------------------------------------|
| `onBeforeClose`       | `() => void`               | -        | 关闭前的回调，返回 `false` 可以阻止关闭 |
| `onClosed`            | `() => void`               | -        | 点击右上角叉或取消按钮的回调               |
| `onConfirm`           | `() => void`               | -        | 点击确定按钮的回调                     |
| `onOpenChange`        | `(isOpen: boolean) => void`| -        | 弹窗状态变化回调                       |
| `onOpened`            | `() => void`               | -        | 弹窗打开动画结束的回调                 |

---

## `ModalState` 状态

| 属性名                | 类型      | 默认值   | 描述                                   |
|-----------------------|-----------|----------|----------------------------------------|
| `isOpen`             | `boolean` | -        | 弹窗是否显示                           |
| `destroyOnClose`     | `boolean` | -        | 在关闭时销毁弹窗                       |
| `confirmLoading`     | `boolean` | `false`  | 确定按钮 loading                       |

---

### 说明
1. `ModalApiOptions` 继承自 `ModalState`，`ModalState` 继承自 `ModalProps`。
2. `ModalApiOptions` 主要用于定义弹窗的行为和回调函数。
3. `ModalState` 是弹窗的状态，包含 `isOpen` 等属性。

如果需要进一步补充或修改，请随时告诉我！