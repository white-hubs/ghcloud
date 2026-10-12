<template lang="pug">
.tallyData
    .tallyData-title.justify-between
      span 报备商家
      span
        a-space(:size="8")
          a-button(size="small" :type="checkTime === 'TODAY' ? 'primary' : 'default'" @click="changeTime('TODAY')") 今日
          a-button(size="small" :type="checkTime === 'THIS_WEEK' ? 'primary' : 'default'" @click="changeTime('THIS_WEEK')") 本周
          a-button(size="small" :type="checkTime === 'THIS_MONTH' ? 'primary' : 'default'" @click="changeTime('THIS_MONTH')") 本月
          a-button(size="small" :type="checkTime === 'MONTH' ? 'primary' : 'default'" @click="changeTime('MONTH')") 近30天
    .tallyData-content 
        funnelChart(
          v-if="typeof data.total === 'number'"
          :total="data.total" 
          :highRiskLevelNum="data.highRiskLevelNum" 
          :lowRiskLevelNum="data.lowRiskLevelNum" 
          :mediumRiskLevelNum="data.mediumRiskLevelNum")      
          //- :highRiskLevelNum="data.highRiskLevel" 
          //- :lowRiskLevelNum="data.lowRiskLevel" 
          //- :mediumRiskLevelNum="data.mediumRiskLevel")      
</template>
<script lang="jsx">
import {
  defineComponent,
  getCurrentInstance,
  onMounted,
  reactive,
  toRefs,
} from "vue";
import funnelChart from "./echarts/funnel.vue";
export default defineComponent({
  components: {
    funnelChart,
  },
  setup() {
    const { proxy } = getCurrentInstance();
    const state = reactive({
      data: {
        highRiskLevel: 0,
        highRiskLevelNum: 0,
        lowRiskLevel: 0,
        lowRiskLevelNum: 0,
        mediumRiskLevel: 0,
        mediumRiskLevelNum: 0,
        total: "",
      },
      checkTime: "TODAY",
    });

    const getData = (type) => {
      proxy.$api.getPorkStatRiskLevel({ type: type },"get" ).then((res) => {
        // if (res.total) {
        state.data = res;
        // }
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
