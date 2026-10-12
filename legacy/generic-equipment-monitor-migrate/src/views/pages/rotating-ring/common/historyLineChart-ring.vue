<template>
  <div class="item-title">
    <span v-if="xTitle">{{ `历史${xTitle }数据` }}</span>
    <span>{{ title }}</span>
    <slot />
  </div>
  <!-- <a-empty v-if="!historyChangeData || !historyChangeData[0]" /> -->
  <div class="lineChart" :id="id" ref="myChartDom" style="width: 100%; height: 280px"></div>
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
import moment from "moment";
export default defineComponent({
name: "",
components: {},
props: {
  historyData: {
    type: Object,
    default: {},
  },
  deviceData: {
    type: Array,
    default: [],
  },
  unit: {
    type: Object,
    default: { x: "", y: "" },
  },
  id: {
    type: String,
    default: "",
  },
  timeType: {
    type: String,
    default: "",
  },
  title: {
    type: String,
    default: "",
  },
},
setup(props, { emit }) {
  const state = reactive({
    colorArr: [ "#09D6A3", "#1890FF", "#FBA33F"],
    historyChangeData: [],
    xTitle: '',
  });
  const { proxy } = getCurrentInstance();
  const data = ref();
  watch(
    () => props.historyData,
    (n) => {
      state.historyChangeData = Object.values(n);
      try {
        if(state.historyChangeData && state.historyChangeData[0] && state.historyChangeData[0][0]) {
          state.xTitle = props.deviceData.find((res) => res.value === state.historyChangeData[0][0].key)?.label
        } else {
          state.xTitle = ''
        }
        nextTick(() => {
          initEchart();
        });
      } catch (error) {
        return ''
      }
    },
    { immediate: true, deep: true }
  );
  const myChartDom = ref();
  let myChart;
  const initEchart = async () => {
    if(myChart) myChart.dispose()
    let chartDom = document.getElementById(props.id)
    myChart = echarts.init(chartDom)
    let xdata = []
    let ydata = []
      try {
        if(state.historyChangeData && state.historyChangeData[0]) {
          state.historyChangeData[0].forEach((item) => {
            xdata.push(moment(item.ts).format(props.timeType === 'TODAY'? 'HH:mm' : 'YYYY-MM-DD HH:mm'));
            ydata.push(item.value);
          });
        }
      } catch (error) {
        return ''
      }
    const color = Number(props.id.slice(-1)) % 2 ? state.colorArr[0] : state.colorArr[1]
    const option = {
        tooltip: {
          trigger: "axis",
        },
        grid: {
          top: "10%",
          left: "10px",
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
          name: props.unit.y,
          boundaryGap: [0, "100%"],
          padding: 5,
        },

        series: [
          {
            name: state.xTitle,
            type: "line",
            symbol: "none",
            sampling: "lttb",
            itemStyle: {
              color: color,
              lineStyle: {
                width: 1,
              },
            },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                {
                  offset: 0,
                  color: color,
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
  };
  onMounted(() => {
    nextTick(() => {
      state.historyChangeData = props.historyData;
      initEchart();
    });
  });
  return {
    ...toRefs(state),
    initEchart,
    myChartDom
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

