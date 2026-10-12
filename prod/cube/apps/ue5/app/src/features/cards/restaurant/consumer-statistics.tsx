import { defineComponent } from "vue";
import { ref, reactive, onMounted } from "vue";

import overviewChartBar from "@/features/cards/hospital/overview-chartBar";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { canteenConsumptionUserNumberTrend } from "@/infrastructure/api/onecard";
import DateInlineForm, { ModelValueItf } from "@/shared-ui/panel/dateInlineForm";
import noData from "@/shared-ui/panel/noData";

import styles from "./consumer-statistics.module.less";

export const ConsumerStatistics = defineComponent({
  name: "ConsumerStatistics",
  setup(_props, ctx) {
    const workOrderTime = ref<ModelValueItf>({
      timeType: "TODAY",
      dateRange: [],
    });

    const barData = reactive({
      xData: [] as string[],
      yData: [
        {
          data: [] as number[],
          name: "",
          color: ["rgba(41, 137, 255, 0.80)", "rgba(41, 137, 255, 0)"],
        },
      ],
    });

    const changeHandleworkOrderTime = async () => {
      if (!workOrderTime.value?.dateRange?.length) return;
      try {
        const res = await canteenConsumptionUserNumberTrend({
          period: workOrderTime.value.dateRange.join(","),
          type: workOrderTime.value.timeType,
        });
        if (Array.isArray(res)) {
          barData.xData = res.map((item: any) => item.period || item.date || item.key);
          barData.yData[0].data = res.map((item: any) => Number(item.personCount || item.value || item.num || 0));
        }
      } catch (error) {}
    };

    return (): JSX.Element => (
      <>
        <SubPanelTemplate title="消费人数统计">
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
          {barData.xData.length > 0 && (
            <div class="stacked-bar-chart">
              {" "}
              <overviewChartBar xData={barData.xData} yData={barData.yData}></overviewChartBar>
            </div>
          )}
          <div class="stacked-bar-chart" style="min-height: 150px">
            {" "}
            <noData></noData>
          </div>
        </SubPanelTemplate>
      </>
    );
  },
});

export default ConsumerStatistics;
