import qs from "qs";
import { authStore } from '../config'

const Authorization =
  "Basic Y3djZy1zZXJ2aWNlLWNsaWVudDozWmJ3ZlFlclY4ZUVqOEFsT2U=";

// 存储token
export function storeToken(token) {
  if (!token.expire_time) {
    token.expire_time = Date.now() + token.expires_in * 1000;
  }
  cacheToken = token;
  authStore.token = token.access_token
  sessionStorage.setItem("token", JSON.stringify(token));
}

// 存储项目code
export function storeProjectCode(code) {
  sessionStorage.setItem("projectCode", code);
}

export function storeProject(project) {
  /* sessionStorage */ sessionStorage.setItem(
    "project",
    JSON.stringify(project)
  );
}

// 存储项目
export function storeProjects(projects) {
  /* sessionStorage */ sessionStorage.setItem(
    "projects",
    JSON.stringify(projects)
  );
}

// 存储用户
export function storeUser(user) {
  sessionStorage.setItem("user", JSON.stringify(user));
}

// 刷新token

// 获取用户token
let cacheToken = null;
export async function getToken() {
  let token = cacheToken;
  if (token === null && sessionStorage.getItem("token")) {
    token = cacheToken = JSON.parse(sessionStorage.getItem("token"));
  }
  if (token) {
    if (token.expire_time < Date.now()) {
      return refreshToken(token.refresh_token);
    }
    authStore.token = token.access_token
    return token;
  }
  return null;
}

// 退出登陆时清除缓存
export function logout() {
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("projectCode");
  sessionStorage.removeItem("user");
  sessionStorage.removeItem("project");
  sessionStorage.removeItem("projects");

  sessionStorage.removeItem("stationId");
  sessionStorage.removeItem("station");
  sessionStorage.removeItem("stations");
  window.location.href = "/";
  window.location.hash = "/login";
  window.location.reload();
}
// 刷新
window.onbeforeunload = () => {
  // 刷新, 关闭
  sessionStorage.removeItem("user");
  sessionStorage.removeItem("project");
  sessionStorage.removeItem("projects");
  sessionStorage.removeItem("station");
  sessionStorage.removeItem("stations");
};

// 加载当前用户
export async function loadCurrentUser() {
  let user;
  if (sessionStorage.getItem("user")) {
    user = JSON.parse(sessionStorage.getItem("user"));
  } else {
    user = await getUserInfo();
  }
  if (user) {
    return user;
  }
  return null;
}

// 获取项目的code
export async function getProjectCode() {
  return sessionStorage.getItem("projectCode") || null;
}

// 加载当前项目
export async function loadCurrentProject() {
  let project;
  const projects = await loadProjects();
  if (sessionStorage.getItem("project")) {
    project = JSON.parse(sessionStorage.getItem("project"));
    // 保证: project在projects内!!
    project = projects.find((p) => p.code === project.code);
  } else {
    const projectCode = await getProjectCode();
    project = projects.find((p) => p.code === projectCode);
  }
  if (project) {
    return project;
  }
  return null;
}

// 用户所有项目
export async function loadProjects() {
  let projects;
  if (sessionStorage.getItem("projects")) {
    projects = JSON.parse(sessionStorage.getItem("projects"));
  } else {
    projects = await getProjects();
  }
  if (projects) {
    return projects;
  }
  return null;
}

// 注册用户
export async function registerUser(model) {
  await axios.restful("POST:/sys/users/register", model);
  // storeToken(token);
}

// 获取token
export async function loginForPassword(model) {
  const token = await axios.restful(
    "POST:/gw-bff/auth/token",
    qs.stringify({
      grant_type: "password",
      scope: "select",
      // ...model,
      username: model.username,
      password: model.password,
    }),
    {
      token: false,
      notify: false,
      "Content-Type": "application/x-www-form-urlencoded",
      headers: {
        "x-oauth-client": "client_1",
      },
    },
    "Login"
  );
  storeToken(token);
  // if (!model.remberMe) {
  //   delete token.refresh_token;
  // }
}

// 第三方登录
export async function loginForCwcg(cwcg_token) {
  const token = await axios.restful(
    "POST:/sys/oauth2/token",
    qs.stringify({
      grant_type: "cwcgToken",
      token: cwcg_token,
    }),
    {
      token: false,
      notify: false,
      "Content-Type": "application/x-www-form-urlencoded",
      headers: {
        Authorization,
      },
    }
  );
  storeToken(token);
}

// 获取用户信息
export async function getUserInfo() {
  // const projectCode = await getProjectCode();
  const user = await axios.restful(`sys/context/user-info`, {
    // projectCode: window.config.projectCode,
    group: "web-hq",
    // projectCode: projectCode,
    token: getToken(),
    notify: false,
    "Content-Type": "application/x-www-form-urlencoded",
    headers: {
      Authorization,
    },
  });
  storeUser(user);
  return user;
}

// 当前用户的项目
export async function getProjects() {
  const projects = await axios.restful("GET:/sys/context/user-projects");
  storeProjects(projects);
  // 自动选中 projectCode 对应的项目
  const projectCode = await getProjectCode();
  const project = projects?.find((p) => p.code === projectCode);
  project && storeProject(project);
  return projects;
}

// 用户权限
export function hasPermission(user, permissions) {
  // const normoalizedPermissions = _.flattenDeep([permissions]);
  // const isAdmin = _.some(user.roles, (a) => a === 'SystemAdmin');
  // const resources = user.resources;
  // return (
  //   isAdmin ||
  //   !!_.intersection(
  //     resources.map((item) => item.id),
  //     normoalizedPermissions,
  //   ).length
  // );
  return true;
}

// stations 相关操作
// 中建西部的厂站
export async function getStations() {
  const stations = await axios.restful("GET:/sys/context/user-stations");
  storeStations(stations);
  const stationId = await getStationId();
  const station = stations?.find((item) => item.id === stationId);
  station && storeProject(station);
  return stations;
}

// 清除厂站和id
export function clearStationId() {
  sessionStorage.removeItem("stationId");
}
export function clearStation() {
  /* sessionStorage */ sessionStorage.removeItem("station");
}

// 存储厂站id和厂站
export function storeStationId(id) {
  sessionStorage.setItem("stationId", id);
}
export function storeStation(station) {
  /* sessionStorage */ sessionStorage.setItem(
    "station",
    JSON.stringify(station)
  );
}
export function storeStations(stations) {
  /* sessionStorage */ sessionStorage.setItem(
    "stations",
    JSON.stringify(stations)
  );
}

// 获取厂站id
export async function getStationId() {
  return sessionStorage.getItem("stationId") || null;
}

// 加载当前厂站
export async function loadCurrentStation() {
  let station;
  const stations = await loadStations();
  if (sessionStorage.getItem("station")) {
    station = JSON.parse(sessionStorage.getItem("station"));
    // 保证: station在stations内!!
    station = stations.find((item) => item.id === station.id);
  } else {
    const stationId = await getStationId();
    station = stations.find((item) => item.id === stationId);
  }
  if (station) {
    return station;
  }
  return null;
}

// 加载厂站
export async function loadStations() {
  let stations;
  if (sessionStorage.getItem("stations")) {
    stations = JSON.parse(sessionStorage.getItem("stations"));
  } else {
    stations = await getStations();
  }
  if (stations) {
    return stations;
  }
  return null;
}
