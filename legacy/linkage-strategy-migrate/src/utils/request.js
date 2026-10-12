import axios from "axios";
import qs from "qs";
import { message, Modal } from "ant-design-vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import { getToken } from "@ghcloud-legacy/bimops-fe-web-migrate-lib/lib/services/AccountService";
const confirm = Modal.confirm;
const store = useStore();
const router = useRouter();
const service = axios.create({
  // baseURL: '/axios',
  timeout: 6000000,
  header: {
    "Content-Type": "application/json",
  },
});

service.interceptors.request.use(
  async (config) => {
    config.headers = {
      terminal: window.config.terminal,
      // tenant: sessionStorage.getItem("GH-NowEnterprise") ? JSON.parse(sessionStorage.getItem("GH-NowEnterprise")).code : '',
      ...config.headers,
    };
    // 如果参数有tenant,使用参数里的--(一般用于刷新token)
    if (qs.parse(config.data).tenant) {
      config.headers.tenant = qs.parse(config.data).tenant;
    } else if (sessionStorage.getItem("GH-NowEnterprise")) {
      config.headers.tenant = JSON.parse(
        sessionStorage.getItem("GH-NowEnterprise")
      ).code;
    }
    if (config.token !== false) {
      const token = sessionStorage.getItem("GH-Token");
      if (token) {
        config.headers = {
          Authorization: "Bearer " + JSON.parse(token).access_token ,
          ...config.headers,
        };
      }
    }
    return config;
  },
  (error) => {
    Promise.reject(error);
  }
);

service.interceptors.response.use(
  (response) => {
    const data = response.data;
    const resCode = data.code || false;
    if (resCode) {
      let result = data.data
      if(data.data === null){
        result = true
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
      const errCode = data.code;
      if (errCode) {
        if (errCode === 410) {
          if (sessionStorage.getItem("GH-Token")) {
            confirm({
              title: "提示",
              content:
                "当前账号被其他设备登录，请返回登录页重新登录，如不是本人操作，请尽快修改密码！",
              okText: "确定",
              cancelText: "取消",
              onOk: () => {
                window.location.hash = "/login";
              },
              onCancel: () => {
                window.location.hash = "/login";
              },
            });
          }
          sessionStorage.removeItem("GH-Token");
          sessionStorage.removeItem("GH-NowEnterprise");
          sessionStorage.removeItem("GH-UserInfo");
        } else if (errCode === 409) {
          return { data: data.data, errCode: errCode };
        } else {
          if (errCode === 403) {
            message.error("当前无权限");
            return;
          }
          if (data.data instanceof Object) {
            const obj = data.data;
            for (let i in obj) {
              message.error(obj[i]);
            }
          } else if (data.message) {
            message.error(data.message);
          }
          // message.error(data.message || "请求时出现错误！");
        }
      } else {
        message.error(data.error_description || "请求出现错误");
      }
    }
    return Promise.reject(error);
  }
);
const ajaxfn = function (config) {
  const method = config.method || "get";
  const url = config.url || "";
  const dataType = config.dataType || "normal";
  const data = config.params ? config.params : config.data ? config.data : {};

  if (method === "get") {
    return service.get(url, {
      params: data,
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
