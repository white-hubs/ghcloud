import * as echarts from "echarts";
import { defineComponent, onBeforeUnmount, onMounted, shallowRef, watch, type PropType } from "vue";

import { Empty, Spin } from "@ghcloud/cube-ui";

import hunanGeoJson from "@/assets/data/hunan-430000-full.json";
import type { DepotSummary } from "@/types/cockpit";
import { buildHunanMapOption, HUNAN_MAP_NAME } from "@/utils/hunan-map-option";

export const HunanDepotMap = defineComponent({
  name: "HunanDepotMap",
  props: {
    depot: { type: Object as PropType<DepotSummary>, required: true },
    dimmed: { type: Boolean, default: false },
  },
  emits: {
    selectDepot: (): boolean => true,
  },
  setup: (props, { emit }) => {
    const host = shallowRef<HTMLDivElement | null>(null);
    const chart = shallowRef<echarts.ECharts | null>(null);
    const ready = shallowRef(false);
    const failed = shallowRef(false);
    let resizeObserver: ResizeObserver | undefined;

    const renderChart = (): void => {
      chart.value?.setOption(buildHunanMapOption(props.depot, props.dimmed), true);
    };

    onMounted(() => {
      try {
        echarts.registerMap(HUNAN_MAP_NAME, hunanGeoJson as Parameters<typeof echarts.registerMap>[1]);
        if (!host.value) throw new Error("地图容器不存在");
        chart.value = echarts.init(host.value);
        renderChart();
        chart.value.on("click", (params) => {
          if (params.seriesType === "effectScatter" && params.name === props.depot.name) emit("selectDepot");
        });
        resizeObserver = new ResizeObserver(() => chart.value?.resize());
        resizeObserver.observe(host.value);
        ready.value = true;
      } catch (error) {
        console.error("[grain-storage-cockpit] map init failed", error);
        failed.value = true;
      }
    });

    watch(() => props.dimmed, renderChart);

    onBeforeUnmount(() => {
      resizeObserver?.disconnect();
      chart.value?.dispose();
      chart.value = null;
    });

    return (): JSX.Element => (
      <div class="hunan-map">
        {!ready.value && !failed.value ? <Spin class="hunan-map__state" tip="湖南省行政区划地图加载中…" /> : null}
        {failed.value ? <Empty class="hunan-map__state" description="地图加载失败" /> : null}
        <div
          class="hunan-map__chart"
          ref={(element) => {
            host.value = element as HTMLDivElement;
          }}
        />
      </div>
    );
  },
});
