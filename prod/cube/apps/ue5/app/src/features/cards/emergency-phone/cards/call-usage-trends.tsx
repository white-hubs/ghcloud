import { defineComponent } from "vue";
import { ref, reactive, onMounted } from "vue";

import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { telephoneTrends } from "@/infrastructure/api/securitymanagement";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import LineChart from "@/shared-ui/panel/lineChart";

import styles from "./call-usage-trends.module.less";

export const CallUsageTrends = defineComponent({
  name: "CallUsageTrends",
  setup(_props, ctx) {
    const through = ref();
    const charsData = reactive({
      xData: [],
      yData: [],
    });

    const getTelephoneTrends = async () => {
      const params = {
        type: through.value.timeType,
        period: through.value.dateRange.join(","),
      };
      const res = await telephoneTrends(params);
      charsData.xData = res.xtitle.map((item) => {
        if (through.value.timeType === "TODAY") {
          return (item += "时");
        } else if (through.value.timeType === "THIS_YEAR") {
          return (item += "月");
        } else {
          return item;
        }
      });
      charsData.yData = res.xtitle.map((xItem) => {
        return res.telephoneUsageTrends.find((item) => item.timeFlag === xItem)
          ? res.telephoneUsageTrends.find((item) => item.timeFlag === xItem).num
          : 0;
      });
    };

    onMounted(() => {
      getTelephoneTrends();
    });

    return (): JSX.Element => (
      <>
        <SubPanelTemplate title="电话使用趋势" class="alarm-event">
          <template>
            {" "}
            <DateInlineForm
              modelValue={through.value}
              onUpdate:modelValue={(v) => {
                through.value = v;
              }}
              onSearch={getTelephoneTrends}
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

export default CallUsageTrends;
