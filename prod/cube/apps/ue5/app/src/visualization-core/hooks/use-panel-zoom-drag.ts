import { onBeforeUnmount, ref, unref, type MaybeRef, type Ref } from "vue";

const DRAG_THRESHOLD_PX = 4;
const LAUNCH_MS = 280;
const MODAL_OPEN_DELAY_MS = 160;
const GHOST_STYLE_ID = "sub-panel-drag-ghost-style";
const ENABLE_DRAG_ZOOM = true;

const IGNORE_SELECTOR = [
  "[data-no-zoom]",
  ".zoom-trigger-btn",
  ".energy-v2-more-link",
  ".energy-v2-filter-group",
  ".energy-v2-header-toolbar",
  "button",
  "a",
  "input",
  "select",
  "textarea",
  "label",
  "video",
  "canvas",
  "img",
  ".camera-frame",
  "[contenteditable='true']",
  ".ant-select",
  ".ant-picker",
  ".ant-input",
  ".ant-btn",
  ".ant-switch",
  ".ant-radio",
  ".ant-checkbox",
  ".ant-slider",
  ".ant-pagination",
].join(",");

export interface UsePanelZoomDragOptions {
  enabled: MaybeRef<boolean>;
  sourceRef: Ref<HTMLElement | null>;
  onZoom: () => void;
}

const ensureGhostStyles = () => {
  if (typeof document === "undefined") return;
  if (document.getElementById(GHOST_STYLE_ID)) return;

  const style = document.createElement("style");
  style.id = GHOST_STYLE_ID;
  style.textContent = `
.sub-panel-drag-ghost {
  box-sizing: border-box;
  margin: 0 !important;
  pointer-events: none !important;
  z-index: 2400 !important;
  transform-origin: center center;
  border-radius: 8px;
  overflow: hidden;
  will-change: transform, opacity, width, height;
  backface-visibility: hidden;
  contain: layout style paint;
  box-shadow:
    0 0 0 1px var(--visual-card-drag-border, rgba(110, 178, 255, 0.75)),
    0 12px 32px rgba(0, 16, 48, 0.42);
  transition: none;
}
.sub-panel-drag-ghost.is-following {
  transition: none !important;
}
.sub-panel-drag-ghost.is-launching {
  transition:
    transform 0.28s cubic-bezier(0.16, 1, 0.3, 1),
    width 0.28s cubic-bezier(0.16, 1, 0.3, 1),
    height 0.28s cubic-bezier(0.16, 1, 0.3, 1),
    opacity 0.24s ease,
    box-shadow 0.28s ease !important;
  box-shadow:
    0 0 0 1px rgba(140, 200, 255, 0.85),
    0 18px 48px rgba(0, 16, 48, 0.5);
}
.sub-panel-drag-ghost-hint {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: 3;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  min-width: 112px;
  padding: 14px 18px;
  border-radius: 16px;
  background: var(--visual-zoom-hint-core-bg, rgba(10, 42, 88, 0.92));
  border: 1px solid var(--visual-zoom-hint-border, rgba(140, 200, 255, 0.7));
  box-shadow: 0 0 18px rgba(41, 137, 255, 0.35);
  color: var(--visual-zoom-hint-color, #f2f8ff);
  pointer-events: none;
}
.sub-panel-drag-ghost-hint-title {
  position: relative;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.08em;
  line-height: 1.2;
}
.sub-panel-drag-ghost-hint-sub {
  position: relative;
  font-size: 11px;
  opacity: 0.78;
  letter-spacing: 0.04em;
  color: var(--visual-zoom-hint-sub-color, #b7d7ff);
}
.sub-panel-drag-ghost-veil {
  position: absolute;
  inset: 0;
  z-index: 2;
  background: var(--visual-zoom-drag-overlay, rgba(4, 28, 64, 0.42));
  pointer-events: none;
}
`;
  document.head.appendChild(style);
};

const destroyAllGhosts = () => {
  if (typeof document === "undefined") return;
  document.querySelectorAll(".sub-panel-drag-ghost").forEach((node) => node.remove());
};

/** 用轻量占位替换 canvas/video，避免同步 toDataURL 卡顿 */
const softenHeavyMedia = (clone: HTMLElement) => {
  clone.querySelectorAll("canvas, video").forEach((node) => {
    const el = node as HTMLElement;
    const placeholder = document.createElement("div");
    placeholder.style.cssText = [
      `width:${el.offsetWidth || 120}px`,
      `height:${el.offsetHeight || 80}px`,
      "background:rgba(20,48,96,0.35)",
      "border-radius:4px",
    ].join(";");
    el.replaceWith(placeholder);
  });
};

const createGhost = (source: HTMLElement, clientX: number, clientY: number) => {
  ensureGhostStyles();
  destroyAllGhosts();

  const rect = source.getBoundingClientRect();
  const clone = source.cloneNode(true) as HTMLElement;
  softenHeavyMedia(clone);

  clone.classList.add("sub-panel-drag-ghost", "is-following");
  clone.setAttribute("aria-hidden", "true");

  const veil = document.createElement("div");
  veil.className = "sub-panel-drag-ghost-veil";

  const hint = document.createElement("div");
  hint.className = "sub-panel-drag-ghost-hint";
  hint.innerHTML =
    '<div class="sub-panel-drag-ghost-hint-title">松开放大</div>' + '<div class="sub-panel-drag-ghost-hint-sub">释放查看详情</div>';

  const offsetX = clientX - rect.left;
  const offsetY = clientY - rect.top;

  clone.style.position = "fixed";
  clone.style.left = "0";
  clone.style.top = "0";
  clone.style.width = `${rect.width}px`;
  clone.style.height = `${rect.height}px`;
  clone.style.zIndex = "2400";
  clone.style.pointerEvents = "none";
  clone.style.margin = "0";
  clone.style.opacity = "0.96";
  clone.style.transform = `translate3d(${rect.left}px, ${rect.top}px, 0) scale(1.02)`;

  clone.appendChild(veil);
  clone.appendChild(hint);
  document.body.appendChild(clone);

  return {
    el: clone,
    width: rect.width,
    height: rect.height,
    offsetX,
    offsetY,
  };
};

export function usePanelZoomDrag(options: UsePanelZoomDragOptions) {
  const isDragging = ref(false);
  const isLaunching = ref(false);
  const dragProgress = ref(0);

  let active = false;
  let crossedThreshold = false;
  let startX = 0;
  let startY = 0;
  let pointerId: number | null = null;
  let captureTarget: HTMLElement | null = null;
  let launchTimer: ReturnType<typeof setTimeout> | null = null;
  let openTimer: ReturnType<typeof setTimeout> | null = null;
  let rafId = 0;
  let pendingX = 0;
  let pendingY = 0;
  let ghost: {
    el: HTMLElement;
    width: number;
    height: number;
    offsetX: number;
    offsetY: number;
  } | null = null;

  const clearLaunchTimer = () => {
    if (launchTimer != null) {
      clearTimeout(launchTimer);
      launchTimer = null;
    }
    if (openTimer != null) {
      clearTimeout(openTimer);
      openTimer = null;
    }
  };

  const cancelRaf = () => {
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = 0;
    }
  };

  const destroyGhost = () => {
    if (!ghost) return;
    ghost.el.remove();
    ghost = null;
  };

  const resetVisual = () => {
    dragProgress.value = 0;
    isDragging.value = false;
    isLaunching.value = false;
    destroyGhost();
    destroyAllGhosts();
  };

  const cleanupListeners = () => {
    active = false;
    crossedThreshold = false;
    pointerId = null;
    captureTarget = null;
    cancelRaf();
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", onPointerUp);
    window.removeEventListener("pointercancel", onPointerUp);
  };

  const isEnabled = () => Boolean(ENABLE_DRAG_ZOOM && unref(options.enabled));

  const getSourcePanel = () => {
    const root = options.sourceRef.value;
    if (!root) return null;
    return (root.querySelector(".sub-panel") as HTMLElement | null) ?? root;
  };

  const moveGhost = (clientX: number, clientY: number) => {
    if (!ghost) return;
    const x = clientX - ghost.offsetX;
    const y = clientY - ghost.offsetY;
    ghost.el.style.transform = `translate3d(${x}px, ${y}px, 0) scale(1.02)`;
  };

  const startGhost = (clientX: number, clientY: number) => {
    if (ghost) return;
    const source = getSourcePanel();
    if (!source) return;
    if (source.closest("[data-no-zoom]")) return;
    ghost = createGhost(source, clientX, clientY);
    moveGhost(clientX, clientY);
  };

  const flushFrame = () => {
    rafId = 0;
    if (!active || !crossedThreshold) return;
    moveGhost(pendingX, pendingY);
  };

  const onPointerMove = (event: PointerEvent) => {
    if (!active || !isEnabled()) return;

    const dx = event.clientX - startX;
    const dy = event.clientY - startY;
    const distance = Math.hypot(dx, dy);

    if (!crossedThreshold && distance >= DRAG_THRESHOLD_PX) {
      crossedThreshold = true;
      isDragging.value = true;
      // 下一帧再克隆，避免在 pointer 回调里同步做重活
      pendingX = event.clientX;
      pendingY = event.clientY;
      requestAnimationFrame(() => {
        if (!active || !crossedThreshold || ghost) return;
        startGhost(pendingX, pendingY);
      });
    }

    if (!crossedThreshold) return;

    pendingX = event.clientX;
    pendingY = event.clientY;
    if (!rafId) {
      rafId = requestAnimationFrame(flushFrame);
    }
  };

  const launchGhostThenZoom = () => {
    isDragging.value = false;
    isLaunching.value = true;
    dragProgress.value = 1;

    const current = ghost;
    if (!current) {
      options.onZoom();
      resetVisual();
      return;
    }

    const { el, width, height, offsetX, offsetY } = current;
    const currentLeft = pendingX - offsetX;
    const currentTop = pendingY - offsetY;

    el.classList.remove("is-following");
    el.classList.add("is-launching");

    const targetWidth = Math.min(Math.max(width * 1.28, 480), window.innerWidth * 0.7);
    const targetHeight = Math.min(Math.max(height * 1.2, 320), window.innerHeight * 0.7);
    const targetLeft = (window.innerWidth - targetWidth) / 2;
    const targetTop = (window.innerHeight - targetHeight) / 2;

    // 用 transform 做位移动画，避免 left/top 布局抖动
    el.style.left = "0";
    el.style.top = "0";
    el.style.width = `${width}px`;
    el.style.height = `${height}px`;
    el.style.transform = `translate3d(${currentLeft}px, ${currentTop}px, 0) scale(1.02)`;

    void el.offsetWidth;

    el.style.width = `${targetWidth}px`;
    el.style.height = `${targetHeight}px`;
    el.style.transform = `translate3d(${targetLeft}px, ${targetTop}px, 0) scale(1)`;
    el.style.opacity = "0.15";

    clearLaunchTimer();
    // 提前打开弹窗，与 ghost 淡出重叠，减少闪一下的空窗
    openTimer = setTimeout(() => {
      openTimer = null;
      options.onZoom();
    }, MODAL_OPEN_DELAY_MS);

    launchTimer = setTimeout(() => {
      launchTimer = null;
      destroyGhost();
      isLaunching.value = false;
      dragProgress.value = 0;
      isDragging.value = false;
    }, LAUNCH_MS);
  };

  const onPointerUp = () => {
    const shouldOpen = crossedThreshold && isEnabled();
    cleanupListeners();

    if (!shouldOpen) {
      resetVisual();
      return;
    }

    launchGhostThenZoom();
  };

  const onPointerDown = (event: PointerEvent) => {
    destroyAllGhosts();
    if (!isEnabled() || isLaunching.value) return;
    if (event.button !== 0) return;

    const target = event.target;
    if (!(target instanceof Element)) return;
    if (target.closest(IGNORE_SELECTOR)) {
      destroyAllGhosts();
      return;
    }

    clearLaunchTimer();
    resetVisual();

    active = true;
    crossedThreshold = false;
    startX = event.clientX;
    startY = event.clientY;
    pendingX = event.clientX;
    pendingY = event.clientY;
    pointerId = event.pointerId;
    captureTarget = event.currentTarget instanceof HTMLElement ? event.currentTarget : null;

    try {
      captureTarget?.setPointerCapture?.(event.pointerId);
    } catch {
      // ignore
    }

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
  };

  onBeforeUnmount(() => {
    clearLaunchTimer();
    cancelRaf();
    if (pointerId != null && captureTarget) {
      try {
        captureTarget.releasePointerCapture?.(pointerId);
      } catch {
        // ignore
      }
    }
    cleanupListeners();
    resetVisual();
  });

  return {
    isDragging,
    isLaunching,
    dragProgress,
    onPointerDown,
  };
}
