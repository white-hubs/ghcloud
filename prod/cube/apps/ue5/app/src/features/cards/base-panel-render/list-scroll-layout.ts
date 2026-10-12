/** Design-px → layout-px. Matches postcss-pxtorem rootValue 192. */
export const REM_ROOT_VALUE = 192;

export const readUiScale = (): number => {
  if (typeof document === "undefined") {
    return 1;
  }
  const root = document.documentElement;
  const scaleRaw = Number.parseFloat(getComputedStyle(root).getPropertyValue("--ue5-ui-scale").trim());
  if (Number.isFinite(scaleRaw) && scaleRaw > 0) {
    return scaleRaw;
  }
  const fontSize = Number.parseFloat(getComputedStyle(root).fontSize);
  return Number.isFinite(fontSize) && fontSize > 0 ? fontSize / REM_ROOT_VALUE : 1;
};

/** Convert a design-draft px length to the current rem-scaled layout px. */
export const resolveLayoutPx = (designPx: number, uiScale = readUiScale()): number => {
  if (!Number.isFinite(designPx) || designPx <= 0) {
    return 0;
  }
  const scale = Number.isFinite(uiScale) && uiScale > 0 ? uiScale : 1;
  return Math.max(1, Math.round(designPx * scale));
};

/** Snap a native overflow list so the viewport starts on an item, not mid-row. */
export const resolveSnappedScrollTop = (scrollTop: number, itemOffsets: number[]): number => {
  if (!Number.isFinite(scrollTop) || itemOffsets.length === 0) {
    return Number.isFinite(scrollTop) ? Math.max(0, scrollTop) : 0;
  }
  const top = Math.max(0, scrollTop);
  let best = itemOffsets[0] ?? 0;
  let bestDist = Math.abs(top - best);
  for (const offset of itemOffsets) {
    if (!Number.isFinite(offset)) continue;
    const dist = Math.abs(top - offset);
    // On a tie, prefer the later item so a half-visible top row is not left clipped.
    if (dist < bestDist || (dist === bestDist && offset > best)) {
      best = offset;
      bestDist = dist;
    }
  }
  return Math.max(0, best);
};

export const collectScrollItemOffsets = (container: HTMLElement): number[] => {
  const offsets: number[] = [];
  for (const child of Array.from(container.children)) {
    if (!(child instanceof HTMLElement)) continue;
    if (child.offsetHeight <= 0) continue;
    offsets.push(child.offsetTop);
  }
  return offsets;
};

const SNAP_ROOT_SELECTOR = ".panel-card-slot, .v2-panel-root, .visual-v2-sub-panel, .visual-v2-roll-table, .modal-panel-zoom-content";
const SNAP_IGNORE_SELECTOR =
  ".ant-select-dropdown, .ant-picker-dropdown, .ant-picker-panel, .ant-picker, textarea, input, [data-no-row-snap]";

const canSnapOverflowList = (el: HTMLElement): boolean => {
  if (!el.closest(SNAP_ROOT_SELECTOR) || el.closest(SNAP_IGNORE_SELECTOR)) {
    return false;
  }
  const style = getComputedStyle(el);
  if (style.overflowY !== "auto" && style.overflowY !== "scroll") {
    return false;
  }
  if (el.scrollHeight <= el.clientHeight + 1) {
    return false;
  }
  return collectScrollItemOffsets(el).length >= 2;
};

export const snapOverflowList = (el: HTMLElement): void => {
  if (!canSnapOverflowList(el)) return;
  const nextTop = resolveSnappedScrollTop(el.scrollTop, collectScrollItemOffsets(el));
  if (Math.abs(nextTop - el.scrollTop) < 0.5) return;
  el.scrollTop = nextTop;
};

export const installCardListScrollSnap = (root: ParentNode = document): (() => void) => {
  let timer = 0;
  const schedule = (target: EventTarget | null): void => {
    if (!(target instanceof HTMLElement)) return;
    window.clearTimeout(timer);
    timer = window.setTimeout(() => {
      snapOverflowList(target);
    }, 80);
  };
  const onScroll = (event: Event): void => {
    schedule(event.target);
  };
  const onScrollEnd = (event: Event): void => {
    window.clearTimeout(timer);
    if (event.target instanceof HTMLElement) {
      snapOverflowList(event.target);
    }
  };
  root.addEventListener("scroll", onScroll, true);
  root.addEventListener("scrollend", onScrollEnd, true);
  return () => {
    window.clearTimeout(timer);
    root.removeEventListener("scroll", onScroll, true);
    root.removeEventListener("scrollend", onScrollEnd, true);
  };
};
