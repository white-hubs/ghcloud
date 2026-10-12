import { defineComponent } from "vue";
import { ref, onMounted } from "vue";

import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { ammeterStatStatus } from "@/infrastructure/api/prepaid";
import PlanPie from "@/shared-ui/panel/charts/pie/planePie";
import pieList from "@/shared-ui/panel/pieList";

import styles from "./arrears-electricity-meter-stats.module.less";

export const ArrearsElectricityMeterStats = defineComponent({
  name: "ArrearsElectricityMeterStats",
  setup(_props, ctx) {
    const arrearsData = ref([
      {
        value: 0,
        label: "未欠费",
        color: "rgba(3, 182, 21, 1)",
      },
      {
        value: 0,
        label: "已欠费",
        color: "rgba(245, 154, 35, 1)",
      },
    ]);

    const getAmmeterPage = async () => {
      const res = await ammeterStatStatus();
      arrearsData.value[1].value = res.oweMoney || 0;
      arrearsData.value[0].value = res.unOweMoney || 0;
    };

    onMounted(() => {
      getAmmeterPage();
    });

    return (): JSX.Element => (
      <>
        <SubPanelTemplate title="欠费电表占比">
          <div class="equipmentAlarm">
            <PlanPie pieData={arrearsData.value}>
              <div class="content">
                <div class="total-num"> {arrearsData[1].value + arrearsData[0].value}</div>
                <div> 电表总数</div>
              </div>
            </PlanPie>
            <pieList roundPieData={arrearsData.value}></pieList>
          </div>
        </SubPanelTemplate>
      </>
    );
  },
});

export default ArrearsElectricityMeterStats;
