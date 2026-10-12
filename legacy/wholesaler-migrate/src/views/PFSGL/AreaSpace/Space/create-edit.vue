<template lang="pug">
app-page-layout(fix-header)
  div.pt2.px3.abs-fit.overflow-auto
    a-tabs.full-height(:active-key="activeKey" @change="handleTabChange")
      a-tab-pane(key="CreateSpace" tab="空间信息")
        div.tab-panel-container(style="height: calc(100vh - 25rem);")
          CreateSpace
      a-tab-pane(v-if="$route.params.id" key="AreaHistory" tab="历史面积")
        div.tab-panel-container(style="height: calc(100vh - 25rem);")
          //- AreaHistory
</template>

<script>
import { GETTER_PROJECT } from '@store/account';
import { mapGetters } from 'vuex';
import CreateSpace from './Tabs/CreateSpace.vue';
import AreaHistory from './Tabs/AreaHistory';
export default {
  components: {
    CreateSpace,
    AreaHistory,
  },
  data() {
    return {
      activeKey: null,
    };
  },
  computed: {
    ...mapGetters({
      project: GETTER_PROJECT,
    }),
    tabkey() {
      return this.$route.params.tabkey || 'CreateSpace';
    },
  },
  created() {
    this.activeKey = this.tabkey;
  },
  methods: {
    back() {
      this.$router.push({ path: '/' });
    },
    handleTabChange(key) {
      this.activeKey = key;
    },
  },
};
</script>

<style lang="less" scoped>
// 样式
.full-height {
  height: 100%;
}
</style>
