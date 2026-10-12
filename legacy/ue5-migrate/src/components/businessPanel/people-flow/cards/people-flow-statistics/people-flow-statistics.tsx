import { defineComponent, reactive, onMounted, ref, onUnmounted } from "vue";

import { usePeopleFlow, hideUePeopleFlowHeatmapLayers, showUePeopleFlowHeatmapLayers } from "../../hooks/use-people-flow";
import { cubeTrafficStatisticsService } from "@/api/service";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import LineChart from "@/components/businessPanel/public/lineChart.vue";
import NoData from "@/components/businessPanel/public/noData.vue";
import OperateDays from "@/components/businessPanel/public/operateDays.vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import { useStateStore } from "@/pages/state/use-state-store";

import styles from "./people-flow-statistics.module.less";

// 人流量分析
export const PeopleFlowStatistics = defineComponent({
  name: "PeopleFlowStatistics",
  setup() {
    const { globalState } = useStateStore();
    const { clearHeatmap, ensureHeatmapRendered } = usePeopleFlow();
    const through = ref({
      timeType: "TODAY",
      dateRange: [],
    });
    const numberPasses = ref(0);
    const echartsData = reactive({
      xData: [],
      yData: [],
    });

    const getData = async (): Promise<void> => {
      try {
        const params = {
          type: through.value.timeType,
          period: through.value.dateRange.join(","),
        };
        const result = await Promise.all([
          cubeTrafficStatisticsService.getTrafficPersonStatistics(params),
          cubeTrafficStatisticsService.getTrafficTrendStat(params),
        ]);
        numberPasses.value = result[0]?.totalNumber ?? 0;
        echartsData.xData = result[1]?.map((e) => e?.period) ?? [];
        echartsData.yData = result[1]?.map((e) => e?.totalPersonNumber) ?? [];
      } catch {}
    };
    const firstCurrentMenu = globalState.business.currentMenu;

    onMounted(() => {
      getData();
      showUePeopleFlowHeatmapLayers();
      void ensureHeatmapRendered();
    });
    onUnmounted(() => {
      hideUePeopleFlowHeatmapLayers();
      const lastCurrentMenu = globalState.business.currentMenu;
      if (lastCurrentMenu !== firstCurrentMenu) {
        clearHeatmap({ preserveCache: true });
      }
    });

    return () => (
      <SubPanelTemplate
        title="人流量分析"
        zoomable
        zoom-title="人流量分析详情"
        v-slots={{
          extra: () => (
            <DateInlineForm
              v-model:modelValue={through.value}
              onSearch={getData}
              style={{ opacity: "0", visibility: "hidden" }}
              data-no-zoom
            />
          ),
          "zoom-content": () => (
            <div class={styles.zoomStatistics}>
              <OperateDays value={numberPasses.value} title="人流量数" class={styles.zoomOperateDays} data-no-zoom />
              <div class={styles.zoomChart} data-no-zoom>
                {echartsData.xData.length > 0 ? (
                  <LineChart
                    x-data={echartsData.xData}
                    series={[
                      {
                        data: echartsData.yData,
                        linearGradientColor: ["rgb(255, 162, 0.1)", "rgb(255, 222, 165,1)"],
                      },
                    ]}
                    height={380}
                  />
                ) : (
                  <>
                    <NoData />
                  </>
                )}
              </div>
            </div>
          ),
        }}
      >
        <OperateDays value={numberPasses.value} title="人流量数" data-no-zoom />
        <div class={styles.chart} data-no-zoom>
          {echartsData.xData.length > 0 ? (
            <LineChart
              x-data={echartsData.xData}
              series={[
                {
                  data: echartsData.yData,
                  linearGradientColor: ["rgb(255, 162, 0.1)", "rgb(255, 222, 165,1)"],
                },
              ]}
            />
          ) : (
            <>
              <NoData />
            </>
          )}
        </div>
      </SubPanelTemplate>
    );
  },
});
