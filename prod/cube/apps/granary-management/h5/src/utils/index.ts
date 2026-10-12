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
