<template lang="pug">
app-page-layout(fix-header)
  div.pt2.px3.abs-fit.overflow-auto
    a-tabs(default-active-key="1")
      a-tab-pane(key="1" tab="区域管理")
        div.tab-panel-container
          Area
      a-tab-pane(key="2" tab="空间管理")
        div.tab-panel-container
          Space
</template>
<script>
import { GETTER_PROJECT } from '@store/account';
import { mapGetters } from 'vuex';
import Area from './Tabs/area';
import Space from './Tabs/space';
export default {
  name: 'KeepAliveXxxx',
  components: {
    Area,
    Space,
  },
  data() {
    return {
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
  methods: {},
};
</script>
<style lang="less" scoped>
.sqxx-container {
  height: 400px;
}
.sbxx-container {
  min-height: 100px;
  background-color: #fff;
}
.mt16 {
  margin-top: 16px;
}
.footer-btns {
  margin: 16px 0;
}
</style>
