# SCADA 产品属性映射实现计划

**目标：** 复用 Studio 已有的图元属性与逻辑 Tag 绑定，让 Demo 将产品属性映射到逻辑 Tag，并校验产品属性与图元属性的类型兼容性。

**架构：** 每条 `Binding` 同时描述“逻辑 Tag → 图元属性”，并可携带 Demo 选择的 `productProperty` 元数据。Demo 将模拟或真实设备值写入 `binding.tagName`，现有 `BindingEngine` 继续负责类型转换、表达式处理和图元属性更新。不再建立独立的“设备属性值绑定目标”模型。

### Task 1：统一绑定模型

- [x] 在 `Binding` 上增加可选的产品属性映射元数据。
- [x] 保留产品属性类型标准化与兼容性校验工具。
- [x] 删除独立的 `devicePropertyBindings` 类型、序列化和运行时分支。
- [x] 验证产品属性元数据随逻辑 Tag 绑定保存和恢复。

### Task 2：收敛 Studio 配置

- [x] 删除“设备属性值绑定目标”面板。
- [x] 将原“数据绑定”明确为“Tag / 点位绑定”。
- [x] 编辑绑定时保留 Demo 已配置的产品属性映射。
- [x] 提示产品属性由 Demo 映射到这条逻辑 Tag。

### Task 3：调整 Demo 产品映射

- [x] 按现有 `bindings` 展示可映射的图元属性与逻辑 Tag。
- [x] 将产品属性保存在对应 `Binding.productProperty`。
- [x] 禁用类型不兼容的产品属性，并在保存前再次校验。
- [x] 产品切换时清理旧映射，保留 Studio 的逻辑 Tag 绑定。
- [x] 将模拟值写入逻辑 Tag，通过现有引擎更新图元。
- [x] 保留弹窗及画布内产品字段选择功能。

### Task 4：验证

- [x] 运行核心序列化、类型兼容和绑定引擎测试。
- [x] 构建 Studio SDK、SCADA Studio 和 SCADA Demo。
- [x] 运行格式及 diff 检查，不改动或提交用户的其他工作区变更。
