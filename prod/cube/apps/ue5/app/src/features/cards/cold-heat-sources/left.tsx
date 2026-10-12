import { defineComponent } from "vue";
import { ref, reactive, onMounted } from "vue";

import GridContainer from "@/features/panel-shell/metrics/grid-container/grid-container";
import OperateDays from "@/features/panel-shell/metrics/operate-days/operate-days";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { equipmentTotal } from "@/infrastructure/api/equipment";
import { AlarmStatus } from "@/infrastructure/api/models/alarm";
import { alarmTrend, equipmentNumber, equipmentAlarmRateData } from "@/infrastructure/utils/requestData/alarm";
import PlanPie from "@/shared-ui/panel/charts/pie/planePie";
import waterPolo from "@/shared-ui/panel/charts/waterPolo/waterPolo";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import deviceModule from "@/shared-ui/panel/deviceModule";
import LineChart from "@/shared-ui/panel/lineChart";
import PieList from "@/shared-ui/panel/pieList";
import { AlarmRateList, ModelValueItf } from "@/shared-ui/panel/types";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import styles from "./left.module.less";

export const Left = defineComponent({
  name: "Left",
  setup(_props, ctx) {
    const { globalState } = useStateStore();

    const colorList = ["#FFAB10", "#2F8DFF", "#F14545", "#19F8F7"];
    const deviceStatusType = {
      ALARM: "报警",
      TROUBLE: "故障",
      OFFLINE: "离线",
      NORMAL: "正常",
    };
    const monitorSituationPieData = ref<{ label: string; value: number; color: string }[]>([]);
    const alarmTotal = ref(0);
    const alarmStatusData = ref<AlarmStatus[]>([
      {
        alarmNum: 10,
        alarmStatus: "",
        alarmStatusName: "处理中",
        color: "#FFC700",
      },
      {
        alarmNum: 10,
        alarmStatus: "",
        alarmStatusName: "挂起",
        color: "#74AEE7",
      },
      {
        alarmNum: 10,
        alarmStatus: "",
        alarmStatusName: "已处理",
        color: "#00F27B",
      },
      {
        alarmNum: 10,
        alarmStatus: "",
        alarmStatusName: "待确认",
        color: "#29C2FF",
      },
    ]);
    const alarmData = ref(0);
    const xData = ref<string[]>(["12-4", "12-5", "12-6", "12-7", "12-8"]);
    const yData = ref<number[]>([1, 2, 3, 4, 5]);
    const alarmCon = ref({
      count: 0,
      ratio: 0,
    });
    const dataList = reactive<AlarmRateList[]>([
      {
        title: "设备总数",
        value: 0,
        ringRatio: false,
      },
      {
        title: "报警设备总数",
        value: 0,
        ringRatio: true,
        label: 0,
        unit: "%",
      },
    ]);
    const hiddenDangerTime = ref<ModelValueItf>();
    const deviceAlarmTime = ref<ModelValueItf>();

    // 设备实时数据
    const deviceDataInfo = async () => {
      let res: any = await equipmentTotal({ sceneType: globalState.business.currentMenu, areaId: globalState.business.currentAreaId });
      if (!res.deviceNum) {
        return;
      }
      monitorSituationPieData.value.length = 0;
      alarmTotal.value = 0;
      res.deviceStatusNums.forEach((item, index) => {
        alarmTotal.value += item.num;
        let obj = {
          label: deviceStatusType[item.name],
          color: colorList[index],
          value: item.num,
        };
        monitorSituationPieData.value.push(obj);
      });
    };
    // 设备报警趋势
    const alarmTrendInfo = async () => {
      let param = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        period: hiddenDangerTime.value.dateRange.join(","),
        type: hiddenDangerTime.value.timeType,
      };

      let res: any = await alarmTrend(param);
      let data: any = await equipmentNumber(param);
      alarmStatusData.value = data.alarmStatusStatistics;
      alarmCon.value.count = data.alarmNum;
      alarmCon.value.ratio = data.chainRatio;
      xData.value = res.xdata;
      yData.value = res.ydata;
    };
    // 设备报警率
    const equipmentAlarm = async () => {
      let param = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        period: deviceAlarmTime.value.dateRange.join(","),
        type: deviceAlarmTime.value.timeType,
      };
      let res = await equipmentAlarmRateData(param);
      alarmData.value = Math.round(Number(res.proportion) * 10000) / 100.0;
      dataList[0].value = Number(res.deviceTotal);
      dataList[1].value = Number(res.alarmNum);
      dataList[1].label = Math.round(Number(res.chainRatio) * 10000) / 100.0;
    };
    onMounted(() => {
      deviceDataInfo();
    });

    return (): JSX.Element => (
      <>
        <div>
          <SubPanelTemplate title="冷热源实时数据">
            <div class="flex-between">
              <PlanPie pieData={monitorSituationPieData.value}>
                <div class="content">
                  <div class="total-num"> {alarmTotal.value}</div>
                  <div> 设备总数</div>
                </div>
              </PlanPie>
              <PieList roundPieData={monitorSituationPieData.value}></PieList>
            </div>
          </SubPanelTemplate>
          <SubPanelTemplate title="设备报警趋势">
            <template>
              {" "}
              <DateInlineForm
                modelValue={hiddenDangerTime.value}
                onUpdate:modelValue={(v) => {
                  hiddenDangerTime.value = v;
                }}
                onSearch={alarmTrendInfo}
              ></DateInlineForm>
            </template>
            <OperateDays title="报警数" value={alarmCon.value.count} class="body-bum">
              <div class="extra flex-start">
                <div class="mode"> 环比</div>
                <div class={["downtriangle", alarmCon.ratio > 0 && "uptriangle"]}></div>
                <div class={[alarmCon.ratio < 0 ? "down" : "up"]}>{alarmCon.ratio}%</div>
              </div>
            </OperateDays>
            <GridContainer data={alarmStatusData.value}></GridContainer>
            <div class="chart">
              <LineChart
                x-data={xData.value}
                series={[
                  {
                    data: yData,
                    linearGradientColor: ["rgb(86, 142, 255)", "rgb(86, 142, 255,0)"],
                  },
                ]}
              />
            </div>
          </SubPanelTemplate>
          <SubPanelTemplate title="设备报警率">
            <template>
              {" "}
              <DateInlineForm
                modelValue={deviceAlarmTime.value}
                onUpdate:modelValue={(v) => {
                  deviceAlarmTime.value = v;
                }}
                onSearch={equipmentAlarm}
              ></DateInlineForm>
            </template>
            <div class="equipmentInfo">
              <waterPolo title value={alarmData.value} unit="%" bgColor="#FE090E" color="#FE090E"></waterPolo>
              <deviceModule data-list={dataList}></deviceModule>
            </div>
          </SubPanelTemplate>
        </div>
      </>
    );
  },
});

export default Left;
