import { defineComponent } from "vue";
import { ref, reactive } from "vue";

import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { trendStat } from "@/infrastructure/api/door";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import LineChart from "@/shared-ui/panel/lineChart";
import { ModelValueItf } from "@/shared-ui/panel/types";

import styles from "./smart-visitor-trends.module.less";

export const SmartVisitorTrends = defineComponent({
  name: "SmartVisitorTrends",
  setup(_props, ctx) {
    const takeNotes = ref<ModelValueItf>();
    const periodTime = reactive<{ xData: string[]; yData: number[] }>({
      xData: [],
      yData: [],
    });

    const getPlayRecordTop = async () => {
      const res = await trendStat({ type: takeNotes.value.timeType, period: takeNotes.value.dateRange.join(",") });
      periodTime.xData = res.map((item) => {
        if (takeNotes.value.timeType === "TODAY") {
          return item.name + "时";
        } else {
          return item.name;
        }
      });
      periodTime.yData = res.map((item) => item.value);
    };

    return (): JSX.Element => (
      <>
        <SubPanelTemplate title="来访人员趋势图">
          <template>
            {" "}
            <DateInlineForm
              modelValue={takeNotes.value}
              onUpdate:modelValue={(v) => {
                takeNotes.value = v;
              }}
              onSearch={getPlayRecordTop}
            ></DateInlineForm>
          </template>
          <div class="chart">
            {" "}
            <LineChart
              x-data={periodTime.xData}
              series={[{ data: periodTime.yData }]}
              showLegend={true}
              showBackground={true}
              titles={[""]}
              gridTop="5"
              unit={{ x: "", y: "" }}
              axisPointer={true}
            />
          </div>
        </SubPanelTemplate>
      </>
    );
  },
});

export default SmartVisitorTrends;
