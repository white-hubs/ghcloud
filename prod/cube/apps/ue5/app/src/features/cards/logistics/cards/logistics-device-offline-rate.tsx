import { defineComponent } from "vue";
import { ref, reactive, onMounted } from "vue";

import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import waterPolo from "@/shared-ui/panel/charts/waterPolo/waterPolo";
import deviceModule from "@/shared-ui/panel/deviceModule";
import { AlarmRateList } from "@/shared-ui/panel/types";
import useCommon from "@/visualization-core/hooks/useCommon";

import styles from "./logistics-device-offline-rate.module.less";

export const LogisticsDeviceOfflineRate = defineComponent({
  name: "LogisticsDeviceOfflineRate",
  setup(_props, ctx) {
    const { getEquipmentNumber } = useCommon();
    const dataList = reactive<AlarmRateList[]>([
      {
        title: "设备总数",
        value: 0,
        ringRatio: false,
      },
      {
        title: "离线总数",
        value: 0,
        ringRatio: true,
        label: 0,
        unit: "%",
      },
    ]);
    const faultRate = ref<number>(0);

    /**
     * 设备类型分布
     */
    const equipmentStatistic = async () => {
      const res: any = await getEquipmentNumber();
      if (JSON.stringify(res) === "{}") {
        return;
      }
      res.deviceStatusNums.forEach((item: any) => {
        if (item.name === "OFFLINE" && res.deviceNum !== 0) {
          faultRate.value = Math.round((item.num / res.deviceNum) * 10000) / 100.0;
          dataList[0].value = res.deviceNum;
          dataList[1].value = item.num;
          dataList[1].label = faultRate.value;
        }
      });
    };

    onMounted(() => {
      equipmentStatistic();
    });

    return (): JSX.Element => (
      <>
        <SubPanelTemplate title="设备离线率" class="alarm-event">
          <div class="equipmentInfo">
            <waterPolo title value={faultRate.value} unit="%" bgColor="#FFC700" color="#FFC700"></waterPolo>
            <deviceModule data-list={dataList}></deviceModule>
          </div>
        </SubPanelTemplate>
      </>
    );
  },
});

export default LogisticsDeviceOfflineRate;
