import { defineComponent } from "vue";
import { ref, reactive, onMounted } from "vue";

import overviewChartBar from "../hospital/overview-chartBar";
import FailedEquipmentModal from "@/features/cards/surgical-demonstration/components/failed-equipment-modal";
import stackedLine from "@/features/panel-shell/charts/stacked-line/stacked-line";
import GridContainer from "@/features/panel-shell/metrics/grid-container/grid-container";
import OperateDays from "@/features/panel-shell/metrics/operate-days/operate-days";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { statisticsLevel, statisticsStatus } from "@/infrastructure/api/alarm";
import { deviceAlarmArea, deviceAlarmNum, deviceAlarmTrend } from "@/infrastructure/api/device";
import { getAssetsImage } from "@/infrastructure/utils/getImage";
import PlanPie from "@/shared-ui/panel/charts/pie/planePie";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import PieList from "@/shared-ui/panel/pieList";
import { ModelValueItf } from "@/shared-ui/panel/types";
import useCommon from "@/visualization-core/hooks/useCommon";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import styles from "./left.module.less";

export const Left = defineComponent({
  name: "Left",
  setup(_props, ctx) {
    let alarmStatusData = ref([]);
    const alarmStatusEnum = ref("");
    const { globalState } = useStateStore();

    let xData = ref<string[]>([]);
    let yData = ref<number[]>([]);
    const deviceModal = ref<boolean>(false);
    const alarmCon = ref({
      count: 0,
      ratio: 10,
      alarmStatusStatistics: [],
    });
    let deviceStatusType = {
      ALARM: "报警",
      TROUBLE: "故障",
      OFFLINE: "离线",
      NORMAL: "正常",
    };

    const barData = reactive({
      xData: ["安防报警", "消防报警", "电气报警", "入侵报警"],
      yData: [
        {
          data: [10, 20, 30, 40],
          name: "区域",
        },
      ],
    });
    const clickItem = (data) => {
      alarmStatusEnum.value = data.alarmStatus;
      deviceModal.value = true;
    };
    const { getEquipmentNumber } = useCommon();

    let colorList = ["#2AE8BD", "#99C7FF", "#FFC700", "#F14545"];
    const alarmApplication = ref("atrend");
    const alarmTrend = ref("trend");
    const alarmTotal = ref<number>(10);
    const deviceNum = ref(0);
    const alarmSituationPieData = ref<any>([
      {
        color: "#FFAB10",
        value: 0,
        label: "故障",
      },
      {
        color: "#2F8DFF",
        value: 0,
        label: "离线",
      },
      {
        color: "#F14545",
        value: 0,
        label: "报警",
      },
      {
        color: "#19F8F7",
        value: 0,
        label: "在线",
      },
    ]);
    const lineData = reactive({
      title: "次",
      xData: [],
      yData: [],
    });
    const receiveOverviewTime = ref<ModelValueItf>();
    const topTimeFrame = ref<ModelValueItf>();
    // 报警态势
    const changeHandleReceiveOverviewTime = async () => {
      let params = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        period: receiveOverviewTime.value.dateRange.join(","),
        type: receiveOverviewTime.value.timeType,
      };
      alarmCon.value.alarmStatusStatistics = [];
      let status = await statisticsStatus(params);
      alarmCon.value.count = status.alarmNum;
      alarmCon.value.ratio = status.chainRatio;
      if (alarmApplication.value === "atrend") {
        let num = await deviceAlarmNum(params);
        alarmCon.value.alarmStatusStatistics = num.result.map((item, index) => {
          return {
            color: colorList[index],
            value: item.alarmNum,
            label: item.genreName,
          };
        });
      } else {
        let res = await statisticsLevel(params);
        alarmCon.value.alarmStatusStatistics = res.map((item, index) => {
          return {
            color: colorList[index],
            value: item.alarmNum,
            label: item.name,
          };
        });
      }
    };
    // 报警趋势
    const changeTopTimeFrame = async () => {
      let params = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        period: topTimeFrame.value.dateRange.join(","),
        type: topTimeFrame.value.timeType,
      };
      xData.value.length = 0;
      yData.value.length = 0;
      let Status = await statisticsStatus(params);
      let Trend = await deviceAlarmTrend(params);
      lineData.yData = [];
      lineData.xData = [];
      for (const key in Trend) {
        let obj = {
          data: [],
          name: "",
        };
        lineData.xData = Trend[key].map((item) => {
          if (params.type === "TODAY") {
            item.period += "时";
          } else if (params.type === "THIS_YEAR") {
            item.period += "月";
          } else {
            item.period += "号";
          }
          return item.period;
        });
        obj.data = Trend[key].map((item) => {
          return item.alarmNum;
        });
        obj.name = key;
        lineData.yData.push(obj);
      }
      alarmStatusData.value = Status.alarmStatusStatistics.map((item, index) => {
        item.color = colorList[index];
        return item;
      });
      let area = await deviceAlarmArea(params);
      barData.xData = [];
      barData.yData = [];
      let data = [];
      area.forEach((item) => {
        barData.xData.push(item.name);
        data.push(item.num);
      });
      barData.yData.push({
        name: "区域",
        data,
      });
    };
    // 今日设备总览
    const deviceDataInfo = async () => {
      let res: any = await getEquipmentNumber();
      if (!res.deviceNum) {
        return;
      }
      alarmSituationPieData.value.length = 0;
      deviceNum.value = res.deviceNum;
      res.deviceStatusNums.forEach((item, index) => {
        alarmTotal.value += item.num;
        let obj = {
          label: deviceStatusType[item.name],
          color: colorList[index],
          value: item.num,
        };
        alarmSituationPieData.value.push(obj);
      });
    };
    onMounted(() => {
      deviceDataInfo();
    });

    return (): JSX.Element => (
      <>
        <div>
          <SubPanelTemplate title="今日设备总览">
            <OperateDays value={deviceNum.value} title="设备总数" class="body-num" />
            <div class="flex-between">
              <PlanPie pieData={alarmSituationPieData.value} class="alarm-total-pie" pie-class="alarm-total-pie-chart">
                {" "}
                <div class="content">
                  {" "}
                  <img src={getAssetsImage("overView5.png")} alt></img>
                </div>
              </PlanPie>
              <PieList roundPieData={alarmSituationPieData.value} class="alarm-total-list"></PieList>
            </div>
          </SubPanelTemplate>
          <SubPanelTemplate title="报警态势">
            <template>
              {" "}
              <DateInlineForm
                modelValue={receiveOverviewTime.value}
                onUpdate:modelValue={(v) => {
                  receiveOverviewTime.value = v;
                }}
                onSearch={changeHandleReceiveOverviewTime}
              ></DateInlineForm>
            </template>
            <a-radio-group
              onChange={changeHandleReceiveOverviewTime}
              class="body-num"
              value={alarmApplication.value}
              onUpdate:value={(v) => {
                alarmApplication.value = v;
              }}
              button-style="solid"
            >
              <a-radio-button value="atrend"> 设备报警统计</a-radio-button>
              <a-radio-button value="statistics"> 报警等级统计</a-radio-button>
            </a-radio-group>
            <OperateDays title="报警数" value={alarmCon.value.count} class="body-num">
              <div class="extra flex-start">
                <div class="mode"> 环比</div>
                <div class={["downtriangle", alarmCon.ratio > 0 && "uptriangle"]}></div>
                <div class={[alarmCon.ratio < 0 ? "down" : "up"]}>{alarmCon.ratio}%</div>
              </div>
            </OperateDays>
            <div class="flex-between">
              <PlanPie pieData={alarmCon.alarmStatusStatistics} class="alarm-total-pie" pie-class="alarm-total-pie-chart">
                {" "}
                <div class="content">
                  {" "}
                  <img src={getAssetsImage("overView21.png")} alt></img>
                </div>
              </PlanPie>
              <PieList roundPieData={alarmCon.alarmStatusStatistics} class="alarm-total-list"></PieList>
            </div>
          </SubPanelTemplate>
          <SubPanelTemplate title="报警趋势" class="fire-alarm">
            <template>
              {" "}
              <DateInlineForm
                modelValue={topTimeFrame.value}
                onUpdate:modelValue={(v) => {
                  topTimeFrame.value = v;
                }}
                onSearch={changeTopTimeFrame}
              ></DateInlineForm>
            </template>
            <a-radio-group
              onChange={changeTopTimeFrame}
              class="body-num"
              value={alarmTrend.value}
              onUpdate:value={(v) => {
                alarmTrend.value = v;
              }}
              button-style="solid"
            >
              <a-radio-button value="trend"> 设备报警趋势</a-radio-button>
              <a-radio-button value="statistics"> 区域报警统计</a-radio-button>
            </a-radio-group>
            <div class="body">
              <GridContainer onClickItem={clickItem} data={alarmStatusData.value}></GridContainer>
              {alarmTrend === "trend" && (
                <div class="chart">
                  {" "}
                  <stackedLine
                    title={lineData.title}
                    yData={lineData.yData}
                    xData={lineData.xData}
                    color={["#2989FF", "#FF6E23"]}
                  ></stackedLine>
                </div>
              )}
              <div class="chart">
                {" "}
                <overviewChartBar xData={barData.xData} yData={barData.yData}></overviewChartBar>
              </div>
            </div>
          </SubPanelTemplate>
        </div>
        {deviceModal && (
          <FailedEquipmentModal
            date={topTimeFrame.dateRange}
            alarmStatusEnum={alarmStatusEnum.value}
            title="异常设备清单"
            modelValue={deviceModal.value}
            onUpdate:modelValue={(v) => {
              deviceModal.value = v;
            }}
            onClose={() => {
              deviceModal.value = false;
            }}
            footer={null}
          />
        )}
      </>
    );
  },
});

export default Left;
