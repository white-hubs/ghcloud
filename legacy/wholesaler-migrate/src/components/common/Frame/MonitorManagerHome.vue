<template lang="pug">
.app-frame.jkpt
  .app-navigation
    app-navigation
  .app-frame-main
    .app-frame-main-sider(v-show='!hiddenFrame')
      app-sider
    .app-frame-main-container
      app-container(:showBreadcrumb='false')
</template>
<script>
import AppContainer from './Container';
import AppSider from './Sider';
// import AppNavigation from './Navigation';
import AppNavigation from './Navigation/jkpt';

import { SET_STATE } from '@store/menu';
import store from '@/store';

export default {
  components: { AppContainer, AppSider, AppNavigation },
  data() {
    return {
      hiddenFrame: true,
    };
  },
  async beforeRouteEnter(to, from, next) {
    store.commit(SET_STATE, ['system', 'JKPT']);
    next();
  },
  async created() {
    this.$store.commit(SET_STATE, ['system', 'JKPT']);
  },
};
</script>

<style lang="less" scoped>
@import '~@/styles/utilities';
.app-frame {
  .abs-fit;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  &-navigation {
    flex: none;
    z-index: 10;
  }
  &-main {
    flex: auto;
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: row;
    &-sider {
      flex: none;
      z-index: 8;
      position: relative;
    }
    &-container {
      flex: auto;
      z-index: 6;
      position: relative;
      overflow: hidden;
    }
  }
}
</style>
<style lang="less">
.jkpt {
  .app-navigation {
    position: fixed;
    top: 0;
    width: 100%;
    background: rgba(0, 0, 0, 0.2) !important;
    z-index: 1000;
  }
  .app-frame-main {
    background-image: linear-gradient(
      -180deg,
      #48abf1 0%,
      #8897b5 50%,
      #141303 100%
    );
    // background-repeat: no-repeat;
    // background-position: center bottom;
  }
}
</style>
