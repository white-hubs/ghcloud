# 视频监控内存整改方案

> **文档版本**：v1.0  
> **创建日期**：2026-07-20  
> **适用范围**：报警弹窗、安防监控、长沙指挥调度  
> **关联文档**：[memory-remediation-checklist.md](./memory-remediation-checklist.md)（报警弹窗细项清单）· [memory-remediation-implementation.md](./memory-remediation-implementation.md)（**已修改内容汇总**）

---

## 1. 文档目的

本方案针对以下三个业务场景中 **CubePlayer 实时视频监控** 的内存泄漏、资源未释放、并发竞态及峰值占用过高问题，给出统一整改路径、分期计划和验收标准。

| 模块 | 代码路径 | 视频场景 |
|------|----------|----------|
| **报警弹窗** | `prod/cube/apps/alarm-center/alarm-modal` | iframe 单例，报警附带 1~9 路视频 |
| **安防监控** | `prod/cube/apps/security-management` | PC 预览弹窗 / H5 详情页，单路为主 |
| **长沙指挥调度** | `legacy/command-dispath-changsha-migrate` | 主屏 4 路常驻 + 放大 modal，叠加报警弹窗 |

三者共用 **`@ghcloud/cube-player`**，底层播放器修复一次，三处同时受益。

---

## 2. 现状架构

```
                    ┌─────────────────────────────────────┐
                    │     @ghcloud/cube-player（共享）      │
                    │  PlayerCore → H5S / 海康 / GHY / 大华  │
                    └──────────────┬──────────────────────┘
           ┌───────────────────────┼───────────────────────┐
           ▼                       ▼                       ▼
   ┌───────────────┐      ┌───────────────┐      ┌───────────────────┐
   │  报警弹窗      │      │  安防监控      │      │  长沙指挥调度       │
   │  iframe 单例   │      │  PC modal     │      │  sceneMonitor 4路  │
   │  队列 1~9 路   │      │  H5 详情 1路   │      │  + videoModal 放大  │
   └───────┬───────┘      └───────────────┘      └─────────┬─────────┘
           │                                                │
           └──────────────── 可同时叠加占用 ──────────────────┘
                    （长沙 App.vue 内嵌 CubeAlarmModal）
```

### 2.1 各模块典型并发路数

| 模块 | 常态 | 峰值 | 关闭/离开释放 |
|------|------|------|---------------|
| 报警弹窗 | 当前报警 1~9 路 | 9 路（九宫格） | 视频基本释放；iframe/SDK 常驻 |
| 安防监控 | 1 路 | 1 路 | 弹窗关闭 / 路由离开 → 正常卸载 |
| 长沙指挥调度 | **4 路常驻** | 4 + modal **重复 1 路** = 5 路 | 路由离开卸载 4 路；modal `v-if` 正常 |
| **叠加场景** | 4 + 报警弹窗 | **最多 4 + 9 = 13 路** | 需业务层互斥或路数预算 |

### 2.2 关键代码索引

| 模块 | 文件 |
|------|------|
| 报警弹窗 UI | `alarm-modal/src/views/alarm-modal.tsx` |
| 报警 iframe 注册 | `alarm-modal/src/register.ts` |
| 播放器 | `prod/cube/basic/cube-player/src/player/` |
| 安防 PC 预览 | `security-management/app/src/views/associated-devices/associated-devices.tsx` |
| 安防 H5 详情 | `security-management/h5/src/views/security-video/video-detail.tsx` |
| 长沙 sceneMonitor | `command-dispath-changsha-migrate/.../sceneMonitor.vue` |
| 长沙 CustomPlayer | `command-dispath-changsha-migrate/src/components/cube-player/index.vue` |
| 长沙放大 modal | `command-dispath-changsha-migrate/.../video-modal/index.vue` |
| 长沙报警接入 | `command-dispath-changsha-migrate/src/App.vue` |

---

## 3. 问题总览

### 3.1 按严重程度

| 级别 | 类型 | 影响模块 | 说明 |
|------|------|----------|------|
| **P0** | 定时器泄漏 | 报警弹窗 | `getAlarmStatus` 多条报警后孤儿 interval |
| **P0** | 关闭不完整 | 报警弹窗 | 音频未 pause、state 未 reset |
| **P0** | 异步竞态 | 报警弹窗 | `getAlarmEventVideo` 与 `getAlarmDetail` 互相覆盖 videoList |
| **P0** | 消息无串行 | 报警弹窗 | 多条报警 `postMessage` 并行处理 |
| **P0** | 重复拉流 | 长沙指挥调度 | 放大 modal 时 sceneMonitor 4 路不停 |
| **P0** | 组件缺失 | 长沙指挥调度 | `device-info` 引用 `<g-video>` 但项目内无实现 |
| **P1** | H5S 重连泄漏 | 共享 cube-player | 重连前未 disconnect 旧实例 |
| **P1** | 海康/GHY destroy 不完整 | 共享 cube-player | 插件/DOM placeholder 残留 |
| **P1** | 轮询误关全部 | 报警弹窗 | 任一条 ALARM_HANDLER → close 清空队列 |
| **P1** | 音频配置串台 | 报警弹窗 | `getAlarmLevelPlayConfig` 读 currentAlarm 而非新报警 |
| **P2** | 多路峰值 | 报警弹窗 / 长沙 | 9 路 / 4 路无全局路数预算 |
| **P2** | iframe 常驻 | 报警弹窗 | SDK 基线占用 |
| **P3** | 图表 snapshot 乱序 | 报警弹窗 | 切换报警时旧请求覆盖新数据 |

### 3.2 安防监控专项结论

安防监控 **无独立 timer/iframe 泄漏**，风险主要来自：

1. 继承 `cube-player` 底层 destroy 不完整（P1 共享层）
2. PC 预览 modal 关闭时未显式清空 `curRow`（影响较小）
3. 不与指挥调度/报警弹窗叠加，**整体风险最低**

---

## 4. 整改方案

### 4.1 共享层：`@ghcloud/cube-player`

**目标**：所有 CubePlayer 消费者在 destroy / 重连 / 异常恢复时行为一致。

| 编号 | 整改项 | 文件 | 方案 | 工时 |
|------|--------|------|------|------|
| **S-1** | H5S 重连前先 destroy | `player-strategy.ts` → `H5sPlayerStrategy` | `initPlayer()` 开头：`clearInterval` → `disconnect()` → `playerInstance = null` | 0.5d |
| **S-2** | 海康 destroy 增强 | `HikvisionPlayerStrategy` | 补充 `JS_Stop` + 文档要求的销毁 API，`playerInstance = null` | 1d |
| **S-3** | GHY placeholder 清理 | `GhyPlayerStrategy` | `destroy()` 移除 `[data-cube-player-h265-placeholder]` 节点 | 0.5d |
| **S-4** | 页面可见性暂停（可选） | `player.tsx` 或业务层 | `document.visibilityState === 'hidden'` 时 disconnect，visible 时恢复 | 1d |

**验收**：模拟断流重连 5 次、开关播放器 20 次，Memory 快照无持续增长。

---

### 4.2 报警弹窗

**目标**：消除泄漏与竞态；关闭后视频/音频/timer 完整释放。

#### 4.2.1 P0 — 必须修

| 编号 | 整改项 | 方案 |
|------|--------|------|
| **A-1** | 定时器泄漏 | `Map<businessKey, timerId>` 管理轮询；`close()` / 单条处理完时 `clearInterval` + delete |
| **A-2** | 统一 reset | 抽取 `resetAlarmModalState()`：`alarmItems` 清空、全部 timer 清除、audio pause、图表 state 重置、`videoErrorMap` 清空 |
| **A-3** | 消息串行化 | `handleWindowMessage` 改为队列：一条处理完再处理下一条；或 mutex 锁 |
| **A-4** | videoList 竞态 | `await getAlarmEventVideo()` 后再 `getAlarmDetail()`；或 merge 时取 `Math.max` 最新 videoList |
| **A-5** | 音频清理 | `resetAlarmModalState` 内：`audioDom.pause()`、`currentTime = 0`、重置 `alarmLevelAudio` / `playCount` |

**涉及文件**：`alarm-modal/src/views/alarm-modal.tsx`

#### 4.2.2 P1 — 建议修

| 编号 | 整改项 | 方案 |
|------|--------|------|
| **A-6** | 轮询关闭策略 | 单条 `ALARM_HANDLER` 只移除该条 alarm，不 `close()` 全部（需产品确认） |
| **A-7** | 音效配置 | `getAlarmLevelPlayConfig(businessKey \| alarmIndex)`，不读 `currentAlarm` |
| **A-8** | 报警去重 | `addAlarmMessage` 按 `businessKey` 去重，避免重复入队 |
| **A-9** | snapshot 乱序 | `handleAlarmSnapshot` 加 `requestId`，丢弃过期响应 |

#### 4.2.3 P2 — 峰值优化

| 编号 | 整改项 | 方案 |
|------|--------|------|
| **A-10** | 九宫格懒加载 | Tab `destroyInactiveTabPane` + 九宫格 `LazyVideoPlayer`（IntersectionObserver + 全局最多 4 路并发） | ✅ 已实现 |
| **A-11** | 队列上限 | `alarmItems` 上限 50 条，超出提示 | ✅ 已实现 |
| **A-12** | iframe reset | 关闭后空闲 30 分钟销毁 iframe，下次报警重建 | ✅ 已实现 |

**涉及文件**：`alarm-modal/src/views/alarm-modal.tsx`、`register.ts`

---

### 4.3 长沙指挥调度

**目标**：降低 4 路常驻 + 放大重复拉流；修复不可用监控 tab。

| 编号 | 整改项 | 文件 | 方案 | 工时 |
|------|--------|------|------|------|
| **C-1** | 放大停背景流 | `index.vue` + `sceneMonitor.vue` | modal 打开时暂停/卸载 sceneMonitor 同 deviceId 或全部 4 路；关闭 modal 恢复 | 1d |
| **C-2** | 修复 g-video | `device-info/index.vue` | 改为 `CustomPlayer`（与 sceneMonitor 一致），或补 `gVideo.vue` 封装 CubePlayer | 0.5d |
| **C-3** | 关闭自动重连 | `cube-player/index.vue` | 增加 `:enable-auto-recovery="false"`，减少 H5S 异常 churn | 0.5d |
| **C-4** | 路数可见性 | `sceneMonitor.vue` | 轮播翻页 `:key` 强制卸载 + 翻页先清空 `swiperVideo` | ✅ 已实现 |
| **C-5** | 与报警弹窗互斥（可选） | `App.vue` / `index.vue` | 报警弹窗展示视频时，sceneMonitor 降为 1 路或暂停（需产品确认） | 2d |

**验收**：

- 打开放大 modal 前后，Performance 中 WebSocket/解码器数量不增加（或仅 +1 不重复）
- device-info「关联监控」tab 可正常播放
- 离开指挥调度页，4 路全部停止

---

### 4.4 安防监控

**目标**：跟随共享层修复；补齐少量边界清理。

| 编号 | 整改项 | 文件 | 方案 | 工时 |
|------|--------|------|------|------|
| **M-1** | 继承 S-1~S-3 | — | 升级 `@ghcloud/cube-player` 即可 | — |
| **M-2** | modal 关闭清理 | `associated-devices.tsx` | `onCancel` 时 `curRow = undefined`，确保 CubePlayer 卸载 | 0.5d |
| **M-3** | 路由离开 | `video-detail.tsx` | 已有 `onBeforeUnmount`，确认 CubePlayer 正常 destroy（回归即可） | — |

安防监控 **无需独立大批量改造**，以共享层 + 回归测试为主。

---

## 5. 分期实施计划

### 第一阶段：止血（3~4 工作日）

**目标**：消除明确泄漏与数据竞态。

```
Week 1
├── [共享] S-1  H5S 重连 destroy
├── [报警] A-1  定时器 Map 管理
├── [报警] A-2  resetAlarmModalState
├── [报警] A-3  消息串行队列
├── [报警] A-4  videoList 竞态修复
└── [报警] A-5  音频清理
```

**交付物**：报警弹窗 P0 修复 PR；cube-player S-1 PR。

**验收**：

- 连续 10 条报警，timer 不增长
- 关闭弹窗后无音频、无 interval 请求
- 报警带视频时 videoList 不被详情接口冲空

---

### 第二阶段：播放器与业务增强（4~5 工作日）

**目标**：播放器 destroy 完整；长沙重复拉流；报警并发边界。

```
Week 2
├── [共享] S-2  海康 destroy
├── [共享] S-3  GHY placeholder
├── [报警] A-6  轮询关闭策略（产品确认后）
├── [报警] A-7  音效按 alarmIndex
├── [报警] A-8  businessKey 去重
├── [报警] A-9  snapshot requestId
├── [长沙] C-1  放大停背景流
├── [长沙] C-2  g-video → CustomPlayer
└── [长沙] C-3  enable-auto-recovery=false
```

**交付物**：cube-player P1 PR；alarm-modal P1 PR；changsha-migrate PR。

---

### 第三阶段：峰值与长效（按需，3~5 工作日）

**目标**：控制多路峰值；长时间挂载基线。

```
Week 3+（可选）
├── [共享] S-4   visibility 暂停
├── [报警] A-10  九宫格懒加载 / 路数上限
├── [报警] A-11  队列上限
├── [报警] A-12  iframe 生命周期策略
├── [长沙] C-4   轮播 v-if 卸载
├── [长沙] C-5   与报警弹窗互斥（产品确认）
└── [安防] M-2   modal curRow 清理
```

---

## 6. 验收与回归测试

### 6.1 通用工具

- Chrome DevTools → **Memory**（Heap snapshot 对比 open/close）
- **Performance** → Timers / Network
- Chrome **任务管理器** → 标签页内存

### 6.2 分模块测试用例

| # | 模块 | 场景 | 通过标准 |
|---|------|------|----------|
| 1 | 报警弹窗 | 连续 10 条报警不关闭 | timer 数量稳定 |
| 2 | 报警弹窗 | 关闭弹窗 | 无音频、无 interval、Memory 下降 |
| 3 | 报警弹窗 | 带视频报警 + 详情接口慢 | videoList 最终有数据 |
| 4 | 报警弹窗 | 九宫格 9 路后关闭 | Memory 明显回落 |
| 5 | 长沙 | 4 路常驻 30min | 内存无持续爬升（允许基线） |
| 6 | 长沙 | 打开放大 modal | 总路数不重复 +1（≤5 而非 6） |
| 7 | 长沙 | 离开指挥调度页 | 4 路全部停止 |
| 8 | 长沙 | device-info 关联监控 | 视频正常播放 |
| 9 | 安防 | PC 预览开关 20 次 | 无 detached player DOM |
| 10 | 安防 | H5 详情进入退出 20 次 | Memory 稳定 |
| 11 | **叠加** | 长沙 4 路 + 报警弹窗 9 路 | 关闭报警后回落；关页后全停 |
| 12 | 共享 | H5S 断流重连 5 次 | WebSocket 不累积 |

### 6.3 内存基线参考（需业务确认阈值）

| 场景 | 预期 |
|------|------|
| 仅打开长沙指挥调度（4 路） | 单标签 +200~400MB（视码流） |
| 叠加报警弹窗（9 路） | 峰值 +300~700MB，关闭报警弹窗后回落 4 路基线 |
| 8h 无新报警 | 内存曲线平稳，无持续上升 |

---

## 7. 风险与依赖

| 风险 | 说明 |  mitigation |
|------|------|-------------|
| 产品行为变更 | 单条处理完是否关全部弹窗、是否与 sceneMonitor 互斥 | 第一阶段前与产品确认 A-6、C-5 |
| 海康 SDK API | destroy API 因版本而异 | S-2 先在测试环境验证 |
| legacy 项目约束 | changsha-migrate 最小改动原则 | C-1~C-3 优先小 diff |
| 跨包发布 | cube-player 改动需各应用升级依赖 | 共享层先发版，再三处验证 |
| 长沙 + 报警叠加 | 峰值 13 路，低配置机器可能 OOM | A-10 + C-5 降低峰值 |

---

## 8. 预期效果

| 阶段完成 | 效果 |
|----------|------|
| 第一阶段 | 消除 timer/音频泄漏；修复 videoList 竞态；关闭弹窗资源基本释放 |
| 第二阶段 | 播放器 destroy 可靠；长沙不再重复拉流；报警音效/轮询行为正确 |
| 第三阶段 | 多路峰值可控；长时间挂载基线可接受；叠加场景内存可预测 |

---

## 9. 任务分工建议

| 负责域 | 整改编号 | 建议负责人 |
|--------|----------|------------|
| 平台 / 播放器 | S-1 ~ S-4 | 前端基础设施 |
| 报警中心 | A-1 ~ A-12 | 报警弹窗维护人 |
| 指挥调度 | C-1 ~ C-5 | legacy changsha 维护人 |
| 安防监控 | M-1 ~ M-3 | security-management 维护人 |
| 联调验收 | 第 6 节 | QA + 上述三方 |

---

## 10. 变更记录

| 版本 | 日期 | 说明 |
|------|------|------|
| v1.0 | 2026-07-20 | 初版：报警弹窗 + 安防监控 + 长沙指挥调度整体方案 |
| v1.1 | 2026-07-20 | A-10/A-12/C-4 完整实现（非简化版）：LazyVideoPlayer、iframe 空闲销毁、轮播页强制 remount |
