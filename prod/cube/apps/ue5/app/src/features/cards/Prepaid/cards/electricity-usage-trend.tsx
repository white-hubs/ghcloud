import moment from "moment";
import { defineComponent } from "vue";
import { ref, reactive } from "vue";

import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { powerUserDayStat } from "@/infrastructure/api/prepaid";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import LineChart from "@/shared-ui/panel/lineChart";

import styles from "./electricity-usage-trend.module.less";

export const ElectricityUsageTrend = defineComponent({
  name: "ElectricityUsageTrend",
  setup(_props, ctx) {
    const through = ref();
    const charsData = reactive({
      xData: [],
      yData: [],
    });

    const abnormalPassageInfo = async () => {
      const time = {
        TODAY: "day",
        THIS_WEEK: "week",
        THIS_MONTH: "month",
        THIS_YEAR: "year",
      };
      const res = await powerUserDayStat({ period: through.value.dateRange.join(","), type: time[through.value.timeType] });
      charsData.xData = [];
      charsData.yData = [];
      res.forEach((item) => {
        charsData.xData.push(moment(item.useDate).format(through.value.timeType !== "THIS_YEAR" ? "YYYY-MM-DD" : "YYYY-MM"));
        charsData.yData.push(item.pv);
      });
    };

    return (): JSX.Element => (
      <>
        <SubPanelTemplate title="电表日用能趋势图">
          <template>
            {" "}
            <DateInlineForm
              modelValue={through.value}
              onUpdate:modelValue={(v) => {
                through.value = v;
              }}
              onSearch={abnormalPassageInfo}
            ></DateInlineForm>
          </template>
          <div class="chart">
            <LineChart
              x-data={charsData.xData}
              series={[
                {
                  data: charsData.yData,
                  linearGradientColor: ["rgb(255, 162, 0.1)", "rgb(255, 222, 165,1)"],
                },
              ]}
            />
          </div>
        </SubPanelTemplate>
      </>
    );
  },
});

export default ElectricityUsageTrend;
