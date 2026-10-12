<template lang="pug">
.app-container.abs-fit
  div.app-container-tabs(v-show="!hiddenFrame")
    a-tabs.tabs(type="card" :active-key="activeKey" @change="changeHandler" :force-render="true"  :animated="false" )
      a-tab-pane(v-for='(item,index) in tabs' :key="item.key")
        div(@click.middle="$closeTab(item.key); handleCloseTab();" slot="tab")
          a-dropdown(:trigger="['contextmenu']")
            div.inline-block
              //- i.iconfont.mr1(:class="'icon-'+item.icon" v-if="item.icon")
              span {{item.title}}
            a-menu(slot="overlay")
              a-menu-item(@click="refreshTab(item)")  刷新
              //- a-menu-item(@click="$refreshTab(item)")  刷新
              a-menu-item(@click="$closeTab(item.key); handleCloseTab();" v-if="item.closable && tabs.length > 1")  关闭
              //- a-menu-item(@click="$closeOtherTabs()") 关闭全部
              a-menu-item(@click="$closeOtherTabs(item.key); handleCloseTab();") 关闭其他
              a-menu-item(v-if="index<tabs.length-1" @click="$closeRightTabs(item.key); handleCloseTab();") 关闭右侧
              a-menu-item(v-if="index>0" @click="$closeLeftTabs(item.key); handleCloseTab();") 关闭左侧
          a-icon.close-icon(type="close" v-if="item.closable && tabs.length > 1" @click.stop="$closeTab(item.key); handleCloseTab();")
  .app-container-breadcrumb(v-show='!hiddenFrame&&showBreadcrumb')
    app-breadcrumb
  .app-container-main
    //- keep-alive(:exclude="keepAliveExclude" :max="2")
      router-view()
    keep-alive(:include="keepAliveincludes" :max="10")
      router-view(v-if="routerViewControl" ref="child")
    //- router-view
</template>
<script>
import { GETTER_TABS, GETTER_TAB, GETTER_MENUS } from '@store/menu';
import { GETTER_HIDDEN_FRAME } from '@store/common';
import { mapGetters } from 'vuex';
import AppBreadcrumb from './Breadcrumb';
import _ from 'lodash';
export default {
  components: {
    AppBreadcrumb,
  },
  props: {
    showBreadcrumb: {
      type: Boolean,
      default: () => {
        return true;
      },
    },
  },
  data() {
    return {
      keepAliveincludes: [
        'KeepAliveDeviceMonitor',
        'KeepAliveDevices',
        'KeepAliveXxxx',
      ],

      routerViewControl: true,
    };
  },
  computed: {
    ...mapGetters({
      tabs: GETTER_TABS,
      menus: GETTER_MENUS,
      activeKey: GETTER_TAB,
      hiddenFrame: GETTER_HIDDEN_FRAME,
    }),
    activeTab() {
      return this.tabs.find((a) => a.key === this.activeKey);
    },
    // 把菜单的 code 和路由配置的组件的 name 结合起来
    // keepAliveincludes() {
    //   const names = this.tabs.map((item) => item.key);
    //   return names;
    // },
  },
  watch: {
    $route(nv) {
      if (this.menus.length) {
        this.$nextTick(() => {
          this.activeTabByUrl(nv.fullPath);
        });
      }
      if (nv.fullPath === '/') {
        window.location.reload();
      }
    },
  },
  mounted() {
    if (this.menus.length) {
      // this.$nextTick(this.activeTabOnFirst);
    }
  },
  methods: {
    // 刷新
    refreshTab(tab) {
      // this.routerViewControl = false;
      // this.keepAliveincludes = [];
      // this.$nextTick(() => {
      //   this.keepAliveincludes = [
      //     'KeepAliveDeviceMonitor',
      //     'KeepAliveDevices',
      //     'KeepAliveXxxx',
      //   ];
      //   this.routerViewControl = true;
      // });
    },
    // 关闭强制刷新
    handleCloseTab() {
      // this.$refs.child.$vnode = null;
      // this.routerViewControl = false;
      // this.keepAliveincludes = [];
      // setTimeout(() => {
      //   this.keepAliveincludes = [
      //     'KeepAliveDeviceMonitor',
      //     'KeepAliveDevices',
      //     'KeepAliveXxxx',
      //   ];
      //   this.routerViewControl = true;
      // }, 200);
    },
    changeHandler(key) {
      const activeTab = this.tabs.find((a) => a.key === key);
      // debugger;
      this.activeTabByUrl(activeTab.url);
    },
    activeTabByUrl(url) {
      const activeTab = this.tabs.find((a) => a.key === this.activeKey);
      // debugger;
      if (activeTab && activeTab.url !== url) {
        const tab = this.tabs.find((a) => a.url === url);
        if (tab) {
          this.$openTab(tab);
        } else if (_.isEmpty(this.$route.matched)) {
          this.$router.replace(this.activeTab.url);
        } else {
          const activeTab = this.tabs.find((a) => a.key === this.activeKey);
          this.$openTab({ ...activeTab, url: url });
        }
      }
    },
    activeTabOnFirst() {
      const url = this.$route.fullPath;
      const menu = _.find(this.menus, (a) => a.url === url) || this.menus[0];
      if (menu) {
        this.$openMenu(menu.code);
      }
    },
  },
};
</script>
<style lang="less" scoped>
.app-container {
  display: flex;
  flex-direction: column;
  padding: 20px;
  overflow: hidden;
  &-tabs {
    flex: none;
    @{deep} .ant-tabs {
      padding-left: 3px;
      background-color: #edf9ff;
      .ant-tabs-bar {
        margin-bottom: 0;
      }
    }

    .close-icon {
      margin-right: -0.5rem !important;
      margin-left: 0.5rem;
      color: rgba(0, 0, 0, 0.65);
      font-size: 12px !important;
    }
  }
  &-breacrumb {
    flex: none;
  }
  &-main {
    position: relative;
    flex: auto;
    overflow: hidden;
  }
}
</style>
