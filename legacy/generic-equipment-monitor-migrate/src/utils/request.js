import {
  getNowEnterprise,
  getToken,
  removeNowEnterprise,
  removeToken,
  removeUserInfo,
} from "@ghcloud-legacy/bimops-fe-web-migrate-lib/lib/utils/auth";
import { message, Modal } from "ant-design-vue";
import axios from "axios";
import qs from "qs";

import { getmarketconfig } from "@/api";
const confirm = Modal.confirm;

const service = axios.create({
  timeout: 60000, // 请求超时
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
  },
});

//请求拦截
service.interceptors.request.use(
  (config) => {
    config.headers = {
      terminal: window.config.terminal,
      ...config.headers,
    };
    // 如果参数有tenant,使用参数里的--(一般用于刷新token)
    if (qs.parse(config.data).tenant) {
      config.headers.tenant = qs.parse(config.data).tenant;
    } else if (getNowEnterprise()) {
      config.headers.tenant = getNowEnterprise().code;
    }
    const token = getToken();
    const markettoken = sessionStorage.getItem("markettoken");
    const url = sessionStorage.getItem("marketurl");
    const tenant = sessionStorage.getItem("marketenant");
    const gtokendaga = markettoken == null ? token.access_token : markettoken;
    if (url !== null) {
      config.baseURL = url;
      config.headers.tenant = tenant;
    } else {
      config.baseURL = "";
    }
    if (gtokendaga) {
      config.headers = {
        ...config.headers,
        Authorization: "Bearer " + gtokendaga,
        "Content-Type": "application/json",
      };
    }
    return config;
  },
  (error) => {
    // 请求错误
    return Promise.reject(error);
  },
);

// 响应拦截
service.interceptors.response.use(
  // 获取响应状态
  (response) => {
    if (response.status === 200) {
      const responseData = response.data;
      const isStandardApiResponse =
        responseData &&
        typeof responseData === "object" &&
        responseData.hasOwnProperty("code") &&
        responseData.hasOwnProperty("data") &&
        typeof responseData.code === "number" &&
        responseData.code === 200;
      if (isStandardApiResponse) {
        return responseData.data;
      } else {
        return responseData;
      }
    } else {
      return response;
    }
  },
  (error) => {
    if (error.response) {
      const data = error.response.data;
      const errCode = data.code || data.status;
      if (errCode) {
        if (errCode === 410) {
          if (getToken()) {
            confirm({
              title: "提示",
              content: "当前账号被其他设备登录，请返回登录页重新登录，如不是本人操作，请尽快修改密码！",
              okText: "确定",
              cancelText: "取消",
              // icon: createVNode(ExclamationCircleOutlined),
              onOk: () => {
                window.location.hash = "/login";
              },
              onCancel: () => {
                window.location.hash = "/login";
              },
            });
          }
          removeToken();
          removeUserInfo();
          removeNowEnterprise();
        } else if (errCode === 409) {
          return {
            data: data.data,
            errCode: errCode,
          };
        } else {
          if (errCode === 403) {
            message.error("当前无权限");
            return;
          }
          if (data.data instanceof Object) {
            // 只提示一项
            const obj = data.data;
            const keys = Object.keys(obj);
            message.error(obj[keys[0]]);
            // for
            // for (let i = 0; i < keys.length; i++) {

            // }
            // for (let i in obj) {
            //
            // }
          } else if (data.message) {
            message.error(data.message);
          }
        }
      } else {
        message.error(data.error_description || "请求出现错误");
      }
    }
    return Promise.reject(error);
  },
);

export default service;
