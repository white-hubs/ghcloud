const fullNumberFormatter = new Intl.NumberFormat("zh-CN", {
  maximumFractionDigits: 0,
});

export const formatOverviewFullNumber = (value?: number | string | null): string => {
  if (value === null || value === undefined || value === "") {
    return "0";
  }

  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return String(value);
  }

  return fullNumberFormatter.format(numericValue);
};
