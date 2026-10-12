import qs from "qs";

import axios from "@/utils/axios";
import request from "@/utils/request";

// 存储token
export function storeToken(token) {
  if (!token.expire_time) {
    token.expire_time = Date.now() + token.expires_in * 1000;
  }
  cacheToken = token;
  sessionStorage.setItem("GH-Token", JSON.stringify(token));
}

// 刷新token
export async function refreshToken(refreshToken) {
  if (!refreshToken) {
    logout();
    return null;
  }
  let baseURL = "/api/ouaa";
  const token = await axios.concurrentRestful(
    `POST:/gw-bff/auth/token`,
    qs.stringify({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
    {
      defferedTimeout: 100,
      token: false,
      notify: false,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    },
  );
  storeToken(token);
  return token;
}

// 获取用户token
let cacheToken = null;
let nowEnterpriseCode = null;
export async function getToken() {
  let token = cacheToken;
  let code = nowEnterpriseCode;
  if (token === null && sessionStorage.getItem("GH-Token")) {
    token = cacheToken = JSON.parse(sessionStorage.getItem("GH-Token"));
  }
  if (code === null && sessionStorage.getItem("GH-NowEnterprise")) {
    code = JSON.parse(sessionStorage.getItem("GH-NowEnterprise"))?.code;
  }
  if (token) {
    if (token.expire_time < Date.now() && code && token.refresh_token) {
      return refreshToken(token.refresh_token);
    }
    return token;
  }
  return null;
}

// 获取当前企业code
let cacheCode = null;
export async function getEnterpriseCode() {
  let code = cacheCode;
  if (code === null && sessionStorage.getItem("GH-NowEnterprise")) {
    code = cacheCode = JSON.parse(sessionStorage.getItem("GH-NowEnterprise")).code;
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
  window.location.href = "/command-dispatch";
}

// 刷新
window.onbeforeunload = () => {
  // 刷新, 关闭
  sessionStorage.removeItem("user");
};
