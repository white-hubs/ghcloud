import { resolveLayoutPx } from "./list-scroll-layout";

export const DEFAULT_TABLE_ROW_HEIGHT = 36;
export const DEFAULT_TABLE_HEADER_HEIGHT = 32;
export const DEFAULT_MIN_VISIBLE_ROWS = 1;
export const DEFAULT_MAX_VISIBLE_ROWS = 8;

export const countVisibleTableRows = (
  surfaceHeight: number,
  options?: {
    rowHeight?: number;
    headerHeight?: number;
    min?: number;
    max?: number;
  },
): number => {
  const rowHeight = options?.rowHeight && options.rowHeight > 0 ? options.rowHeight : DEFAULT_TABLE_ROW_HEIGHT;
  const headerHeight = Number.isFinite(options?.headerHeight) ? Number(options?.headerHeight) : DEFAULT_TABLE_HEADER_HEIGHT;
  const min = options?.min && options.min > 0 ? options.min : DEFAULT_MIN_VISIBLE_ROWS;
  const max = options?.max && options.max >= min ? options.max : DEFAULT_MAX_VISIBLE_ROWS;
  const available = Math.max(0, surfaceHeight - Math.max(0, headerHeight));
  const rows = Math.floor(available / rowHeight);
  return Math.min(max, Math.max(min, rows || min));
};

/** 按 RollTable DOM 实测表体高度计算可视行数（与 CSS 行高一致） */
export const measureRollTableVisibleRows = (
  tableSurface: HTMLElement | null | undefined,
  options?: {
    rowHeight?: number;
    min?: number;
    max?: number;
  },
): number => {
  if (!tableSurface) {
    return options?.min && options.min > 0 ? options.min : DEFAULT_MIN_VISIBLE_ROWS;
  }
  const designRowHeight = options?.rowHeight && options.rowHeight > 0 ? options.rowHeight : DEFAULT_TABLE_ROW_HEIGHT;
  const rollTable = tableSurface.querySelector(".roll-table");
  const header = rollTable?.querySelector(".header") as HTMLElement | null;
  const row = rollTable?.querySelector(".table-tr") as HTMLElement | null;
  const headerHeight = header?.offsetHeight ?? resolveLayoutPx(DEFAULT_TABLE_HEADER_HEIGHT);
  const rowHeight = row?.offsetHeight && row.offsetHeight > 0 ? row.offsetHeight : resolveLayoutPx(designRowHeight);
  return countVisibleTableRows(tableSurface.clientHeight, {
    ...options,
    rowHeight,
    headerHeight,
  });
};
