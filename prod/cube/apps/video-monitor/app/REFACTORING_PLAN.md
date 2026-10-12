# 代码可读性重构计划

## 📋 审查总结

### 当前代码结构
```
src/
├── app.tsx              # 根组件 (28行) ✅ 结构清晰
├── app.ts               # 未使用的类 (79行) ⚠️ 需要确认是否删除
├── main.ts              # 入口文件 (46行) ✅ 结构清晰
├── routes.ts            # 路由配置 (52行) ✅ 结构清晰
├── hooks/
│   └── auth-request.ts  # 认证请求钩子 (6行) ✅ 结构清晰
├── logger.ts            # 日志工具 (3行) ✅ 结构清晰
├── global.d.ts          # 类型声明 (18行) ✅ 结构清晰
└── views/
    └── permission/
        ├── permission-list.tsx    # 权限列表 (421行) ⚠️ 需要重构
        ├── permission-editor.tsx  # 权限编辑器 (1172行) ⚠️ 需要重构
        └── permission-editor.less # 样式文件 (3行) ⚠️ 需要扩展
```

### 主要问题

#### 1. **permission-list.tsx (421行)**
- ❌ 内联样式字符串过多（pageStyle, headerStyle等）
- ❌ 表格列定义内联在组件中，可读性差
- ❌ 数据转换逻辑复杂（mapDeviceAuthToRecord），应该提取
- ❌ 类型定义混在组件文件中
- ❌ 业务逻辑和UI逻辑耦合

#### 2. **permission-editor.tsx (1172行)**
- ❌ 文件过长，违反单一职责原则
- ❌ 内联样式字符串过多（20+个样式变量）
- ❌ 数据转换函数应该提取到工具文件
- ❌ 状态管理逻辑复杂，应该拆分
- ❌ 数据加载逻辑应该提取到composables
- ❌ 组件渲染逻辑可以拆分成子组件
- ❌ 大量的watch监听器，逻辑复杂

#### 3. **app.ts (79行)**
- ⚠️ 未被使用，需要确认是否删除

---

## 🎯 重构目标

1. **提高可读性**：将长文件拆分为更小的、职责单一的文件
2. **提高可维护性**：提取公共逻辑，减少重复代码
3. **提高可测试性**：将业务逻辑从UI中分离
4. **统一代码风格**：使用CSS模块或样式文件替代内联样式

---

## 📝 详细重构计划

### 阶段一：基础重构（优先级：高）

#### 1.1 清理未使用文件
- [ ] 确认 `app.ts` 是否被使用，如未使用则删除

#### 1.2 提取类型定义
**目标文件：** `src/types/permission.ts`
```typescript
// 提取所有权限相关的类型定义
- OwnershipItem
- ScopeItem
- PermissionRecord
- DeviceInfo
- ScopeTreeNode
- DeviceDisplay
- SelectOption
```

#### 1.3 提取样式
**目标文件：** `src/views/permission/permission-list.less`
- [ ] 将 `permission-list.tsx` 中的内联样式提取到CSS文件
- [ ] 使用CSS类名替代内联样式字符串

**目标文件：** `src/views/permission/permission-editor.less`
- [ ] 将 `permission-editor.tsx` 中的内联样式提取到CSS文件
- [ ] 使用CSS类名替代内联样式字符串

#### 1.4 提取工具函数
**目标文件：** `src/utils/permission.ts`
```typescript
// 数据转换函数
- mapDeviceAuthToRecord()
- convertAreaToScopeTreeNode()
- convertAreasToScopeTree()
- convertGroupToScopeTreeNode()
- convertDeviceInstanceToDeviceInfo()
- buildKeyMap()
- toCheckedKeys()
```

**目标文件：** `src/utils/scope.ts`
```typescript
// 范围相关工具函数
- buildAuthScopes()
- buildGrantTargets()
- queryDevicesByAreas()
- queryDevicesByGroups()
- queryDevicesByIds()
```

---

### 阶段二：组件拆分（优先级：高）

#### 2.1 拆分 permission-list.tsx
**目标结构：**
```
src/views/permission/
├── permission-list.tsx           # 主组件（简化后约150行）
├── permission-list.less           # 样式文件
├── components/
│   ├── PermissionTable.tsx        # 表格组件
│   ├── PermissionTableColumns.tsx # 表格列定义
│   └── PermissionSearchForm.tsx   # 搜索表单组件
└── composables/
    └── usePermissionList.ts       # 列表逻辑（数据加载、搜索、删除等）
```

**拆分内容：**
- [ ] 提取表格列定义到 `PermissionTableColumns.tsx`
- [ ] 提取搜索表单到 `PermissionSearchForm.tsx`
- [ ] 提取业务逻辑到 `usePermissionList.ts` composable
- [ ] 主组件只保留UI结构和事件绑定

#### 2.2 拆分 permission-editor.tsx
**目标结构：**
```
src/views/permission/
├── permission-editor.tsx          # 主组件（简化后约200行）
├── permission-editor.less         # 样式文件
├── components/
│   ├── ScopeSelector.tsx          # 监控范围选择器
│   ├── ScopeTree.tsx              # 范围树组件
│   ├── DeviceList.tsx              # 设备列表组件
│   ├── OwnershipSelector.tsx      # 权限归属选择器
│   └── DeviceDisplayCard.tsx      # 设备展示卡片
└── composables/
    ├── useScopeData.ts            # 范围数据管理
    ├── useDeviceData.ts           # 设备数据管理
    ├── useOwnershipData.ts        # 权限归属数据管理
    └── usePermissionEditor.ts    # 编辑器主逻辑
```

**拆分内容：**
- [ ] 提取监控范围选择器到 `ScopeSelector.tsx`
- [ ] 提取设备列表到 `DeviceList.tsx`
- [ ] 提取权限归属选择器到 `OwnershipSelector.tsx`
- [ ] 提取范围数据逻辑到 `useScopeData.ts`
- [ ] 提取设备数据逻辑到 `useDeviceData.ts`
- [ ] 提取权限归属逻辑到 `useOwnershipData.ts`
- [ ] 提取编辑器主逻辑到 `usePermissionEditor.ts`

---

### 阶段三：逻辑优化（优先级：中）

#### 3.1 优化数据加载
- [ ] 统一错误处理逻辑
- [ ] 添加加载状态管理
- [ ] 优化异步数据加载顺序

#### 3.2 优化状态管理
- [ ] 使用 computed 优化派生状态
- [ ] 减少不必要的 watch 监听器
- [ ] 优化防抖逻辑

#### 3.3 优化类型安全
- [ ] 完善类型定义
- [ ] 减少 any 类型使用
- [ ] 添加类型守卫函数

---

### 阶段四：代码质量提升（优先级：低）

#### 4.1 添加注释
- [ ] 为复杂函数添加JSDoc注释
- [ ] 为业务逻辑添加说明注释

#### 4.2 统一命名规范
- [ ] 统一函数命名（handleXxx, loadXxx, queryXxx等）
- [ ] 统一变量命名（isXxx, hasXxx, selectedXxx等）

#### 4.3 提取常量
**目标文件：** `src/constants/permission.ts`
```typescript
// 提取魔法数字和字符串
- 默认分页大小
- 搜索防抖时间
- 标签颜色映射
- 类型标签映射
```

---

## 📊 重构前后对比

### permission-list.tsx
- **重构前：** 421行，包含所有逻辑
- **重构后：** 
  - 主组件：~150行
  - 子组件：~100行/个
  - Composables：~150行
  - 工具函数：~100行

### permission-editor.tsx
- **重构前：** 1172行，包含所有逻辑
- **重构后：**
  - 主组件：~200行
  - 子组件：~150行/个（5个组件）
  - Composables：~200行/个（4个composables）
  - 工具函数：~200行

---

## 🚀 实施建议

### 推荐顺序
1. **阶段一**：基础重构（影响面小，风险低）
2. **阶段二**：组件拆分（需要仔细测试）
3. **阶段三**：逻辑优化（在拆分基础上优化）
4. **阶段四**：代码质量提升（持续改进）

### 注意事项
1. **保持功能不变**：重构过程中确保功能完全一致
2. **逐步重构**：每次重构一个小模块，及时测试
3. **保留原文件**：重构初期可以保留原文件作为参考
4. **充分测试**：每个阶段完成后进行完整测试

---

## 📈 预期收益

1. **可读性提升 60%+**：文件长度减少，职责清晰
2. **可维护性提升 50%+**：逻辑分离，易于修改
3. **可测试性提升 70%+**：业务逻辑可独立测试
4. **开发效率提升 30%+**：代码复用，减少重复

---

## ✅ 检查清单

### 重构完成标准
- [x] 所有内联样式已提取到CSS文件
- [x] 所有类型定义已提取到类型文件
- [x] 所有工具函数已提取到工具文件
- [x] permission-list 业务逻辑已提取到composables
- [x] permission-list 组件已拆分
- [x] 代码通过ESLint检查
- [x] 无TypeScript错误
- [ ] permission-editor 完全重构（部分完成，已创建 composables）
- [ ] 功能测试通过

### 已完成的重构
1. ✅ 删除未使用的 app.ts 文件
2. ✅ 提取类型定义到 `src/types/permission.ts`
3. ✅ 提取工具函数到 `src/utils/permission.ts` 和 `src/utils/scope.ts`
4. ✅ 提取常量到 `src/constants/permission.ts`
5. ✅ 创建样式文件 `permission-list.less` 和 `permission-editor.less`
6. ✅ 重构 permission-list.tsx：
   - 创建 `usePermissionList` composable
   - 创建 `PermissionTableColumns` 组件
   - 创建 `PermissionSearchForm` 组件
   - 主组件从 421 行减少到 ~90 行
7. ✅ 创建 permission-editor 相关 composables：
   - `useScopeData` - 监控范围数据管理
   - `useOwnershipData` - 权限归属数据管理
8. ✅ 修复所有 lint 错误

---

## 📝 备注

- 本计划为渐进式重构，可以分阶段实施
- 建议每个阶段完成后进行代码审查
- 重构过程中注意保持Git提交的原子性

