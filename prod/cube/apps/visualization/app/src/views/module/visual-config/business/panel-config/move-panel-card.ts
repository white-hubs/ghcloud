export type PanelCardDropPlacement = "before" | "after" | "end";

type Identifiable = {
  uuid: string;
};

/**
 * 在同一列表或左右面板之间移动卡片。原地修改数组，返回是否发生了位置变化。
 */
export const movePanelCard = <T extends Identifiable>(
  source: T[],
  target: T[],
  uuid: string,
  targetUuid: string | null,
  placement: PanelCardDropPlacement,
): boolean => {
  const fromIndex = source.findIndex((item) => item.uuid === uuid);
  if (fromIndex < 0) {
    return false;
  }

  const sameList = source === target;
  let destIndex: number;
  if (placement === "end" || !targetUuid) {
    destIndex = target.length;
  } else {
    const idx = target.findIndex((item) => item.uuid === targetUuid);
    if (idx < 0) {
      destIndex = target.length;
    } else {
      destIndex = placement === "after" ? idx + 1 : idx;
    }
  }

  if (sameList) {
    if (fromIndex < destIndex) {
      destIndex -= 1;
    }
    if (fromIndex === destIndex) {
      return false;
    }
    const [item] = source.splice(fromIndex, 1);
    if (!item) {
      return false;
    }
    source.splice(destIndex, 0, item);
    return true;
  }

  const [item] = source.splice(fromIndex, 1);
  if (!item) {
    return false;
  }
  destIndex = Math.min(destIndex, target.length);
  target.splice(destIndex, 0, item);
  return true;
};
