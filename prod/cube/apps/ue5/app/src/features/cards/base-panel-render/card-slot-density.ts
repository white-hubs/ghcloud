/** 单卡槽位内容区密度档位（按实测内容高度，像素） */
export type CardSlotDensity = "comfortable" | "compact";

export const CARD_SLOT_DENSITY_CHANGE_EVENT = "ue5:card-slot-density-change";

/** 卡片标题栏 + 内边距近似高度（设计稿 px） */
export const CARD_SHELL_HEADER_HEIGHT = 48;

/** 1080p 三槽设计态内容高约 257px；不低于此视为舒适 */
export const DENSITY_COMFORTABLE_MIN = 220;

export const resolveCardSlotDensity = (contentHeightPx: number): CardSlotDensity => {
  const height = Number.isFinite(contentHeightPx) && contentHeightPx > 0 ? contentHeightPx : 0;
  return height >= DENSITY_COMFORTABLE_MIN ? "comfortable" : "compact";
};

/** 首屏渲染前按可见张数估算槽位密度，避免先舒适后闪成压缩 */
export const estimateInitialCardSlotDensity = (
  availablePanelHeight: number,
  visibleCount: number,
  gapPx: number,
  scale: number,
): CardSlotDensity => {
  const count = Math.max(1, Math.floor(visibleCount));
  const safeScale = Number.isFinite(scale) && scale > 0 ? scale : 1;
  const gaps = gapPx * Math.max(0, count - 1);
  const slotOuter = (Math.max(0, availablePanelHeight) - gaps) / count;
  const contentHeight = slotOuter - CARD_SHELL_HEADER_HEIGHT * safeScale;
  return resolveCardSlotDensity(contentHeight);
};
