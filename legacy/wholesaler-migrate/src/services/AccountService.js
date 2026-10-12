import axios from '@/utils/axios';
import qs from 'qs';
const Authorization =
  'Basic aW9wcy1zZXJ2aWNlLWNsaWVudDozWmJ3ZlFlclY4ZUVqOEFsT2U=';
export function storeToken(token) {
  if (!token.expire_time) {
    token.expire_time = Date.now() + token.expires_in * 1000;
  }
  cacheToken = token;
  localStorage.setItem('token', JSON.stringify(token));
}
export function storeProjectCode(code) {
  localStorage.setItem('projectCode', code);
}
export function storeProject(project) {
  /* sessionStorage */ sessionStorage.setItem(
    'project',
    JSON.stringify(project),
  );
}
export function storeProjects(projects) {
  /* sessionStorage */ sessionStorage.setItem(
    'projects',
    JSON.stringify(projects),
  );
}
export function storeUser(user) {
  sessionStorage.setItem('user', JSON.stringify(user));
}
async function refreshToken(refreshToken) {
  if (!refreshToken) {
    logout();
    return null;
  }
  localStorage.removeItem('token');
  const token = await axios.concurrentRestful(
    'POST:/sys/oauth2/token',
    qs.stringify({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
    {
      defferedTimeout: 100,
      token: false,
      notify: false,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization,
      },
    },
  );
  storeToken(token);
  return token;
}

let cacheToken = null;
export async function getToken() {
  let token = cacheToken;
  if (token === null && localStorage.getItem('token')) {
    token = cacheToken = JSON.parse(localStorage.getItem('token'));
  }
  if (token) {
    if (token.expire_time < Date.now()) {
      return refreshToken(token.refresh_token);
    }
    return token;
  }
  return null;
}

export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('projectCode');
  sessionStorage.removeItem('user');
  sessionStorage.removeItem('project');
  sessionStorage.removeItem('projects');
  window.location.href = '/';
  window.location.hash = '/login';
  window.location.reload();
}

window.onbeforeunload = () => {
  // 刷新, 关闭
  sessionStorage.removeItem('user');
  sessionStorage.removeItem('project');
  sessionStorage.removeItem('projects');
};

export async function loadCurrentUser() {
  let user;
  if (sessionStorage.getItem('user')) {
    user = JSON.parse(sessionStorage.getItem('user'));
  } else {
    user = await getUserInfo();
  }
  if (user) {
    return user;
  }
  return null;
}
export async function getProjectCode() {
  return localStorage.getItem('projectCode') || 'snsh';
}
export async function loadCurrentProject() {
  // let project;
  // const projects = await loadProjects();
  // if (sessionStorage.getItem('project')) {
  //   project = JSON.parse(sessionStorage.getItem('project'));
  //   // 保证: project在projects内!!
  //   project = projects.find((p) => p.code === project.code);
  // } else {
  //   const projectCode = await getProjectCode();
  //   project = projects.find((p) => p.code === projectCode);
  // }
  let project= {id:'1323555902002921473'}
  if (project) {
    return project;
  }
  return null;
}

export async function loadProjects() {
  let projects;
  if (sessionStorage.getItem('projects')) {
    projects = JSON.parse(sessionStorage.getItem('projects'));
  } else {
    projects = await getProjects();
  }
  if (projects) {
    return projects;
  }
  return null;
}

export async function registerUser(model) {
  await axios.restful('POST:/centerApi/sys/users/register', model);
  // storeToken(token);
}

export async function loginForPassword(model) {
  const token = await axios.restful(
    'POST:/sys/oauth2/token',
    qs.stringify({
      grant_type: 'pwd',
      ...model,
      // username: model.username,
      // password: model.password,
    }),
    {
      token: false,
      notify: false,
      'Content-Type': 'application/x-www-form-urlencoded',
      headers: {
        Authorization,
      },
    },
  );
  if (!model.remberMe) {
    delete token.refresh_token;
  }
  storeToken(token);
}
export async function getUserInfo() {
  const projectCode = await getProjectCode();
  const user = await axios.restful(`project-merchant/context/user-info`, {
    // projectCode: window.config.projectCode,
    group: 'web-site',
    projectCode: projectCode,
    token: getToken(),
    notify: false,
    'Content-Type': 'application/x-www-form-urlencoded',
    headers: {
      Authorization,
    },
  });
  storeUser(user);
  return user;
}
export async function getProjects() {
  const projects = await axios.restful('GET:/project-merchant/context/user-projects');
  storeProjects(projects);
  // 自动选中 projectCode 对应的项目
  const projectCode = await getProjectCode();
  const project = projects?.find((p) => p.code === projectCode);
  project && storeProject(project);
  return projects;
}
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
