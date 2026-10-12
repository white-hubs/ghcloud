<template>
  <div ref="chartBox" class="chart-container" />
</template>

<script lang="jsx">
import {
  getCurrentInstance,
  defineComponent,
  createVNode,
  onUnmounted,
  onMounted,
  reactive,
  nextTick,
  computed,
  markRaw,
  toRefs,
  watch,
  ref,
} from "vue";
import * as echarts from "echarts";
import { useRouter, useRoute } from "vue-router";
import { Modal, message } from "ant-design-vue";
import { UploadOutlined } from "@ant-design/icons-vue";
export default defineComponent({
  components: {},
  props: {
    totalNum: [String, Number],
    name: String,
    data: {
      type: Object,
      default: () => {},
    },
    center: {
      default: () => ["50%", "50%"],
      type: Array,
    },
    radius: {
      default: () => ["50%", "62%"],
      type: Array,
    },
    clockwise: Boolean,
    startAngle: Number,
    hideTitle: Boolean,
  },
  setup(props) {
    const { proxy } = getCurrentInstance();
    const router = useRouter();
    const route = useRoute();
    const type = route.query;
    let chartBox = ref();
    const state = reactive({
      chart: null,
    });

    const options = computed(() => {
      return {
        title: props.data?.title ? props.data?.title : [],
        tooltip: {
          trigger: "axis",
        },
        legend: {
          data: props.data?.legend ? props.data?.legend : [],
        },
        grid: {
          left: "8px",
          right: "16px",
          bottom: "8px",
          top: "32px",
          containLabel: true,
        },
        xAxis: {
          type: "category",
          boundaryGap: props.data?.boundaryGap
            ? props.data?.boundaryGap
            : false,
          data: props.data?.xAxisData ? props.data?.xAxisData : [],
        },
        yAxis: {
          type: "value",
        },
        series: props.data?.series ? props.data?.series : [],
      };
    });

    //图标初始化
    const initChart = () => {
      //markRaw 禁止为响应式数据
      state.chart = markRaw(echarts.init(chartBox.value));
    };
    //图标数据渲染
    const renderChart = () => {
      nextTick(() => {
        state.chart.setOption(options.value);
        // state.chart.resize();
      });
    };

    const echartsResize = () => {
      if (state.chart) {
        state.chart.resize();
      }
    };

    onMounted(() => {
      initChart();
      renderChart();
      window.addEventListener("resize", echartsResize);
    });

    onUnmounted(() => {
      window.removeEventListener("resize", echartsResize);
    });

    //监听props里面的data的数据变化
    watch(
      () => props.data,
      (n) => {
        if (state.chart) {
          renderChart();
        }
      },
      { deep: true }
    );

    return {
      chartBox,
      ...toRefs(state),
    };
  },
});
</script>

<style lang="less" scoped>
.chart-container {
  width: 100%;
  height: 100%;
}
</style>
