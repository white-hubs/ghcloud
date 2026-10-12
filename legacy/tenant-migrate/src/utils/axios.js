import { recurse } from "@/utils/common";
import { message } from "ant-design-vue";
import axios from "axios";
import moment from "moment";
import _ from "lodash";
import qs from "qs";
import { getToken } from "@/services/AccountService";
import { getSessionItemWithObject, getSessionItemWithNumber } from '@/utils/session'
import { SessionEnum } from '@/models/session'

/**
 * 解决并发同一个请求导致重复请求问题
 * 如获取显示数据字典
 */
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

const axiosInstance = axios.create({
  // baseURL: "/ouaa",
  paramsSerializer: function (params) {
    return qs.stringify(params, { arrayFormat: "repeat" });
  },
  headers: {
    "X-Requested-With": "XMLHttpRequest",
  },
  withCredentials: true,
});

// 默认对日期自动格式化为字符串
axiosInstance.interceptors.request.use((config) => {
  if (
    config.method.toLowerCase() !== "get" &&
    config.handleData !== false &&
    config.headers["Content-Type"] !== "multipart/form-data"
  ) {
    const handledData = recurse(config.data, (value) => {
      if (_.isDate(value) || moment.isMoment(value)) {
        return moment(value).format("YYYY-MM-DD HH:mm:ss");
      }
      if (_.isString(value) && !config.whitespace) {
        return _.trim(value);
      }
      return value;
    });
    config.data = handledData;
  }
  return config;
});

// 请求前获取token,设置Authorization头
axiosInstance.interceptors.request.use(async (options) => {
  let tenant =
    options.tenant || getSessionItemWithObject(SessionEnum.nowEnterprise).code;
  // options.headers.terminal = "sat-enterprise-pc";
  options.headers.terminal = "kh-tenant-web";
  if (tenant) {
    options.headers.tenant = tenant;
  }
  if (options.token !== false) {
    const token = await getToken();
    if (token) {
      options.headers = {
        Authorization: "Bearer " + token.access_token,
        ...options.headers,
      };
    }
  }
  return options;
});

axiosInstance.interceptors.response.use(
  (response) => {
    const res = response.data;
    if (res.code) {
      return res.data;
    }
    return res;
  },
  (error) => {
    if (error.response) {
      if (error.response.status === 403) {
        message.error("你无权限访问。");
      } else if (error.response.status === 401) {
        if (
          error.config?.url !== "/sys/oauth2/token" ||
          qs.parse(error.config?.data || "").grant_type !== "pwd"
        ) {
          // 自动刷新token refresh_token也失效跳转到登录页
          // logout();
        }
      } else {
        if (error.response.data.msg) {
          message.error(error.response.data.msg);
        }
      }
    }
    return Promise.reject(error);
  }
);

axiosInstance.restful = (gramer, data, options, requstBase) => {
  let method = "get";
  let url = gramer;
  const n = gramer.indexOf(":");
  if (n > 0) {
    const m = gramer.substring(0, n).toLowerCase();
    if (["get", "delete", "put", "post", "save", "patch"].includes(m)) {
      url = gramer.slice(n + 1);
      method = m;
    }
  }
  const isParamsOptions = ["get", "delete"].includes(method);
  if (method === "save") {
    method = data.id ? "put" : "post";
  }
  if (_.isPlainObject(data) && isParamsOptions) {
    data.__t = Date.now();
  }
  return axiosInstance.request({
    method,
    url,
    data: isParamsOptions && !options?.forceBody ? null : data,
    params: isParamsOptions && !options?.forceBody ? data : null,
    requstBase: requstBase || "/ouaa",
    tenant: options && options.headers.tenant ? options.headers.tenant : null,
  });
};

/**
 * 如果同一个请求在指定时间内（默认500ms）发送多次，则会自动合并为一个请求
 */
const deffereds = {};
axiosInstance.concurrentRestful = (gramer, data, options) => {
  let deffered = deffereds[gramer];
  if (!deffered) {
    deffered = deffereds[gramer] = mergeConcurrentFetch();
  }
  return deffered(
    () => axiosInstance.restful(gramer, data, options),
    options?.defferedTimeout
  );
};

export default axiosInstance;
