import FocusDirective from '../directives/focus';
import axios from '@/utils/axios';
import globalComponents from '@/components/global';
import echarts from 'echarts';

export default {
  // 注册全局的组件
  install(Vue) {
    // 全局自定义指令创建Vue.directive
    Vue.directive('focus', FocusDirective);
    // 全局components中global的index文件导出了自定义全局组件（对象导出）。循环注册全局组件以便多页面使用
    Object.keys(globalComponents).forEach((key) => {
      Vue.component(key, globalComponents[key]);
    });

    Vue.prototype.$filehost = '/fileresource/'; // process.env.VUE_APP_FILE_HOST; // 配置的 文件/图片 服务器地址
    Vue.prototype.$echarts = echarts;
    // Vue.prototype.$echartsGl = echartsGl;
    Vue.prototype.$axios = axios;
    Vue.prototype.$restful = axios.restful;
    Vue.prototype.$concurrentRestful = axios.concurrentRestful;
    Vue.prototype.$hasPermission = function () {
      return true;
    };
    Vue.prototype.$getUid = function () {
      return btoa(Math.random() * 10241024).substr(8);
    };
    Vue.prototype.$transformByAddPrefix = function (
      prefix,
      object,
      includeKeys,
    ) {
      const keys = Object.keys(object).filter(
        (key) => !includeKeys || includeKeys.includes(key),
      );
      const transKeys = keys.map((k) => {
        const firstLetter = k[0].toUpperCase();
        const otherLetters = k.substr(1);
        return prefix + firstLetter + otherLetters;
      });
      const obj = {};
      keys.forEach((key, index) => {
        obj[transKeys[index]] = object[key];
      });
      return obj;
    };
    Vue.prototype.$transformByRemovePrefix = function (
      prefix,
      object,
      includeKeys,
    ) {
      const keys = Object.keys(object).filter(
        (key) => !includeKeys || includeKeys.includes(key),
      );
      const transKeys = keys.map((k) => {
        const targetKey = k.replace(prefix, '');
        const firstLetter = targetKey[0].toLowerCase();
        const otherLetters = targetKey.substr(1);
        return firstLetter + otherLetters;
      });
      const obj = {};
      keys.forEach((key, index) => {
        obj[transKeys[index]] = object[key];
      });
      return obj;
    };

    Vue.mixin({
      data() {
        return {
          isActived: false,
        };
      },
      created() {
        this.isActived = true;
      },
      activated() {
        this.isActived = true;
        try {
          this.$refs.table.reload();
        } catch {
          // no table
        }
      },
      deactivated() {
        this.isActived = false;
      },
    });
  },
};
