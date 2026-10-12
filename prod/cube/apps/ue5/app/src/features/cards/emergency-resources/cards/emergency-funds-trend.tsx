import { defineComponent } from "vue";
import { ref } from "vue";

import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { emergencyRecordTrend } from "@/infrastructure/api/emergency";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import LineChart from "@/shared-ui/panel/lineChart";
import { ModelValueItf } from "@/shared-ui/panel/types";

import styles from "./emergency-funds-trend.module.less";

export const EmergencyFundsTrend = defineComponent({
  name: "EmergencyFundsTrend",
  setup(_props, ctx) {
    let timeFrame = ref<ModelValueItf>();
    const xData = ref<string[]>(["1", "2", "3", "4", "5", "6"]);
    const yData = ref([
      {
        data: ["1", "2", "3", "4", "5", "6"],
        linearGradientColor: ["rgb(255, 162, 0.1)", "rgb(255, 222, 165,1)"],
        name: "支出",
      },
      {
        data: ["1", "2", "3", "4", "5", "6"],
        linearGradientColor: ["rgba(120, 252, 252, 1)", "rgba(120, 252, 252, 0.1)"],
        lineColor: "rgba(120, 252, 252, 1)",
        name: "进账",
      },
    ]);

    const getAlarmLevel = async () => {
      const res = await emergencyRecordTrend({ type: timeFrame.value.timeType, period: timeFrame.value.dateRange.join(",") });
      xData.value = res.map((item) => {
        if (timeFrame.value.timeType === "TODAY") {
          return (item.day += "时");
        } else if (timeFrame.value.timeType === "THIS_YEAR") {
          return (item.day += "月");
        } else {
          return item.day;
        }
      });
      yData.value[0].data = res.map((item) => item.outAmount);
      yData.value[1].data = res.map((item) => item.inAmount);
    };

    return (): JSX.Element => (
      <>
        <SubPanelTemplate title="应急资金趋势统计">
          <template>
            {" "}
            <DateInlineForm
              modelValue={timeFrame.value}
              onUpdate:modelValue={(v) => {
                timeFrame.value = v;
              }}
              onSearch={getAlarmLevel}
            ></DateInlineForm>
          </template>
          <div class="charts">
            {" "}
            <LineChart
              x-data={xData.value}
              series={yData.value}
              showLegend={true}
              showBackground={true}
              titles={["支出", "进账"]}
              gridTop="15"
              unit={{ x: "", y: "元" }}
              axisPointer={true}
            />
          </div>
        </SubPanelTemplate>
      </>
    );
  },
});

export default EmergencyFundsTrend;
