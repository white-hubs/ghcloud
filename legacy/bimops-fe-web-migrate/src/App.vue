<template>
  <a-config-provider :locale="zhCN">
    <router-view />
  </a-config-provider>
</template>

<script setup>
import zhCN from 'ant-design-vue/es/locale/zh_CN';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import { onMounted } from "vue";
import { useSiteSetting } from './hooks/use-site-setting'
import { forbiddenDevtools } from './utils/common'

dayjs.locale('zh-cn');
const { initTheme } = useSiteSetting()
initTheme()

function isInPrivateNetwork() {
  const ip = window.location.hostname;
  if(ip === 'localhost'){
    return true;
  }
  const privatePattern = /^(10(?:\.(?:2[0-4]\d|25[0-5]|[01]?\d?\d)){3})|(172\.(?:1[6-9]|2\d|3[0-1])(?:\.(?:2[0-4]\d|25[0-5]|[01]?\d?\d)){2})|(192\.168(?:\.(?:2[0-4]\d|25[0-5]|[01]?\d?\d)){2})$/;
  return privatePattern.test(ip);
}

onMounted(() => {
  // 如果装有开发插件并开启了注入则不做处理
  // (!window.cubeDebugMode && !isInPrivateNetwork()) && forbiddenDevtools()
  if (sessionStorage.getItem("videoSession")) {
    window.videoSession = sessionStorage.getItem("videoSession");
  }
});
</script>

<style lang="less">
@import "./styles/index.less";
*{
  transition: color,background-color,background 0.3s ease-in-out;
}
#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  height: 100%;
  width: 100%;

  >div {
    height: 100%;
    width: 100%;
  }
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

.primary-color {
  color: white;
  background-color: var(--cube-theme-var--primary-color) !important;
}
.verticalLine{
  &::before{
    background-color: var(--cube-theme-var--primary-color) !important;
  }
}
</style>
