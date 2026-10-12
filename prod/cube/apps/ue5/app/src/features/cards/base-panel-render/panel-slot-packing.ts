/** Shared minimum height for regular card slots. */
export const SLOT_MIN = 260;
export const SLOT_GAP = 12;

export type PanelPackMode = "empty" | "pack" | "scroll";

export interface PanelSlotPacking {
  mode: PanelPackMode;
  cardCount: number;
  visibleCount: number;
  slotHeights: number[];
  gap: number;
  paddingTop: number;
  paddingBottom: number;
}

const safeWeight = (weight: number): number => (Number.isFinite(weight) && weight > 0 ? weight : 1);

const safeMin = (slotMin: number): number => Math.max(SLOT_MIN, Number.isFinite(slotMin) && slotMin > 0 ? slotMin : SLOT_MIN);

const safeMax = (slotMax: number, slotMin: number): number =>
  Math.max(slotMin, Number.isFinite(slotMax) && slotMax > 0 ? slotMax : slotMin);

export const resolveVisibleCount = (availableHeight: number, slotMins: number[], gap: number): number => {
  const count = slotMins.length;
  if (count === 0) {
    return 0;
  }
  for (let n = count; n >= 1; n--) {
    const needed = slotMins.slice(0, n).reduce((sum, min) => sum + min, 0) + gap * Math.max(0, n - 1);
    if (needed <= availableHeight) {
      return n;
    }
  }
  return 1;
};

export const distributeSlotHeights = (
  availableHeight: number,
  gap: number,
  profiles: Array<{ weight: number; slotMin: number; slotMax: number }>,
): number[] => {
  const n = profiles.length;
  if (n === 0) {
    return [];
  }
  const heights = profiles.map((profile) => profile.slotMin);
  let remaining = availableHeight - heights.reduce((sum, height) => sum + height, 0) - gap * Math.max(0, n - 1);
  if (remaining <= 0) {
    return heights;
  }

  for (let guard = 0; guard < 8 && remaining > 0.5; guard++) {
    const growable = profiles
      .map((profile, index) => ({
        index,
        room: profile.slotMax - heights[index],
        weight: safeWeight(profile.weight),
      }))
      .filter((item) => item.room > 0.5);
    if (growable.length === 0) {
      break;
    }
    const weightSum = growable.reduce((sum, item) => sum + item.weight, 0);
    let used = 0;
    for (const item of growable) {
      const take = Math.min(item.room, remaining * (item.weight / weightSum));
      heights[item.index] += take;
      used += take;
    }
    if (used < 0.5) {
      break;
    }
    remaining -= used;
  }
  const rounded = heights.map((height) => Math.round(height));
  const drift = availableHeight - rounded.reduce((sum, height) => sum + height, 0) - gap * Math.max(0, n - 1);
  if (n > 0 && Math.abs(drift) <= n && drift !== 0) {
    const last = n - 1;
    rounded[last] = Math.min(profiles[last].slotMax, Math.max(profiles[last].slotMin, rounded[last] + drift));
  }
  return rounded;
};

export const resolvePanelSlotPacking = (options: {
  cardCount: number;
  availableHeight: number;
  uiScale: number;
  profiles: Array<{ weight: number; slotMin: number; slotMax: number }>;
  maxVisibleCount?: number;
  fillAvailableHeight?: boolean;
  equalVisibleRows?: boolean;
}): PanelSlotPacking => {
  const scale = Number.isFinite(options.uiScale) && options.uiScale > 0 ? options.uiScale : 1;
  const gap = SLOT_GAP * scale;
  const count = Math.max(0, Math.floor(options.cardCount));
  if (count === 0) {
    return {
      mode: "empty",
      cardCount: 0,
      visibleCount: 0,
      slotHeights: [],
      gap,
      paddingTop: 0,
      paddingBottom: 0,
    };
  }

  const availableHeight = Math.max(0, options.availableHeight);
  const scaled = options.profiles.map((profile) => {
    const slotMin = safeMin(profile.slotMin) * scale;
    return {
      weight: options.equalVisibleRows ? 1 : safeWeight(profile.weight),
      slotMin,
      slotMax: safeMax(profile.slotMax, profile.slotMin) * scale,
    };
  });
  const requestedLimit = options.maxVisibleCount;
  const visibleLimit =
    typeof requestedLimit === "number" && Number.isFinite(requestedLimit)
      ? Math.max(1, Math.min(count, Math.floor(requestedLimit)))
      : count;
  const visibleCount = resolveVisibleCount(
    availableHeight,
    scaled.slice(0, visibleLimit).map((profile) => profile.slotMin),
    gap,
  );
  const visibleProfiles = scaled
    .slice(0, visibleCount)
    .map((profile) => (options.fillAvailableHeight ? { ...profile, slotMax: Math.max(profile.slotMax, availableHeight) } : profile));
  const packedHeights = distributeSlotHeights(availableHeight, gap, visibleProfiles);
  const meanVisible = packedHeights.reduce((sum, height) => sum + height, 0) / Math.max(1, packedHeights.length);
  const meanWeight = scaled.slice(0, visibleCount).reduce((sum, profile) => sum + profile.weight, 0) / Math.max(1, visibleCount);

  const slotHeights = scaled.map((profile, index) => {
    if (index < visibleCount) {
      return packedHeights[index];
    }
    const target = meanVisible * (profile.weight / meanWeight);
    return Math.round(Math.min(profile.slotMax, Math.max(profile.slotMin, target)));
  });

  const contentHeight = slotHeights.reduce((sum, height) => sum + height, 0) + gap * Math.max(0, count - 1);
  const visibleHeights = slotHeights.slice(0, visibleCount);
  const paddingBottom =
    visibleCount < count
      ? Math.max(0, availableHeight - visibleHeights.reduce((sum, height) => sum + height, 0) - gap * Math.max(0, visibleCount - 1))
      : 0;

  return {
    mode: contentHeight > availableHeight + 1 || visibleCount < count ? "scroll" : "pack",
    cardCount: count,
    visibleCount,
    slotHeights,
    gap,
    paddingTop: 0,
    paddingBottom,
  };
};
