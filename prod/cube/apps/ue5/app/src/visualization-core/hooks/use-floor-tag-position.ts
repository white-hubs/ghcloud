import { nextTick, onBeforeUnmount, onMounted, type Ref, ref, watch } from "vue";

import { useStateStore } from "@/visualization-core/stores/use-state-store";

/** 无面板 DOM 时使用的设计宽度；实际定位始终读取面板 Rect。 */
const PANEL_DESIGN_WIDTH = 400;
/** 与旧版 left:400px 一致：紧贴左面板右缘，仅留极小间距 */
const GAP = 8;
const COLLAPSED = 8;
/** 面板滑出过半则视为收起 */
const PANEL_OPEN_RATIO = 0.45;
const PANEL_TRANSITION_MS = 360;

interface UseFloorTagPosition {
  /** 区域/楼栋标签距布局容器左侧的偏移 */
  tagLeft: Ref<number>;
  /** 热力图等控件距布局容器右侧的偏移 */
  tagRight: Ref<number>;
  refreshTagPosition: () => void;
}

const getLayoutRoot = (): HTMLElement => document.querySelector<HTMLElement>(".layout-container") ?? document.documentElement;

const getFallbackPanelWidth = (): number => {
  const scale = Number(getComputedStyle(document.documentElement).getPropertyValue("--ue5-ui-scale").trim());
  return PANEL_DESIGN_WIDTH * (Number.isFinite(scale) && scale > 0 ? scale : 1);
};

/**
 * 计算浮动控件相对左右面板可视边缘的位置。
 * 使用 getBoundingClientRect 并换算到 layout-container 坐标系。
 */
const measureInset = (panel: HTMLElement | null, side: "left" | "right"): number => {
  const rootRect = getLayoutRoot().getBoundingClientRect();
  if (!panel) {
    return getFallbackPanelWidth() + GAP;
  }
  const rect = panel.getBoundingClientRect();
  const openThreshold = rect.width * PANEL_OPEN_RATIO;
  if (side === "left") {
    const fromLeft = rect.right - rootRect.left;
    if (fromLeft < openThreshold) {
      return COLLAPSED;
    }
    return Math.round(fromLeft + GAP);
  }
  const fromRight = rootRect.right - rect.left;
  if (fromRight < openThreshold) {
    return COLLAPSED;
  }
  return Math.round(fromRight + GAP);
};

export const useFloorTagPosition = (): UseFloorTagPosition => {
  const stateStore = useStateStore();
  const tagLeft = ref(PANEL_DESIGN_WIDTH + GAP);
  const tagRight = ref(PANEL_DESIGN_WIDTH + GAP);
  let resizeObserver: ResizeObserver | null = null;
  let mutationObserver: MutationObserver | null = null;
  let animationFrame = 0;
  let followUntil = 0;

  const getTagPosition = (): void => {
    const leftPanel = document.querySelector<HTMLElement>("#left-panel");
    const rightPanel = document.querySelector<HTMLElement>("#right-panel");
    tagLeft.value = measureInset(leftPanel, "left");
    tagRight.value = measureInset(rightPanel, "right");
  };

  const followPanelTransition = (): void => {
    followUntil = performance.now() + PANEL_TRANSITION_MS;
    if (animationFrame) {
      return;
    }
    const follow = (): void => {
      getTagPosition();
      if (performance.now() < followUntil) {
        animationFrame = requestAnimationFrame(follow);
      } else {
        animationFrame = 0;
      }
    };
    animationFrame = requestAnimationFrame(follow);
  };

  const observePanels = (): void => {
    resizeObserver?.disconnect();
    mutationObserver?.disconnect();
    resizeObserver = new ResizeObserver(followPanelTransition);
    mutationObserver = new MutationObserver(followPanelTransition);
    for (const id of ["#left-panel", "#right-panel"] as const) {
      const panel = document.querySelector<HTMLElement>(id);
      if (!panel) {
        continue;
      }
      resizeObserver.observe(panel);
      mutationObserver.observe(panel, { attributes: true, attributeFilter: ["class", "style"] });
    }
  };

  onMounted(() => {
    void nextTick(() => {
      observePanels();
      followPanelTransition();
    });
    window.addEventListener("resize", followPanelTransition);
  });

  watch(
    () =>
      [
        stateStore.globalState.panel.visible,
        stateStore.globalState.panel.leftPanelName,
        stateStore.globalState.panel.rightPanelName,
        stateStore.globalState.menuVisible,
      ] as const,
    () => {
      void nextTick(() => {
        observePanels();
        followPanelTransition();
      });
    },
  );

  onBeforeUnmount(() => {
    window.removeEventListener("resize", followPanelTransition);
    resizeObserver?.disconnect();
    mutationObserver?.disconnect();
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
    }
  });

  return {
    tagLeft,
    tagRight,
    refreshTagPosition: followPanelTransition,
  };
};
