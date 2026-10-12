import { defineComponent } from "vue";
import { ref, reactive, onMounted } from "vue";

import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import elevatorAnalysisPie from "@/shared-ui/panel/charts/pie/elevator-analysis-pie";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import elevatorAnalysisList from "@/shared-ui/panel/elevator-analysis-list";
import { ModelValueItf } from "@/shared-ui/panel/types";

import styles from "./overview-property-revenue.module.less";

export const OverviewPropertyRevenue = defineComponent({
  name: "OverviewPropertyRevenue",
  setup(_props, ctx) {
    const pieData = ref([
      {
        name: "收入总额",
        value: 30,
        color: "#306CCA",
        ratio: "0%",
      },
      {
        name: "指出总额",
        value: 70,
        color: "#19F8F7",
        ratio: "0%",
      },
    ]);
    const getDataTotal = () => {
      return pieData.value.reduce((sum, item) => sum + item.value, 0);
    };
    const alarmAnalysisTime = ref<ModelValueItf>();
    const changeHandleAlarmAnalysisTime = () => {};

    return (): JSX.Element => (
      <>
        <SubPanelTemplate>
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
          <div class="elevator-analysis">
            <div class="chart">
              <elevator-analysis-pie pieData={pieData.value}>
                <div style="color: #fff;text-align: center;font-size: 14px;"> {getDataTotal()}</div>
                <div style="color: #fff;text-align: center;font-size: 14px;"> 收入总数(元)</div>
              </elevator-analysis-pie>
            </div>
            <elevatorAnalysisList contentList={pieData.value} style="margin-left: 10px;"></elevatorAnalysisList>
          </div>
        </SubPanelTemplate>
      </>
    );
  },
});

export default OverviewPropertyRevenue;
