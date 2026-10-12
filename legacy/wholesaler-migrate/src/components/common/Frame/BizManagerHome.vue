<template lang="pug">
  div.app-frame.custom-skins(:class="savedTheme")
    div.app-navigation(v-show="!hiddenFrame")
      app-navigation
    div.app-frame-main
      div.app-frame-main-sider(v-show="!hiddenFrame")
        app-sider
      div.app-frame-main-container
        app-container
</template>
<script>
import AppContainer from './ContainerMutilTab';
import AppSider from './Sider';
import AppNavigation from './Navigation';
// import AppNavigation from './Navigation/jkpt';
import { GETTER_HIDDEN_FRAME } from '@store/common';
import { SET_STATE } from '@store/menu';
import { GETTER_SAVED_THEME } from '@store/theme';
import store from '@/store';
import { mapGetters } from 'vuex';
export default {
  components: { AppContainer, AppSider, AppNavigation },
  computed: {
    ...mapGetters({
      hiddenFrame: GETTER_HIDDEN_FRAME,
      savedTheme: GETTER_SAVED_THEME,
    }),
  },
  async beforeRouteEnter(to, from, next) {
    // await getProjects(); // 刷新projects
    // const project = await loadCurrentProject();
    // if (project) {
    //   next();
    // }
    store.commit(SET_STATE, ['system', 'YWPT']);
    next();
  },
  async created() {
    this.$store.commit(SET_STATE, ['system', 'YWPT']);
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
