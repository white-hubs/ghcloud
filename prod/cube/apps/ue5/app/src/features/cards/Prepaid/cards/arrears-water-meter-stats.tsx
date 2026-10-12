import { defineComponent } from "vue";
import { ref, onMounted } from "vue";

import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { waterMeterPage } from "@/infrastructure/api/prepaid";
import PlanPie from "@/shared-ui/panel/charts/pie/planePie";
import pieList from "@/shared-ui/panel/pieList";

import styles from "./arrears-water-meter-stats.module.less";

export const ArrearsWaterMeterStats = defineComponent({
  name: "ArrearsWaterMeterStats",
  setup(_props, ctx) {
    const roundPieData = ref([
      {
        value: 0,
        label: "未失联",
        color: "rgba(3, 182, 21, 1)",
      },
      {
        value: 0,
        label: "已失联",
        color: "rgba(245, 154, 35, 1)",
      },
    ]);
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

    const getArrearsOfFeesPage = async () => {
      const contact = await waterMeterPage({ oweMoney: true, pageSize: 1, pageNumber: 1 });
      const noContact = await waterMeterPage({ oweMoney: false, pageSize: 1, pageNumber: 1 });
      arrearsData.value[1].value = contact.total || 0;
      arrearsData.value[0].value = noContact.total || 0;
    };

    onMounted(() => {
      getArrearsOfFeesPage();
    });

    return (): JSX.Element => (
      <>
        <SubPanelTemplate title="欠费水表占比">
          <div class="equipmentAlarm">
            <PlanPie pieData={roundPieData.value}>
              <div class="content">
                <div class="total-num"> {arrearsData[1].value + arrearsData[0].value}</div>
                <div> 水表总数</div>
              </div>
            </PlanPie>
            <pieList roundPieData={roundPieData.value}></pieList>
          </div>
        </SubPanelTemplate>
      </>
    );
  },
});

export default ArrearsWaterMeterStats;
