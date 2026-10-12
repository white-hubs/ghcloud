import { defineComponent } from "vue";
import { ref, onMounted } from "vue";

import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { equipmentTotal } from "@/infrastructure/api/equipment";
import PlanPie from "@/shared-ui/panel/charts/pie/planePie";
import PieList from "@/shared-ui/panel/pieList";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import styles from "./logistics-device-type-distribution.module.less";

export const LogisticsDeviceTypeDistribution = defineComponent({
  name: "LogisticsDeviceTypeDistribution",
  setup(_props, ctx) {
    const { globalState } = useStateStore();
    const colorList = ["#2F8DFF", "#D0DEEE", "#FFAB10", "#F14545"];
    const roundPieData = ref<any[]>([]);
    const alarmTotal = ref(0);

    // 设备实时数据
    const deviceDataInfo = async () => {
      let params = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
      };
      let res: any = await equipmentTotal(params);
      if (!res.deviceNum) {
        return;
      }
      roundPieData.value.length = 0;
      alarmTotal.value = 0;
      res.deviceGenreNums.forEach((item: any, index: number) => {
        alarmTotal.value += item.num;
        let obj = {
          label: `${item.genreName}(${Math.round((item.num / res.deviceNum) * 10000) / 100.0}%)`,
          color: colorList[index],
          value: item.num,
        };
        roundPieData.value.push(obj);
      });
    };

    onMounted(() => {
      deviceDataInfo();
    });

    return (): JSX.Element => (
      <>
        <SubPanelTemplate title="设备类型分布">
          <div class="flex-between">
            <PlanPie pieData={roundPieData.value}>
              <div class="content">
                <div class="total-num"> {alarmTotal.value}</div>
                <div> 设备总数</div>
              </div>
            </PlanPie>
            <PieList roundPieData={roundPieData.value}></PieList>
          </div>
        </SubPanelTemplate>
      </>
    );
  },
});

export default LogisticsDeviceTypeDistribution;
