# 视频内存整改 — 已修改内容汇总

> **文档版本**：v1.0  
> **整理日期**：2026-07-20  
> **适用范围**：报警弹窗 · 共享播放器 · 长沙指挥调度 · 安防监控  
> **关联方案**：[video-memory-remediation-plan.md](./video-memory-remediation-plan.md) · [memory-remediation-checklist.md](./memory-remediation-checklist.md)

---

## 1. 整改范围与目标

针对浏览器长时间挂载、多路视频并发场景下的内存泄漏与峰值占用，对以下四个域完成代码整改：

| 域 | 包 / 路径 | 核心目标 |
|----|-----------|----------|
| 共享播放器 | `prod/cube/basic/cube-player` | destroy / 重连 / 可见性行为一致，避免 SDK 实例残留 |
| 报警弹窗 | `prod/cube/apps/alarm-center/alarm-modal` | 消除 timer / 音频 / 竞态泄漏；控制九宫格峰值；iframe 空闲回收 |
| 长沙指挥调度 | `legacy/command-dispath-changsha-migrate` | 降低 4 路常驻 + 放大重复拉流；修复不可用监控 tab |
| 安防监控 | `prod/cube/apps/security-management` | 跟随共享层；补齐 modal 关闭边界清理 |

**未实施（需产品确认）**：C-5 报警弹窗与 sceneMonitor 互斥降路数。

---

## 2. 修改文件清单

### 2.1 共享层 `@ghcloud/cube-player`

| 文件 | 变更类型 |
|------|----------|
| `src/player/player-strategy.ts` | 修改 |
| `src/player/player.tsx` | 修改 |

### 2.2 报警弹窗 `@ghcloud/cube-alarm-modal`

| 文件 | 变更类型 |
|------|----------|
| `src/views/alarm-modal.tsx` | 修改 |
| `src/views/components/lazy-video-player.tsx` | **新增** |
| `src/register.ts` | 修改 |

### 2.3 长沙指挥调度 `command-dispath-changsha-migrate`

| 文件 | 变更类型 |
|------|----------|
| `src/views/traffic/commandDispatch/sceneMonitor.vue` | 修改 |
| `src/views/traffic/commandDispatch/index.vue` | 修改 |
| `src/components/cube-player/index.vue` | 修改 |
| `src/views/traffic/commandDispatch/components/device-info/index.vue` | 修改 |

### 2.4 安防监控 `security-management`

| 文件 | 变更类型 |
|------|----------|
| `app/src/views/associated-devices/associated-devices.tsx` | 修改 |

---

## 3. 分项改动说明

### 3.1 共享层 S-1 ~ S-4

#### S-1 H5S 重连前先 destroy

**文件**：`player-strategy.ts` → `H5sPlayerStrategy`

- `initPlayer()` 开头：`clearInterval(h5sPlayerCheck)` → `disconnect()` → `playerInstance = null`
- 避免重连时旧 WebSocket / 解码实例未释放

#### S-2 海康 destroy 增强

**文件**：`player-strategy.ts` → `HikvisionPlayerStrategy`

- `destroy()` 补充 `JS_Stop(0)`，`finally` 中 `playerInstance = null`
- 插件错误回调中已有 `JS_Stop`

#### S-3 GHY placeholder 清理

**文件**：`player-strategy.ts` → `GhyPlayerStrategy`

- `destroy()` 移除带 `data-cube-player-h265-placeholder="true"` 的占位 DOM
- Jessibuca / H265 实例均 `destroy()` 后置 `playerInstance = null`

#### S-4 页面可见性暂停

**文件**：`player.tsx`

- 监听 `document.visibilitychange`
- `hidden`：`suspendedByVisibility = true`，卸载 `PlayerCore`
- `visible`：恢复播放，`playerKey++` 强制 remount

#### 大华策略（随 S 系列一并完善）

**文件**：`player-strategy.ts` → `DahuaPlayerStrategy`

- `destroy()` 调用 `close()` 并 `playerInstance = null`

---

### 3.2 报警弹窗 A-1 ~ A-12

#### P0：泄漏与竞态（A-1 ~ A-5）

**文件**：`alarm-modal.tsx`

| 编号 | 实现要点 |
|------|----------|
| **A-1** 定时器 Map | `Map<businessKey, timerId>` 管理轮询；单条处理完 / 关闭时 `clearInterval` |
| **A-2** 统一 reset | `resetAlarmModalState()`：清空 `alarmItems`、全部 timer、音频、图表 state、`videoErrorMap`、懒加载槽位 |
| **A-3** 消息串行 | `alarmMessageQueue` + `drainAlarmMessageQueue()`，一条处理完再处理下一条 |
| **A-4** videoList 竞态 | `await getAlarmEventVideo()` 后再 `getAlarmDetail()`；merge 时保留已有 videoList |
| **A-5** 音频清理 | reset 内 `audioDom.pause()`、`currentTime = 0`、重置 `alarmLevelAudio` / `playCount` |

#### P1：行为修正（A-6 ~ A-9）

| 编号 | 实现要点 |
|------|----------|
| **A-6** 轮询关闭策略 | 单条 `ALARM_HANDLER` 仅 `removeAlarmByBusinessKey(businessKey)`，不关闭全部 |
| **A-7** 音效配置 | `getAlarmLevelPlayConfig(alarmMessage)` 按当前消息配置，不读错误的 `currentAlarm` |
| **A-8** 报警去重 | `addAlarmMessage` 按 `businessKey` 去重更新，避免重复入队 |
| **A-9** snapshot 乱序 | `handleAlarmSnapshot` 使用 `snapshotRequestId`，丢弃过期响应 |

#### P2：峰值与长效（A-10 ~ A-12）

**A-10 九宫格完整懒加载**

- **Tab 模式**：`Tabs` 开启 `destroyInactiveTabPane`，受控 `activeKey`（`resolvedVideoTabKey`），仅挂载当前 Tab 播放器
- **九宫格模式**：恢复最多 **9 格** UI（`MAX_GRID_VIDEOS = 9`），不再简单 `slice(0, 4)`
- **新组件** `lazy-video-player.tsx`：
  - `IntersectionObserver`（threshold 0.2）可见才申请播放槽
  - 模块级 `Map` 限制全局 **最多 4 路并发**，超出 LRU 踢最旧一路
  - 弹窗关闭 / reset 时 `resetLazyVideoStreamSlots()` 释放全部槽位

**A-11 队列上限**

- `MAX_ALARM_QUEUE = 50`，超出 shift 最旧条目并清理对应 timer

**A-12 iframe 空闲生命周期**

**文件**：`register.ts`

- 抽取 `createIframe()` / `destroyIframe()` / `ensureIframe()`
- 收到 `cube-alarm-modal-close` 后启动 **30 分钟**空闲计时（可配置 `idleDestroyMs`）
- 到期 `destroyIframe()`：移除 DOM、`modalReady = false`
- 下次 `handelAlarmMessage` 自动重建 iframe；`removeAlarmModal()` 清除计时器并彻底卸载

#### 父页面消息队列（register.ts 配套）

- `pendingAlarmMessages` 在 iframe ready 后 **串行 flush**
- 每条等待 `cube-alarm-modal-completed`（30s 超时兜底）

---

### 3.3 长沙指挥调度 C-1 ~ C-4

#### C-1 放大 / 报警时暂停背景流

**文件**：`index.vue` + `sceneMonitor.vue`

- `sceneMonitor` 新增 `paused` prop
- 报警弹窗展示视频时 `sceneMonitorPaused = true`
- 放大 modal 打开时 `:paused="sceneMonitorPaused || modalVideo.visible"`
- `paused === true` 时主画面与轮播 `CustomPlayer` 均 `v-if` 卸载

#### C-2 修复 device-info 关联监控

**文件**：`device-info/index.vue`

- 缺失的 `<g-video>` 替换为 `CustomPlayer`
- `a-tabs` 开启 `destroyInactiveTabPane`
- 关联监控 tab 内 `v-if="activeKey === '4'"` 才挂载播放器

#### C-3 关闭自动重连

**文件**：`components/cube-player/index.vue`

- `CubePlayer` 增加 `:enable-auto-recovery="false"`，减少 H5S 异常 churn

#### C-4 轮播翻页强制卸载

**文件**：`sceneMonitor.vue`

- `swiper-box` 增加 `:key="\`carousel-page-${pagination.pageNumber}\`"`
- 翻页前先 `swiperVideo = []`，`nextTick` 后再 `refreshSwiperPage()`
- 每个 `CustomPlayer` 的 key 含页码：`${pagination.pageNumber}-${item.id}`
- 轮播区域 `v-if="swiperVideo.length && !paused"`

---

### 3.4 安防监控 M-1 ~ M-2

| 编号 | 实现要点 |
|------|----------|
| **M-1** | 升级 `@ghcloud/cube-player` 依赖即可继承 S-1 ~ S-4 |
| **M-2** | `associated-devices.tsx`：`onCancel` 时 `curRow.value = undefined`，确保预览 modal 内 `CubePlayer` 卸载 |

**M-3**（`video-detail.tsx` 路由离开）仅回归验证，无代码改动。

---

## 4. 整改项完成状态

| 编号 | 整改项 | 状态 |
|------|--------|------|
| S-1 | H5S 重连 destroy | ✅ 已完成 |
| S-2 | 海康 destroy 增强 | ✅ 已完成 |
| S-3 | GHY placeholder 清理 | ✅ 已完成 |
| S-4 | 页面可见性暂停 | ✅ 已完成 |
| A-1 | 定时器 Map 管理 | ✅ 已完成 |
| A-2 | resetAlarmModalState | ✅ 已完成 |
| A-3 | 消息串行队列 | ✅ 已完成 |
| A-4 | videoList 竞态修复 | ✅ 已完成 |
| A-5 | 音频清理 | ✅ 已完成 |
| A-6 | 单条 ALARM_HANDLER 移除 | ✅ 已完成 |
| A-7 | 音效按 alarmMessage | ✅ 已完成 |
| A-8 | businessKey 去重 | ✅ 已完成 |
| A-9 | snapshot requestId | ✅ 已完成 |
| A-10 | 九宫格 LazyVideoPlayer + Tab destroyInactiveTabPane | ✅ 已完成 |
| A-11 | 队列上限 50 | ✅ 已完成 |
| A-12 | iframe 空闲 30min 销毁 | ✅ 已完成 |
| C-1 | 放大 / 报警暂停 sceneMonitor | ✅ 已完成 |
| C-2 | device-info CustomPlayer | ✅ 已完成 |
| C-3 | enable-auto-recovery=false | ✅ 已完成 |
| C-4 | 轮播翻页 key remount | ✅ 已完成 |
| C-5 | 与报警弹窗互斥降路数 | ⬜ 未做（需产品确认） |
| M-1 | 继承共享层 | ✅ 随 cube-player 升级 |
| M-2 | modal curRow 清理 | ✅ 已完成 |
| M-3 | video-detail 回归 | ⬜ 待 QA 回归 |

---

## 5. 关键代码入口

便于 Code Review 与后续维护：

```
alarm-modal 消息入口
  register.ts → handelAlarmMessage()
  alarm-modal.tsx → handleWindowMessage() → drainAlarmMessageQueue()

alarm-modal 清理入口
  alarm-modal.tsx → resetAlarmModalState()
  lazy-video-player.tsx → resetLazyVideoStreamSlots()
  register.ts → destroyIframe() / scheduleIdleDestroy()

播放器 destroy 链
  player.tsx → onBeforeUnmount / visibilitychange
  player-core.tsx → destroyStrategy()
  player-strategy.ts → 各 Strategy.destroy()

长沙 sceneMonitor 卸载条件
  index.vue → sceneMonitorPaused / modalVideo.visible
  sceneMonitor.vue → paused prop + carousel-page key
```

---

## 6. 构建与回归建议

### 6.1 构建验证

```bash
# 报警弹窗
cd prod/cube/apps/alarm-center/alarm-modal && bun run build

# 共享播放器（若有独立 build）
cd prod/cube/basic/cube-player && bun run build
```

alarm-modal 生产构建已于 2026-07-20 验证通过。

### 6.2 功能回归用例

| # | 模块 | 场景 | 通过标准 |
|---|------|------|----------|
| 1 | 报警弹窗 | 连续 10 条报警不关闭 | DevTools Timers 数量稳定 |
| 2 | 报警弹窗 | 关闭弹窗 | 无音频、无 interval、Memory 回落 |
| 3 | 报警弹窗 | 带视频报警 + 详情接口慢 | videoList 最终有数据 |
| 4 | 报警弹窗 | 九宫格 9 路后关闭 | 同时活跃 ≤ 4 路；关闭后 Memory 明显回落 |
| 5 | 报警弹窗 | 关闭 30min 无新报警 | iframe 被销毁；新报警自动重建 |
| 6 | 长沙 | 4 路常驻 30min | 内存无持续爬升（允许基线） |
| 7 | 长沙 | 打开放大 modal | 背景 4 路暂停，总路数不重复叠加 |
| 8 | 长沙 | 轮播翻页 | 仅当前页 3 路存在，旧页播放器已卸载 |
| 9 | 长沙 | device-info 关联监控 | 视频正常播放 |
| 10 | 安防 | PC 预览开关 20 次 | 无 detached player DOM |
| 11 | 叠加 | 长沙 4 路 + 报警弹窗 | 关闭报警后回落；关页后全停 |
| 12 | 共享 | H5S 断流重连 5 次 | WebSocket 不累积 |

### 6.3 观测工具

- Chrome DevTools → **Memory**（Heap snapshot 对比 open/close）
- **Performance** → Timers / Network
- Chrome **任务管理器** → 标签页内存

---

## 7. 发布与依赖关系

```
@ghcloud/cube-player（S-1~S-4）
    ↓ workspace 依赖
@ghcloud/cube-alarm-modal（A-1~A-12）
security-management（M-2，随 cube-player 升级）
legacy/command-dispath-changsha-migrate（C-1~C-4，独立部署）
```

建议发布顺序：

1. 先发 `@ghcloud/cube-player`
2. 再发 `@ghcloud/cube-alarm-modal`（含 register SDK）
3. 长沙 legacy 与安防监控各自合入并回归

---

## 8. 变更记录

| 版本 | 日期 | 说明 |
|------|------|------|
| v1.0 | 2026-07-20 | 汇总三阶段已落地代码改动（S/A/C/M 全项除 C-5） |
