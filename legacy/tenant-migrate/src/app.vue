<template>
  <a-config-provider :locale="locale">
    <div id="app">
      <router-view />
    </div>
  </a-config-provider>
</template>
<script lang="jsx">
import { defineComponent, ref, provide } from "vue";
import zhCN from "ant-design-vue/es/locale/zh_CN";
import { ConfigProvider } from "ant-design-vue";
export default defineComponent({
  setup() {
    const locale = ref(zhCN);
    return {
      locale,
    }; 
  },
});
</script>
<style>
.a_primary {
  color: var(--cube-theme-var--primary-color) !important
}
.a_danger{
  color: #ff4d4f !important;
}
</style>
