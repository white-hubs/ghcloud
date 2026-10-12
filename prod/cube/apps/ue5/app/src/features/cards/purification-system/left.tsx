import { defineComponent } from "vue";
import { ref, reactive, onMounted } from "vue";

import GridContainer from "@/features/panel-shell/metrics/grid-container/grid-container";
import OperateDays from "@/features/panel-shell/metrics/operate-days/operate-days";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { AlarmRate } from "@/infrastructure/api/models/alarm";
import { alarmTrend, equipmentAlarmRateData, equipmentNumber } from "@/infrastructure/utils/requestData/alarm";
import PlanPie from "@/shared-ui/panel/charts/pie/planePie";
import waterPolo from "@/shared-ui/panel/charts/waterPolo/waterPolo";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import deviceModule from "@/shared-ui/panel/deviceModule";
import LineChart from "@/shared-ui/panel/lineChart";
import PieList from "@/shared-ui/panel/pieList";
import { AlarmRateList, ModelValueItf } from "@/shared-ui/panel/types";
import useCommon from "@/visualization-core/hooks/useCommon";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import styles from "./left.module.less";

export const Left = defineComponent({
  name: "Left",
  setup(_props, ctx) {
    const colors = ["#29C2FF", "#74AEE7", "#FFC700", "#655DD1", "#B9D9FF", "#6EE3E1"];
    const deviceStatusType = {
      ALARM: "报警",
      TROUBLE: "故障",
      OFFLINE: "离线",
      NORMAL: "正常",
    };
    const { globalState } = useStateStore();
    const { getEquipmentNumber } = useCommon();
    const timeFrame = ref<ModelValueItf>();
    const trend = ref<ModelValueItf>();
    const roundPieData = ref([]);
    const alarmTotal = ref(0);
    const alarmRateData = reactive<AlarmRate>({
      proportion: 0,
      deviceTotal: "",
      alarmNum: "",
      chainRatio: "",
    });
    const alarmStatusData = reactive([]);
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
    // 设备实时数据
    const deviceDataInfo = async () => {
      let res: any = await getEquipmentNumber();
      if (!res.deviceNum) {
        return;
      }
      roundPieData.value.length = 0;
      alarmTotal.value = 0;
      res.deviceStatusNums.forEach((item, index) => {
        alarmTotal.value += item.num;
        let obj = {
          label: deviceStatusType[item.name],
          color: colors[index],
          value: item.num,
        };
        roundPieData.value.push(obj);
      });
    };
    const series = reactive([
      {
        data: [0],
        linearGradientColor: ["rgb(86, 142, 255)", "rgb(86, 142, 255,0)"],
      },
    ]);
    const xData = ref(["1时", "2时", "3时", "4时", "5时"]);
    const alarmNum = ref<number>(0);
    const chainRatio = ref<number>(0);
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
      Object.assign(alarmStatusData, data.alarmStatusStatistics);
      alarmNum.value = data.alarmNum;
      chainRatio.value = data.chainRatio;
      xData.value = res.xdata;
      series[0].data = res.ydata;
    };
    // 设备报警率
    const equipmentAlarmRateInfo = async () => {
      let param = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        period: timeFrame.value.dateRange.join(","),
        type: timeFrame.value.timeType,
      };
      let res = await equipmentAlarmRateData(param);
      alarmRateData.proportion = Math.round(Number(res.proportion) * 10000) / 100.0;
      dataList[0].value = Number(res.deviceTotal);
      dataList[1].value = Number(res.alarmNum);
      dataList[1].label = Math.round(Number(res.chainRatio) * 10000) / 100.0;
    };
    onMounted(() => {
      deviceDataInfo();
      equipmentAlarmRateInfo();
    });

    return (): JSX.Element => (
      <>
        <SubPanelTemplate title="设备状态分布">
          <div>
            <div class="flex-between">
              <PlanPie pieData={roundPieData.value}>
                <div class="content">
                  <div class="total-num"> {alarmTotal.value}</div>
                  <div> 设备总数</div>
                </div>
              </PlanPie>
              <PieList roundPieData={roundPieData.value}></PieList>
            </div>
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
          <div class="chart">
            {" "}
            <LineChart x-data={xData.value} series={series} title={"次"}></LineChart>
          </div>
        </SubPanelTemplate>
        <SubPanelTemplate title="设备报警率" class="alarm-event">
          <template>
            {" "}
            <DateInlineForm
              modelValue={timeFrame.value}
              onUpdate:modelValue={(v) => {
                timeFrame.value = v;
              }}
              onSearch={equipmentAlarmRateInfo}
            ></DateInlineForm>
          </template>
          <div class="equipmentInfo">
            <waterPolo title value={alarmRateData.proportion} unit="%" bgColor="#2989FF" color="#2989FF"></waterPolo>
            <deviceModule data-list={dataList}></deviceModule>
          </div>
        </SubPanelTemplate>
      </>
    );
  },
});

export default Left;
