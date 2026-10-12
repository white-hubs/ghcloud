const NowEnterpriseKey = "GH-NowEnterprise";

export function getNowEnterprise() {
  return JSON.parse((sessionStorage as any).getItem(NowEnterpriseKey));
}
// ---- 设置token ----
const TokenKey = "GH-Token";

export function getToken() {
  return JSON.parse((sessionStorage as any).getItem(TokenKey));
}
