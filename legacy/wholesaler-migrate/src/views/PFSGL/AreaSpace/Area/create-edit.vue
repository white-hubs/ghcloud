<template lang="pug">
app-page-layout(fix-header)
  div.pt2.px3.abs-fit.overflow-auto 
    a-tabs.full-height(:active-key="activeKey" @change="handleTabChange")
      a-tab-pane(key="CreateArea" tab="区域信息")
        div.tab-panel-container
          CreateArea
      a-tab-pane(v-if="$route.params.id" key="AreaHistory" tab="历史面积")
        div.tab-panel-container
          AreaHistory
</template>

<script>
import { GETTER_PROJECT } from '@store/account';
import { mapGetters } from 'vuex';
import CreateArea from './Tabs/CreateArea';
import AreaHistory from './Tabs/AreaHistory';
export default {
  components: {
    CreateArea,
    AreaHistory,
  },
  data() {
    return {
      activeKey: 'CreateArea',
    };
  },
  computed: {
    ...mapGetters({
      project: GETTER_PROJECT,
    }),
    tabkey() {
      return this.$route.params.tabkey || 'CreateArea';
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
