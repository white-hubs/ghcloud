<template lang="pug">
app-page-layout(fix-header)
  div.my3.px3.abs-fit.overflow-auto
    a-tabs(default-active-key="1")
      a-tab-pane(key="1" tab="基本信息")
        div.tab-panel-container
          baseinfo(:id="id")
      a-tab-pane(key="2" tab="人员列表")
        div.tab-panel-container 
          personnel(:id="id")
      a-tab-pane(key="3" tab="所有车辆")
        div.tab-panel-container 
          vehicle(:id="id")
      a-tab-pane(key="4" tab="所有设备")
        div.tab-panel-container 
          device(:id="id")
      a-tab-pane(key="5" tab="商户协议")
        div.tab-panel-container 
          agreement(:id="id")
      a-tab-pane(key="6" tab="实名认证")
        div.tab-panel-container 
          authentication(:id="id")
</template>
<script>
import baseinfo from './baseinfo';
import personnel from './personnel';
import vehicle from './vehicle';
import device from './device';
import agreement from './agreement';
import authentication from './authentication';
import { GETTER_PROJECT, LOAD_CURRENT_PROJECT } from '@store/account';
import { mapGetters } from 'vuex';
export default {
  components: {
    baseinfo,
    personnel,
    vehicle,
    device,
    agreement,
    authentication,
  },
  data() {
    return {
      colspans: {
        md: 8,
        sm: 12,
      },
      model: {},
      rules: {},
      loading: false,
    };
  },
  computed: {
    ...mapGetters({
      project: GETTER_PROJECT,
    }),
    id() {
      const id = this.$route.params.id;
      return id;
    },
  },
  created() {
    this.$store.dispatch(LOAD_CURRENT_PROJECT);
  },
  methods: {},
};
</script>
<style lang="less" scoped>
.tab-panel-container {
  height: 100%;
  overflow: auto;
}
</style>
