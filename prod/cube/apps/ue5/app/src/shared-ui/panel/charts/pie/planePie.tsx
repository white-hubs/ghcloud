import { PieChart } from "echarts/charts";
import { LegendComponent, TitleComponent, TooltipComponent } from "echarts/components";
import * as echarts from "echarts/core";
import { computed, defineComponent, isRef, nextTick, onMounted, onUnmounted, ref, watch } from "vue";

import "./planePie.module.less";
import "echarts-liquidfill";

echarts.use([PieChart, LegendComponent, TooltipComponent, TitleComponent]);

export const PlanePie = defineComponent({
  name: "PlanePie",
  props: {
    pieData: {
      type: Array as () => { value: number; color: string }[],
      required: true,
      default: () => [],
    },
    class: String,
    pieClass: String,
    showZeroAsEmptyRing: Boolean,
  },
  setup(props, { slots }) {
    const powerFactorRef = ref<HTMLElement>();

    const pieDataList = computed(() => {
      const raw = isRef(props.pieData) ? props.pieData.value : props.pieData;
      return Array.isArray(raw) ? raw : [];
    });

    const pieValue = computed(() => pieDataList.value.map((item) => item.value));
    const pieColor = computed(() => pieDataList.value.map((item) => item.color));
    const hasPositiveValue = computed(() => pieValue.value.some((value) => Number(value) > 0));
    const showStableEmptyRing = computed(() => props.showZeroAsEmptyRing && !hasPositiveValue.value);

    let myChart: echarts.ECharts | null = null;
    let resizeObserver: ResizeObserver | null = null;

    const resizeChart = (): void => {
      nextTick(() => {
        const chartContainer = powerFactorRef.value;
        if (!chartContainer || !myChart) return;

        const resizeToContainer = (): void => {
          const width = chartContainer.clientWidth;
          const height = chartContainer.clientHeight;
          if (width <= 0 || height <= 0) return;
          myChart?.resize({ width, height });
        };

        resizeToContainer();
        requestAnimationFrame(() => {
          resizeToContainer();
        });
      });
    };

    const option = () => ({
      color: pieColor.value,
      series: [
        {
          name: "Access From",
          type: "pie",
          radius: ["70%", "85%"],
          avoidLabelOverlap: true,
          showEmptyCircle: !props.showZeroAsEmptyRing,
          label: {
            show: false,
            position: "center",
          },
          data: pieValue.value,
        },
      ],
    });

    const initChart = (container?: HTMLElement): void => {
      if (!container) return;
      if (!myChart) myChart = echarts.init(container);
      myChart.setOption(option());
      resizeChart();
    };

    watch(
      pieDataList,
      () => {
        initChart(powerFactorRef.value);
      },
      { deep: true },
    );

    onMounted(() => {
      initChart(powerFactorRef.value);
      const chartContainer = powerFactorRef.value;
      if (chartContainer) {
        resizeObserver = new ResizeObserver(resizeChart);
        resizeObserver.observe(chartContainer);
        if (chartContainer.parentElement) {
          resizeObserver.observe(chartContainer.parentElement);
        }
      }
    });

    onUnmounted(() => {
      resizeObserver?.disconnect();
      myChart?.dispose();
    });

    return (): JSX.Element => (
      <>
        {/* plane-pie-box: scoped size; keep pie-box for legacy theme selectors */}
        <div class={["plane-pie-box", "pie-box", props.class]}>
          <div class={["power-factor", props.pieClass, showStableEmptyRing.value ? "plane-pie-chart--empty" : ""]} ref={powerFactorRef} />
          {showStableEmptyRing.value ? (
            <svg class="plane-pie-empty-ring" viewBox="0 0 100 100" aria-hidden="true">
              <circle cx="50" cy="50" r="38.75" fill="none" stroke="currentColor" stroke-width="7.5" />
            </svg>
          ) : null}
          <div class="content">{slots.default?.()}</div>
        </div>
      </>
    );
  },
});

export default PlanePie;
