import { defineComponent } from "vue";
import { ref, reactive, onMounted } from "vue";

import stackedBarChart from "@/features/cards/Information-release/stacked-bar-chart";
import GridContainer from "@/features/panel-shell/metrics/grid-container/grid-container";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { groupControlStat } from "@/infrastructure/api/device";
import { getAssetsImage } from "@/infrastructure/utils/getImage";
import PlanPie from "@/shared-ui/panel/charts/pie/planePie";
import waterPolo from "@/shared-ui/panel/charts/waterPolo/waterPolo";
import deviceModule from "@/shared-ui/panel/deviceModule";
import elevatorAnalysisList from "@/shared-ui/panel/elevator-analysis-list";
import { AlarmRateList } from "@/shared-ui/panel/types";
import useCommon from "@/visualization-core/hooks/useCommon";

import styles from "./lighting-left.module.less";

export const LightingLeft = defineComponent({
  name: "LightingLeft",
  setup(_props, ctx) {
    const { getEquipmentNumber } = useCommon();
    const faultRate = ref<number>(0);
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
    const xData = ref<string[]>([]);
    const yData = ref<{ name: string; data: number[]; color: string }[]>([
      {
        name: "正常",
        data: [],
        color: "#2AE8BD",
      },
      {
        name: "关闭",
        data: [],
        color: "#2989FF",
      },
    ]);
    const colorList = ["#328BF7", "#19F8F7", "#FFC700", "#EF424A"];
    const monitorSituationPieData = ref<{ name: string; value: number; color: string }[]>([
      { name: "门诊大厅屏", value: 30000, color: "#FFAB10" },
      { name: "电梯屏", value: 2000, color: "#2F8DFF" },
      { name: "候诊排队屏", value: 748, color: "#F14545" },
      { name: "病房走廊屏", value: 6000, color: "#19F8F7" },
      { name: "诊间门口频", value: 6000, color: "#2AE8BD" },
    ]);
    const getEquipmentInfo = async () => {
      monitorSituationPieData.value.length = 0;
      let res: any = await getEquipmentNumber();
      if (!res.deviceNum) {
        return;
      }
      res.deviceGenreNums.forEach((item, index) => {
        monitorSituationPieData.value.push({
          name: item.genreName,
          value: item.num,
          color: colorList[index],
        });
      });
    };
    /**
     * 设备类型分布
     */
    const equipmentStatistic = async () => {
      const res = await getEquipmentNumber();
      if (JSON.stringify(res) === "{}") {
        return;
      }
      res.deviceStatusNums.forEach((item) => {
        if (item.name === "OFFLINE" && res.deviceNum !== 0) {
          faultRate.value = Math.round((item.num / res.deviceNum) * 10000) / 100.0;
          dataList[0].value = res.deviceNum;
          dataList[1].value = item.num;
          dataList[1].label = faultRate.value;
        }
      });
    };
    const getLightingCircuit = async () => {
      const res = await groupControlStat();
      yData.value[0].data.length = 0;
      yData.value[1].data.length = 0;
      xData.value = res.map((item) => {
        return item.groupName;
      });
      res.forEach((item) => {
        item.detailStat.forEach((data) => {
          if (data.label === "开") {
            yData.value[0].data.push(data.num);
          } else {
            yData.value[1].data.push(data.num);
          }
        });
      });
    };
    onMounted(() => {
      getEquipmentInfo();
      equipmentStatistic();
      getLightingCircuit();
    });

    return (): JSX.Element => (
      <>
        <div>
          <SubPanelTemplate title="设备分类统计">
            <div class="appointment-data">
              <PlanPie pieData={monitorSituationPieData.value}>
                {" "}
                <img src={getAssetsImage("business-icon/triage-queue-appointment.png")} />
              </PlanPie>
              <elevatorAnalysisList contentList={monitorSituationPieData.value} style="margin-left: 10px;"></elevatorAnalysisList>
            </div>
          </SubPanelTemplate>
          <SubPanelTemplate title="照明回路实况" class="device-statistics">
            {" "}
            <div class="chart">
              {" "}
              <stackedBarChart x-data={xData.value} y-data={yData.value}></stackedBarChart>
            </div>
          </SubPanelTemplate>
          <SubPanelTemplate title="设备离线率">
            <div class="alarm-event">
              <waterPolo title value={faultRate.value} unit="%" bgColor="#FFC700" color="#FFC700"></waterPolo>
              <deviceModule data-list={dataList}></deviceModule>
            </div>
          </SubPanelTemplate>
        </div>
      </>
    );
  },
});

export default LightingLeft;
