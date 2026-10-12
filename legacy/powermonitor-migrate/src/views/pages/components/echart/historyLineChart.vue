<template>
  <div v-if="historyChangeData.length > 0">
    <div v-for="(item, index) in historyChangeData" :key="index">
      <div class="item-title">{{ `历史${item.propertyName}数据` }}</div>
      <div class="lineChart" style="width: 100%; height: 280px"></div>
    </div>
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
import { colorRgb } from "@/utils/common";

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
      var chartDom = document.getElementsByClassName("lineChart");
      var xdata = [];
      var ydata = [];
      for (let i = 0; i < chartDom.length; i++) {
        var myChart = echarts.init(chartDom[i]);
        var option;
        if (i % 2) {
          state.colorArr[i] = "#1890FF";
        } else {
          state.colorArr[i] = "#09D6A3";
        }
        if (state.historyChangeData.length > 0) {
          state.historyChangeData[i].valueTsBoList.forEach(item => {
            xdata.push(item.ts);
            ydata.push(item.value);
          });
          option = {
            tooltip: {
              trigger: "axis",
              position: function (pt) {
                return [pt[0], "10%"];
              },
            },
            grid: {
              top: "8%",
              left: "1%",
              right: "1%",
              bottom: "6%",
              containLabel: true,
            },
            toolbox: {
              feature: {},
            },
            xAxis: {
              type: "category",
              boundaryGap: false,
              data: xdata,
            },
            yAxis: {
              type: "value",
              boundaryGap: [0, "100%"],
            },

            series: [
              {
                name: state.historyChangeData[i].propertyName,
                type: "line",
                symbol: "none",
                sampling: "lttb",
                itemStyle: {
                  color: state.colorArr[i],
                  lineStyle: {
                    width: 1,
                  },
                },
                areaStyle: {
                  color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    {
                      offset: 0,
                      color: state.colorArr[i],
                    },
                    {
                      offset: 1,
                      color: "#fff",
                    },
                  ]),
                },
                data: ydata,
              },
            ],
          };

          myChart.setOption(option);
        }
      }
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
