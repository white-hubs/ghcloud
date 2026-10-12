/** 类目图是否已具备可完整绘制的横轴与序列，避免只画出残缺坐标轴 */

export const hasCompleteCategoryChartData = (
  xData: Array<string | number> | undefined,
  series: Array<{ data?: unknown[] } | undefined> | undefined,
): boolean => {
  const categoryCount = xData?.length ?? 0;
  if (categoryCount === 0) return false;
  return (series ?? []).some((item) => Array.isArray(item?.data) && item.data.length === categoryCount);
};
