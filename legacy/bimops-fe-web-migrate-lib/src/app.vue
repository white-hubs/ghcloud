<template>
  <ConfigProvider :locale="zh_CN">
    <div class="app">
      <router-view />
    </div>
  </ConfigProvider>
</template>
<script>
import zh_CN from 'ant-design-vue/es/locale/zh_CN'
import { ConfigProvider } from 'ant-design-vue/es'
import {defineComponent,} from "vue";
// Iconfont CSS loaded from resources
// Note: Add <link rel="stylesheet" href="/resource/v1/bimops-fe-web-migrate-lib/fonts/iconfont.css"> in index.html
// Or use: import('/resource/v1/bimops-fe-web-migrate-lib/fonts/iconfont.css')

export default defineComponent({
  components: {
    ConfigProvider
  },
  setup(props, ctx) {
    return {
      zh_CN
    }
  },
});
</script>
<style lang="less" scoped>
.app {
  width: 100%;
  height: 100%;
}
</style>
