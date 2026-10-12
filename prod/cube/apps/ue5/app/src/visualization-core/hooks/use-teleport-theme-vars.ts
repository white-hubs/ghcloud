import { nextTick, onMounted, onUnmounted } from "vue";

/** 列配置弹窗 Teleport 到 `body`，需与 `#Ue5` 同步主题变量，否则勾选态颜色异常。 */
export const TELEPORT_THEME_VAR_KEYS = ["--cube-theme-var--primary-color", "--cube-theme-var--primary-color-hover"] as const;
const TELEPORT_VIEWPORT_VAR_KEYS = ["--ue5-ui-scale", "--ue5-raw-scale", "--ue5-width-scale", "--ue5-panel-width"] as const;

const FALLBACK_PRIMARY = "#1890ff";
const FALLBACK_PRIMARY_HOVER = "#40a9ff";

function findFirstElementWithThemeVar(root: HTMLElement, name: string): HTMLElement | null {
  const stack: HTMLElement[] = [root];
  let guard = 0;
  const maxNodes = 400;
  while (stack.length > 0 && guard < maxNodes) {
    guard++;
    const el = stack.shift() as HTMLElement;
    const v = getComputedStyle(el).getPropertyValue(name).trim();
    if (v) {
      return el;
    }
    for (const child of Array.from(el.children) as HTMLElement[]) {
      stack.push(child);
    }
  }
  return null;
}

function readThemeVarsFromApp(): Record<string, string> {
  const root = document.getElementById("Ue5");
  const html = document.documentElement;
  const out: Record<string, string> = {};
  const htmlCs = getComputedStyle(html);
  for (const key of TELEPORT_VIEWPORT_VAR_KEYS) {
    const v = htmlCs.getPropertyValue(key).trim();
    if (v) {
      out[key] = v;
    }
  }
  if (!root) {
    return out;
  }
  const source =
    findFirstElementWithThemeVar(root, TELEPORT_THEME_VAR_KEYS[0]) ??
    findFirstElementWithThemeVar(root, TELEPORT_THEME_VAR_KEYS[1]) ??
    root;
  const cs = getComputedStyle(source);
  for (const key of TELEPORT_THEME_VAR_KEYS) {
    const v = cs.getPropertyValue(key).trim();
    if (v) {
      out[key] = v;
    }
  }
  return out;
}

function applyToBody(vars: Record<string, string>): void {
  for (const [k, v] of Object.entries(vars)) {
    document.body.style.setProperty(k, v);
  }
}

function clearBody(keys: readonly string[]): void {
  for (const k of keys) {
    document.body.style.removeProperty(k);
  }
}

/** 在挂载页使用 `useCubeTable({ tableCode })` 时调用，用于列配置弹窗主题。 */
export function useTeleportThemeVars(): void {
  const sync = (): void => {
    const fromApp = readThemeVarsFromApp();
    applyToBody({
      "--cube-theme-var--primary-color": fromApp["--cube-theme-var--primary-color"] ?? FALLBACK_PRIMARY,
      "--cube-theme-var--primary-color-hover": fromApp["--cube-theme-var--primary-color-hover"] ?? FALLBACK_PRIMARY_HOVER,
      "--ue5-ui-scale": fromApp["--ue5-ui-scale"] ?? "1",
      "--ue5-raw-scale": fromApp["--ue5-raw-scale"] ?? "1",
      "--ue5-width-scale": fromApp["--ue5-width-scale"] ?? "1",
      "--ue5-panel-width": fromApp["--ue5-panel-width"] ?? "calc(400 / 192 * 1rem)",
    });
  };

  onMounted(() => {
    void nextTick(() => {
      sync();
    });
  });

  onUnmounted(() => {
    clearBody([...TELEPORT_THEME_VAR_KEYS, ...TELEPORT_VIEWPORT_VAR_KEYS]);
  });
}
