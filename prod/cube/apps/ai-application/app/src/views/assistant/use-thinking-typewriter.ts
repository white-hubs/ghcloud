/**
 * 思考文本（prose 口味）的「打字机匀速」渲染（grill 决策 4/5）。
 *
 * 到达的思考叙述（`target`）是一阵一阵累积的；直接逐字重排会抖。本 composable 把 `target`
 * 当作缓冲，前端以**与到达速率解耦**的节奏匀速吐字：
 *   - 流式中（`active`）：速度随缓冲长度自适应——缓冲多则加速追赶，缓冲空但仍在流式则原地
 *     等待（容器靠头部计时/光标维持「在动」，不空转成静止）。
 *   - turn 结束（`active` 变 false）：快速排空剩余缓冲后停机。
 *   - 历史消息（挂载即 `active=false`）：直接整段显示，不重播打字机。
 *   - `prefers-reduced-motion`：整段直出，不做逐帧动画。
 */
import { onUnmounted, ref, watch, type Ref } from "vue";

export interface ThinkingTypewriter {
  /** 当前应渲染的前缀文本 */
  revealed: Ref<string>;
  /** 打字机仍在推进（流式中或结束后排空未尽）——用于尾部光标显隐 */
  running: Ref<boolean>;
}

/** 自适应吐字速率曲线（字/秒）与缓冲阈值（字）——缓冲越多越快，turn 结束排空最快。 */
const DRAIN_CHARS_PER_SECOND = 600;
const LARGE_BUFFER_CHARS_PER_SECOND = 260;
const MEDIUM_BUFFER_CHARS_PER_SECOND = 120;
const IDLE_CHARS_PER_SECOND = 55;
const LARGE_BUFFER_THRESHOLD = 240;
const MEDIUM_BUFFER_THRESHOLD = 80;

/** 帧步长夹取：首帧假定 16ms（~60fps），后续单帧最多按 64ms 计（切后台/掉帧时不要暴走）。 */
const FIRST_FRAME_DELTA_MS = 16;
const MAX_FRAME_DELTA_MS = 64;
const MS_PER_SECOND = 1000;
const MIN_CHARS_PER_FRAME = 1;

/** 自适应吐字速率（字/秒）：缓冲越多越快；排空阶段最快。 */
function resolveCharsPerSecond(remaining: number, active: boolean): number {
  if (!active) {
    return DRAIN_CHARS_PER_SECOND;
  }
  if (remaining > LARGE_BUFFER_THRESHOLD) {
    return LARGE_BUFFER_CHARS_PER_SECOND;
  }
  if (remaining > MEDIUM_BUFFER_THRESHOLD) {
    return MEDIUM_BUFFER_CHARS_PER_SECOND;
  }
  return IDLE_CHARS_PER_SECOND;
}

function prefersReducedMotion(): boolean {
  return typeof globalThis.matchMedia === "function" && globalThis.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function useThinkingTypewriter(target: Ref<string>, active: Ref<boolean>): ThinkingTypewriter {
  const revealed = ref("");
  const running = ref(false);
  const reduce = prefersReducedMotion();

  let revealedCount = 0;
  let rafId: number | undefined;
  let lastTs: number | undefined;

  const sync = (): void => {
    revealed.value = target.value.slice(0, revealedCount);
  };

  const stop = (): void => {
    if (rafId !== undefined) {
      cancelAnimationFrame(rafId);
      rafId = undefined;
    }
    lastTs = undefined;
    running.value = false;
  };

  const frame = (ts: number): void => {
    const full = target.value.length;
    if (revealedCount > full) {
      // target 变短（如新一轮把叙述重置）——回夹到当前长度
      revealedCount = full;
    }
    const remaining = full - revealedCount;

    if (reduce) {
      revealedCount = full;
      sync();
      stop();
      return;
    }

    const dt = lastTs === undefined ? FIRST_FRAME_DELTA_MS : Math.min(MAX_FRAME_DELTA_MS, ts - lastTs);
    lastTs = ts;

    if (remaining > 0) {
      const cps = resolveCharsPerSecond(remaining, active.value);
      const advance = Math.max(MIN_CHARS_PER_FRAME, Math.round((cps * dt) / MS_PER_SECOND));
      revealedCount = Math.min(full, revealedCount + advance);
      sync();
    }

    // 流式中始终继续（缓冲空也保持循环，等待新内容）；结束后仅在还有余量时继续排空
    if (active.value || revealedCount < target.value.length) {
      rafId = requestAnimationFrame(frame);
    } else {
      stop();
    }
  };

  const start = (): void => {
    if (rafId !== undefined || reduce) {
      return;
    }
    running.value = true;
    lastTs = undefined;
    rafId = requestAnimationFrame(frame);
  };

  // 初始化：历史消息（挂载即非流式）整段直出、不动画；流式则从头打字。
  if (active.value && !reduce) {
    revealedCount = 0;
    revealed.value = "";
    start();
  } else {
    revealedCount = target.value.length;
    revealed.value = target.value;
  }

  watch(active, (now, prev) => {
    if (now && !prev) {
      start();
    } else if (!now && prev) {
      // turn 结束：若仍有未吐完的缓冲，继续快速排空；否则直接补全停机
      if (revealedCount < target.value.length && !reduce) {
        start();
      } else {
        revealedCount = target.value.length;
        sync();
        stop();
      }
    }
  });

  onUnmounted(stop);

  return { revealed, running };
}
