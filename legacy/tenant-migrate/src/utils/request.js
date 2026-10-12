import axios from "axios";
import qs from "qs";
import { message, Modal } from "ant-design-vue";
import { SessionEnum } from '@/models/session'
import { getSessionItemWithObject, getSessionItemWithNumber } from '@/utils/session'

const confirm = Modal.confirm;
const service = axios.create({
  // baseURL: '/axios',
  timeout: 15000,
  header: {
    "Content-Type": "application/json",
  },
});

service.interceptors.request.use(
  async (config) => {
    config.headers.terminal = "bimops-manage-web";
    // config.headers.terminal = "sat-enterprise-pc";
    if (getSessionItemWithObject(SessionEnum.nowEnterprise)) {
      config.headers.tenant = getSessionItemWithObject(SessionEnum.nowEnterprise).code;
    }
    if (config.token !== false) {
      const token = sessionStorage.getItem("GH-Token");
      if (token) {
        config.headers = {
          Authorization: "Bearer " + JSON.parse(token).access_token,
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
    if(response.status === 200){
      const responseData = response.data
      const isStandardApiResponse = responseData && 
        typeof responseData === 'object' && 
        responseData.hasOwnProperty('code') && 
        responseData.hasOwnProperty('data') && 
        typeof responseData.code === 'number' &&
        responseData.code === 200
        if(isStandardApiResponse){
          return responseData.data
        } else {
          return responseData
        }
    } else {
      return response
    }
  },
  (error) => {
    if (error.response) {
      const data = error.response.data;
      const errCode = data.code || error.response.status;
      if (errCode) {
        if (data.message) {
          if (data.message === "Precondition Failed") {
            const obj = data.data;
            for (let i in obj) {
              message.error(obj[i]);
            }
          } else {
            message.error(data.message);
          }
        } else if (data.data instanceof Object) {
          const obj = data.data;
          for (let i in obj) {
            message.error(obj[i]);
          }
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
