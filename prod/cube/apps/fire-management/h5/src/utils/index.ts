export const getUrlParams = (): Record<string, string> => {
  const queryText = window.location.href.split("?")[1];
  if (!queryText) {
    return {};
  }
  return queryText.split("&").reduce<Record<string, string>>((result, item) => {
    const [key, value = ""] = item.split("=");
    if (key) {
      result[decodeURIComponent(key)] = decodeURIComponent(value);
    }
    return result;
  }, {});
};

export const formatMobileDateTime = (value?: string | number | null): string => {
  const source = typeof value === "string" ? value.trim() : value;
  if (!source) return "--";

  const date = new Date(source);
  if (Number.isNaN(date.getTime())) return typeof source === "string" ? source.replace("T", " ").slice(5, 16) : "--";

  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
    .format(date)
    .replaceAll("/", "-");
};
