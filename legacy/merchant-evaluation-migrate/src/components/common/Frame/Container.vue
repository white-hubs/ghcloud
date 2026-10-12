<template lang="pug">
.app-container.abs-fit
  //- div.app-container-tabs(v-show="!hiddenFrame")
  //-   a-tabs.tabs(type="card" :active-key="activeKey" @change="changeHandler" :force-render="true"  :animated="false" :tab-bar-style="{paddingLeft:'1rem'}")
  //-     a-tab-pane(v-for='(item,index) in tabs' :key="item.key")
  //-       div(@click.middle="$closeTab(item.key)" slot="tab")
  //-         a-dropdown(:trigger="['contextmenu']")
  //-           div.inline-block
  //-             i.iconfont.mr1(:class="'icon-'+item.icon" v-if="item.icon")
  //-             span {{item.title}}
  //-           a-menu(slot="overlay")
  //-             a-menu-item(@click="$closeTab(item.key)" v-if="item.closable")  关闭
  //-             a-menu-item(@click="$closeOtherTabs()") 关闭全部
  //-             a-menu-item(@click="$closeOtherTabs(item.key)") 关闭其他
  //-             a-menu-item(v-if="index<tabs.length-1" @click="$closeRightTabs(item.key)") 关闭右侧
  //-             a-menu-item(v-if="index>0" @click="$closeLeftTabs(item.key)") 关闭左侧
  //-         a-icon.close-icon(type="close" v-if="item.closable" @click.stop="$closeTab(item.key)")
  .app-container-breadcrumb(v-show='!hiddenFrame&&showBreadcrumb')
    app-breadcrumb
  .app-container-main
    //- keep-alive(:exclude="keepAliveExclude" :max="2")
      router-view()
    keep-alive(v-if="!$route.meta.noKeepAlive" :include="['KeepAliveDeviceMonitor', 'KeepAliveDevices', 'KeepAliveXxxx']" :max="10")
      router-view()
    router-view(v-else)
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
      keepAliveinclude: /(keepAlive|KeepAliveDevices)/gi, // component name 包含 KeepAlive 的缓存住
      keepAliveExclude: /detail|edit|create/gi,
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
  },
  watch: {
    $route(nv) {
      if (this.menus.length) {
        this.$nextTick(() => this.activeTabByUrl(nv.fullPath));
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
    changeHandler(key) {
      const activeTab = this.tabs.find((a) => a.key === key);
      this.activeTabByUrl(activeTab.url);
    },
    activeTabByUrl(url) {
      const activeTab = this.tabs.find((a) => a.key === this.activeKey);
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
  overflow: hidden;

  &-tabs {
    flex: none;

    @{deep} .ant-tabs {
      padding-left: 1rem;

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
