export const getUrlParams = (): Record<string, string> => {
  const search = window.location.search.startsWith("?") ? window.location.search.slice(1) : window.location.search;
  const hashQuery = window.location.hash.includes("?") ? (window.location.hash.split("?").at(1) ?? "") : "";
  const params = new URLSearchParams([search, hashQuery].filter(Boolean).join("&"));
  return Object.fromEntries(params.entries());
};
