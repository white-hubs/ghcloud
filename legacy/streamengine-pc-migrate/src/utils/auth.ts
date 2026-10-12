const NowEnterpriseKey = "GH-NowEnterprise";

export function getNowEnterprise() {
  return JSON.parse((sessionStorage as any).getItem(NowEnterpriseKey)) ??{code:0};
}
// ---- 设置token ----
const TokenKey = "GH-Token";

export function getToken() {
  let token = JSON.parse((sessionStorage as any).getItem(TokenKey));
  if(!token){
    token = JSON.parse((sessionStorage as any).getItem('token'));
  }
  return token
}
