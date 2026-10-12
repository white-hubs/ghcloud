import { defineComponent } from "vue";
import { ref, reactive, onMounted } from "vue";

import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { canteenConsumptionAmountTrend } from "@/infrastructure/api/onecard";
import DateInlineForm, { ModelValueItf } from "@/shared-ui/panel/dateInlineForm";
import LineChart from "@/shared-ui/panel/lineChart";
import noData from "@/shared-ui/panel/noData";

export const DisplayConsumptionAmount = defineComponent({
  name: "DisplayConsumptionAmount",
  setup(_props, ctx) {
    const alarmAnalysisTime = ref<ModelValueItf>({
      timeType: "TODAY",
      dateRange: [],
    });
    const receptionTrendsChartData = reactive({
      xData: [] as string[],
      yData: [{ data: [] as number[] }],
    });
    const changeHandleAlarmAnalysisTime = async () => {
      try {
        const res = await canteenConsumptionAmountTrend({
          period: alarmAnalysisTime.value.dateRange.join(","),
          type: alarmAnalysisTime.value.timeType,
        });
        if (res || Array.isArray(res)) {
          receptionTrendsChartData.xData = res.map((item: any) => item.period);
          receptionTrendsChartData.yData[0].data = res.map((item: any) => Number(item.amount || item.value || item.count || 0));
        }
      } catch (error) {}
    };

    return (): JSX.Element => (
      <>
        <SubPanelTemplate title="消费金额趋势图">
          <template>
            {" "}
            <DateInlineForm
              modelValue={alarmAnalysisTime.value}
              onUpdate:modelValue={(v) => {
                alarmAnalysisTime.value = v;
              }}
              onSearch={changeHandleAlarmAnalysisTime}
            ></DateInlineForm>
          </template>
          {receptionTrendsChartData.xData.length > 0 && (
            <div class="chart">
              {" "}
              <LineChart
                x-data={receptionTrendsChartData.xData}
                series={receptionTrendsChartData.yData}
                showLegend={false}
                gridTop="15"
                unit={{ x: "", y: "元" }}
              />
            </div>
          )}
          <div class="chart" style="min-height: 150px">
            {" "}
            <noData></noData>
          </div>
        </SubPanelTemplate>
      </>
    );
  },
});

export default DisplayConsumptionAmount;
