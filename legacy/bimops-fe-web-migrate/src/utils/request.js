import { CubeMfRootGlobalState } from "@ghcloud/cube-mf-root";
import { message } from "ant-design-vue";
import axios from "axios";
import qs from "qs";

const service = axios.create({
  timeout: 30000,
  header: {},
});
service.interceptors.request.use(
  async (config) => {
    config.headers = {
      terminal: window.config.terminal,
      ...config.headers,
    };
    const cubeMfRootGlobalState = CubeMfRootGlobalState.getInstance();
    if (!config.header.tenant && cubeMfRootGlobalState.mfRootState.authInfo?.tenant) {
      config.headers.tenant = cubeMfRootGlobalState.mfRootState.authInfo.tenant;
    }
    if (config.token !== false) {
      if (cubeMfRootGlobalState.mfRootState.authInfo?.token) {
        config.headers = {
          Authorization: "Bearer " + cubeMfRootGlobalState.mfRootState.authInfo.token,
          ...config.headers,
        };
      }
    }
    return config;
  },
  (error) => {
    Promise.reject(error);
  },
);

service.interceptors.response.use(
  (response) => {
    const data = response.data;
    const resCode = data.code || false;
    if (resCode === 200) {
      let result = data.data;
      if (data.data === null) {
        result = true;
      }
      return result;
    }
    // 登录认证接口后端不返回code状态码
    else {
      return data;
    }
  },
  (error) => {
    if (error.response) {
      const data = error.response.data;
      const errCode = data.code || error.response.status;
      // debugger
      if (data.details) {
        //登录中错误信息-需要在form表单中展示的
        return data;
      }
      if (errCode) {
        if (errCode === 503) {
          return;
        }
        if (errCode === 500) {
          message.error(data.message || "请求出现错误");
        }
        if (errCode === 401 && error.response.config.url !== "/api/dictionary/getSysDictionaryByCodeAndItemCode") {
          message.warning("登录信息已过期，即将跳转登录页");
          // setTimeout(() => {
          //   sessionStorage.clear();
          //   window.location.href = "/login";
          // }, 2000);
        }
        if (errCode == 409) {
          return data;
        }
      } else {
        message.error(data.error_description || "请求出现错误");
      }
    }
    return Promise.reject(error);
  },
);
const ajaxfn = function (config) {
  const method = config.method || "get";
  const url = config.url || "";
  const dataType = config.dataType || "normal";
  const data = config.params ? config.params : config.data ? config.data : {};
  if (method === "get") {
    return service.get(url, {
      params: data,
      header: config.header ?? {},
      timeout: 30000,
      paramsSerializer: (params) => {
        return qs.stringify(params, { indices: false });
      },
    });
  } else if (method === "put") {
    return service.put(url, data);
  } else if (method === "delete") {
    return service.delete(url, {
      data: data,
    });
  } else if (method === "patch") {
    return service.patch(url, data);
  } else {
    if (dataType === "form") {
      return service.post(url, qs.stringify(data));
    } else {
      return service.post(url, data);
    }
  }
};

const deffereds = {};
service.concurrentRestful = (config) => {
  let deffered = deffereds[config.url];
  if (!deffered) {
    deffered = deffereds[config.url] = mergeConcurrentFetch();
  }
  return deffered(() => ajaxfn(config), config.data?.defferedTimeout);
};
const mergeConcurrentFetch = function () {
  let resolved = true;
  let ret = null;
  let timeouter = null;
  return function (cb, timeout = 500) {
    clearTimeout(timeouter);
    timeouter = setTimeout(async () => {
      ret = await cb();
      resolved = true;
    }, timeout);
    return new Promise((resolve) => {
      resolved = false;
      let timer = setInterval(() => {
        if (resolved) {
          resolve(ret);
          clearInterval(timer);
        }
      }, timeout);
    });
  };
};

export default ajaxfn;
