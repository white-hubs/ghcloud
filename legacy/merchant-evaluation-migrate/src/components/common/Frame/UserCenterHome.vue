<template lang="pug">
  div.app-frame
    div.app-navigation(v-show="!hiddenFrame")
      app-navigation
    div.app-frame-main
      div.app-frame-main-sider(v-show="!hiddenFrame")
        app-sider
      div.app-frame-main-container
        app-container
</template>
<script>
import AppContainer from './Container';
import AppSider from './Sider';
// import AppNavigation from './Navigation/UserCenterNavigation';
import AppNavigation from './Navigation';
import { GETTER_HIDDEN_FRAME } from '@store/common';
import {
  storeProject,
  getProjects,
  loadProjects,
} from '@/services/AccountService';
import { SET_STATE } from '@store/menu';
import { LOAD_CURRENT_PROJECT } from '@store/account';
import store from '@/store';
import { mapGetters } from 'vuex';
export default {
  components: {
    AppContainer,
    AppSider,
    // AppMenu,
    AppNavigation,
  },
  data() {
    return {};
  },
  computed: {
    ...mapGetters({
      hiddenFrame: GETTER_HIDDEN_FRAME,
    }),
  },
  async beforeRouteEnter(to, from, next) {
    await getProjects(); // 刷新projects
    // const projects = await loadProjects();
    // const { projectId } = to.params;
    // storeProject(projects.find((p) => p.id === projectId) || projects[0]);
    // await store.dispatch(LOAD_CURRENT_PROJECT);
    // if (projects?.length > 1) {
    //   next();
    // } else if (projects?.length === 1) {
    //   await storeProject(projects[0]);
    //   next({ path: '/jkpt/project', replace: true });
    // } else if (!projects?.length) {
    //   next({ path: '/noproject' });
    // }
    next();
  },
  created() {
    this.$store.commit(SET_STATE, ['system', 'GRSZ']);
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
