<template>
  <div v-if="historyChangeData.length > 0">
    <div class="item-title">{{ `历史${historyChangeData[0].name}数据` }}</div>
    <div class="lineChart" ref="lineChart" style="width: 100%; height: 280px"></div>
  </div>
  <div v-else>
    <a-empty></a-empty>
  </div>
</template>

<script lang="jsx">
import {
  defineComponent,
  reactive,
  toRefs,
  onBeforeMount,
  onMounted,
  getCurrentInstance,
  ref,
  nextTick,
  watch,
} from "vue";
import * as echarts from "echarts";
import { colorRgb } from "@ghcloud-legacy/bimops-fe-web-migrate-lib/lib/utils/common";
import moment from "moment";
export default defineComponent({
  name: "",
  components: {},
  props: {
    historyData: {
      type: Array,
      defalut: [],
    },
  },
  setup(props, { emit }) {
    const state = reactive({
      colorArr: ["#1890FF", "#09D6A3"],
      historyChangeData: [],
    });
    const { proxy } = getCurrentInstance();
    const lineChart = ref(null);
    const data = ref();

    watch(
      () => props.historyData,
      n => {
        state.historyChangeData = n;


        nextTick(() => {
          initEchart();
        });
      },
      { immediate: true, deep: true },
    );
    const initEchart = async () => {
      let currenttime = moment(new Date()).format('YYYY-MM-DD HH')
      let indexDa = state.historyChangeData[0].propertyHistoryVos.findIndex(res => res.ts == currenttime + ':00:00')
      let myChart = echarts.init(lineChart.value);
      myChart.clear();
      myChart.setOption({
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          data: state.historyChangeData.map(res => res.attributeName)
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        yAxis: {
          type: 'value'
        },
        dataZoom: [
          {
            type: "slider",
            show: true,
            height: 20,
            left: "10%",
            right: "10%",
            bottom: "2%",
            start: 0,
            end: 50,

            textStyle: {
              color: "#d4ffff",
              fontSize: 11,
            },
          },
          {
            type: "inside",
            moveOnMouseWheel: false,
            zoomOnMouseWheel: false,
          },

        ],
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: state.historyChangeData[0].propertyHistoryVos.map(res => res.ts)
        },

        series: state.historyChangeData.map(res => {

          return {
            name: res.attributeName,
            type: 'line',

            data: res.propertyHistoryVos.map(res => res.value)
          }
        }),




      })
    };
    onBeforeMount(() => {
      //2.组件挂载页面之前执行----onBeforeMount
    });

    onMounted(() => {
      //3.组件挂载到页面之后执行-------onMounted
      nextTick(() => {
        state.historyChangeData = props.historyData;

        initEchart();
      });
    });
    return {
      ...toRefs(state),
      lineChart,
      initEchart,
    };
  },
});
</script>
<style scoped lang="less">
.item-title {
  width: 100%;
  height: 35px;
  line-height: 35px;
  text-align: left;
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 10px;
  color: #000000d9;
  border-top: 1px solid #e8e8e88c;
  padding-top: 5px;

  &:first-child {
    border: none;
  }
}
</style>
