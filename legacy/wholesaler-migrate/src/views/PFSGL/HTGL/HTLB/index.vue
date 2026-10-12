<template lang="pug">
app-page-layout(fix-header)
  div.my3.px3.abs-fit.overflow-auto
    a-tabs(:activeKey="activekey" @change="handleActiveChange")
      a-tab-pane(key="1" tab="待签订")
        div.tab-panel-container
          signedSign(:status="activekey")
      a-tab-pane(key="2" tab="待签章")
        div.tab-panel-container
          signature(:status="activekey")
      a-tab-pane(key="3" tab="已生效")
        div.tab-panel-container
          effective(:status="activekey")
      a-tab-pane(key="0" tab="草稿")
        div.tab-panel-container
          draft(:status="activekey")
</template>
<script>
import draft from './draft';
import signedSign from './signedSign';
import signature from './signature';
import effective from './effective';
import { GETTER_PROJECT } from '@store/account';
import { mapGetters } from 'vuex';
export default {
  name: 'KeepAliveXxxx',
  components: { draft, signedSign, signature, effective },
  data() {
    return {
      activekey: '1',
    };
  },
  computed: {
    ...mapGetters({
      project: GETTER_PROJECT,
    }),
  },
  created() {
    this.activekey = this.$route.query.activeKey || '1';
  },

  methods: {
    handleActiveChange(e) {
      this.activekey = e;
    },
  },
};
</script>
<style lang="less" scoped>
.tab-pane-container {
  position: relative;
  height: calc(100vh - 24rem);
}
:deep(.input){
  overflow: hidden;
  margin-right: 8px;
}
:deep(.inline){
  &:nth-child(4){
    .input{
      margin-right: 0px;
    }
  }
}
</style>
