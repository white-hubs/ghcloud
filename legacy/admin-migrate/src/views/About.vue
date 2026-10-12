<template lang="pug">
a-layout
    a-layout-sider(style="width:200px" theme="light")
        menuList(:menuList="applicationMenus" @gotoPage="goToPage")
          div.menuTitle
            span.title {{title}}
    a-layout-content(class="layout_content")
        a-layout
            a-layout-header(class="view_header")
                NavTabs(:tabPanes="pageList" :activeKey="activeKey" :breadcrums="breadcrums" @removeTab="removeTab" @changeTab="changeTab")
            a-layout-content(class="view_content")
                router-view 
            a-layout-footer(class="view_footer") {{copyright}}
    div.popup        
</template>

<script lang='jsx'>
import {
  computed,
  defineComponent,
  onMounted,
  reactive,
  toRefs,
  watch,
} from "vue";
import { useStore } from "vuex";
import { useRouter, useRoute } from "vue-router";
import { treematch, getParentNode } from "@/utils/common";
export default defineComponent({
  setup() {
    const store = useStore();
    const router = useRouter();
    const route = useRoute();
    const state = reactive({
      title: "",
      applicationMenus: [],
      pageList: [],
      activeKey: "",
      breadcrums: [],
      copyright: window.config.copyright,
    });
    onMounted(() => {
      getApplication();
      setDefaultPage();
      state.breadcrums = getParentNode(
        state.applicationMenus,
        route.path,
        "path",
        "name"
      );
    });
    // 初始获取应用菜单
    const getApplication = () => {
      const application = computed(() => {
        // return store.getters.app;
        return JSON.parse(store.getters.app);
      });
      const menu = computed(() => {
        // return store.getters.menu;
        return JSON.parse(store.getters.menu);
      });
      state.pageList = computed(() => {
        return store.getters.tabsPane;
      });
      state.title = application.value?.name;
      state.applicationMenus = menu.value;
    };
    // 返回默认第一个菜单
    const firstPage = (data) => {
      if (data.length) {
        if (data[0].children && data[0].children.length > 0) {
          return firstPage(data[0].children);
        } else {
          return data[0];
        }
      }
    };
    // 判断当前进入的页面如果是about则默认进去第一页面，如果不是则进入对应页面
    const setDefaultPage = () => {
      if (route.path === "/about") {
        const firstMenu = computed(() => {
          return firstPage(state.applicationMenus);
        });
        state.activeKey = firstMenu.value.id;
        if (
          state.pageList.findIndex((item) => item.id === firstMenu.value.id) ===
          -1
        ) {
          state.pageList.push(firstMenu.value);
        }
        router.push(firstMenu.value.path);
      } else {
        if (
          state.pageList.findIndex((item) => item.path === route.path) === -1
        ) {
          const match = treematch(state.applicationMenus, route.path, "path");
          if (match) {
            state.pageList.push(match);
            state.activeKey = match.id;
          }
        }
      }
      store.commit("menu/SET_TABS_PANE", state.pageList);
    };
    const goToPage = (data) => {
      if (state.pageList.findIndex((item) => item.id === data.id) === -1) {
        state.pageList.push(data);
        store.commit("menu/SET_TABS_PANE", state.pageList);
      }
      state.activeKey = data.id;
      router.push(data.path);
    };
    // 关闭tab时如果是当前页面则重新跳转页面（需要判断当前页面是不是tabs里面最后一个）
    const removeTab = (key) => {
      let index = state.pageList.findIndex((item) => item.id === key);
      state.pageList.splice(index, 1);
      store.commit("menu/SET_TABS_PANE", state.pageList);
      if (key === state.activeKey) {
        index =
          index >= state.pageList.length ? state.pageList.length - 1 : index;
        state.activeKey = state.pageList[index].id;
        router.push(state.pageList[index].path);
      }
    };
    // 点击tab-pane跳转页面
    const changeTab = (key) => {
      state.activeKey = key;
      const page = state.pageList.find((item) => item.id === key);
      router.push(page.path);
    };

    watch(
      () => route.path,
      () => {
        getApplication();
        setDefaultPage();
        state.breadcrums = getParentNode(
          state.applicationMenus,
          route.path,
          "path",
          "name"
        );
      }
    );
    watch(
      () => store.getters.app,
      () => {
        state.title = JSON.parse(store.getters.app).name;
      }
    );
    return {
      ...toRefs(state),
      goToPage,
      removeTab,
      changeTab,
    };
  },
});
</script>

<style lang="less" scoped>
// @import url("@/styles/theme/color.less");;
.layout_content {
  height: 100%;
  .ant-layout {
    height: 100%;
    overflow: hidden;
  }
}
.view_header {
  height: 80px;
}
.view_content {
  padding: 16px 16px 0 16px;
  position: relative;
  // overflow: hidden;
}
.view_footer {
  height: 30px;
  line-height: 30px;
  font-size: 12px;
  padding: 0;
  color: #999999;
}
.title {
  // background-color: #696969;
  height: 45px;
  line-height: 45px;
  color: #000;
  font-size: 16px;
  font-family: @fontMedium;
}
.menuTitle {
  background-color: @lightBlue;
  text-align: center;
  span {
    display: inline-block;
    vertical-align: middle;
  }
}
</style>
