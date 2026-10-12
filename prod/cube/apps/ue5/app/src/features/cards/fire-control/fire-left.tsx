import { defineComponent } from "vue";
import { ref, onMounted, watch, onBeforeUnmount, reactive } from "vue";

import GridContainer from "@/features/panel-shell/metrics/grid-container/grid-container";
import OperateDays from "@/features/panel-shell/metrics/operate-days/operate-days";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { statisticsLevel, statisticsTrend, statisticsStatus, statisticsAreaTop } from "@/infrastructure/api/alarm";
import { AlarmAreaTop, AlarmLevelType } from "@/infrastructure/api/models/alarm";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import EventAlarmItem from "@/shared-ui/panel/eventAlarmItem";
import LineChart from "@/shared-ui/panel/lineChart";
import noData from "@/shared-ui/panel/noData";
import { ModelValueItf } from "@/shared-ui/panel/types";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import styles from "./fire-left.module.less";

export const FireLeft = defineComponent({
  name: "FireLeft",
  setup(_props, ctx) {
    const { globalState } = useStateStore();
    let timeFrame = ref<ModelValueItf>();
    let topTimeFrame = ref<ModelValueItf>();
    const areaAlarmDate = ref<ModelValueItf>();
    const alarmCon = ref({
      count: 0,
      ratio: 10,
    });
    const colorList = ["#FFC700", "#74AEE7", "#00F27B", "#29C2FF"];
    let eventAlarmData = reactive<{ list: AlarmAreaTop[] }>({
      list: [],
    });
    let alarmStatusData = ref([]);
    let xData = ref<string[]>([]);
    let yData = ref<number[]>([]);
    let timer: any = reactive(null);
    const fakeData = ref<AlarmLevelType[]>([
      {
        alarmNum: 0,
        name: "一级报警",
        chainRatio: 0,
        isGrow: false,
      },
    ]);
    watch(
      () => globalState.business.currentAreaId,
      () => {
        clearInterval(timer);
        timer = setInterval(
          () => {
            init();
          },
          (window as any).config.pageLoopRequestTime,
        );
        init();
      },
    );
    // 报警区域事件
    function changeAreaAlarmDate() {
      getAreaAlarm();
    }
    // 获取报警区域top5
    async function getAreaAlarm() {
      let params = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        period: areaAlarmDate.value.dateRange.join(","),
        type: areaAlarmDate.value.timeType,
      };
      eventAlarmData.list = await statisticsAreaTop(params);
    }
    // 报警级别分布
    function changeTimeFrame() {
      getAlarmLevel();
    }
    // 消防报警
    function changeTopTimeFrame() {
      getAlarmsNumber();
    }
    // 报警状态统计&报警趋势折线图统计
    async function getAlarmsNumber() {
      let params = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        period: topTimeFrame.value.dateRange.join(","),
        type: topTimeFrame.value.timeType,
      };
      xData.value.length = 0;
      yData.value.length = 0;
      let Status = await statisticsStatus(params);
      let Trend = await statisticsTrend(params);
      alarmStatusData.value = Status.alarmStatusStatistics.map((item, index) => {
        item.color = colorList[index];
        return item;
      });
      alarmCon.value = {
        count: Status.alarmNum,
        ratio: Status.chainRatio,
      };
      Trend.forEach((item) => {
        let time = "";
        if (params.type === "TODAY") {
          time = "时";
        } else if (params.type === "THIS_YEAR") {
          time = "月";
        } else {
          time = "号";
        }
        xData.value.push(item.period + time);
        yData.value.push(item.alarmNum);
      });
    }
    // 获取报警级别分布数据
    async function getAlarmLevel() {
      let params = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        period: timeFrame.value.dateRange.join(","),
        type: timeFrame.value.timeType,
      };
      let res = await statisticsLevel(params);
      // let res = await mockAlarmLevel({'timeType': timeFrame.value.timeType as TimeType});
      fakeData.value = res.map((item) => {
        item.chainRatio <= 0 ? (item.isGrow = false) : (item.isGrow = true);
        item.name += "报警";
        return item;
      });
    }
    function init() {
      getAlarmLevel();
      getAlarmsNumber();
    }
    onMounted(() => {
      timer = setInterval(
        () => {
          init();
        },
        (window as any).config.pageLoopRequestTime,
      );
    });
    onBeforeUnmount(() => {
      clearInterval(timer);
    });

    return (): JSX.Element => (
      <>
        <div>
          <SubPanelTemplate title="消防报警" class="fire-alarm">
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
            <div class="body">
              <OperateDays title="报警数" value={alarmCon.value.count} class="body-num">
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
            </div>
          </SubPanelTemplate>
          <SubPanelTemplate title="报警区域Top5">
            <template>
              {" "}
              <DateInlineForm
                modelValue={areaAlarmDate.value}
                onUpdate:modelValue={(v) => {
                  areaAlarmDate.value = v;
                }}
                onSearch={changeAreaAlarmDate}
              />
            </template>
            <div class="body" style="min-height: 250px;">
              {eventAlarmData.list.map((item, index) => (
                <EventAlarmItem
                  key={index}
                  sort={index + 1}
                  name={item.name}
                  linkRatio={item.chainRatio}
                  count={item.alarmNum}
                  ratio={item.ratio + "%"}
                />
              ))}
            </div>
            <div class="body" style="min-height: 250px;">
              {" "}
              <noData></noData>
            </div>
          </SubPanelTemplate>
        </div>
      </>
    );
  },
});

export default FireLeft;
