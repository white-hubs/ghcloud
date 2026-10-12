<template lang="pug">
app-page-layout(fix-header)
  //- a-tabs(:tabBarGutter="36" :tabBarStyle="{margin: 0, 'box-shadow': '0 0 4px 0px rgba(0, 0, 0, 0.1)'}")
  a-tabs(:tabBarGutter="36" :tabBarStyle="{padding: '0 12px'}" default-active-key="noHandled")
    a-tab-pane(v-for="t in tabList" :key="t.name" :tab="t.label")
      div.tab-pane-container
        component(:is="t.name" :key="t.name")
    template(v-slot:tabBarExtraContent)
      //- span tabs上的额外节点
  
</template>
<script>
import handled from './handled';
import noHandled from './noHandled';

import { GETTER_PROJECT } from '@store/account';
import { mapGetters } from 'vuex';
export default {
  // name: 'KeepAliveXxxx',
  components: { handled, noHandled },
  data() {
    return {
      tabList: [
        { label: '待处理', name: 'noHandled' },
        { label: '已处理', name: 'handled' },
      ],
    };
  },
  computed: {
    ...mapGetters({
      project: GETTER_PROJECT,
    }),
  },
  methods: {},
};
</script>
