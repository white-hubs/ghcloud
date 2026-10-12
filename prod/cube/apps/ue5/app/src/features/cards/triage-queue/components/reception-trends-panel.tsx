import { defineComponent, onMounted, reactive, ref } from "vue";

import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { receptionTrends } from "@/infrastructure/api/consultation-data";
import { px2rem } from "@/infrastructure/utils/common";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import LineChart from "@/shared-ui/panel/lineChart";
import type { ModelValueItf } from "@/shared-ui/panel/types";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

export const ReceptionTrendsPanel = defineComponent({
  name: "ReceptionTrendsPanel",
  props: {
    chartHeight: { type: Number, required: false, default: 180 },
  },
  setup(props) {
    const { globalState } = useStateStore();

    const receptionTrendsTime = ref<ModelValueItf>();

    const receptionTrendsChartData = reactive({
      xData: [] as string[],
      yData: [
        {
          data: [] as number[],
          linearGradientColor: ["rgba(120, 252, 252, 1)", "rgba(120, 252, 252, 0.1)"],
          lineColor: "rgba(120, 252, 252, 1)",
        },
      ],
    });

    const getReceptionTrends = async (): Promise<void> => {
      const params = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        period: receptionTrendsTime.value?.dateRange?.join(",") ?? "",
        type: receptionTrendsTime.value?.timeType,
      };
      const res = await receptionTrends(params);
      receptionTrendsChartData.xData = res.xtitle;
      receptionTrendsChartData.yData[0].data = [];
      res.receptionTrends.forEach((item: { visitNum?: number }) => {
        receptionTrendsChartData.yData[0].data.push(item.visitNum ?? 0);
      });
    };

    onMounted(() => {});

    return (): JSX.Element => (
      <SubPanelTemplate
        title="接诊趋势"
        v-slots={{
          extra: () => (
            <DateInlineForm
              modelValue={receptionTrendsTime.value}
              onUpdate:modelValue={(v) => {
                receptionTrendsTime.value = v;
              }}
              onSearch={getReceptionTrends}
            />
          ),
        }}
      >
        <div style={{ height: px2rem(`${props.chartHeight}px`) }}>
          <LineChart
            x-data={receptionTrendsChartData.xData}
            series={receptionTrendsChartData.yData}
            showLegend={false}
            gridTop="20"
            unit={{ x: "", y: "人次" }}
          />
        </div>
      </SubPanelTemplate>
    );
  },
});

export default ReceptionTrendsPanel;
