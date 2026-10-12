import type { ReturnAreaScenePanelConfig } from "@/infrastructure/api/models/mdata";

const ANIMATION_MS = 280;

export type PanelUniversal = { items: string };

export type BusinessPanelState = {
  visible: boolean;
  leftPanelName: string;
  rightPanelName: string;
  universalPanelVo: {
    left: PanelUniversal;
    right: PanelUniversal;
  };
};

export type SwitchBusinessPanelDeps = {
  getMenu: () => string;
  getAreaLeave: () => number;
  getPanel: () => BusinessPanelState;
  fetchPanels: (params: { areaLeave: number; sceneType: string }) => Promise<unknown>;
  animationMs?: number;
  delay?: (ms: number) => Promise<void>;
};

/** Build left/right panel names from API rows. Never assign null into universalPanelVo. */
export const resolveBusinessPanels = (
  panels: ReturnAreaScenePanelConfig[] | null | undefined,
): {
  leftPanelName: string;
  rightPanelName: string;
  leftUniversal: PanelUniversal;
  rightUniversal: PanelUniversal;
} => {
  let leftPanelName = "";
  let rightPanelName = "";
  let leftUniversal: PanelUniversal = { items: "" };
  let rightUniversal: PanelUniversal = { items: "" };

  for (const element of Array.isArray(panels) ? panels : []) {
    if (!element || typeof element !== "object") {
      continue;
    }
    if (element.panelPosition === "LEFT_PANEL") {
      leftPanelName = element.panelConfig ?? "";
      leftUniversal = (element.universalPanelVo as PanelUniversal | null | undefined) ?? { items: "" };
    }
    if (element.panelPosition === "RIGHT_PANEL") {
      rightPanelName = element.panelConfig ?? "";
      rightUniversal = (element.universalPanelVo as PanelUniversal | null | undefined) ?? { items: "" };
    }
  }

  return { leftPanelName, rightPanelName, leftUniversal, rightUniversal };
};

export const applyBusinessPanelsToState = (panel: BusinessPanelState, panels: ReturnAreaScenePanelConfig[] | null | undefined): void => {
  const next = resolveBusinessPanels(panels);
  panel.leftPanelName = next.leftPanelName;
  panel.rightPanelName = next.rightPanelName;
  panel.universalPanelVo.left = next.leftUniversal;
  panel.universalPanelVo.right = next.rightUniversal;
};

const defaultDelay = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

/**
 * Serial latest-wins panel switch.
 * Rapid menu clicks only keep the newest target; older in-flight work is skipped
 * without leaving panel.visible stuck at false.
 */
export const createSwitchBusinessPanelRunner = (deps: SwitchBusinessPanelDeps) => {
  let running = false;
  let latest: { menu: string; areaLeave: number } | null = null;

  const delay = deps.delay ?? defaultDelay;
  const animationMs = deps.animationMs ?? ANIMATION_MS;
  const snapshotTarget = (): { menu: string; areaLeave: number } | null => {
    const menu = deps.getMenu();
    const areaLeave = deps.getAreaLeave();
    return menu && areaLeave ? { menu, areaLeave } : null;
  };

  const run = async (): Promise<void> => {
    const requestedTarget = snapshotTarget();
    if (!requestedTarget) {
      return;
    }

    latest = requestedTarget;
    if (running) {
      return;
    }

    running = true;
    const panel = deps.getPanel();

    try {
      while (latest) {
        const target = latest;
        latest = null;
        panel.visible = false;

        let panels: ReturnAreaScenePanelConfig[] = [];
        try {
          const [res] = await Promise.all([
            deps.fetchPanels({
              areaLeave: target.areaLeave,
              sceneType: target.menu,
            }),
            delay(animationMs),
          ]);
          panels = Array.isArray(res) ? (res as ReturnAreaScenePanelConfig[]) : [];
        } catch (error) {
          console.error("[switchBusinessPanel] failed", error);
          continue;
        }

        if (latest) {
          continue;
        }

        const currentTarget = snapshotTarget();
        if (!currentTarget) {
          continue;
        }
        if (currentTarget.menu !== target.menu || currentTarget.areaLeave !== target.areaLeave) {
          // Some callers update the area/menu independently. Even if they miss an
          // explicit trigger, converge to the current store state before showing.
          latest = currentTarget;
          continue;
        }

        try {
          applyBusinessPanelsToState(panel, panels);
        } catch (applyError) {
          console.error("[switchBusinessPanel] apply panels failed", applyError);
        }
        panel.visible = true;
      }
    } finally {
      running = false;
      // No failure or stale request may leave either side translated off-screen.
      panel.visible = true;
      if (latest) {
        void run();
      }
    }
  };

  return {
    trigger: (): void => {
      void run().catch((error) => {
        console.error("[switchBusinessPanel] unexpected", error);
        try {
          deps.getPanel().visible = true;
        } catch {
          /* ignore */
        }
      });
    },
    _isRunning: (): boolean => running,
    _getLatest: (): { menu: string; areaLeave: number } | null => latest,
  };
};
