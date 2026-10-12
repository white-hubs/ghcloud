import { defineComponent } from "vue";
import { ref, reactive, onMounted } from "vue";

import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { inspectElectronMobileChargeStat, inspectElectronMobileParkingStat } from "@/infrastructure/api/maintain";
import elevatorAnalysisPie from "@/shared-ui/panel/charts/pie/elevator-analysis-pie";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import elevatorAnalysisList from "@/shared-ui/panel/elevator-analysis-list";
import { ModelValueItf } from "@/shared-ui/panel/types";

import styles from "./violation-statistics-electric-vehicles.module.less";

export const ViolationStatisticsElectricVehicles = defineComponent({
  name: "ViolationStatisticsElectricVehicles",
  setup(_props, ctx) {
    const pieData = ref([
      {
        name: "违规充电",
        value: 0,
        color: "#29C2FF",
        ratio: "0%",
      },
      {
        name: "违规停放",
        value: 0,
        color: "#FFAB10",
        ratio: "0%",
      },
    ]);
    const alarmTotal = ref(0);
    const alarmTimeType = ref<ModelValueItf>({
      timeType: "THIS_YEAR",
      dateRange: [],
    });
    const changeDate = async () => {
      const park = await inspectElectronMobileParkingStat({ period: alarmTimeType.value.dateRange.join(",") });
      const charge = await inspectElectronMobileChargeStat({ period: alarmTimeType.value.dateRange.join(",") });
      alarmTotal.value = park.total + charge.total;
      pieData.value[1].value = alarmTotal.value ? (park.total / alarmTotal.value) * 100 : 0;
      pieData.value[0].value = alarmTotal.value ? (charge.total / alarmTotal.value) * 100 : 0;
    };

    return (): JSX.Element => (
      <>
        <SubPanelTemplate title="电瓶车违规占比">
          <template>
            {" "}
            <DateInlineForm
              modelValue={alarmTimeType.value}
              onUpdate:modelValue={(v) => {
                alarmTimeType.value = v;
              }}
              onSearch={changeDate}
            ></DateInlineForm>
          </template>
          <div class="elevator-analysis">
            <div class="chart">
              <elevator-analysis-pie pieData={pieData.value}>
                <div style="color: #fff;text-align: center;font-size: 14px;"> {alarmTotal.value}</div>
                <div style="color: #fff;text-align: center;font-size: 14px;"> 违规总数(个)</div>
              </elevator-analysis-pie>
            </div>
            <elevatorAnalysisList contentList={pieData.value} style="margin-left: 10px;"></elevatorAnalysisList>
          </div>
        </SubPanelTemplate>
      </>
    );
  },
});

export default ViolationStatisticsElectricVehicles;
