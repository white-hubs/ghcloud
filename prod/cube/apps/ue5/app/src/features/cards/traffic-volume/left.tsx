import moment from "moment";
import { defineComponent } from "vue";
import { ref, reactive, onMounted } from "vue";

import GridContainer from "@/features/panel-shell/metrics/grid-container/grid-container";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { statisticsLevel } from "@/infrastructure/api/alarm";
import { trafficFlowTunnels } from "@/infrastructure/api/securitymanagement";
import RoundPie from "@/shared-ui/panel/charts/roundPie/roundPie";
import waterPolo from "@/shared-ui/panel/charts/waterPolo/waterPolo";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import deviceModule from "@/shared-ui/panel/deviceModule";
import LineChart from "@/shared-ui/panel/lineChart";
import pieList from "@/shared-ui/panel/pieList";
import { AlarmRateList, ModelValueItf } from "@/shared-ui/panel/types";
import useCommon from "@/visualization-core/hooks/useCommon";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import styles from "./left.module.less";

export const Left = defineComponent({
  name: "Left",
  setup(_props, ctx) {
    const { getEquipmentNumber } = useCommon();
    const { globalState } = useStateStore();

    const colorList = ["#328BF7", "#19F8F7", "#FFC700", "#EF424A"];
    const roundPieData = ref([]);
    const devicesNum = ref(0);
    const alarmStatusData = ref([
      { alarmStatus: "0", alarmStatusName: "进入", alarmNum: 0, color: "rgb(255, 199, 0)" },
      { alarmStatus: "1", alarmStatusName: "离开", alarmNum: 0, color: "rgb(0, 242, 123)" },
    ]);
    let timeFrame = ref<ModelValueItf>();
    const xData = ref<string[]>([]);
    const yData = ref<
      {
        name: string;
        data: number[];
        linearGradientColor?: string[];
        lineColor?: string;
        showSymbol?: boolean;
        smooth?: boolean;
        symbolSize?: number;
      }[]
    >([
      {
        data: [0],
        linearGradientColor: ["rgb(255, 162, 0.1)", "rgb(255, 222, 165,1)"],
        name: "进入",
      },
      {
        data: [0],
        linearGradientColor: ["rgba(120, 252, 252, 1)", "rgba(120, 252, 252, 0.1)"],
        lineColor: "rgba(120, 252, 252, 1)",
        name: "离开",
      },
    ]);
    const titles = ref<string[]>([]);
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
    // 获取报警级别分布数据
    async function getAlarmLevel() {
      let params = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        period: timeFrame.value.dateRange.join(","),
        type: timeFrame.value.timeType,
      };
      let res = await statisticsLevel(params);
      devicesNum.value = 0;
      roundPieData.value = res.map((item, index) => {
        devicesNum.value += item.alarmNum;
        return {
          label: (item.name += "报警"),
          color: colorList[index],
          value: item.alarmNum,
        };
      });
    }
    const getTrafficFlowTunnels = async () => {
      const res = await trafficFlowTunnels({
        period: [moment().format("YYYY-MM-DD 00:00:00"), moment().format("YYYY-MM-DD HH:mm:ss")].join(","),
      });
      alarmStatusData.value[0].alarmNum = res.directionTotalIn;
      alarmStatusData.value[1].alarmNum = res.directionTotalOut;
      xData.value = res.xtitle.map((item) => {
        return item + "时";
      });
      yData.value[0].data = res.xtitle.map((xItem) => {
        return res.directionInList.find((item) => item.timeFlag === xItem)
          ? res.directionInList.find((item) => item.timeFlag === xItem).num
          : 0;
      });
      yData.value[1].data = res.xtitle.map((xItem) => {
        return res.directionOutList.find((item) => item.timeFlag === xItem)
          ? res.directionOutList.find((item) => item.timeFlag === xItem).num
          : 0;
      });
    };
    onMounted(() => {
      equipmentStatistic();
      getTrafficFlowTunnels();
    });

    return (): JSX.Element => (
      <>
        <div>
          <SubPanelTemplate title="隧道今日车流量分析">
            <GridContainer style="margin-top: 10px" data={alarmStatusData.value}></GridContainer>
            <div class="charts">
              {" "}
              <LineChart
                x-data={xData.value}
                series={yData.value}
                showLegend={true}
                showBackground={true}
                titles={titles.value}
                gridTop="15"
                unit={{ x: "", y: "人次" }}
                axisPointer={true}
              />
            </div>
          </SubPanelTemplate>
          <SubPanelTemplate title="设备离线率" class="alarm-event">
            <div class="equipmentInfo">
              <waterPolo title value={faultRate.value} unit="%" bgColor="#FFC700" color="#FFC700"></waterPolo>
              <deviceModule data-list={dataList}></deviceModule>
            </div>
          </SubPanelTemplate>
          <SubPanelTemplate title="设备报警事件统计">
            <template>
              {" "}
              <DateInlineForm
                modelValue={timeFrame.value}
                onUpdate:modelValue={(v) => {
                  timeFrame.value = v;
                }}
                onSearch={getAlarmLevel}
              ></DateInlineForm>
            </template>
            <div class="equipmentAlarm">
              <RoundPie data={roundPieData.value} eventNum={devicesNum.value}>
                <div class="content">
                  <span> {devicesNum.value}</span>
                  <br />
                  报警总数
                </div>
              </RoundPie>
              <pieList roundPieData={roundPieData.value}></pieList>
            </div>
          </SubPanelTemplate>
        </div>
      </>
    );
  },
});

export default Left;
