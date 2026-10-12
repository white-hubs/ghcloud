import * as echarts from "echarts";
import { defineComponent, onBeforeUnmount, onMounted, shallowRef, watch } from "vue";

const clampPercent = (value: number): number => Math.min(100, Math.max(0, value));

export const EchartsProgressBar = defineComponent({
  name: "EchartsProgressBar",
  props: {
    percent: { type: Number, required: true },
    color: { type: String, default: "#13c2c2" },
    height: { type: Number, default: 7 },
    label: { type: String, default: "完成进度" },
  },
  setup: (props) => {
    const host = shallowRef<HTMLDivElement | null>(null);
    const chart = shallowRef<echarts.ECharts | null>(null);
    let resizeObserver: ResizeObserver | undefined;

    const renderChart = (): void => {
      chart.value?.setOption(
        {
          animationDuration: 450,
          animationEasing: "cubicOut",
          grid: { top: 0, right: 0, bottom: 0, left: 0 },
          xAxis: { type: "value", min: 0, max: 100, show: false },
          yAxis: { type: "category", data: [""], show: false },
          series: [
            {
              type: "bar",
              data: [clampPercent(props.percent)],
              barWidth: props.height,
              silent: true,
              showBackground: true,
              backgroundStyle: {
                color: "rgba(148, 163, 184, 0.14)",
                borderRadius: props.height,
              },
              itemStyle: {
                color: props.color,
                borderRadius: props.height,
                shadowBlur: 7,
                shadowColor: props.color,
              },
            },
          ],
        },
        true,
      );
    };

    onMounted(() => {
      if (!host.value) return;
      chart.value = echarts.init(host.value, undefined, { renderer: "canvas" });
      renderChart();
      resizeObserver = new ResizeObserver(() => chart.value?.resize());
      resizeObserver.observe(host.value);
    });

    watch(() => [props.percent, props.color, props.height], renderChart);

    onBeforeUnmount(() => {
      resizeObserver?.disconnect();
      chart.value?.dispose();
      chart.value = null;
    });

    return (): JSX.Element => (
      <div
        class="echarts-progress"
        style={{ height: `${props.height}px` }}
        role="progressbar"
        aria-label={props.label}
        aria-valuemin="0"
        aria-valuemax="100"
        aria-valuenow={clampPercent(props.percent)}
        ref={(element) => {
          host.value = element as HTMLDivElement;
        }}
      />
    );
  },
});
