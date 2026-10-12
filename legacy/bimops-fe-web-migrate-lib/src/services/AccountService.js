// 获取用户token
export async function getToken() {
  if (sessionStorage.getItem("GH-Token")) {
    return JSON.parse(sessionStorage.getItem("GH-Token"));
  }
  return null;
}

// 获取当前企业code
let cacheCode = null;
export async function getEnterpriseCode() {
  let code = cacheCode;
  if (code === null && sessionStorage.getItem("GH-NowEnterprise")) {
    code = cacheCode = JSON.parse(
      sessionStorage.getItem("GH-NowEnterprise")
    ).code;
  }
  if (code) {
    return code;
  }
  return null;
}

// 退出登陆时清除缓存
export function logout() {
  sessionStorage.removeItem("GH-Token");
  sessionStorage.removeItem("GH-NowEnterprise");
  sessionStorage.removeItem("GH-UserInfo");
  window.location.href = "/";
  window.location.hash = "/login";
  window.location.reload();
}

// 刷新
window.onbeforeunload = () => {
  // 刷新, 关闭
  sessionStorage.removeItem("user");
};
