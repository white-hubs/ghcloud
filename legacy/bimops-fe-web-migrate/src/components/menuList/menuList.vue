<template>
  <template v-if="cubeSiteSetting.layout.value === 'CLASSIC'">
    <a-layout-sider v-if="menuList.length">
      <div class="app-menu">
        <div class="menuTitle">
          <span class="title">{{ application.name }}</span>
        </div>
        <div ref="menuScrollContainer" class="menu">
          <a-menu
            mode="inline"
            :openKeys="state.openKeys"
            v-model:selectedKeys="state.selectedKeys"
            :inline-collapsed="false"
            @openChange="onOpenChange"
          >
            <template v-for="item in menuList" :key="item.id">
              <a-sub-menu v-if="item.children && item.children.length > 0" :key="`${item.id}`" :title="item.name">
                <menuSub :subMenu="item.children" @gotoPage="goToPage" />
              </a-sub-menu>
              <a-menu-item v-else :key="item.id" @click="goToPage(item)">
                {{ item.name }}
              </a-menu-item>
            </template>
          </a-menu>
        </div>
      </div>
    </a-layout-sider>
  </template>
  <template v-else>
    <template v-if="childApplication.currentApplicationMenuGroup">
      <a-layout-sider :collapsed="cubeSiteSetting.layout.menuFold"></a-layout-sider>
      <div
        class="ant-layout-sider ant-layout-sider-dark layout-mixin"
        :class="{ 'ant-layout-sider-collapsed': cubeSiteSetting.layout.menuFold }"
        style="position: absolute; left: 0; height: calc(100% - 50px)"
      >
        <div class="app-menu" :class="{ 'menu-fold': cubeSiteSetting.layout.menuFold }">
          <div ref="menuScrollContainer" class="menu">
            <a-menu mode="inline" @openChange="onOpenChange" :openKeys="state.openKeys" v-model:selectedKeys="state.selectedKeys">
              <template v-for="item in childApplication.currentApplicationMenuGroup?.applications" :key="item.id">
                <a-sub-menu
                  v-if="item.menus && item.menus.length > 0"
                  :key="item.id"
                  class="application-menu-entry"
                  :data-application-id="item.id"
                  :title="cubeSiteSetting.layout.menuFold ? '' : item.name"
                >
                  <template #icon>
                    <a-image
                      :preview="false"
                      :src="item?.icon"
                      style="width: 13px; height: 13px; margin-right: 8.5px"
                      :fallback="fallback"
                      v-if="!cubeSiteSetting.layout.menuFold"
                    />
                    <a-popover :title="item.name" placement="rightTop" overlayClassName="cube-menu-overlay" v-else>
                      <template #content>
                        <a-menu mode="inline" v-model:selectedKeys="state.selectedKeys" :inline-collapsed="false">
                          <template v-for="item in item.menus" :key="item.id">
                            <a-sub-menu v-if="item.children && item.children.length > 0" :key="`${item.id}`" :title="item.name">
                              <menuSub :subMenu="item.children" @gotoPage="goToPage" />
                            </a-sub-menu>
                            <a-menu-item v-else :key="item.id" @click="goToPage(item)">
                              {{ item.name }}
                            </a-menu-item>
                          </template>
                        </a-menu>
                      </template>
                      <div style="text-align: center; width: 100%">
                        <a-image
                          :preview="false"
                          :src="item?.icon"
                          :fallback="fallback"
                          style="width: 37px; height: 37px; border-radius: 8px"
                        />
                      </div>
                    </a-popover>
                  </template>
                  <menuSub :subMenu="item.menus" @gotoPage="goToPage" v-if="!cubeSiteSetting.layout.menuFold" />
                </a-sub-menu>
              </template>
            </a-menu>
          </div>
          <div class="change-icon" :class="{ 'menu-fold': cubeSiteSetting.layout.menuFold }" @click="changeMenuFold">
            <MenuFoldOutlined
              :style="{ transform: `rotate(${cubeSiteSetting.layout.menuFold ? 180 : 0}deg)`, fontSize: '16px', color: '#BFBFBF' }"
            />
          </div>
        </div>
      </div>
    </template>
  </template>
</template>
<script setup>
import { MenuFoldOutlined } from "@ant-design/icons-vue";
import { nextTick, ref, reactive, watch } from "vue";
import { useRoute } from "vue-router";

import menuSub from "./menuSub.vue";
import { fallback } from "@/config.js";
import { useChildApplication } from "@/hooks/use-child-application";
import { useSiteSetting } from "@/hooks/use-site-setting";

const { cubeSiteSetting, changeMenuFold } = useSiteSetting();
const childApplication = useChildApplication();
const route = useRoute();
const state = reactive({
  openKeys: [],
  selectedKeys: [],
});
const application = ref();
const menuList = ref([]);
const menuScrollContainer = ref();
const onOpenChange = (openKeys) => {
  if (cubeSiteSetting.layout.value === "CLASSIC") {
    state.openKeys = [openKeys.reverse()[0]];
  } else if (!cubeSiteSetting.layout.menuFold) {
    const latestOpenKey = openKeys.find((key) => state.openKeys.indexOf(key) === -1);
    if (openKeys.length > 0) {
      // 当前展开的应用
      const expendApplication = childApplication.currentApplicationMenuGroup?.applications.find(
        (e) => e.id === childApplication.currentApplication.id,
      );
      // 最后点击的菜单是否是有children
      if (expendApplication.menus.find((e) => e.id === latestOpenKey)?.children?.length > 0) {
        state.openKeys = [openKeys[0], latestOpenKey];
        return;
      }
    }
    const rootSubmenuKeys = childApplication.currentApplicationMenuGroup?.applications.map((item) => item.id);
    if (rootSubmenuKeys.indexOf(latestOpenKey) === -1) {
      state.openKeys = openKeys;
    } else {
      state.openKeys = latestOpenKey ? [latestOpenKey] : [];
    }
  }
};
const goToPage = async (data) => {
  // 判断要跳转的页面是否在属于应用菜单中
  if (data.applicationId === childApplication.currentApplication?.id || cubeSiteSetting.layout.value === "CLASSIC") {
    if (childApplication.currentApplication) {
      await childApplication.toChildApplication(childApplication.currentApplication, data.path);
    }
    return;
  }
  const findGroup = childApplication.applicationGroup.find((e) => e.id === childApplication.currentApplicationMenuGroup.groupId);
  const findApp = findGroup.applicationPageVOS.find((e) => e.id === data.applicationId);
  findApp && (await childApplication.toChildApplication(findApp, data.path));
};

function normalizeMenuPath(pathname) {
  const path = pathname.split("?")[0].replace(/\/+$/, "");
  return path || "/";
}

function getMenuPathMatchScore(menuPath, pathname) {
  if (!menuPath || !pathname) {
    return 0;
  }
  if (menuPath === pathname) {
    return menuPath.length + 20000;
  }
  const normalizedMenuPath = normalizeMenuPath(menuPath);
  const normalizedPath = normalizeMenuPath(pathname);
  if (!normalizedMenuPath || normalizedMenuPath === "/") {
    return normalizedMenuPath === normalizedPath ? 1 : 0;
  }
  if (normalizedMenuPath === normalizedPath) {
    return normalizedMenuPath.length + 10000;
  }
  // 只允许真正的子路由命中父菜单，避免 /trafficArea 命中 /trafficAreaPersonFlowStatistics。
  return normalizedPath.startsWith(`${normalizedMenuPath}/`) ? normalizedMenuPath.length : 0;
}

function findBestMenuPathMatch(menus, pathnames, parentKeys = []) {
  let bestMatch = null;
  for (const menu of menus) {
    const keys = [...parentKeys, menu.id];
    const score = pathnames.reduce((bestScore, pathname) => {
      return Math.max(bestScore, getMenuPathMatchScore(menu.path, pathname));
    }, 0);
    if (score && score > (bestMatch?.score ?? 0)) {
      bestMatch = { score, menu, keys };
    }
    if (menu.children?.length) {
      const childMatch = findBestMenuPathMatch(menu.children, pathnames, keys);
      if (childMatch && childMatch.score > (bestMatch?.score ?? 0)) {
        bestMatch = childMatch;
      }
    }
  }
  return bestMatch;
}

async function setDefaultOpenKeys() {
  const currentPath = window.location.pathname;
  const currentFullPath = `${window.location.pathname}${window.location.search}`;
  const currentPathCandidates = [currentFullPath, currentPath, route.fullPath, route.path];
  // 根据当前地址校正应用上下文，处理浏览器返回/手输地址导致的 currentApplication 与路由不一致。 导致对应菜单没展开和选中
  await childApplication.syncCurrentByPath(currentPath);
  // 完全没有菜单数据 先获取一遍
  if (childApplication.applicationMenuGroup.length === 0 && childApplication.currentMenus.length === 0) {
    await childApplication.queryAllApplicationMenuGroup();
    childApplication.matchApplicationMenuGroupByPath(currentPath);
  }

  // 如果当前应用和菜单已经匹配，且路径对应的菜单已存在，则只更新选中状态，避免重复加载
  // 优先使用 fullPath（包含 query）精确匹配，失败时回退到 path，兼容菜单 path 是否带参数两种情况
  const currentMatchResult = findBestMenuPathMatch(childApplication.currentMenus, currentPathCandidates);
  const currentMatch = currentMatchResult?.menu;

  if (currentMatch && childApplication.currentApplication?.id === application.value?.id) {
    // 只更新选中状态和展开状态，不重新加载菜单
    state.selectedKeys = [currentMatch.id];
    const keys = currentMatchResult?.keys;
    if (keys && keys.length) {
      if (cubeSiteSetting.layout.value === "CLASSIC") {
        state.openKeys = keys;
      } else {
        for (const app of childApplication.currentApplicationMenuGroup?.applications || []) {
          if (app.menus.find((e) => e.id === keys[0])) {
            state.openKeys = [app.id, ...keys];
            break;
          }
        }
      }
    }
    if (cubeSiteSetting.layout.menuFold) {
      state.openKeys = [];
    }
    return;
  }

  application.value = childApplication.currentApplication;
  menuList.value = childApplication.currentMenus;

  // 匹配选中的菜单
  const matchResult = findBestMenuPathMatch(menuList.value, currentPathCandidates);
  const match = matchResult?.menu;
  if (match) {
    state.selectedKeys = [match.id];
  } else {
    if (cubeSiteSetting.layout.value !== "CLASSIC") {
      try {
        const findApp = childApplication.currentApplicationMenuGroup?.applications.find(
          (e) => e.id === childApplication.currentApplication.id,
        );
        if (findApp) {
          state.openKeys = [findApp.id];
        }
      } catch {}
    }
  }
  if (
    !childApplication.currentApplicationMenuGroup ||
    childApplication.currentApplicationMenuGroup.length === 0 ||
    childApplication.currentApplicationMenuGroup.applications.length === 0
  ) {
    // 子应用菜单未加载 先获取一遍
    await childApplication.getApplicationMenuByGroup(application.value);
  }

  // 匹配父级菜单使其展开
  const keys = matchResult?.keys;
  if (keys && keys.length) {
    if (cubeSiteSetting.layout.value === "CLASSIC") {
      state.openKeys = keys;
    } else {
      for (const application of childApplication.currentApplicationMenuGroup.applications) {
        if (application.menus.find((e) => e.id === keys[0])) {
          state.openKeys = [application.id, ...keys];
          break;
        }
      }
    }
  }
  if (cubeSiteSetting.layout.menuFold) {
    state.openKeys = [];
  }
}

async function scrollCurrentMenuIntoView() {
  await nextTick();
  await new Promise((resolve) => setTimeout(resolve, 350));

  const menuContainer = menuScrollContainer.value;
  if (!menuContainer) {
    return;
  }

  let target = menuContainer.querySelector(".ant-menu-item-selected");
  if (!target && cubeSiteSetting.layout.value !== "CLASSIC" && cubeSiteSetting.layout.menuFold) {
    const applicationId = `${childApplication.currentApplication?.id ?? ""}`;
    target = Array.from(menuContainer.querySelectorAll(".application-menu-entry")).find(
      (element) => `${element.dataset.applicationId ?? ""}` === applicationId,
    );
  }
  if (!target) {
    return;
  }

  target.scrollIntoView({
    block: "center",
  });
}

watch(
  // 同一路由切换不同应用时 route.path 不变，需要监听应用 id 重新计算菜单高亮。
  [
    () => route.path,
    () => cubeSiteSetting.layout.value,
    () => cubeSiteSetting.layout.menuFold,
    () => childApplication.currentApplication?.id,
  ],
  async () => {
    await setDefaultOpenKeys();
    await scrollCurrentMenuIntoView();
  },
  { immediate: true },
);
</script>

<style lang="less" scoped>
.ant-layout-sider-collapsed {
  width: var(--menu-fold-width) !important;
  min-width: var(--menu-fold-width) !important;
  max-width: var(--menu-fold-width) !important;
  flex: 0 0 var(--menu-fold-width) !important;

  :deep(.ant-menu-submenu-arrow) {
    display: none;
  }
}

.app-menu {
  width: var(--menu-unfold-width);
  height: 100%;
  background-color: white;
  transition: all 0.3s;
  border-right: thin solid #e8e8e8;
  &::-webkit-scrollbar {
    display: none;
  }

  &.menu-fold {
    width: var(--menu-fold-width);
    overflow-x: hidden;
  }

  .menu {
    width: 100%;
    height: calc(100% - 45px);
    overflow-y: auto;
    &::-webkit-scrollbar {
      display: none;
    }
  }
}

:deep(.ant-menu) {
  width: 100%;
  height: 100%;
  overflow-x: hidden;
  border: 0;
  &::-webkit-scrollbar {
    display: none;
  }
}
:deep(.ant-menu-item) {
  margin-top: 0 !important;
}

.menuTitle {
  text-align: center;
  background-color: #fafafa;

  .title {
    display: inline-block;
    vertical-align: middle;
    height: 45px;
    line-height: 45px;
    color: #000;
    font-size: 16px;
    font-family: PingFang SC-Regular;
    font-weight: 400;
  }
}

.change-icon {
  height: 45px;
  background-color: transparent;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;

  .anticon-menu-fold {
    transition: all 0.3s;
  }

  &.menu-fold {
    width: var(--menu-fold-width);
  }
}

:deep(.ant-layout-sider-children) {
  background-color: white;
}
:deep(.ant-menu-submenu-arrow) {
  &::before,
  &::after {
    height: 0.1px;
  }
}
</style>
<style lang="less">
.menu-fold {
  .ant-menu-submenu-title {
    text-align: center;
    padding: 0 !important;
    height: 50px !important;
    line-height: 50px !important;
  }
}

.cube-menu-overlay {
  .ant-popover-title {
    text-align: center;
    padding: 5px 0;
    font-size: 16px;
  }
  .ant-popover-inner-content {
    padding: 0;
    .ant-menu {
      min-width: 146px;
      .ant-menu-item,
      .ant-menu-submenu-title {
        padding-left: 21px !important;
      }
    }
  }
}
</style>
