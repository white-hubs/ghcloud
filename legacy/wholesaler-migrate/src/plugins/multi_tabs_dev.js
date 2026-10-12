import { GETTER_MENUS } from '@store/menu';
import _ from 'lodash';

export default {
  install(Vue) {
    Vue.prototype.$openTab = function (options) {
      const { key, title, url, icon } = options;
      this.$router.push({ path: url, title, key });
    };

    /**
     * 返回
     * @param length - 返回多少级
     */
    Vue.prototype.$back = function () {
      this.$router.go(-1);
    };

    Vue.prototype.$openMenu = function (key, options) {
      const menus = this.$store.getters[GETTER_MENUS];
      const menu = _.find(menus, (a) => a.code === key);
      this.$openTab({ title: menu.name, url: menu.url, key, ...options });
      // this.
    };

    Vue.prototype.$getPermission = function (code) {
      const project = sessionStorage.getItem('project');
      if (project) {
        const btnCodes = JSON.parse(project).functionCodes || [];
        return btnCodes.includes(code);
      }
      return false;
      // return true;
    };
  },
};
