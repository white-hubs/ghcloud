# 报警弹窗内存整改清单

> **文档版本**：v1.0  
> **创建日期**：2026-07-17  
> **适用范围**：`alarm-modal` + `@ghcloud/cube-player`  
> **关联文档**：[memory-remediation-checklist.md](./memory-remediation-checklist.md) · [memory-remediation-implementation.md](./memory-remediation-implementation.md)（**已修改内容汇总**）

---

## 1. 背景与问题概述

报警弹窗采用**全局单例 iframe** 架构：父页面通过 `CubeAlarmModal` 创建 iframe，iframe 内运行 Vue 应用；多条报警进入同一实例的 `alarmItems` 队列，同一时间仅展示 `currentAlarm` 对应的 UI 与视频。

长时间挂载浏览器、频繁收到报警时，存在以下风险：

| 类型 | 说明 |
|------|------|
| **明确泄漏** | `getAlarmStatus` 定时器未清理，多条报警后孤儿 interval 持续运行 |
| **关闭不完整** | 关闭弹窗时音频未停止、部分 state 未重置 |
| **播放器残留** | H5S 重连、海康 destroy、GHY placeholder DOM 等场景可能未完全释放 |
| **基线占用** | iframe + 播放器 SDK 常驻内存（设计取舍，非严格泄漏） |
| **峰值占用** | 九宫格模式最多 9 路视频同时拉流解码 |

---

## 2. 架构与生命周期

```
WebSocket 报警消息
    ↓
CubeAlarmModal（父页面单例 iframe）
    ↓ postMessage
alarm-modal.tsx（iframe 内 Vue 应用）
    ↓
alarmItems 队列 → currentAlarm → CubePlayer × N
    ↓
PlayerCore → PlayerStrategy（H5S / 海康 / GHY / 大华）
```

**关闭流程现状**：

1. 用户点击关闭 → `close()` → `postMessage('cube-alarm-modal-close')`
2. 父页面隐藏 iframe（`display: none`，**不销毁 iframe**）
3. iframe 内清空 `alarmItems`，`CubePlayer` 组件卸载并触发 `destroyStrategy()`

**关键代码位置**：

| 模块 | 文件 |
|------|------|
| 报警弹窗 UI | `src/views/alarm-modal.tsx` |
| iframe 注册与隐藏 | `src/register.ts` |
| 播放器组件 | `prod/cube/basic/cube-player/src/player/player.tsx` |
| 播放器核心 | `prod/cube/basic/cube-player/src/player/player-core.tsx` |
| 播放策略 | `prod/cube/basic/cube-player/src/player/player-strategy.ts` |
| 父页面初始化 | `prod/cube/mf-root/app/src/store/core/modules/message-socket.ts` |

---

## 3. 整改项清单

### 3.1 P0 — 必须修（明确泄漏 / 持续占用）

#### 【P0-1】修复 `getAlarmStatus` 定时器泄漏

| 项 | 内容 |
|----|------|
| **问题描述** | 每收到一条报警调用 `getAlarmStatus()` 并 `setInterval`，新 interval 覆盖 `time.value`，旧 interval 不会被清除；`close()` 只能清掉最后一个 |
| **影响** | 多条报警后孤儿定时器持续运行，每分钟重复请求 `getAlarmRecordDetail`，长时间运行 CPU / 网络 / 内存缓慢上升 |
| **涉及文件** | `src/views/alarm-modal.tsx` |
| **现状代码** | `getAlarmStatus()` 内 `time.value = setInterval(...)`；`close()` 内 `clearInterval(time.value)` |
| **整改方案** | **方案 A（推荐）**：用 `Map<businessKey, ReturnType<typeof setInterval>>` 管理，报警处理完或关闭时逐个 `clearInterval` 并 delete<br>**方案 B（最小改动）**：新建 interval 前先 `clearInterval(time.value)`；`close()` 时清空全部 timer |
| **验收标准** | 连续触发 10 条报警后 DevTools 中 timer 数量不持续增长；关闭弹窗后无残留 interval 请求 |
| **预估工时** | 0.5 天 |
| **状态** | ⬜ 待处理 |

---

#### 【P0-2】`close()` 补充音频与状态清理

| 项 | 内容 |
|----|------|
| **问题描述** | 关闭弹窗时 `<audio id="alarmAudio">` 未 `pause()`；`alarmLevelAudio`、`alarmLevelPlayConfig`、`playCount`、`state.alarmSnapshotDetail` 等未重置 |
| **影响** | 关闭后音频可能继续播放；下次打开可能沿用旧配置；图表 state 残留 |
| **涉及文件** | `src/views/alarm-modal.tsx` |
| **整改方案** | 在 `close()` 或统一 `resetAlarmModalState()` 中补充：<br>• `audioDom?.pause()` 且 `currentTime = 0`<br>• 重置 `alarmLevelAudio`、`alarmLevelPlayConfig`、`playCount`<br>• 清空 `state.alarmSnapshotDetail`、`state.activeKey` |
| **验收标准** | 关闭弹窗后音频立即停止；再次打开报警时音效与图表状态正常 |
| **预估工时** | 0.5 天 |
| **状态** | ⬜ 待处理 |

---

### 3.2 P1 — 建议修（视频 / 播放器相关）

#### 【P1-3】H5S 重连前先销毁旧实例

| 项 | 内容 |
|----|------|
| **问题描述** | `H5sPlayerStrategy.initPlayer()` 在重连时直接创建新实例，未先 `disconnect()` 旧实例 |
| **影响** | 播放异常、自动重连多次时可能残留 WebSocket / 解码资源 |
| **涉及文件** | `prod/cube/basic/cube-player/src/player/player-strategy.ts`（`H5sPlayerStrategy`） |
| **整改方案** | 在 `initPlayer()` 开头：<br>```ts<br>this.h5sPlayerCheck && clearInterval(this.h5sPlayerCheck);<br>this.playerInstance?.disconnect();<br>this.playerInstance = null;<br>// 再创建新实例<br>``` |
| **验收标准** | 模拟断流 / 重连 5 次后 Memory 中 detached nodes / WebSocket 数量不持续增加 |
| **预估工时** | 0.5 天 |
| **状态** | ⬜ 待处理 |

---

#### 【P1-4】海康播放器 `destroy` 增强

| 项 | 内容 |
|----|------|
| **问题描述** | `HikvisionPlayerStrategy.destroy()` 仅调用 `JS_Stop(0)`，未做更完整释放 |
| **影响** | 使用海康 ISC 的租户，关闭弹窗后可能仍有部分插件资源未释放 |
| **涉及文件** | `prod/cube/basic/cube-player/src/player/player-strategy.ts`（`HikvisionPlayerStrategy`） |
| **整改方案** | 查阅海康 `JSPlugin` 文档，在 `destroy()` 中补充 `JS_Stop`、如有 `JS_Destroy` 等销毁 API 一并调用，并将 `playerInstance = null` |
| **验收标准** | 关闭含海康视频的报警弹窗后，Memory 快照对比无明显 retained DOM / plugin 对象增长 |
| **预估工时** | 1 天 |
| **状态** | ⬜ 待处理 |

---

#### 【P1-5】GHY H265 占位 DOM 清理

| 项 | 内容 |
|----|------|
| **问题描述** | `GhyPlayerStrategy.keepDomForLateH265Callbacks()` 会在 `document.body` 插入隐藏 placeholder，未见对应清理逻辑 |
| **影响** | 频繁创建 / 销毁播放器时 body 下可能累积隐藏 div |
| **涉及文件** | `prod/cube/basic/cube-player/src/player/player-strategy.ts`（`GhyPlayerStrategy`） |
| **整改方案** | `destroy()` 时移除 `dataset.cubePlayerH265Placeholder === "true"` 的节点；或改为在组件容器内维护 placeholder |
| **验收标准** | 反复开关 20 次报警视频后，`document.querySelectorAll('[data-cube-player-h265-placeholder]')` 数量为 0 |
| **预估工时** | 0.5 天 |
| **状态** | ⬜ 待处理 |

---

### 3.3 P2 — 架构优化（中长期，按需）

#### 【P2-6】iframe 常驻策略评估

| 项 | 内容 |
|----|------|
| **问题描述** | `CubeAlarmModal` 关闭时只隐藏 iframe，Vue 应用 + 播放器 SDK 脚本常驻内存 |
| **影响** | 浏览器长时间挂载时基线内存偏高；SDK 一旦加载不会卸载 |
| **涉及文件** | `src/register.ts`、`message-socket.ts` |
| **整改方案** | **A**：空闲 N 分钟无报警时 `removeAlarmModal()`，下次报警再重建<br>**B**：保持单例，`close()` 时向 iframe 发消息触发更彻底 reset<br>**C**：维持现状，文档说明基线占用预期 |
| **验收标准** | 8 小时无报警场景下内存稳定在可接受范围（需业务定阈值） |
| **预估工时** | 2–3 天 |
| **状态** | ⬜ 待评估 |

---

#### 【P2-7】多路视频并发上限与懒加载

| 项 | 内容 |
|----|------|
| **问题描述** | 九宫格模式最多同时挂载 9 路 `CubePlayer`，每路独立拉流解码 |
| **影响** | 单条报警多摄像头时内存峰值高；大华 SDK 已暴露 `chromeMemoryOut` 风险 |
| **涉及文件** | `src/views/alarm-modal.tsx` |
| **整改方案** | 默认 Tab 单路模式；九宫格仅渲染可见格子；限制同时活跃路数（如最多 4 路） |
| **验收标准** | 9 路视频场景下，关闭弹窗后内存回落至接近打开前水平（± 基线 iframe 占用） |
| **预估工时** | 2–3 天 |
| **状态** | ⬜ 待评估 |

---

#### 【P2-8】报警队列数据上限

| 项 | 内容 |
|----|------|
| **问题描述** | `alarmItems` 无上限，极端情况下队列无限增长 |
| **影响** | 数据层内存缓慢上升（通常小于视频，但需防极端） |
| **涉及文件** | `src/views/alarm-modal.tsx` |
| **整改方案** | 设置队列上限（如 50 条），超出时合并提示或丢弃最旧；或单条处理完即从队列移除 |
| **验收标准** | 模拟 100 条报警入队，内存增长可控且有明确提示 |
| **预估工时** | 1 天 |
| **状态** | ⬜ 待评估 |

---

### 3.4 P3 — 配套改进

#### 【P3-9】统一资源清理入口

| 项 | 内容 |
|----|------|
| **问题描述** | 清理逻辑分散在 `close()`、自动关闭、父页面 `close-modal` 等多处，易遗漏 |
| **整改方案** | 抽取 `resetAlarmModalState()`，统一处理：<br>• 清空 `alarmItems`<br>• 清除全部 status 轮询 timer<br>• 停止并重置 audio<br>• 清空 `videoErrorMap`、图表 state |
| **涉及文件** | `src/views/alarm-modal.tsx` |
| **预估工时** | 0.5 天 |
| **状态** | ⬜ 待处理 |

---

## 4. 关闭弹窗时的资源释放对照表

| 资源 | 关闭后是否释放 | 说明 |
|------|----------------|------|
| 当前报警的视频流（CubePlayer） | ✅ 基本释放 | 组件卸载 → `destroyStrategy()` |
| 切换上一条 / 下一条时的旧视频 | ✅ 基本释放 | Vue 卸载旧 CubePlayer |
| iframe + Vue 应用 | ❌ 不释放 | 设计为单例常驻 |
| 播放器 SDK 脚本 | ❌ 不释放 | 首次加载后常驻 iframe |
| 报警音频 | ⚠️ 不完整 | `<audio>` 常驻 DOM，`close()` 未 pause |
| 状态轮询定时器 | ⚠️ 不完整 | 仅清最后一个 interval |
| 图表 snapshot state | ⚠️ 不完整 | 未主动清空 |
| alarmItems 队列数据 | ✅ 释放 | `alarmItems.value = []` |

---

## 5. 回归测试清单

| # | 测试场景 | 检查项 | 通过 |
|---|----------|--------|------|
| 1 | 单条报警 + 1 路视频 | 关闭后无残留播放、无残留请求 | ⬜ |
| 2 | 连续 10 条报警不关闭 | timer 数量不持续增长 | ⬜ |
| 3 | 10 条报警后关闭 | 所有 interval 停止 | ⬜ |
| 4 | 九宫格 9 路视频 | 关闭后 Memory 明显下降 | ⬜ |
| 5 | 上一条 / 下一条切换 | 旧 CubePlayer 已 destroy，无多路并行 | ⬜ |
| 6 | 报警音效 loop | 关闭后音频立即停止 | ⬜ |
| 7 | 长时间挂载 8h | 无报警时内存无持续爬升 | ⬜ |
| 8 | 海康 / H5S / 大华 / GHY | 按租户视频类型抽样验证 | ⬜ |

**推荐工具**：

- Chrome DevTools → Memory（Heap snapshot 对比）
- Performance → 观察 timer / network
- Chrome Task Manager → 标签页内存

---

## 6. 实施计划

```
第 1 批（1–2 天）— P0
├── P0-1  定时器泄漏修复
└── P0-2  close() 资源清理

第 2 批（2–3 天）— P1
├── P1-3  H5S 重连 destroy
├── P1-4  海康 destroy 增强
└── P1-5  H265 placeholder 清理

第 3 批（按需）— P2 + P3
├── P2-6  iframe 生命周期策略
├── P2-7  多路视频懒加载
├── P2-8  队列上限
└── P3-9  统一 reset 入口
```

---

## 7. 预期效果

| 整改批次 | 预期改善 |
|----------|----------|
| P0 完成 | 消除明确泄漏；关闭弹窗后视频 + 音频 + 定时器基本释放 |
| P1 完成 | 播放器异常重连、频繁开关场景下内存更稳定 |
| P2 按需 | 降低长时间挂载基线占用与多路视频峰值 |

---

## 8. 变更记录

| 版本 | 日期 | 作者 | 说明 |
|------|------|------|------|
| v1.0 | 2026-07-17 | — | 初版，基于 alarm-modal + cube-player 代码审查 |
