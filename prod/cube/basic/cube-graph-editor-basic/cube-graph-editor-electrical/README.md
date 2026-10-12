# @graph-editor/electrical

基于 `@graph-editor/core` 扩展的电气连接关系编辑器。

## 特性

- ✅ 电气节点定义（断路器、开关、电阻、电容等）
- ✅ 节点树管理（支持多根节点）
- ✅ 设备绑定功能
- ✅ 业务数据与 X6 图数据双向转换
- ✅ 电气元素库
- ✅ 属性面板（样式、属性、设备绑定）

## 安装

```bash
bun add @graph-editor/electrical
```

## 使用示例

```typescript
import { ElectricalEditor } from '@graph-editor/electrical'
import type { ElectricalNode } from '@graph-editor/electrical'

const nodes: ElectricalNode[] = [
  {
    id: 'root1',
    name: '主配电系统',
    type: 'root',
    children: [
      {
        id: 'device1',
        name: '断路器 A1',
        type: 'device',
        deviceId: 'breaker-001',
      },
    ],
  },
]

<ElectricalEditor
  nodes={nodes}
  options={{
    grid: true,
    panning: true,
    mousewheel: true,
  }}
  onReady={(graph) => {
  }}
  onChange={(data) => {
  }}
/>
```

## 数据转换

### 导出数据

```typescript
import { transformFromGraph } from "@graph-editor/electrical";

const data = transformFromGraph(graph);
```

### 导入数据

```typescript
import {
  loadElectricalDataToGraph,
  transformToGraph,
} from "@graph-editor/electrical";

loadElectricalDataToGraph(graph, electricalData);
```

## 自定义节点

可以使用 X6 的 `Node.define` 定义自定义电气节点：

```typescript
import { Node } from "@antv/x6";

const CustomNode = Node.define({
  shape: "custom-electrical",
  width: 80,
  height: 60,
  // ... 自定义配置
});
```

## 设备绑定

```typescript
import type { DeviceBinding } from "@graph-editor/electrical";

const binding: DeviceBinding = {
  deviceId: "breaker-001",
  deviceName: "断路器 A1",
  deviceType: "breaker",
  parameters: {
    ratedCurrent: 100,
    ratedVoltage: 380,
  },
};
```
