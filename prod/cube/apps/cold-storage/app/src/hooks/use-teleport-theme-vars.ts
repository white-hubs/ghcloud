import { nextTick, onMounted, onUnmounted } from "vue";

export const TELEPORT_THEME_VAR_KEYS = ["--cube-theme-var--primary-color", "--cube-theme-var--primary-color-hover"] as const;

const FALLBACK_PRIMARY = "#1890ff";
const FALLBACK_PRIMARY_HOVER = "#40a9ff";

function findFirstElementWithThemeVar(root: HTMLElement, name: string): HTMLElement | null {
  const stack: HTMLElement[] = [root];
  let guard = 0;
  const maxNodes = 400;
  while (stack.length > 0 && guard < maxNodes) {
    guard += 1;
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
  const root = document.getElementById("ColdStorage");
  if (!root) {
    return {};
  }
  const source =
    findFirstElementWithThemeVar(root, TELEPORT_THEME_VAR_KEYS[0]) ??
    findFirstElementWithThemeVar(root, TELEPORT_THEME_VAR_KEYS[1]) ??
    root;
  const cs = getComputedStyle(source);
  const out: Record<string, string> = {};
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

export function useTeleportThemeVars(): void {
  const sync = (): void => {
    const fromApp = readThemeVarsFromApp();
    applyToBody({
      "--cube-theme-var--primary-color": fromApp["--cube-theme-var--primary-color"] ?? FALLBACK_PRIMARY,
      "--cube-theme-var--primary-color-hover": fromApp["--cube-theme-var--primary-color-hover"] ?? FALLBACK_PRIMARY_HOVER,
    });
  };

  onMounted(() => {
    void nextTick(() => {
      sync();
    });
  });

  onUnmounted(() => {
    clearBody(TELEPORT_THEME_VAR_KEYS);
  });
}
