<template lang="pug">
.tallyData
    .tallyData-title.justify-between
      span 理货数据审核
      span
        a-space(:size="8")
          a-button(size="small" :type="checkTime === 'TODAY' ? 'primary' : 'default'" @click="changeTime('TODAY')") 今日
          a-button(size="small" :type="checkTime === 'THIS_WEEK' ? 'primary' : 'default'" @click="changeTime('THIS_WEEK')") 本周
          a-button(size="small" :type="checkTime === 'THIS_MONTH' ? 'primary' : 'default'" @click="changeTime('THIS_MONTH')") 本月
          a-button(size="small" :type="checkTime === 'MONTH' ? 'primary' : 'default'" @click="changeTime('MONTH')") 近30天
    .tallyData-content 
        doublePie(
            v-if="typeof data.total === 'number'"
            :total="data.total" 
            :porkArrangeAuditFailedNum="data.porkArrangeAuditFailedNum" 
            :porkArrangeAuditFailed="data.porkArrangeAuditFailed"
            :porkArrangeAuditPassedNum="data.porkArrangeAuditPassedNum"
            :porkArrangeAuditPassed="data.porkArrangeAuditPassed"
        )      
</template>
<script lang="jsx">
import {
  defineComponent,
  getCurrentInstance,
  onMounted,
  reactive,
  toRefs,
} from "vue";
import doublePie from "./echarts/doublePie.vue";
export default defineComponent({
  components: {
    doublePie,
  },
  setup() {
    const { proxy } = getCurrentInstance();
    const state = reactive({
      data: {
        porkArrangeAuditFailed: "0.00",
        porkArrangeAuditFailedNum: 0,
        porkArrangeAuditPassed: "0.00",
        porkArrangeAuditPassedNum: 0,
        total: "",
      },
      checkTime: "TODAY",
    });

    const getData = (type) => {
      proxy.$api.getPorkStatArrangeAudit({ type: type },"get" ).then((res) => {
        state.data = res;
      });
    };

    const changeTime = (value) => {
      state.checkTime = value;
      getData(value);
    };

    const getAbs = (num) => {
      return Math.abs(num);
    };

    onMounted(() => {
      getData(state.checkTime);
    });

    return {
      ...toRefs(state),
      changeTime,
      getAbs,
    };
  },
});
</script>
<style lang="less" scoped>
.tallyData {
  margin-top: 16px;
  height: 322px;
  background: #ffffff;
  border-radius: 0px 0px 0px 0px;
  margin-top: 16px;
  padding-left: 16px;
  padding-right: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  .tallyData-title {
    height: 50px;
    display: flex;
    align-items: center;
    // justify-content: flex-start;
    width: 100%;
    border-bottom: 1px solid #f3f3f3;
    font-size: 16px;
    font-family: PingFang SC-Regular, PingFang SC;
    font-weight: 550;
    color: #000000;
  }
  .tallyData-content {
    flex: 1;
    width: 100%;
  }
}
</style>
