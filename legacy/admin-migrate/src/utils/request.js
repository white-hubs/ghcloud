import axios from "axios";
import qs from "qs";
import { message, Modal, } from "ant-design-vue";
// import { ExclamationCircleOutlined } from "@ant-design/icons-vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import { getToken } from "@/services/AccountService";
const confirm = Modal.confirm;
const router = useRouter();
const store = useStore();
const service = axios.create({
  // baseURL: '/axios',
  timeout: 15000,
  header: {
    "Content-Type": "application/json",
  },
});

service.interceptors.request.use(
  async (config) => {
    config.headers.terminal = window.config.terminal;

    if (!config.headers.tenant && sessionStorage.getItem("tenant")) {
      config.headers.tenant = JSON.parse(sessionStorage.getItem("tenant")).code;
    }
    if (config.token !== false) {
      const token = await getToken();
      if (token) {
        config.headers = {
          Authorization: "Bearer " + token.access_token,
          ...config.headers
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
    if (resCode === 200) {
      const result = data.data || true;
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
      if (errCode) {
        if (errCode === 410) {
          confirm({
            title: "提示",
            content:
              "当前账号被其他设备登录，请返回登录页重新登录，如不是本人操作，请尽快修改密码！",
            okText: "确定",
            cancelText: "取消",
            // icon: createVNode(ExclamationCircleOutlined),
            onOk: () => {
              localStorage.removeItem("token");
              window.location.hash = "/login";
            },
            onCancel: () => { },
          });
        } else if (errCode === 403) {
          message.error("暂无查看权限!!");
        } else {
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
      headers: config.headers ?? {}
    });
  } else if (method === "put") {
    return service.put(url, data, { headers: config.headers ?? {} });
  } else if (method === "delete") {
    return service.delete(url, { headers: config.headers ?? {} });
  } else if (method === "patch") {
    return service.patch(url, data);
  } else {
    if (dataType === "form") {
      return service.post(url, qs.stringify(data), { headers: config.headers ?? {} });
    } else {
      return service.post(url, data, { headers: config.headers ?? {} });
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
