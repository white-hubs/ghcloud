<template lang="pug">
  div.flow-list
    a-timeline.mt2
      a-timeline-item(v-for="e in flowList" :key="e.id")
        div {{ e.time || '处理中' }}
        div 
          span.p1(v-if="e.nickname || e.username") 由
          span.p1.black(v-if="e.nickname || e.username") {{ e.nickname || e.username }}
          span.p1 {{ e.name }}
          span.p1.ml2(v-if="e.dutyId") 处理人: 
          span.black(v-if="e.dutyId") 
            app-user-display.ml1(v-for="id in e.dutyId.split(',')" :id="id" :key="id")
          
        div(v-if="e.remark")
          span.p1.gray 描述:
          span.p1.gray {{ e.remark }}        
        
</template>

<script>
import moment from 'moment';
export default {
  components: {},
  props: {
    flowList: Array,
  },
  data() {
    return {};
  },
  methods: {
    moment,
  },
};
</script>

<style lang="less" scoped>
.flow-list {
  padding: 16px;
  .black {
    color: #333;
  }
  .gray {
    color: #999;
  }
}
</style>
