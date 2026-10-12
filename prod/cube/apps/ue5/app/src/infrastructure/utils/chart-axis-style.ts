import { calcFontSize } from "@/infrastructure/utils/common";
import type { VisualThemeChartColors } from "@/infrastructure/utils/visual-theme";

export interface CategoryXAxisOptions {
  data: Array<string | number>;
  boundaryGap?: boolean;
  /** 折线图默认 auto；柱状图建议 0 展示当前窗口内全部标签 */
  labelInterval?: number | "auto";
  rotate?: number;
  margin?: number;
  fontSize?: number;
  /** 类目较多时允许标签换行；不传则按长标签策略自动截断 */
  wrapWidth?: number;
  /** 图表绘图区宽度，用于按槽位估算截断宽度 */
  chartWidth?: number;
  /** dataZoom 窗口内可见类目数；不传则按全部类目估算 */
  visibleCount?: number;
}

/** 侧栏卡片类目轴默认绘图宽度（未知实测宽度时） */
export const CATEGORY_AXIS_FALLBACK_WIDTH = 320;

/** 超过该字数视为长标签（中文事件名 / 设备名） */
export const CATEGORY_AXIS_LONG_LABEL_CHARS = 4;

export interface CategoryAxisLabelLayout {
  rotate: number;
  wrapWidth?: number;
  overflow?: "break" | "truncate";
  hideOverlap: boolean;
  margin: number;
  maxChars?: number;
}

export interface ResolveCategoryAxisLabelLayoutOptions {
  chartWidth?: number;
  fontSize?: number;
  visibleCount?: number;
  rotate?: number;
  wrapWidth?: number;
}

export const formatCategoryAxisLabel = (value: string | number, maxChars?: number): string => {
  const text = String(value ?? "").trim();
  if (!maxChars || maxChars < 1 || text.length <= maxChars) return text;
  return `${text.slice(0, maxChars)}...`;
};

/**
 * 柱状/类目横轴防重叠：少类目长中文优先按槽宽截断（tooltip 展示全称），
 * 类目很多时再旋转。换行会在窄侧栏里把相邻标签挤到一起，不作为默认策略。
 */
export const resolveCategoryAxisLabelLayout = (
  labels: Array<string | number>,
  options: ResolveCategoryAxisLabelLayoutOptions = {},
): CategoryAxisLabelLayout => {
  const count = labels.length;
  const visibleCount = Math.max(1, options.visibleCount ?? count);
  const fontSize = options.fontSize && options.fontSize > 0 ? options.fontSize : 11;
  const chartWidth = options.chartWidth && options.chartWidth > 0 ? options.chartWidth : CATEGORY_AXIS_FALLBACK_WIDTH;
  const maxLen = labels.reduce((max, item) => Math.max(max, String(item ?? "").length), 0);
  const hasLongLabel = maxLen > CATEGORY_AXIS_LONG_LABEL_CHARS;
  const slotWidth = chartWidth / visibleCount;
  const rotate = options.rotate ?? (visibleCount > 6 || (hasLongLabel && visibleCount > 3) ? 30 : 0);

  if (rotate) {
    return {
      rotate,
      hideOverlap: true,
      margin: 10,
    };
  }

  if (!hasLongLabel && options.wrapWidth == null) {
    return {
      rotate: 0,
      hideOverlap: visibleCount >= 8,
      margin: 6,
    };
  }

  const wrapWidth = options.wrapWidth ?? Math.max(32, Math.min(Math.floor(slotWidth * 0.68), 72));
  // chartWidth 是 CSS px；fontSize 若被 rem 缩到 <10，按真实汉字宽度估会几乎不截断
  const charWidth = Math.max(fontSize, 10);
  const maxChars = Math.max(2, Math.floor(wrapWidth / charWidth));

  return {
    rotate: 0,
    wrapWidth,
    overflow: "truncate",
    hideOverlap: true,
    margin: 6,
    maxChars,
  };
};

export const buildCategoryXAxis = (themeColors: VisualThemeChartColors, options: CategoryXAxisOptions) => {
  const fontSize = options.fontSize ?? calcFontSize(12);
  const layout = resolveCategoryAxisLabelLayout(options.data, {
    chartWidth: options.chartWidth,
    fontSize,
    visibleCount: options.visibleCount,
    rotate: options.rotate,
    wrapWidth: options.wrapWidth,
  });

  return {
    type: "category" as const,
    boundaryGap: options.boundaryGap ?? true,
    data: options.data,
    axisLine: {
      show: false,
    },
    axisTick: {
      show: false,
      alignWithLabel: true,
      lineStyle: {
        color: themeColors.axisTick,
      },
    },
    axisLabel: {
      interval: options.labelInterval ?? "auto",
      showMaxLabel: true,
      showMinLabel: true,
      hideOverlap: layout.hideOverlap,
      color: themeColors.axis,
      fontSize,
      fontWeight: 400,
      margin: options.margin ?? layout.margin,
      rotate: layout.rotate,
      ...(layout.maxChars
        ? {
            formatter: (value: string) => formatCategoryAxisLabel(value, layout.maxChars),
          }
        : {}),
      ...(layout.wrapWidth
        ? {
            width: layout.wrapWidth,
            overflow: layout.overflow ?? "truncate",
            ellipsis: "...",
          }
        : {}),
    },
  };
};

export interface ValueYAxisOptions {
  name?: string;
  nameGap?: number;
  splitNumber?: number;
  minInterval?: number;
  axisLabelFormatter?: string | ((value: number) => string);
  nameTextStyle?: Record<string, unknown>;
}

/** 数值 Y 轴：仅保留虚线网格，不绘制轴线避免图表区出现「内框」 */
export const buildValueYAxis = (themeColors: VisualThemeChartColors, options: ValueYAxisOptions = {}) => ({
  minInterval: options.minInterval ?? 1,
  splitNumber: options.splitNumber ?? 4,
  type: "value" as const,
  ...(options.name
    ? {
        name: options.name,
        nameLocation: "end" as const,
        nameGap: options.nameGap ?? calcFontSize(14),
        nameTextStyle: options.nameTextStyle ?? {
          fontSize: calcFontSize(12),
          color: themeColors.axis,
          fontWeight: 400,
          align: "right",
          verticalAlign: "bottom",
          padding: [0, 8, 10, 0],
        },
      }
    : {}),
  splitLine: {
    show: true,
    lineStyle: {
      type: "dashed" as const,
      color: [themeColors.splitLine],
      width: 1,
    },
  },
  axisLabel: {
    show: true,
    hideOverlap: true,
    color: themeColors.axis,
    fontSize: calcFontSize(12),
    fontWeight: 400,
    align: "right",
    margin: 8,
    ...(options.axisLabelFormatter ? { formatter: options.axisLabelFormatter } : {}),
  },
  axisLine: { show: false },
  axisTick: { show: false },
});

const getVisibleRatio = (dataLength: number, visibleCount = 4): number => {
  if (dataLength <= visibleCount) return 100;
  return Math.min(100, Math.round((visibleCount / dataLength) * 100));
};

export type CategoryDataZoomAnchor = "start" | "end";

export interface CategoryChartDataZoomOptions {
  visibleCount?: number;
  /** start=从左起；end=锚定当前/最新时间端 */
  anchor?: CategoryDataZoomAnchor;
  /** 是否展示底部滑条；卡片紧凑布局可关，仅保留 inside 拖动 */
  slider?: boolean;
}

/** 类目轴图表 dataZoom：窗口内展示全部标签，超出可横向滑动 */
export const buildCategoryChartDataZoom = (
  dataLength: number,
  themeColors: VisualThemeChartColors,
  visibleCountOrOptions: number | CategoryChartDataZoomOptions = 4,
) => {
  const options: CategoryChartDataZoomOptions =
    typeof visibleCountOrOptions === "number"
      ? { visibleCount: visibleCountOrOptions, anchor: "start", slider: true }
      : { visibleCount: 4, anchor: "start", slider: true, ...visibleCountOrOptions };
  const visibleCount = options.visibleCount ?? 4;
  const anchor = options.anchor ?? "start";
  const showSlider = options.slider !== false;

  if (dataLength <= visibleCount) return [];

  const windowRatio = getVisibleRatio(dataLength, visibleCount);
  const start = anchor === "end" ? Math.max(0, 100 - windowRatio) : 0;
  const end = anchor === "end" ? 100 : windowRatio;

  const zooms: Array<Record<string, unknown>> = [
    {
      type: "inside" as const,
      xAxisIndex: 0,
      start,
      end,
      zoomOnMouseWheel: false,
      moveOnMouseMove: true,
      moveOnMouseWheel: true,
    },
  ];

  if (showSlider) {
    zooms.push({
      type: "slider" as const,
      xAxisIndex: 0,
      height: calcFontSize(14),
      bottom: calcFontSize(2),
      start,
      end,
      brushSelect: false,
      showDetail: false,
      borderColor: themeColors.dataZoomBorder,
      backgroundColor: themeColors.dataZoomBg,
      fillerColor: themeColors.dataZoomFiller,
      handleSize: "80%",
      handleStyle: {
        color: themeColors.dataZoomHandle,
        borderColor: themeColors.dataZoomHandle,
      },
      dataBackground: {
        lineStyle: { color: themeColors.dataZoomDataLine },
        areaStyle: { color: themeColors.dataZoomDataArea },
      },
      textStyle: {
        color: themeColors.axis,
        fontSize: calcFontSize(10),
      },
    });
  }

  return zooms;
};

/**
 * ECharts grid 边距：纯数字按 px。
 * 卡片变高后若把 28/32 当成百分比，绘图区会被压到下半截。
 */
export const resolveChartGridGap = (value: string | number | undefined, minPx = 0): number | string => {
  if (value === undefined || value === "") {
    return minPx;
  }
  const raw = String(value).trim();
  if (raw.endsWith("%")) {
    return raw;
  }
  const n = Number.parseFloat(raw);
  if (!Number.isFinite(n)) {
    return minPx;
  }
  return Math.max(n, minPx);
};

export const getChartGridBottom = (dataLength: number, hasDataZoom?: boolean, basePercent = "10%", hasSlider = true): string => {
  if (hasDataZoom ?? dataLength > 4) {
    return hasSlider ? `${calcFontSize(28)}px` : `${calcFontSize(22)}px`;
  }
  if (basePercent === "0" || basePercent === "0%") {
    return "8%";
  }
  return basePercent;
};

/** 类目轴：当前窗口内展示全部横轴标签；数据过多时启用横向滑动 */
export const buildScrollableCategoryAxisConfig = (
  dataLength: number,
  themeColors: VisualThemeChartColors,
  options?: {
    visibleCount?: number;
    baseGridBottom?: string;
    /** false 时展示完整横轴，不出现滚动条 */
    scrollable?: boolean;
    /** start=从左起；end=锚定当前/最新时间端（卡片默认建议 end） */
    anchor?: CategoryDataZoomAnchor;
    /** 是否展示底部滑条 */
    slider?: boolean;
  },
) => {
  const visibleCount = options?.visibleCount ?? 6;
  const scrollable = options?.scrollable !== false;
  const showSlider = options?.slider !== false;
  const dataZoom = scrollable
    ? buildCategoryChartDataZoom(dataLength, themeColors, {
        visibleCount,
        anchor: options?.anchor ?? "start",
        slider: showSlider,
      })
    : [];
  const hasDataZoom = dataZoom.length > 0;
  const hasSlider = hasDataZoom && showSlider;
  const baseBottom = options?.baseGridBottom ?? "10%";

  return {
    dataZoom,
    hasDataZoom,
    labelInterval: (hasDataZoom ? 0 : dataLength > 14 ? "auto" : 0) as 0 | "auto",
    gridBottom: hasDataZoom
      ? getChartGridBottom(dataLength, true, baseBottom, hasSlider)
      : baseBottom === "0" || baseBottom === "0%"
        ? "10%"
        : baseBottom,
  };
};

/** 折线图横轴时间标签：与车流趋势/报警趋势接口 period 字段配套 */
const TREND_PERIOD_UNIT_RE = /(时|点|月|号|日)$/;

export const formatTrendPeriodLabel = (period: string | number, timeType?: string): string => {
  const raw = String(period ?? "").trim();
  if (!raw) return raw;
  if (TREND_PERIOD_UNIT_RE.test(raw)) return raw;

  if (timeType === "TODAY") return `${raw}时`;
  if (timeType === "THIS_YEAR") return `${raw}月`;
  return `${raw}号`;
};

export const mapTrendPeriodLabels = (periods: Array<string | number>, timeType?: string): string[] =>
  periods.map((period) => formatTrendPeriodLabel(period, timeType));

/** 能耗趋势横轴：完整日期简化为 MM-DD，避免侧栏折线图标签重叠 */
export const formatEnergyTrendLabel = (time: string | number, timeType?: string): string => {
  const raw = String(time ?? "").trim();
  if (!raw) return raw;

  if (timeType === "THIS_YEAR") {
    const isoYearMonth = raw.match(/^(\d{4})-(\d{1,2})(?:-(\d{1,2}))?(?:\s|$)/);
    if (isoYearMonth) {
      return `${Number(isoYearMonth[2])}月`;
    }

    const cnYearMonth = raw.match(/^(\d{4})年(\d{1,2})月?/);
    if (cnYearMonth) {
      return `${Number(cnYearMonth[2])}月`;
    }

    const slashYearMonth = raw.match(/^(\d{4})\/(\d{1,2})(?:\/(\d{1,2}))?/);
    if (slashYearMonth) {
      return `${Number(slashYearMonth[2])}月`;
    }

    return formatTrendPeriodLabel(raw, timeType);
  }

  const dateMatch = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (dateMatch) {
    const month = String(Number(dateMatch[2]));
    const day = String(Number(dateMatch[3]));
    return `${month}-${day}`;
  }

  if (timeType === "TODAY") {
    return formatTrendPeriodLabel(raw, timeType);
  }

  return raw;
};

export const mapEnergyTrendLabels = (times: Array<string | number>, timeType?: string): string[] =>
  times.map((time) => formatEnergyTrendLabel(time, timeType));
