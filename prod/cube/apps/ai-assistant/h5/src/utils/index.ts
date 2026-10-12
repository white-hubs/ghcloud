interface UrlParams {
  marketTenant?: string;
  headTenant?: string;
  [key: string]: string | undefined;
}

export function getUrlParams(): UrlParams {
  const search = new URLSearchParams(window.location.search);
  const data: UrlParams = {};
  search.forEach((value, key) => {
    data[key] = value;
  });
  return data;
}
