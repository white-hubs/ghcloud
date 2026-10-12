# 安全人员管理 H5

## 实现细节与落地步骤

1. 新建独立 H5 包 `prod/cube/apps/safety-personnel-management/h5`，沿用现有 Cube H5 子应用结构：Vite + Vue3 TSX、Vant、`ThemeConfigProvider`、`CubeAuthRequest`、`postcss-px-to-viewport`。
2. 应用编码使用 `SAFETY_PERSONNEL`，路由根路径 `/` 重定向 `/entry`；入口页只提供两个平级入口：`/personnel` 安全人员、`/key-personnel` 重点人员。
3. 安全人员列表复用 `pagePersons`，支持关键词、人员类型 chips、下拉刷新和分页加载；新增人员通过人员池弹层调用 `pagePersonPool + linkPersons` 完成关联，`ALL` 类型下禁止关联并提示用户。
4. 安全人员详情复用 `getPersonProfile + getPersonCertificates + getPersonResumeTimeline/getPersonResumeByType`，以移动端 tabs、卡片和时间线展示基础信息、证书与履职记录；移除人员调用 `deletePerson` 并二次确认。
5. 重点人员列表复用 `pageKeyPersons`，支持关键词、风险等级 chips、下拉刷新和分页加载；卡片展示编号、姓名、手机号、区域、风险等级、监管人员、监管原因，并提供详情、上报、编辑、删除闭环。
6. 重点人员新增/编辑复用 `getKeyPersonAreaOptions + getKeyPersonSupervisorOptions + createKeyPerson/updateKeyPerson`，字段对齐 PC：姓名、手机号、身份证、区域、风险等级、监管人员、监管原因、照片、附件。
7. 重点人员详情复用 `getKeyPersonDetail + pageKeyPersonReports`，展示基础信息、照片/附件、监管原因和监管记录；监管上报复用 `createKeyPersonReport`，内容必填并支持附件。
8. 文件上传不新增后端协议，沿用公共文件服务能力和 PC 场景码：`securityKeyPersonPhoto`、`securityKeyPersonAttachment`、`securityKeyPersonReportAttachment`。
9. 完成后执行 H5 build；如未修改 `cube-services`，不额外构建公共 client。构建中如遇本包未安装依赖，使用仓库已有 H5 依赖能力做临时验证并清理临时文件。

## 为什么这样实现

- 与现有 H5 模块保持一致：使用 Vant 卡片流、筛选 chips、弹层和移动端表单，避免复制原型 Tailwind HTML 或引入新的 UI 体系。
- 与 PC 功能保持一致：安全人员新增采用“人员池关联”而不是手填创建；重点人员新增/编辑/上报全部复用既有 client，最终写入仍走已有后端契约。
- 移动端信息架构收敛：入口只放两个用户要求的平级菜单，详情、编辑、上报作为列表动作和详情动作承载，不增加不可闭环的监管报警、风险预警、行为轨迹页面。
- 文件能力低侵入：只封装 H5 轻量上传组件和公共文件服务调用，复用 PC 场景码，避免新增后端协议或硬编码 mock 数据进入业务路径。

## 执行复核清单

- [x] H5 工程骨架、构建配置、应用编码和鉴权请求链路已落地。已新增 `package.json`、Vite 配置、`src/main.ts`、`src/app.ts[x]`、鉴权 store 与 `CubeAuthRequest` 接入。
- [x] `/entry` 入口只展示“安全人员”“重点人员”两个平级菜单。未新增监管报警、风险预警、行为轨迹等不可闭环页面。
- [x] 安全人员列表、筛选、刷新、分页、人员池关联、详情履历、证书、移除闭环已落地。列表调用 `pagePersons`，人员池调用 `pagePersonPool + linkPersons`，详情调用 profile/cert/resume 接口，移除调用 `deletePerson`。
- [x] 重点人员列表、筛选、刷新、分页、详情、上报、编辑、删除闭环已落地。列表/详情/表单/上报分别复用 `pageKeyPersons`、`getKeyPersonDetail + pageKeyPersonReports`、`createKeyPerson/updateKeyPerson`、`createKeyPersonReport`；详情页监管记录已改为 H5 List 分页加载，每页 10 条，按 `total` 和本页返回条数判断是否结束，避免一次只取 50 条导致超过 50 条记录丢失。
- [x] 重点人员照片、附件、监管上报附件上传复用 PC 场景码和公共文件服务。H5 轻量上传组件调用 `CubeFileService.uploadFile`，场景码来自 `GLOBAL_SCENE_CODE.securityKeyPersonPhoto/securityKeyPersonAttachment/securityKeyPersonReportAttachment`。
- [x] 未修改后端仓库，未向最终业务路径写入 mock 数据。本次仅新增 `safety-personnel-management/h5` 前端包，未调整 cube2 后端。
- [x] H5 build 已执行并记录结果。由于新包无本地 `node_modules`，先直接执行 `bun run build` 确认失败原因为 `vite: command not found`；随后临时链接同仓库 `risk-graded-control/h5/node_modules` 执行 `bun run build`，Vite 生产构建通过。本轮分页修复后已重新执行同样验证，构建通过，`dist`、`components.d.ts` 和临时依赖链接已清理。
