<template>
  <a-layout-header class="view_header">
    <div class="nav-tabs">
      <a-tabs :activeKey="activeKey" type="editable-card" hide-add @edit="onEdit" size="small" @change="changeTab">
        <a-tab-pane v-for="(pane, index) in tabPanes" :key="pane.id" :closable="false">
          <template #tab>
            <span class="tabItem" @mouseover="changeIndex(index)" @mouseleave="mouseleave">
              <span>{{ pane.applicationName }}-{{ pane.name }}</span>
              <CloseOutlined v-if="tabPanes.length > 1 && (mouseIndex === index || pane.id === activeKey)" @click.stop="onEdit(pane.id)" />
            </span>
          </template>
        </a-tab-pane>
      </a-tabs>
    </div>
    <div class="a-dropdown-container">
      <a-dropdown>
        <a-button size="small" type="link">关闭标签</a-button>
        <template #overlay>
          <a-menu>
            <a-menu-item>
              <a href="javascript:;" @click="closeTab('关闭其他')">关闭其他</a>
            </a-menu-item>
            <a-menu-item>
              <a href="javascript:;" @click="closeTab('关闭到右侧')">关闭到右侧</a>
            </a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>
    </div>
  </a-layout-header>
</template>

<script>
import { CloseOutlined } from "@ant-design/icons-vue";
import { computed, defineComponent, reactive, toRefs, watch } from "vue";
import { useRoute } from "vue-router";

import { useChildApplication } from "../../hooks/use-child-application";
import * as api from "@/api";
import { treeMatch } from "@/utils/common";

export default defineComponent({
  components: { CloseOutlined },
  setup() {
    const route = useRoute();
    const state = reactive({
      activeKey: 0,
      menuName: null,
      mouseIndex: 0,
    });
    const childApplication = useChildApplication();
    const tabPanes = computed(() => {
      return childApplication.tabsPane;
    });
    const onEdit = (key) => {
      const obj = tabPanes.value.find((item) => item.id === key);
      removeTab(key, obj);
    };
    const changeTab = (key) => {
      const index = tabPanes.value.findIndex((item) => item.id === key);
      const obj = tabPanes.value.find((item) => item.id === key);
      if (index !== -1) {
        state.mouseIndex = index;
      }
      handleChangeTab(key, obj);
    };

    state.menuName = computed(() => {
      return childApplication.currentApplication;
    });

    const changeIndex = (index) => {
      state.mouseIndex = index;
    };

    const mouseleave = () => {
      state.mouseIndex = null;
    };

    // 关闭tab时如果是当前页面则重新跳转页面（需要判断当前页面是不是tabs里面最后一个）
    const removeTab = async (key) => {
      const pageList = tabPanes.value;
      let index = pageList.findIndex((item) => item.id === key);
      pageList.splice(index, 1);
      childApplication.tabsPane = pageList;
      if (key === state.activeKey) {
        index = index >= pageList.length ? pageList.length - 1 : index;
        state.activeKey = pageList[index].id;
        let applicationsArr = [];
        childApplication.applicationGroup.forEach((item) => {
          applicationsArr = applicationsArr.concat(item.applicationPageVOS);
        });
        const data = applicationsArr.find((item) => item.id === pageList[index].applicationId);
        if (data) {
          childApplication.currentApplication = data;
          const menu = await api.getApplicationInMenus(
            {
              applicationCode: pageList[index].applicationCode,
            },
            "get",
          );
          if (menu.length > 0) {
            childApplication.currentMenus = menu;
            history.pushState(history.state, "", pageList[index].path);
          } else {
            proxy.$message.error("该应用下未分配菜单");
          }
        }
      }
    };

    // 关闭标签页
    const closeTab = (type) => {
      if (type === "关闭其他") {
        if (state.activeKey) {
          const pageList = childApplication.tabsPane.filter((item) => item.id === state.activeKey);
          childApplication.tabsPane = pageList;
        }
      } else if (type === "关闭到右侧") {
        let boo = true;
        const pageList = childApplication.tabsPane.filter((item) => {
          if (boo) {
            if (item.id === state.activeKey) {
              boo = false;
            }
            return item;
          }
        });
        childApplication.tabsPane = pageList;
      }
    };

    // 点击tab-pane跳转页面
    const handleChangeTab = async (key, obj) => {
      const pageList = tabPanes.value;
      if (obj) {
        state.activeKey = key;
        const page = pageList.find((item) => item.id === key);
        //当前应用
        let applicationsArr = [];
        childApplication.applicationGroup.forEach((item) => {
          applicationsArr = applicationsArr.concat(item.applicationPageVOS);
        });
        const data = applicationsArr.find((item) => item.id === obj.applicationId);
        if (data) {
          await childApplication.toChildApplication(data, page.path);
        }
      }
    };

    watch(
      () => route.path,
      () => {
        const pageList = tabPanes.value;
        if (route.path === "/about") {
          const firstMenu = childApplication.getFirstItemInMenu(childApplication.currentMenus);
          state.activeKey = firstMenu.id;
        } else {
          if (!pageList.find((item) => item.path === route.path)) {
            const match = treeMatch(childApplication.currentMenus, route.path, "path");
            if (match) {
              pageList.push(match);
              state.activeKey = match.id;
            }
          } else {
            const data = pageList.filter((item) => item.path === route.path);
            if (data.length && data[0]) {
              state.activeKey = data[0].id;
            }
          }
        }
        childApplication.tabsPane = pageList;
      },
      { immediate: true },
    );

    return {
      ...toRefs(state),
      onEdit,
      changeTab,
      changeIndex,
      mouseleave,
      tabPanes,
      removeTab,
      closeTab,
    };
  },
});
</script>

<style lang="less" scoped>
.view_header {
  position: relative;

  .a-dropdown-container {
    position: absolute;
    top: 0;
    right: 10px;
    height: 99%;
    line-height: 40px;
    text-align: center;
    background-color: #fff;
  }
}

:deep(.ant-tabs-nav) {
  width: 100%;
  text-align: left;
  margin-bottom: 0 !important;
}

.nav-tabs {
  width: 100%;
  border-bottom: 1px solid #f3f3f3;

  .tabItem {
    padding: 0 8px;
    display: inline-flex;
    justify-content: space-between;
    align-items: center;

    .anticon-close {
      margin: 0;
      margin-left: 10px;
    }
  }

  .close {
    width: 16px;
    height: 16px;
    margin: 0;
    margin-right: 0 !important;
    overflow: hidden;
    color: rgba(0, 0, 0, 0.45);
    font-size: 12px;
    vertical-align: middle;
    transition: all 0.3s;
  }

  .ant-tabs-bar {
    margin: 0;
  }

  .ant-tabs.ant-tabs-card .ant-tabs-card-bar .ant-tabs-tab {
    padding: 0 !important;
    margin: 0 !important;
  }

  .ant-tabs-tab {
    margin: 0 !important;
  }
}
</style>
