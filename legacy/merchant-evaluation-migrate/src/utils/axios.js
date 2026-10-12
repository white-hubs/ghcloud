import { recurse } from '@/utils/common';
import { message } from 'ant-design-vue';
import axios from 'axios';
import moment from 'moment';
import _ from 'lodash';
import qs from 'qs';
import { logout } from '@/services/AccountService';
import { getToken, getNowEnterprise } from './auth';

/**
 * 解决并发同一个请求导致重复请求问题
 * 如获取显示数据字典
 */
const mergeConcurrentFetch = function () {
  let resolved = true;
  let ret = null;
  // 设置定时器
  let timeouter = null;
  return function (cb, timeout = 500) {
    // 进入就先清除定时器
    clearTimeout(timeouter);
    // 设置定时器
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
  baseURL: '/api',
  // axios get传递数组 paramsSerializer序列化，使用qs使参数转换，arrayFormat: 'repeat'参数形式转换为ids=1&ids=2&id=3
  paramsSerializer: function (params) {
    return qs.stringify(params, { arrayFormat: 'repeat' });
  },
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
  },
  // 表示跨域请求时是否需要使用凭证，开启withCredentials后，服务器才能拿到你的cookie，当然后端服务器也要设置允许你获取你开启了才有用
  withCredentials: true,
});

// 请求拦截器
// 默认对日期自动格式化为字符串
axiosInstance.interceptors.request.use((config) => {
  if (
    config.method.toLowerCase() !== 'get' &&
    config.handleData !== false &&
    config.headers['Content-Type'] !== 'multipart/form-data'
  ) {
    const handledData = recurse(config.data, (value) => {
      if (_.isDate(value) || moment.isMoment(value)) {
        return moment(value).format('YYYY-MM-DD HH:mm:ss');
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

// 请求拦截器
// 请求前获取token,设置Authorization头
axiosInstance.interceptors.request.use(async (options) => {
  // 如果参数有tenant,使用参数里的--(一般用于刷新token)
  if (qs.parse(options.data).tenant) {
    options.headers.tenant = qs.parse(options.data).tenant
  } else if (getNowEnterprise()) {
    options.headers.tenant = getNowEnterprise().code
  }
  if (options.token !== false) {
    const token = await getToken();
    if (token) {
      options.headers = {
        Authorization: 'Bearer ' + token.access_token,
        terminal: window.config.terminal,
        'Content-Type': 'application/json',
        ...options.headers,
      };
    }
  }
  return options;
});

// 响应拦截器
axiosInstance.interceptors.response.use(
  (response) => {
    const res = response.data;
    if (res.code) {
      return res.data;
    }
    return res;
  },
  (error) => {
    // if (error?.config?.notify !== false) {
    // }
    if (error.response) {
      if (error.response.status === 403) {
        message.error('你无权限访问。');
      } else if (error.response.status === 401) {
        if (
          error.config?.url !== '/sys/oauth2/token' ||
          qs.parse(error.config?.data || '').grant_type !== 'pwd'
        ) {
          // 自动刷新token refresh_token也失效跳转到登录页
          logout();
        }
      } else {
        message.error(error.response.data.message || '系统出错，请联系管理员。');
      }
    }
    return Promise.reject(error);
  },
);
/**
 * 
 * @param {*} gramer 地址
 * @param {*} data 传输数据
 * @param {*} options options是传给xhr上的 比如header这些,
 * ?? option 是浏览器发出的，只要是跨域都会发出，用于判断资源是不是可以被请求到
 * @returns 
 */
axiosInstance.restful = (gramer, data, options) => {
  let method = 'get';
  let url = gramer;
  // 获取请求地址中“：”的下标（：前面为指定的方法）eg: `GET:/project-merchant/appeals/${this.baseInfo.appealId}`/*  */
  const n = gramer.indexOf(':');
  // 有冒号
  if (n > 0) {
    // 提取地址中指定的方法，并全转化为小写
    const m = gramer.substring(0, n).toLowerCase();
    if (['get', 'delete', 'put', 'post', 'save', 'patch'].includes(m)) {
      // 截取请求地址
      url = gramer.slice(n + 1);
      // 指定请求方法
      method = m;
    }
  }
  // 请求方法是否为get或delete
  const isParamsOptions = ['get', 'delete'].includes(method);
  // 当指定方法为save时，如果传入的数据有ID，将方法改为put，否则改为post
  if (method === 'save') {
    method = data.id ? 'put' : 'post';
  }
  // _为lodash的方法，_.isPlainObject判断一个值是否是一个js原生对象，即使用Object构造函数创建的对象 或者 拥有[[Prototype]]属性为null的对象
  if (_.isPlainObject(data) && isParamsOptions) {
    // Date.now()，返回自1970/01/01以来的毫秒数
    data.__t = Date.now();
  }
  return axiosInstance.request({
    method,
    url,
    data: isParamsOptions && !options?.forceBody ? null : data,
    params: isParamsOptions && !options?.forceBody ? data : null,
    ...options,
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
    options?.defferedTimeout,
  );
};

export default axiosInstance;
