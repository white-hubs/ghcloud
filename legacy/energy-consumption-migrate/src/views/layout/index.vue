<!-- eslint-disable vue/mustache-interpolation-spacing -->
<!-- eslint-disable vue/attributes-order -->
<!-- eslint-disable vue/no-duplicate-attributes -->
<template>
  <Layout style="height:100vh">
    <!-- <LayoutSider v-model:collapsed="collapsed" :trigger="null" collapsible style="background-color: #1f2c40;">
      <LeftMenus />
    </LayoutSider> -->
    <Layout>
      <!-- <LayoutHeader
        style="background: #fff; padding: 0;height: 48px;  line-height: 48px;"
      >
        <menu-unfold-outlined
          v-if="collapsed"
          class="trigger"
          @click="() => (collapsed = !collapsed)"
        />
        <menu-fold-outlined v-else class="trigger" @click="() => (collapsed = !collapsed)" />
        <Breads />
      </LayoutHeader> -->
      <LayoutContent
        :style="{  background: '#fff', minHeight: '280px' }"
      >
        <RouterView />
      </LayoutContent>
    </Layout>
  </Layout>
  <slot />
</template>
<script lang="ts" setup>
import { ref } from 'vue'
import Breads from './components/Breads.vue'
import LeftMenus from './components/LeftMenus.vue'
const collapsed = ref<boolean>(false)
</script>
<style lang="less">
 .trigger {
  font-size: 18px;
  padding: 0 24px;
  cursor: pointer;
  transition: color 0.3s;
}

 .trigger:hover {
  color: #1890ff;
}
.site-layout .site-layout-background {
  background: #fff;
}
</style>
<style>

.template-menu {
  background-color: rgba(9,21,40,.4)!important;
}
.template-layout-sider-children{
  overflow: auto;
}
</style>
