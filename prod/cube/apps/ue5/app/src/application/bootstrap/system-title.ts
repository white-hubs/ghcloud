/** Must stay in sync with the inline script in `index.html`. */
export const UE5_SYSTEM_TITLE_CACHE_KEY = "ue5-system-title";
export const UE5_SYSTEM_TITLE_FALLBACK = "三维可视化";

const TITLE_FADE_MS = 280;
const titleFadeTokens = new WeakMap<HTMLElement, number>();

export const readCachedSystemTitle = (): string => {
  try {
    const cached = window.localStorage.getItem(UE5_SYSTEM_TITLE_CACHE_KEY)?.trim();
    return cached || UE5_SYSTEM_TITLE_FALLBACK;
  } catch {
    return UE5_SYSTEM_TITLE_FALLBACK;
  }
};

const prefersReducedMotion = (): boolean => {
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
};

const setBootTitleText = (node: HTMLElement, next: string): void => {
  const current = node.textContent?.trim() || "";
  if (current === next) {
    node.style.opacity = "1";
    return;
  }
  if (prefersReducedMotion() || current.length === 0) {
    node.textContent = next;
    node.style.opacity = "1";
    return;
  }

  const token = (titleFadeTokens.get(node) ?? 0) + 1;
  titleFadeTokens.set(node, token);
  node.style.opacity = "0";

  const finishIn = (): void => {
    if (titleFadeTokens.get(node) !== token) {
      return;
    }
    node.textContent = next;
    requestAnimationFrame(() => {
      if (titleFadeTokens.get(node) !== token) {
        return;
      }
      node.style.opacity = "1";
    });
  };

  window.setTimeout(finishIn, TITLE_FADE_MS);
};

export const applySystemTitle = (title?: string): void => {
  const next = title?.trim() || readCachedSystemTitle();
  document.title = next;
  if (title?.trim()) {
    try {
      window.localStorage.setItem(UE5_SYSTEM_TITLE_CACHE_KEY, next);
    } catch {
      /* ignore quota / private mode */
    }
  }
  document.querySelectorAll<HTMLElement>("#ue5-boot-loader strong").forEach((node) => {
    setBootTitleText(node, next);
  });
};
