<template lang="pug">
app-page-layout(fix-header)
  //- a-tabs(:tabBarGutter="36" :tabBarStyle="{margin: 0, 'box-shadow': '0 0 4px 0px rgba(0, 0, 0, 0.1)'}")
  a-tabs(:tabBarGutter="36" :tabBarStyle="{padding: '0 12px'}" v-model="activeKey")
    a-tab-pane(v-for="t in tabList" :key="t.name" :tab="t.label")
      div.tab-pane-container
        component(:is="t.name")
    template(v-slot:tabBarExtraContent)
      //- span tabs上的额外节点
</template>
<script>
import checkPend from './checkPend';
import Passed from './Passed';
import Fail from './Fail';
import { GETTER_PROJECT } from '@store/account';
import { mapGetters } from 'vuex';
export default {
  name: '',
  components: { checkPend, Passed, Fail },
  data() {
    return {
      tabList: [
        { label: '待审核', name: 'checkPend' },
        { label: '已通过', name: 'Passed' },
        { label: '未通过', name: 'Fail' },
      ],
      activeKey: 'checkPend',
    };
  },
  computed: {
    ...mapGetters({
      project: GETTER_PROJECT,
    }),
  },
  created() {},

  methods: {},
};
</script>
<style lang="less" scoped>
.tab-pane-container {
  position: relative;
  height: calc(100vh - 24rem);
}
</style>
