import { defineComponent } from "vue";
import { ref, reactive, onMounted } from "vue";

import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { canteenConsumptionAccountStat } from "@/infrastructure/api/onecard";
import barChart from "@/shared-ui/panel/charts/bar/barChart";
import DateInlineForm, { ModelValueItf } from "@/shared-ui/panel/dateInlineForm";
import noData from "@/shared-ui/panel/noData";

import styles from "./top-count-consumption.module.less";

export const TopCountConsumption = defineComponent({
  name: "TopCountConsumption",
  setup(_props, ctx) {
    const workOrderTime = ref<ModelValueItf>({
      timeType: "TODAY",
      dateRange: [],
    });
    const alarmType = reactive({
      xData: [] as string[],
      yData: [] as number[],
    });
    const changeHandleworkOrderTime = async () => {
      try {
        const res = await canteenConsumptionAccountStat({
          period: workOrderTime.value.dateRange.join(","),
          type: workOrderTime.value.timeType,
        });
        if (Array.isArray(res)) {
          const result = res.sort((a: any, b: any) => b.amount - a.amount).slice(0, 10);
          alarmType.xData = result.map((item: any) => item.userName || item.name || "");
          alarmType.yData = result.map((item: any) => Number(item.amount || item.value || item.total || 0));
        }
      } catch (error) {}
    };

    return (): JSX.Element => (
      <>
        <SubPanelTemplate title="账户消费Top10">
          <template>
            {" "}
            <DateInlineForm
              modelValue={workOrderTime.value}
              onUpdate:modelValue={(v) => {
                workOrderTime.value = v;
              }}
              onSearch={changeHandleworkOrderTime}
            ></DateInlineForm>
          </template>
          {alarmType.xData.length > 0 && (
            <div class="chart">
              {" "}
              <barChart x-data={alarmType.xData} data={[{ color: "#1890FF", name: "", data: alarmType.yData }]} class="columnBox" />
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

export default TopCountConsumption;
