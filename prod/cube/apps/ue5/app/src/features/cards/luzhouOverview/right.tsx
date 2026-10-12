import { defineComponent } from "vue";
import { ref, reactive, toRefs, onMounted, onBeforeUnmount } from "vue";

import overviewChartBar from "../hospital/overview-chartBar";
import GridContainer from "@/features/panel-shell/metrics/grid-container/grid-container";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { statisticsLevel, getstatus, luzhouEquipmentAlarm } from "@/infrastructure/api/alarm";
import { getAssetsImage } from "@/infrastructure/utils/getImage";
import elevatorAnalysisPie from "@/shared-ui/panel/charts/pie/elevator-analysis-pie";
import CountTo from "@/shared-ui/panel/count-to/count-to";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import elevatorAnalysisList from "@/shared-ui/panel/elevator-analysis-list";
import LineChart from "@/shared-ui/panel/lineChart";
import { ModelValueItf } from "@/shared-ui/panel/types";

import styles from "./right.module.less";

export const Right = defineComponent({
  name: "Right",
  setup(_props, ctx) {
    const timer: any = ref(null);
    const receptionTrendsChartData = reactive({
      xData: ["4", "8", "12", "16", "20", "24h"],
      yData: [
        {
          name: "报警次数",
          data: [10, 50, 30, 40, 66, 24, 21, 36, 41, 22],
          showSymbol: true,
          smooth: false,
          linearGradientColor: ["rgba(86, 142, 255, 1)", "rgba(86, 142, 255, 0.1)"],
          lineColor: "rgba(86, 142, 255, 1)",
        },
      ],
    });
    const timeList = [
      { label: "本周", value: "THIS_WEEK" },
      { label: "本月", value: "THIS_MONTH" },
      { label: "今年", value: "THIS_YEAR" },
    ];
    let colorList = ["#EF424A", "#FF8C00", "#FFC700", "#3590FF"];
    const deviceStatistic = ref([]);
    const deviceHandle = ref([]);
    let alarmTotal = ref<number>(334);
    const barData = reactive({
      xData: ["安防报警", "消防报警", "电气报警", "入侵报警"],
      yData: [
        {
          name: "",
          data: [10, 20, 30, 40],
          color: ["rgba(41, 137, 255, 0.80)", "rgba(41, 137, 255, 0)"],
        },
      ],
    });
    const pieData = ref([
      {
        name: "正常",
        value: 300,
        color: "#2AE8BD",
      },
      {
        name: "离线",
        value: 14,
        color: "#2989FF",
      },
      {
        name: "故障",
        value: 10,
        color: "#FFC700",
      },
      {
        name: "告警",
        value: 10,
        color: "#F14545",
      },
    ]);
    const equipmentAlarmData = reactive({
      alarmNum: 1,
      alarmRatio: 0,
    });
    const equipmentAlarmTime = ref<ModelValueItf>({
      timeType: "THIS_WEEK",
      dateRange: [""],
    });
    const alarmLevelTime = ref<ModelValueItf>({
      timeType: "THIS_WEEK",
      dateRange: [""],
    });
    const alarmProcessingTime = ref<ModelValueItf>({
      timeType: "THIS_WEEK",
      dateRange: [""],
    });
    // 报警级别
    const alarmLevelEvent = async () => {
      let params = {
        period: alarmLevelTime.value.dateRange.join(","),
        type: alarmLevelTime.value.timeType,
      };
      let res = await statisticsLevel(params);
      alarmTotal.value = 0;
      deviceStatistic.value = res.map((item, index) => {
        alarmTotal.value += item.alarmNum;
        return {
          alarmStatusName: item.name + "报警",
          alarmNum: item.alarmNum,
          color: colorList[index],
        };
      });
      pieData.value = res.map((item, index) => {
        return {
          name: item.name + "报警",
          value: item.alarmNum,
          color: colorList[index],
        };
      });
    };
    // 报警处理
    const getOrderStatistic = () => {
      getstatus({
        period: alarmProcessingTime.value.dateRange.join(","),
        type: alarmProcessingTime.value.timeType,
      }).then((res) => {
        barData.xData.length = 0;
        barData.yData[0].data.length = 0;
        let colorData = ["#29C2FF", "#FFC700", "#19F8F7", "#00F27B"];
        deviceHandle.value = res.alarmStatusStatistics.map((item, index) => {
          barData.xData.push(item.alarmStatusName);
          barData.yData[0].data.push(item.alarmNum);
          return {
            alarmStatusName: item.alarmStatusName,
            alarmNum: item.alarmNum,
            color: colorData[index],
          };
        });
      });
    };
    // 设备报警
    const getDeviceAlarmInfo = async () => {
      let res = await luzhouEquipmentAlarm({
        period: equipmentAlarmTime.value.dateRange.join(","),
        type: equipmentAlarmTime.value.timeType,
      });

      equipmentAlarmData.alarmNum = res.alarmTargetStatistics.alarmNum;
      equipmentAlarmData.alarmRatio = res.alarmTargetStatistics.chainRatio;
      receptionTrendsChartData.xData.length = 0;
      receptionTrendsChartData.yData[0].data.length = 0;
      let unit = "";
      if (equipmentAlarmTime.value.timeType === "TODAY") {
        unit = "时";
      } else if (equipmentAlarmTime.value.timeType === "THIS_WEEK") {
        unit = "日";
      } else if (equipmentAlarmTime.value.timeType === "THIS_MONTH") {
        unit = "日";
      } else if (equipmentAlarmTime.value.timeType === "THIS_YEAR") {
        unit = "月";
      }
      res.alarmTargetTrend.forEach((item) => {
        receptionTrendsChartData.xData.push(item.period + unit);
        receptionTrendsChartData.yData[0].data.push(item.alarmNum);
      });
    };
    const changeHandleEquipmentAlarmTime = () => {
      getDeviceAlarmInfo();
    };
    const changeHandleAlarmLevelTime = () => {
      alarmLevelEvent();
    };
    const changeHandleAlarmProcessingTime = () => {
      getOrderStatistic();
    };
    onMounted(() => {
      equipmentAlarmTime.value.timeType = "THIS_WEEK";
      alarmProcessingTime.value.timeType = "THIS_WEEK";
      alarmLevelTime.value.timeType = "THIS_WEEK";
      // timer.value = setInterval(() => {
      //     init();
      // }, (window as any).config.pageLoopRequestTime);
    });
    onBeforeUnmount(() => {
      clearInterval(timer.value);
    });

    return (): JSX.Element => (
      <>
        <div>
          <SubPanelTemplate title="报警总览">
            <template>
              {" "}
              <DateInlineForm
                timeList={timeList}
                modelValue={equipmentAlarmTime.value}
                onUpdate:modelValue={(v) => {
                  equipmentAlarmTime.value = v;
                }}
                onSearch={changeHandleEquipmentAlarmTime}
              ></DateInlineForm>
            </template>
            <div class="monitorPanel">
              <div class="monitorPanel-left">
                <div class="bg">
                  <img src={getAssetsImage("overView4.png")} alt />
                  <img class="rotate aniamtion-electric-fan" src={getAssetsImage("overView21.png")} alt />
                </div>
              </div>
              <div class="monitorPanel-right">
                <div class="monitorPanel_title"> 报警总量</div>
                <div class="count">
                  {" "}
                  <count-to startVal={0} endVal={equipmentAlarmData.alarmNum} separator></count-to>
                </div>
                <div class="ringRatio">
                  <span> 环比</span>
                  <div class={["downtriangle", equipmentAlarmData.alarmRatio > 0 && "uptriangle"]}></div>
                  <div class={[equipmentAlarmData.alarmRatio > 0 ? "up" : "down"]}>{equipmentAlarmData.alarmRatio + "%"}</div>
                </div>
              </div>
            </div>
            <div class="char" style="height: 155px;">
              {" "}
              <LineChart
                x-data={receptionTrendsChartData.xData}
                series={receptionTrendsChartData.yData}
                showLegend={false}
                gridTop="15"
                unit={{ x: "", y: "次数" }}
              />
            </div>
          </SubPanelTemplate>
          <SubPanelTemplate title="报警级别">
            <template>
              {" "}
              <DateInlineForm
                timeList={timeList}
                modelValue={alarmLevelTime.value}
                onUpdate:modelValue={(v) => {
                  alarmLevelTime.value = v;
                }}
                onSearch={changeHandleAlarmLevelTime}
              ></DateInlineForm>
            </template>
            <div style="padding: 10px 0;">
              <GridContainer data={deviceStatistic.value}></GridContainer>
              <div class="elevator-analysis">
                <elevator-analysis-pie class="char" style="width: 140px;" pieData={pieData.value} radius={"75"}>
                  <div style="color: #fff;text-align: center;font-size: 16px;"> {alarmTotal.value}</div>
                  <div style="color: #fff;text-align: center;font-size: 14px;"> 总量</div>
                </elevator-analysis-pie>
                <elevatorAnalysisList contentList={pieData.value} style="margin-left: 10px;"></elevatorAnalysisList>
              </div>
            </div>
          </SubPanelTemplate>
          <SubPanelTemplate title="报警处理">
            <template>
              {" "}
              <DateInlineForm
                timeList={timeList}
                modelValue={alarmProcessingTime.value}
                onUpdate:modelValue={(v) => {
                  alarmProcessingTime.value = v;
                }}
                onSearch={changeHandleAlarmProcessingTime}
              ></DateInlineForm>
            </template>
            <div style="padding: 10px 0;">
              <GridContainer data={deviceHandle.value}></GridContainer>
              <div style="height: 200px;">
                {" "}
                <overviewChartBar xData={barData.xData} yData={barData.yData}></overviewChartBar>
              </div>
            </div>
          </SubPanelTemplate>
        </div>
      </>
    );
  },
});

export default Right;
