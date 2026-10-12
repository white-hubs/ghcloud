import { getToken as getAuthToken, getNowEnterprise } from "../utils/auth";

export async function getToken() {
  return getAuthToken();
}

export async function getEnterpriseCode() {
  const enterprise = getNowEnterprise();
  return enterprise ? enterprise.code : null;
}

export function logout() {
  sessionStorage.removeItem("GH-Token");
  sessionStorage.removeItem("GH-NowEnterprise");
  sessionStorage.removeItem("GH-UserInfo");
  window.location.href = "/";
  window.location.hash = "/login";
  window.location.reload();
}
