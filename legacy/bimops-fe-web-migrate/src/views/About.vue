<template>
  <a-layout>
    <NavTabs v-if="cubeSiteSetting.layout.value === 'CLASSIC' && !inDesktopClient && !isPortalImmersive" />
    <a-layout>
      <MenuList v-if="childApplication.applicationGroup.length > 0 && !isPortalMenuHidden" />
      <ChildAppContainer />
    </a-layout>
  </a-layout>
</template>

<script setup>
import { storeToRefs } from "pinia";
import { onMounted, watch } from "vue";
import { useRoute } from "vue-router";

import ChildAppContainer from "../components/child-app-container/child-app-container.vue";
import { useChildApplication } from "../hooks/use-child-application";
import { useSiteSetting } from "../hooks/use-site-setting";
import MenuList from "@/components/menuList/menuList.vue";
import NavTabs from "@/components/NavTabs/NavTabs.vue";
import { inDesktopClient } from "@/hooks/use-environment";
import { usePortalLayoutStore } from "@/hooks/use-portal-layout-store";
import { ensureQiankunStarted } from "@/utils/qiankun-runtime";

const { cubeSiteSetting } = useSiteSetting();
const childApplication = useChildApplication();
const route = useRoute();
const { isPortalImmersive, isPortalMenuHidden } = storeToRefs(usePortalLayoutStore());

onMounted(() => {
  ensureQiankunStarted();
});

watch(
  () => route.path,
  async () => {
    childApplication.setDefaultPage();
  },
  { immediate: true },
);
</script>

<style lang="less" scoped>
.layout_content {
  height: 100%;
  .ant-layout {
    height: 100%;
  }
}
</style>
