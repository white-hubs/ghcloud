import { defineComponent } from "vue";
import { onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";

import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { alarmStatistics, statisticsLevel, statisticsTrend } from "@/infrastructure/api/alarm";
import { AlarmLevelType } from "@/infrastructure/api/models/alarm";
import AlarmStatisticsItem from "@/shared-ui/panel/alarmStatisticsItem";
import Pie3D from "@/shared-ui/panel/charts/pie/pie";
import RatePie from "@/shared-ui/panel/charts/ratePie/ratePie";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import LineChart from "@/shared-ui/panel/lineChart";
import { ModelValueItf } from "@/shared-ui/panel/types";
import { storeMenu } from "@/visualization-core/stores/menu";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import styles from "./left.module.less";

export const Left = defineComponent({
  name: "Left",
  setup(_props, ctx) {
    let timer: any = reactive(null);
    const { globalState } = useStateStore();
    let timeFrame = ref<ModelValueItf>();
    let topTimeFrame = ref<ModelValueItf>();
    let handleTime = ref<ModelValueItf>();
    let xData = ref<string[]>([]);
    let yData = ref<number[]>([]);
    const fakeData = ref<AlarmLevelType[]>([
      {
        alarmNum: 0,
        name: "一级报警",
        chainRatio: 0,
        isGrow: false,
      },
    ]);
    let alarmProportion = ref({
      handle: 0,
      really: 0,
    });
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
    // 报警统计
    function changeTimeFrame() {
      getAlarmStatistics();
    }
    // 获取处理占比和真实占比
    async function getAlarmStatistics() {
      let params = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        period: timeFrame.value.dateRange.join(","),
      };
      let res: any = await alarmStatistics(params);
      if (res.alarmNum && res.alarmNum !== 0) {
        alarmProportion.value.really = Math.round((res.alarmActualNum / res.alarmNum) * 10000) / 100.0;
        alarmProportion.value.handle = Math.round((res.alarmHandlerNum / res.alarmNum) * 10000) / 100.0;
      } else {
        alarmProportion.value.really = 0;
        alarmProportion.value.handle = 0;
      }
    }
    // 报警级别分布
    function changeTopTimeFrame() {
      getAlarmLevel();
    }
    // 获取报警级别分布数据
    async function getAlarmLevel() {
      let params = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        period: topTimeFrame.value.dateRange.join(","),
        type: topTimeFrame.value.timeType,
      };
      let res = await statisticsLevel(params);
      fakeData.value = res.map((item) => {
        item.chainRatio <= 0 ? (item.isGrow = false) : (item.isGrow = true);
        item.name += "报警";
        return item;
      });
    }
    // 报警趋势
    function changeHandleTime() {
      getAlarmsNumber();
    }
    let lineChart = ref();
    async function getAlarmsNumber() {
      let params = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        period: handleTime.value.dateRange.join(","),
        type: handleTime.value.timeType,
      };
      xData.value = [];
      yData.value = [];
      let Trend = await statisticsTrend(params);
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
      lineChart.value.render();
    }
    const init = () => {
      getAlarmLevel();
      getAlarmsNumber();
    };
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
          <SubPanelTemplate title="报警统计">
            <template>
              {" "}
              <DateInlineForm
                modelValue={timeFrame.value}
                onUpdate:modelValue={(v) => {
                  timeFrame.value = v;
                }}
                onSearch={changeTimeFrame}
              />
            </template>
            <div class="rate-pie-chart">
              <RatePie value={alarmProportion.handle} title="报警处理占比" color="#5AD0EA" class="rate-pie" />
              <RatePie value={alarmProportion.really} title="报警真实占比" class="rate-pie" />
            </div>
          </SubPanelTemplate>
          <SubPanelTemplate title="报警级别统计" class="alarm-level">
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
              <div class="chart">
                {" "}
                <Pie3D data={fakeData.value} label-key="name" value-key="alarmNum" />
              </div>
              <div class="footer">
                {fakeData.map((item, index) => (
                  <AlarmStatisticsItem
                    key={item.name}
                    level={index + 1}
                    alarmNum={item.alarmNum}
                    chainRatio={item.chainRatio}
                    name={item.name}
                    is-grow={item.isGrow}
                  />
                ))}
              </div>
            </div>
          </SubPanelTemplate>
          <SubPanelTemplate title="报警趋势" class="alarm-trend">
            <template>
              {" "}
              <DateInlineForm
                modelValue={handleTime.value}
                onUpdate:modelValue={(v) => {
                  handleTime.value = v;
                }}
                onSearch={changeHandleTime}
              ></DateInlineForm>
            </template>
            <div class="chart">
              <LineChart
                ref="lineChart"
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
        </div>
      </>
    );
  },
});

export default Left;
