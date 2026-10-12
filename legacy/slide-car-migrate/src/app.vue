<template>
  <a-config-provider :locale="locale">
    <div id="app">
      <router-view />
    </div>
  </a-config-provider>
</template>
<script lang="jsx">
import { defineComponent, ref, provide } from "vue";
import zh_CN from "ant-design-vue/es/locale/zh_CN";
import { ConfigProvider } from "ant-design-vue";
export default defineComponent({
  setup() {
    if (localStorage.getItem("skinColor")) {
      const color = JSON.parse(localStorage.getItem("skinColor"));
      window.less
        .modifyVars({
          "primary-color": color.primaryColor,
          "btn-primary-bg": color.btnPrimaryBg,
        })
        .then((res) => {
        })
        .catch((res) => {
        });
    }
    const locale = ref(zh_CN);
    return {
      locale,
    };
  },
});
</script>
<style lang="less" scoped>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  height: 100%;
  width: 100%;

  // background: @background_2;
  >div {
    height: 100%;
  }
}

#nav {
  // padding: 30px;
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
