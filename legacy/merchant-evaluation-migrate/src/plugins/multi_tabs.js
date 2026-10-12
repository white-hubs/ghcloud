import { SET_STATE, GETTER_TABS, GETTER_TAB, GETTER_MENUS } from '@store/menu';
import _ from 'lodash';

export default {
  install(Vue) {
    Vue.prototype.$refreshTab = function (options) {
      //
    };
    Vue.prototype.$openTab = function (options) {
      const {
        key,
        title,
        url,
        icon,
        closable = true,
        forceF5 = false,
      } = options;
      const tabs = this.$store.getters[GETTER_TABS];
      const open = () => {
        const breadcrumbTitle = this.$route.meta.title;
        let existsTabIndex = _.findIndex(tabs, (tab) => tab.key === key);
        if (existsTabIndex === -1) {
          const newTab = {
            key,
            title: title || breadcrumbTitle,
            url,
            icon,
            closable,
            breadcrumbTitle,
          };
          tabs.push(newTab);
        } else {
          const existsTab = tabs[existsTabIndex];
          // debugger;
          const newUrl = new URL(url, location.origin);
          const oldUrl = new URL(existsTab.url, location.origin);
          if (newUrl.pathname !== oldUrl.pathname) {
            tabs.splice(existsTabIndex, 1, {
              ..._.omit(existsTab, '_vnode'),
              url: url,
              breadcrumbTitle,
              last: existsTab,
            });
          } else if (forceF5) {
            // tabs.splice(existsTabIndex, 1, {
            //   ..._.omit(existsTab, '_vnode'),
            //   url: url,
            //   breadcrumbTitle,
            //   last: existsTab,
            // });
          }
        }
        this.$store.commit(SET_STATE, ['tabs', tabs]);
        this.$store.commit(SET_STATE, ['tab', key]);
      };
      // debugger;
      if (this.$route.fullPath !== url) {
        // debugger;
        this.$router.push(url, open);
      } else {
        open();
      }
    };

    /**
     * 返回
     * @param length - 返回多少级
     */
    Vue.prototype.$back = function (length = 1) {
      try {
        const tabs = this.$store.getters[GETTER_TABS];
        const activeKey = this.$store.getters[GETTER_TAB];
        const activeTab = _.find(tabs, (tab) => tab.key === activeKey);

        length = Math.max(1, length);
        let lastTab = activeTab;
        for (let index = 0; index < length; index++) {
          lastTab = lastTab.last;
        }
        if (lastTab) {
          let lastTabIndex = _.findIndex(
            tabs,
            (tab) => tab.key === lastTab.key,
          );
          if (lastTabIndex >= 0) {
            tabs.splice(lastTabIndex, 1, lastTab);
            this.$store.commit(SET_STATE, ['tabs', tabs]);
            this.$store.commit(SET_STATE, ['tab', lastTab.key]);
          } else {
            this.$store.commit(SET_STATE, ['tabs', [...tabs, lastTab]]);
            this.$store.commit(SET_STATE, ['tab', lastTab.key]);
          }
          if (this.$route.fullPath !== lastTab.url) {
            return this.$router.replace(lastTab.url);
          }
        }
      } catch {
        this.$router.go(-1);
      }
    };

    /**
     * 关闭Tab
     * force: 如果tab.closable为false，需要force=true才能强制关闭
     */
    Vue.prototype.$replaceTab = function (url, breadcrumbTitle) {
      const tabs = this.$store.getters[GETTER_TABS];
      const activeKey = this.$store.getters[GETTER_TAB];
      const activeTab = _.find(tabs, (tab) => tab.key === activeKey);
      if (activeTab.url !== url) {
        activeTab.url = url;
        activeTab.breadcrumbTitle =
          breadcrumbTitle || activeTab.breadcrumbTitle;
        this.$store.commit(SET_STATE, ['tabs', tabs]);
        this.$router.replace(url);
      }
    };

    /**
     * 关闭Tab
     * force: 如果tab.closable为false，需要force=true才能强制关闭
     */
    Vue.prototype.$closeTab = function (key, force = false) {
      const tabs = this.$store.getters[GETTER_TABS];
      const activeKey = this.$store.getters[GETTER_TAB];

      const closeIndex = _.findIndex(tabs, (a) => a.key === key);
      const closeTab = tabs[closeIndex];
      if (closeIndex != -1 && (closeTab.closable || force)) {
        if (key == activeKey) {
          let tab = tabs[closeIndex + 1] || tabs[closeIndex - 1];
          this.$store.commit(SET_STATE, ['tab', tab && tab.key]);
          tab && this.$router.replace(tab.url);
        }
        tabs.splice(closeIndex, 1);
        this.$store.commit(SET_STATE, ['tabs', tabs]);
      }
    };

    Vue.prototype.$closeRightTabs = function (key) {
      let tabs = this.$store.getters[GETTER_TABS];
      const activeKey = this.$store.getters[GETTER_TAB];
      const currentIndex = _.findIndex(tabs, (a) => a.key === key);

      if (currentIndex !== -1 && currentIndex < tabs.length - 1) {
        tabs = _.filter(
          tabs,
          (tab, index) => index <= currentIndex || !tab.closable,
        );
        this.$store.commit(SET_STATE, ['tabs', tabs]);
        if (!_.some(tabs, (a) => a.key === activeKey)) {
          const activeTab = _.last(tabs);
          this.$store.commit(SET_STATE, ['tab', activeTab.key]);
          activeTab && this.$router.replace(activeTab.url);
        }
      }
    };

    Vue.prototype.$closeLeftTabs = function (key) {
      let tabs = this.$store.getters[GETTER_TABS];
      const activeKey = this.$store.getters[GETTER_TAB];
      const currentIndex = _.findIndex(tabs, (a) => a.key === key);

      if (currentIndex > 0) {
        tabs = _.filter(
          tabs,
          (tab, index) => index >= currentIndex || !tab.closable,
        );
        this.$store.commit(SET_STATE, ['tabs', tabs]);
        if (!_.some(tabs, (a) => a.key === activeKey)) {
          const activeTab = _.last(tabs);
          this.$store.commit(SET_STATE, ['tab', activeTab.key]);
          activeTab && this.$router.replace(activeTab.url);
        }
      }
    };

    Vue.prototype.$closeOtherTabs = function (key) {
      let tabs = this.$store.getters[GETTER_TABS];
      const activeKey = this.$store.getters[GETTER_TAB];
      tabs = _.filter(tabs, (tab) => tab.key === key || !tab.closable);
      this.$store.commit(SET_STATE, ['tabs', tabs]);
      if (!_.some(tabs, (a) => a.key === activeKey) && tabs.length) {
        const activeTab = _.last(tabs);
        this.$store.commit(SET_STATE, ['tab', activeTab.key]);
        activeTab && this.$router.replace(activeTab.url);
      }
    };

    Vue.prototype.$openMenu = function (key, options) {
      const menus = this.$store.getters[GETTER_MENUS];
      const menu = _.find(menus, (a) => a.code === key);
      this.$openTab({ title: menu.name, url: menu.url, key, ...options });
      // this.$router.push(menu);
    };

    Vue.prototype.$getPermission = function (code) {
      const user = sessionStorage.getItem('user');
      if (user) {
        const btnCodes = JSON.parse(user).functionCodes || [];
        return btnCodes.includes(code);
      }
      return false;
    };
  },
};
