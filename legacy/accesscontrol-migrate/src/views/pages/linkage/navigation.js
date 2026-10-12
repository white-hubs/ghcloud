function getApplicationPath() {
  const marker = "/roomLinkagePage";
  const index = window.location.pathname.indexOf(marker);
  return index >= 0 ? window.location.pathname.slice(0, index) : window.location.pathname.replace(/\/$/, "");
}

// 与 genericEquipmentMonitor 保持一致：由门户地址栏切换子应用页面，不调用 Vue Router。
export function pushLinkageRoute(path, query = {}) {
  const url = new URL(window.location.href);
  url.pathname = `${getApplicationPath()}${path}`;
  url.search = new URLSearchParams(query).toString();
  window.history.pushState({}, "", `${url.pathname}${url.search}`);
}
