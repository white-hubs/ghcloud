import { defineComponent } from "vue";
import { ref, reactive, onMounted } from "vue";

import GridContainer from "@/features/panel-shell/metrics/grid-container/grid-container";
import OperateDays from "@/features/panel-shell/metrics/operate-days/operate-days";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { alarmTrend, equipmentNumber } from "@/infrastructure/utils/requestData/alarm";
import PlanPie from "@/shared-ui/panel/charts/pie/planePie";
import waterPolo from "@/shared-ui/panel/charts/waterPolo/waterPolo";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import deviceModule from "@/shared-ui/panel/deviceModule";
import LineChart from "@/shared-ui/panel/lineChart";
import PieList from "@/shared-ui/panel/pieList";
import { AlarmRateList, ModelValueItf } from "@/shared-ui/panel/types";
import useCommon from "@/visualization-core/hooks/useCommon";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import styles from "./right.module.less";

export const Right = defineComponent({
  name: "Right",
  setup(_props, ctx) {
    const { globalState } = useStateStore();

    const { getAlarmLevel, getEquipmentNumber } = useCommon();
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
    const alarmLevelTime = ref<ModelValueItf>();
    const trend = ref<ModelValueItf>();
    const chainRatio = ref<number>(0);
    const alarmNum = ref<number>(0);
    const levelPieData = ref([]);
    let alarmStatusData = reactive([]);
    const levelAlarmTotal = ref(0);
    const levelStatistic = ref([
      {
        alarmNum: 10,
        alarmStatus: "",
        alarmStatusName: "一级",
        color: "#FFC700",
      },
      {
        alarmNum: 10,
        alarmStatus: "",
        alarmStatusName: "二级",
        color: "#74AEE7",
      },
      {
        alarmNum: 10,
        alarmStatus: "",
        alarmStatusName: "三级",
        color: "#00F27B",
      },
      {
        alarmNum: 10,
        alarmStatus: "",
        alarmStatusName: "四级",
        color: "#29C2FF",
      },
    ]);
    const xData = reactive({
      arr: ["1时", "2时", "3时", "4时", "5时"],
    });
    const series = reactive([
      {
        data: [0],
        linearGradientColor: ["rgb(86, 142, 255)", "rgb(86, 142, 255,0)"],
      },
    ]);
    // 报警级别
    const changeAlarmLevelTime = async () => {
      let param = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        period: alarmLevelTime.value.dateRange.join(","),
        type: alarmLevelTime.value.timeType,
      };
      levelPieData.value.length = 0;
      levelAlarmTotal.value = 0;
      const res = await getAlarmLevel(param);
      res.forEach((item, index) => {
        levelAlarmTotal.value += item.alarmNum;
        levelStatistic.value[index].alarmNum = item.alarmNum;
        levelPieData.value.push({
          label: item.name,
          value: item.alarmNum,
          color: levelStatistic.value[index].color,
        });
      });
    };
    // 设备报警趋势
    const alarmTrendInfo = async () => {
      let param = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        period: trend.value.dateRange.join(","),
        type: trend.value.timeType,
      };
      let res: any = await alarmTrend(param);
      let data: any = await equipmentNumber(param);
      alarmStatusData = data.alarmStatusStatistics;
      alarmNum.value = data.alarmNum;
      chainRatio.value = data.chainRatio;
      xData.arr = res.xdata;
      series[0].data = res.ydata;
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
    onMounted(() => {
      equipmentStatistic();
    });

    return (): JSX.Element => (
      <>
        <div>
          <SubPanelTemplate title="设备报警级别" class="alarm-event">
            <template>
              {" "}
              <DateInlineForm
                modelValue={alarmLevelTime.value}
                onUpdate:modelValue={(v) => {
                  alarmLevelTime.value = v;
                }}
                onSearch={changeAlarmLevelTime}
              ></DateInlineForm>
            </template>
            <GridContainer data={levelStatistic.value}></GridContainer>
            <div class="flex-between mg-10">
              <PlanPie pieData={levelPieData.value}>
                <div class="content">
                  <div class="total-num"> {levelAlarmTotal.value}</div>
                  <div> 报警总数</div>
                </div>
              </PlanPie>
              <PieList roundPieData={levelPieData.value}></PieList>
            </div>
          </SubPanelTemplate>
          <SubPanelTemplate title="设备报警趋势" class="alarm-event">
            <template>
              {" "}
              <DateInlineForm
                modelValue={trend.value}
                onUpdate:modelValue={(v) => {
                  trend.value = v;
                }}
                onSearch={alarmTrendInfo}
              ></DateInlineForm>
            </template>
            <OperateDays value={alarmNum.value} title="报警总数">
              <div class="ringRatio">
                <span> 环比</span>
                <div class={["downtriangle", chainRatio > 0 && "uptriangle"]}></div>
                <div class={[chainRatio > 0 ? "up" : "down"]}> {chainRatio + "%"}</div>
              </div>
            </OperateDays>
            <GridContainer style="margin-top: 12px" data={alarmStatusData}></GridContainer>
            <LineChart x-data={xData.arr} series={series} title={"次"}></LineChart>
          </SubPanelTemplate>
          <SubPanelTemplate title="设备离线率" class="alarm-event">
            <div class="equipmentInfo">
              <waterPolo title value={faultRate.value} unit="%" bgColor="#FFC700" color="#FFC700"></waterPolo>
              <deviceModule data-list={dataList}></deviceModule>
            </div>
          </SubPanelTemplate>
        </div>
      </>
    );
  },
});

export default Right;
