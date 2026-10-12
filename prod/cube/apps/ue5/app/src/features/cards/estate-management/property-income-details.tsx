import { defineComponent } from "vue";
import { ref, reactive, onMounted } from "vue";

import StackedBar from "@/features/panel-shell/charts/stacked-bar/stacked-bar";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import { ModelValueItf } from "@/shared-ui/panel/types";

import styles from "./property-income-details.module.less";

export const PropertyIncomeDetails = defineComponent({
  name: "PropertyIncomeDetails",
  setup(_props, ctx) {
    const overviewTime = ref<ModelValueItf>();
    const alarmStatisticsData = reactive({
      chartData: {
        xData: ["水费", "电费", "修缮费", "物管费"],
        yData: [
          { name: "支出", value: [10, 10, 8, 6], color: "#2989FF" },
          { name: "收入", value: [10, 10, 8, 6], color: "#2AE8BD" },
        ],
      },
    });
    const changeHandleOverviewTime = () => {};

    return (): JSX.Element => (
      <>
        <SubPanelTemplate>
          <template>
            {" "}
            <DateInlineForm
              modelValue={overviewTime.value}
              onUpdate:modelValue={(v) => {
                overviewTime.value = v;
              }}
              onSearch={changeHandleOverviewTime}
            ></DateInlineForm>
          </template>
          <div class="stacked-bar-chart">
            {" "}
            <StackedBar xData={alarmStatisticsData.chartData.xData} yData={alarmStatisticsData.chartData.yData} />
          </div>
        </SubPanelTemplate>
      </>
    );
  },
});

export default PropertyIncomeDetails;
