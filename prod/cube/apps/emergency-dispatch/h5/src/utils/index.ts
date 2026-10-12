export const getUrlParams = (): Record<string, string> => {
  const locationHref = window.location.href;
  const str = locationHref.split("?")[1];
  if (!str) return {};
  const params = str.split("&");
  const handleParams: Record<string, string> = {};
  for (let i = 0; i < params.length; i++) {
    const g = params[i].split("=");
    handleParams[g[0]] = g[1];
  }
  return handleParams;
};
