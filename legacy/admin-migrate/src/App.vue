<template>
  <a-config-provider :locale="locale">
    <div id="app">
      <router-view />
    </div>
  </a-config-provider>
</template>
<script lang='jsx'>
import zhCN from "ant-design-vue/es/locale/zh_CN";
import { defineComponent, ref, provide } from "vue";
import * as echarts from "echarts";
import { MFRootEventNameEnum, publisher } from '@/event'
import { antd3LegacyThemeManager,themeManager } from './theme'
 
export default defineComponent({
  components: {},
  setup() {
    const locale = ref(zhCN);
    provide("echarts", echarts);
    publisher.publish(MFRootEventNameEnum.MF_ROOT_CHANGE_TENANT, '');

    themeManager.mount()
    antd3LegacyThemeManager.mount()
    themeManager.use('拂晓蓝')
    antd3LegacyThemeManager.use('拂晓蓝')

    return {
      locale,
    };
  },
});
</script>
<style lang="less">
@import url("./styles/index.less");
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  height: 100%;
  width: 100%;
  // background-color: @background_2;
}

#nav {
  width: 100%;
  height: 60px;
  line-height: 60px;

  a {
    font-weight: bold;
    color: #2c3e50;
    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
</style>
