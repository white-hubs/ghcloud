const NowEnterpriseKey = "GH-NowEnterprise";

export function getNowEnterprise() {
  return JSON.parse((sessionStorage as any).getItem(NowEnterpriseKey));
}
// ---- 设置token ----
const TokenKey = "GH-Token";

export function getToken() {
  return JSON.parse((sessionStorage as any).getItem(TokenKey));
}

const UserInfoKey = 'GH-UserInfo'
export function getUserInfo() {
	return JSON.parse((sessionStorage as any).getItem(UserInfoKey))
}
export function debounce(fn: any, delay = 1000) {
  let timer: any = null;
  return () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn();
    }, delay);
  };
}
