import { defineComponent } from "vue";
import { ref, onMounted } from "vue";

import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { useStatusStat } from "@/infrastructure/api/door";
import PlanPie from "@/shared-ui/panel/charts/pie/planePie";
import pieList from "@/shared-ui/panel/pieList";

import styles from "./smart-card-status-stats.module.less";

export const SmartCardStatusStats = defineComponent({
  name: "SmartCardStatusStats",
  setup(_props, ctx) {
    const roundPieData = ref([
      {
        value: 10,
        label: "正常",
        color: "rgba(3, 182, 21, 1)",
      },
      {
        value: 10,
        label: "挂失",
        color: "rgba(245, 154, 35, 1)",
      },
    ]);
    const deviceTotal = ref(0);

    const getUseStatusStat = async () => {
      const res = await useStatusStat();
      roundPieData.value[0].value = res.normalNum;
      roundPieData.value[1].value = res.lossNum;
      deviceTotal.value = res.normalNum + res.lossNum;
    };

    onMounted(() => {
      getUseStatusStat();
    });

    return (): JSX.Element => (
      <>
        <SubPanelTemplate title="智能卡状态统计">
          <div class="equipmentAlarm">
            <PlanPie pieData={roundPieData.value}>
              <div class="content">
                <div class="total-num"> {deviceTotal.value}</div>
                <div> 智能卡总数</div>
              </div>
            </PlanPie>
            <pieList roundPieData={roundPieData.value}></pieList>
          </div>
        </SubPanelTemplate>
      </>
    );
  },
});

export default SmartCardStatusStats;
