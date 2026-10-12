export const PANEL_CARD_GAP = 12;

export type PanelCardShiftInput = {
  cardIndex: number;
  sourceIndex: number;
  insertIndex: number | null;
  itemSize: number;
};

/**
 * 计算拖拽过程中卡片应平移的距离。origin 卡片本身不平移。
 * sourceIndex < 0 表示当前列表不是拖拽来源（卡片从另一侧进来）。
 * insertIndex 为 null 表示指针不在当前列表；来源列表的收拢交给 origin 高度动画。
 */
export const computeCardShift = ({ cardIndex, sourceIndex, insertIndex, itemSize }: PanelCardShiftInput): number => {
  if (cardIndex === sourceIndex || itemSize === 0) {
    return 0;
  }

  if (insertIndex === null) {
    return 0;
  }

  if (sourceIndex < 0) {
    return cardIndex >= insertIndex ? itemSize : 0;
  }

  if (insertIndex > sourceIndex && cardIndex > sourceIndex && cardIndex < insertIndex) {
    return -itemSize;
  }

  if (insertIndex < sourceIndex && cardIndex >= insertIndex && cardIndex < sourceIndex) {
    return itemSize;
  }

  return 0;
};

export const resolveInsertIndex = (cards: { uuid: string }[], overUuid: string | null, placement: "before" | "after" | "end"): number => {
  if (!overUuid || placement === "end") {
    return cards.length;
  }
  const idx = cards.findIndex((item) => item.uuid === overUuid);
  if (idx === -1) {
    return cards.length;
  }
  return placement === "after" ? idx + 1 : idx;
};
