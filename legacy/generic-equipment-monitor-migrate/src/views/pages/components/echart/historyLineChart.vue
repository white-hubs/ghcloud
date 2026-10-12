<template>
  <div v-if="historyChangeData.length > 0">
    <div v-for="(item, index) in historyChangeData" :key="index">
      <div class="item-title" v-if="titles">{{ titles }}</div>
      <div class="item-title" v-else>
        {{ `历史${item[0]?.key ? deviceData.find((res) => res.value == item[0].key)?.label : ''}数据` }}
      </div>
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
import moment from "moment";
export default defineComponent({
  name: "",
  components: {},
  props: {
    historyData: {
      type: Object,
      defalut: {},
    },
    deviceData: {
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
      (n) => {
        state.historyChangeData = Object.values(n);
        nextTick(() => {
          initEchart();
        });
      },
      { immediate: true, deep: true }
    );
    function colorRgb() {
      const r = Math.floor(Math.random() * 256);
      const g = Math.floor(Math.random() * 256);
      const b = Math.floor(Math.random() * 256);
      return `rgb(${r},${g},${b})`;
    }
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
          // 排序一次
          state.historyChangeData[i].sort((a, b) => {
            return a.ts - b.ts;
          })
          state.historyChangeData[i].forEach((item) => {
            xdata.push(moment(item.ts).format("YYYY-MM-DD HH:mm:ss"));
            ydata.push(item.value);
          });
          option = {
            tooltip: {
              trigger: "axis",
            },
            grid: {
              top: "8%",
              left: '4%',
              right: '5%',
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
              // position: 'bottom',

              axisLabel: {
                align: 'center'
              }
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
