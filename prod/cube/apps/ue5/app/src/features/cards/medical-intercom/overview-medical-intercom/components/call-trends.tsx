import { defineComponent } from "vue";
import { ref, reactive } from "vue";

import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { callTrends } from "@/infrastructure/api/medical-intercom";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import LineChart from "@/shared-ui/panel/lineChart";
import { ModelValueItf } from "@/shared-ui/panel/types";
import { storeMenu } from "@/visualization-core/stores/menu";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import styles from "./call-trends.module.less";

export const CallTrends = defineComponent({
  name: "CallTrends",
  setup(_props, ctx) {
    const { globalState } = useStateStore();
    const receptionTrendsTime = ref<ModelValueItf>();
    const receptionTrendsChartData = reactive({
      xData: ["4", "8", "12", "16", "20", "24h"],
      yData: [
        { data: [], linearGradientColor: ["rgba(120, 252, 252, 1)", "rgba(120, 252, 252, 0.1)"], lineColor: "rgba(120, 252, 252, 1)" },
      ],
    });
    //呼叫趋势数据
    const getCallTrends = async () => {
      let params = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        period: receptionTrendsTime.value.dateRange.join(","),
        type: receptionTrendsTime.value.timeType,
      };
      const res = await callTrends(params);
      receptionTrendsChartData.xData = res.xtitle;
      receptionTrendsChartData.yData[0].data = res.xtitle.map((xItem) => {
        return res.callTrends.find((item) => item.timeFlag === xItem) ? res.callTrends.find((item) => item.timeFlag === xItem).num : 0;
      });
    };

    return (): JSX.Element => (
      <>
        <SubPanelTemplate title="呼叫趋势">
          <template>
            {" "}
            <DateInlineForm
              modelValue={receptionTrendsTime.value}
              onUpdate:modelValue={(v) => {
                receptionTrendsTime.value = v;
              }}
              onSearch={getCallTrends}
            ></DateInlineForm>
          </template>
          <div class="charts">
            {" "}
            <LineChart
              x-data={receptionTrendsChartData.xData}
              series={receptionTrendsChartData.yData}
              showLegend={false}
              gridTop="15"
              unit={{ x: "", y: "次" }}
            />
          </div>
        </SubPanelTemplate>
      </>
    );
  },
});

export default CallTrends;
