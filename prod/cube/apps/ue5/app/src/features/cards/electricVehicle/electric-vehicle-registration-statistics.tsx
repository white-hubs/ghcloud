import { defineComponent } from "vue";
import { ref, reactive, onMounted } from "vue";

import electricVehicleLedgerModel from "./components/electric-vehicle-ledger-model";
import DeviceStatistics from "@/features/cards/small-engineering/components/device-statistics";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { electronMobileStat } from "@/infrastructure/api/property";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import { ModelValueItf } from "@/shared-ui/panel/types";

import styles from "./electric-vehicle-registration-statistics.module.less";

export const ElectricVehicleRegistrationStatistics = defineComponent({
  name: "ElectricVehicleRegistrationStatistics",
  setup(_props, ctx) {
    const showModal = ref(false);
    const alarmTimeType = ref<ModelValueItf>({
      timeType: "THIS_YEAR",
      dateRange: [],
    });
    const parameter = ref({
      dateRange: [],
    });
    const deviceStatisticsData = reactive({
      title: "电动车建档总数",
      total: 0,
    });
    const changeDate = async (val: ModelValueItf) => {
      const res = await electronMobileStat({ period: alarmTimeType.value.dateRange.join(",") });
      deviceStatisticsData.total = res;
    };
    const handelClickItemize = () => {
      parameter.value.dateRange = alarmTimeType.value.dateRange;
      showModal.value = true;
    };

    return (): JSX.Element => (
      <>
        <SubPanelTemplate title="电瓶车建档统计">
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
          <div class="content">
            {" "}
            <DeviceStatistics
              onClick={handelClickItemize}
              showRatio={false}
              style="height: 50px;"
              imgPath="overView121.png"
              statistic={deviceStatisticsData}
            ></DeviceStatistics>
          </div>
        </SubPanelTemplate>
        <electricVehicleLedgerModel
          parameter={parameter.value}
          onClose={() => {
            showModal.value = false;
          }}
          showModal={showModal.value}
        ></electricVehicleLedgerModel>
      </>
    );
  },
});

export default ElectricVehicleRegistrationStatistics;
