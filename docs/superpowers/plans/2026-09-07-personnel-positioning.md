# 人员定位 UI 实施计划

**目标：** 完成人员定位子应用工程修复、定位对象及定位设备管理的模拟数据交互。

**范围依据：** 当前《人员定位需求文档》v2.7.7 §5.1、§5.1.1、§5.2。旧原型中的网关录入、地图空间关联、删除不在本次实现范围。人员来源当前仅组织管理开放同步。

**实现方式：** Vue Composition API + TSX，沿用 Cube PC 子应用工程；CubeLayout、useCubeForm、useCubeTable、useCubeModal 和 cube-ui。应用内 mock 模型不是服务端契约。人员、终端、绑定历史集中维护，显示值和 options 从 constants 派生。

- [x] 工程修复：修复 app.ts/app.tsx/main.ts、路由、缺失 locales、旧样式、Vite 地图残留；补齐 mock 字典、env 示例、README；移除无引用的旧项目工具。
- [x] 数据基础：models/positioning.ts 定义界面模型；constants/positioning.ts 定义枚举；mocks/positioning.seed.ts 定义数据；mocks/positioning.repository.ts 维护同步、绑定、解绑、启停；stores/positioning.ts 提供响应式共享状态。
- [x] 规则验证：用 Bun 测试人员同步幂等、终端唯一占用、换绑原子性、解绑保留历史、停用不会删除关系、设备同步保留平台启停、失败保留旧数据和重试。
- [x] 定位对象：views/objects/ 的列表、筛选、来源获取选择弹窗、来源档案、绑定/换绑及解绑确认；详情入口根据当前与历史绑定分流；导出当前筛选结果。
- [x] 人员详情：views/person-detail/ 的基础信息、实时位置预览和绑定记录；离线展示最后位置，未绑定不冒充实时定位；历史轨迹提供独立的模拟预览入口。
- [x] 定位设备：views/devices/ 的终端/基站分页列表、类型/在线/启停筛选、只读详情、启停确认、同步结果和同步记录；不显示定位对象，不提供设备端解绑。
- [x] 验证：执行目标构建、局部 oxlint、Bun 规则测试与本地浏览器关键交互；检查复制残留、路径解析和独立运行。

工作保持在用户提供的未跟踪项目目录，保留用户已经修正的应用名称、编码及挂载 id，不做提交或发布。
