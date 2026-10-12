<template lang="pug">
.supplierRanking
    .supplierRanking-title 肉类出厂情况(TOP5)
        .more(@click="toMore") 更多>
    .supplierRanking-content 
        .supplierRanking-btn
                a-button(:type="type==='TODAY'?'primary':null" @click="getList('TODAY')") 今天
                a-button(:type="type==='THIS_WEEK'?'primary':null" @click="getList('THIS_WEEK')") 本周
                a-button(:type="type==='THIS_MONTH'?'primary':null" @click="getList('THIS_MONTH')") 本月
                a-button(:type="type==='MONTH'?'primary':null" @click="getList('MONTH')") 近30天
        .supplierRanking-chart
            barChart(:chartData="chartData")        
</template>
<script lang="jsx">
import {
  defineComponent,
  getCurrentInstance,
  onMounted,
  reactive,
  toRefs,
} from "vue";
import { useRouter } from "vue-router";
import barChart from "./echarts/bar.vue";
export default defineComponent({
  components: {
    barChart,
  },
  setup() {
    const { proxy } = getCurrentInstance();
    const router = useRouter();
    const state = reactive({
      chartData: [],
      type: "TODAY",
    });
    const getList = (type) => {
      state.type = type;
      proxy.$api
        .getPorkAbattoir({
          type: state.type,
          pageNumber: 1,
          pageSize: 5,
        },"get")
        .then((res) => {
          state.chartData = res.records;
        });
    };
    onMounted(() => {
      getList("TODAY");
    });
    const getAbs = (num) => {
      return Math.abs(num);
    };
    const toMore = () => {
      history.pushState({ current: location.pathname + location.search }, "", `/portal/meatSlider/whiteNoteOutCdn?name=肉类出厂排名`)
    };
    return {
      ...toRefs(state),
      getAbs,
      getList,
      toMore,
    };
  },
});
</script>
<style lang="less" scoped>
.supplierRanking {
  margin-top: 16px;
  height: 392px;
  background: #ffffff;
  border-radius: 0px 0px 0px 0px;
  margin-top: 16px;
  padding-left: 16px;
  padding-right: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  .supplierRanking-title {
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    width: 100%;
    border-bottom: 1px solid #f3f3f3;
    position: relative;
    font-size: 16px;
    font-family: PingFang SC-Regular, PingFang SC;
    font-weight: 550;
    color: #000000;
    .more {
      position: absolute;
      top: 50%;
      transform: translate(0, -50%);
      right: 0;
      font-size: 14px;
      font-family: PingFang SC-Regular, PingFang SC;
      font-weight: 400;
      cursor: pointer;
    }
  }
  .supplierRanking-content {
    flex: 1;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    .supplierRanking-btn {
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      width: 100%;
      .ant-btn {
        margin-right: 10px;
      }
    }
    .supplierRanking-chart {
      flex: 1;
      width: 100%;
    }
  }
}
</style>
