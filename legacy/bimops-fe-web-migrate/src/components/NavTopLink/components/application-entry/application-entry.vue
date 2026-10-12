<template>
  <template v-if="cubeSiteSetting.layout.value === 'CLASSIC'">
    <ul class="flex application-ul" v-show="childApplication.applicationGroup.length">
      <li
        v-for="item in visibleLinkData"
        :key="item.key"
        @click="choseMenu(item.key)"
        @mouseover="showSuspended(item.key)"
        @mouseout.stop="hideSuspended"
        :style="{ backgroundColor: isShowSuspended && item.key === 'applications' ? 'rgba(0,0,0,0.08)' : 'transparent' }"
      >
        <span :class="[isActive === item.key ? 'checked' : '', 'navTopLink-normal']">{{ item.name }}</span>
        <span :class="[isActive === item.key ? 'Active' : '']"></span>
        <div v-if="item.Suspended" :class="['suspended', isShowSuspended ? 'show' : '']">
          <Application :applications="childApplication.applicationGroup"></Application>
        </div>
      </li>
    </ul>
    <div :class="isShowSuspended ? 'popup' : ''" @mouseover="hideSuspended"></div>
  </template>
  <template v-else>
    <div class="application-ul" style="width: 100px" v-show="childApplication.applicationGroup.length">
      <a-tabs v-model:activeKey="isActive" :style="{ height: '100%' }" centered @change="clickAppGroup" class="cube-top-tabs">
        <a-tab-pane v-if="workbenchEntryEnabled" key="workbench" tab="工作台"></a-tab-pane>
        <a-tab-pane v-for="item in childApplication.applicationGroup" :key="item.id" :tab="item.name"></a-tab-pane>
        <template #moreIcon>
          <DownOutlined />
        </template>
      </a-tabs>
    </div>
  </template>
</template>
<script setup>
import { DownOutlined } from "@ant-design/icons-vue";
import { computed, onMounted, ref, watch } from "vue";
import { useRouter, useRoute } from "vue-router";

import { useChildApplication } from "../../../../hooks/use-child-application";
import { useSiteSetting } from "../../../../hooks/use-site-setting";
import Application from "../../../global/Application/Application.vue";
import { isWorkbenchEntryEnabled } from "@/utils/portal-entry";

const { cubeSiteSetting } = useSiteSetting();
const childApplication = useChildApplication();
const router = useRouter();
const route = useRoute();
const linkData = [
  {
    name: "首页",
    key: "workbench",
    Suspended: false,
  },
  {
    name: "应用",
    key: "applications",
    Suspended: true,
  },
];
const isShowSuspended = ref(false);
const isActive = ref("");
const workbenchEntryEnabled = ref(true);
const visibleLinkData = computed(() => {
  return workbenchEntryEnabled.value ? linkData : linkData.filter((item) => item.key !== "workbench");
});
let scrollIndex = 0;
const maxScrollIndex = ref(0);

async function loadWorkBench() {
  if (["/index", "/workbench"].includes(route.path)) {
    return;
  }
  childApplication.changeAppLoadStatus("LOADING");
  childApplication.currentApplication = undefined;
  await router.replace({ path: "/index" });
}

const choseMenu = (key) => {
  if (key === "workbench") {
    loadWorkBench();
  }
};
const showSuspended = (key) => {
  if (key === "applications") isShowSuspended.value = true;
};
const hideSuspended = (e) => {
  if (e.toElement && e.toElement.className.includes("table-body")) {
    return;
  }
  isShowSuspended.value = false;
};

watch(
  () => [cubeSiteSetting.layout.value, route.path],
  () => {
    if (route.path === "/workbench") {
      return;
    }
    setDefaultActive();
  },
  { deep: true },
);

onMounted(async () => {
  const [enabled] = await Promise.all([isWorkbenchEntryEnabled(), childApplication.getUserApplications()]);
  workbenchEntryEnabled.value = enabled;
  setDefaultActive();

  // 计算maxScrollIndex
  if (cubeSiteSetting.layout.value === "MIXIN") {
    const items = document.querySelectorAll(".cube-top-tabs .ant-tabs-tab");
    const navWrapWidth = document.querySelector(".cube-top-tabs .ant-tabs-nav-wrap").clientWidth;
    let scrollLeftWidth = 0;
    for (let i = items.length - 1; i >= 0; i--) {
      scrollLeftWidth += items[i].clientWidth;
      if (scrollLeftWidth >= navWrapWidth) {
        maxScrollIndex.value = i + 2;
        break;
      }
    }
  }
});

async function clickAppGroup() {
  const findAppGroup = childApplication.applicationGroup.find((e) => e.id === isActive.value);
  if (!findAppGroup) {
    loadWorkBench();
    return;
  }
  const application = findAppGroup.applicationPageVOS[0];
  childApplication.toChildApplication(application);
}

function setDefaultActive() {
  if (route.path === "/index") {
    isActive.value = "workbench";
    return;
  }
  isActive.value = "applications";
  if (cubeSiteSetting.layout.value === "MIXIN") {
    const application = childApplication.currentApplication;
    isActive.value = application?.applicationGroupId ?? 0;
  }
}

function scrollAppBar(type = "prev" | "next") {
  if (type === "prev" && scrollIndex === 0) {
    scrollIndex = 1;
  }
  if (type === "next" && scrollIndex + 1 > maxScrollIndex.value) {
    return;
  }
  // 获取tabs宽度
  const items = document.querySelectorAll(".cube-top-tabs .ant-tabs-tab");
  scrollIndex = type === "prev" ? scrollIndex - 1 : scrollIndex + 1;
  let scrollLeft = 0;
  for (let i = 0; i < scrollIndex; i++) {
    scrollLeft += items[i].clientWidth;
  }
  document.querySelector(".cube-top-tabs .ant-tabs-nav-list").style.transform = `translate(${-scrollLeft}px, 0px)`;
}
</script>
<style lang="less" scoped>
:deep(.ant-tabs-tab) {
  min-width: 80px;
  height: 50px !important;
  margin: 0 !important;
  padding-top: 0;
  padding-bottom: 0;

  &:hover {
    background-color: rgba(0, 0, 0, 0.08);
    cursor: pointer;
  }
}

:deep(.ant-tabs-tab-btn) {
  color: white !important;
  text-align: center;
  height: 100%;
  font-size: 14px;
  transition: all 0.3s;
  display: flex;
  justify-content: center;
  align-items: center;
}

:deep(.ant-tabs-tab-active) {
  position: relative;
  background-color: var(--cube-theme-var--primary-color-disabled);

  &::after {
    display: none;
  }

  &:hover {
    background-color: var(--cube-theme-var--primary-color-disabled);
    color: var(--cube-theme-var--primary-color) !important;
  }

  .ant-tabs-tab-btn {
    color: var(--cube-theme-var--primary-color) !important;
  }
}

:deep(.ant-tabs-ink-bar) {
  display: none;
}

:deep(.ant-tabs-nav-more) {
  color: #fff;
  height: 50px;
}

.popup {
  display: inline-block;
  position: fixed;
  top: 50px;
  z-index: 998;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.2);
}

.application-ul {
  width: auto;
  flex: 1;
  list-style: none;
  height: 50px;
  padding: 0;
  margin: 0;
  position: relative;
  flex: 1;
  display: flex;

  li {
    &:hover {
      background-color: rgba(0, 0, 0, 0.08);
      color: @white;
      cursor: pointer;
    }

    position: relative;
    width: 80px;
    cursor: pointer;
    height: 50px;
    font-size: 16px;
    text-align: center;
  }

  .Active {
    width: 18%;
    display: inline-block;
    height: 1px;
    background-color: @white;
    position: absolute;
    bottom: 12px;
    left: 50%;
    transform: translate(-50%);
  }

  .navTopLink-normal {
    font-family: @fontRegular;
    display: inline-block;
    height: 50px;
    line-height: 50px;
  }

  .suspended {
    display: none;
  }

  .show {
    display: inline-block;
    position: absolute;
    top: 50px;
    z-index: 99999;
    left: 0px;
    width: 860px;
    height: 560px;

    :deep(.application) {
      border-radius: 0 0 12px 6px;
      padding: 0 20px;
      overflow-y: auto;

      .title {
        height: 100%;
      }

      .applInfo {
        display: flex;
        justify-content: flex-start;
        flex-wrap: wrap;

        .applName {
          margin-bottom: 16px;

          div {
            flex: 1;
          }
        }
      }
    }
  }

  :deep(.ant-tabs-tab + .ant-tabs-tab) {
    margin: 0;
  }

  :deep(.ant-tabs-nav-list) {
    width: 100%;
    overflow-x: auto;
  }

  .ant-tabs-tab + .ant-tabs-tab {
    margin: 0;
  }
}

.cube-top-tabs {
  height: 50px !important;
}
</style>
