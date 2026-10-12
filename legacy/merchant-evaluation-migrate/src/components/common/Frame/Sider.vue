<template lang="pug">
div.app-sider(:class="{mini:!expand}")
  div.app-sider-main
    a-spin.abs-center(v-if="loading" size="large")
    app-menu(v-model="activeMenuCode" v-show="!loading" :data="systemMenus" :mini="!expand" :rootId="systemItem ? systemItem.id : 'rootid'")
  div.app-sider-footer
    div.menu-expander(@click="expand=!expand" :class="{expand}")
      a-icon(:type="expand?'menu-fold':'menu-unfold'")
</template>
<script>
import AppMenu from './Menu';
import { mapGetters } from 'vuex';
import {
  GETTER_MENUS,
  LODA_RESOURCES,
  GETTER_SYSTEM,
  isParent,
  GETTER_TAB,
  GETTER_TABS,
} from '@store/menu';
import { GETTER_PROJECT } from '@store/account';
import _ from 'lodash';
export default {
  components: { AppMenu },
  data() {
    return {
      loading: false,
      activeMenuCode: null,
      expand: _.isNil(localStorage.getItem('menu-expanded'))
        ? true
        : JSON.parse(localStorage.getItem('menu-expanded')),
    };
  },
  computed: {
    ...mapGetters({
      project: GETTER_PROJECT,
      menus: GETTER_MENUS,
      system: GETTER_SYSTEM,
      activeTab: GETTER_TAB,
      tabs: GETTER_TABS,
    }),
    systemItem() {
      const menus = this.menus || [];
      if (this.system) {
        const systemItem = menus.find((a) => a.code === this.system);
        return systemItem;
      }
      return null;
    },
    systemMenus() {
      const menus = this.menus || [];
      if (this.systemItem) {
        return menus.filter((a) => isParent(this.systemItem, a, true));
      }
      return [];
    },
  },
  watch: {
    activeMenuCode: 'handleMenuClick',
    systemMenus: 'activeMenuOnSystemMenusChange',
    expand(nv) {
      localStorage.setItem('menu-expanded', nv);
    },
    activeTab() {
      this.activeMenuCode = this.activeTab;
    },
  },
  created() {
    this.loadResources();
  },
  methods: {
    async loadResources() {
      this.loading = true;
      await this.$store.dispatch(LODA_RESOURCES);
      this.loading = false;
    },
    handleMenuClick(code) {
      const item = this.systemMenus.find((a) => a.code === code);
      if (item && item.url) {
        const tab = this.tabs.find((a) => a.key === item.code);
        if (tab) {
          this.$openTab(tab);
        } else {
          this.$openMenu(item.code, item);
        }
      }
    },
    activeMenuOnSystemMenusChange() {
      // 这里默认打开当前系统菜单的第一个菜单
      const defaultPath = this.$route.path;
      //   this.$route,
      //   '====http://localhost:9090/#/ywpt/model-bind===',
      // );
      // debugger;
      this.$closeOtherTabs();
      const menu =
        this.systemMenus.find((a) => a.path === defaultPath) ||
        this.systemMenus.find((a) => !!a.path);
      if (
        this.$route.name &&
        menu.name !== this.$route.name &&
        ![
          '项目管理平台',
          '系统管理平台',
          '个人设置',
          '业务管理平台',
          '监控管理平台',
          '项目设置',
        ].includes(this.$route.name)
      ) {
        return;
      }
      if (menu) {
        this.activeMenuCode = menu.code;
      }
    },
  },
};
</script>
<style lang="less" scoped>
.app-sider {
  width: 26rem;
  background-color: #99d3fc;
  box-shadow: 0 0 2px rgba(0, 0, 0, 0.5);
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  transition: all 0.3s;
  &.mini {
    width: 6rem;
  }
  &-main {
    overflow: auto;
    flex: auto;
  }
  &-footer {
    flex: none;
    .menu-expander {
      cursor: pointer;
      font-size: 1.5em;
      color: #222223;
      margin-bottom: 1rem;
      text-align: center;
      &.expand {
        display: inline-block;
        margin-left: 1rem;
      }
    }
  }
}
</style>
