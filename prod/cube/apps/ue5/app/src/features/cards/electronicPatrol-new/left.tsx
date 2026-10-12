import { defineComponent } from "vue";
import { ref, reactive, onMounted } from "vue";

import overviewChartBar from "../hospital/overview-chartBar";
import PatrolContent from "./components/patrol-content";
import DeviceStatistics from "@/features/cards/security-monitoring-safty/device-statistics";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import {
  TaskAbnormal,
  TaskMissing,
  TaskRoute,
  TaskStatistics,
  completionRate,
  electronTaskAbnormal,
  taskAbnormalNum,
} from "@/infrastructure/api/maintain";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import displayPanel from "@/shared-ui/panel/display-panelsafty";

import styles from "./left.module.less";

export const Left = defineComponent({
  name: "Left",
  setup(_props, ctx) {
    const deviceStatisticsData = reactive({
      title: "巡更任务",
      total: 0,
      itemize: [
        {
          name: "待接收",
          label: "执行中",
          value: 0,
          offline: 0,
          key: "OFFLINE",
        },
        {
          name: "已结束",
          label: "异常结束",
          value: 0,
          offline: 0,
          key: "OFFLINE",
        },
      ],
    });
    const patrolData = ref([
      {
        title: "包含巡更路线",
        value: 20,
      },
      {
        title: "涉及巡更点",
        value: 21,
      },
      {
        title: "巡更覆盖率",
        value: 22,
      },
    ]);
    const contentList = ref([
      {
        name: "任务完成率",
        value: 0,
      },
      {
        name: "巡更点漏巡占比",
        value: 0,
      },
      {
        name: "任务完成时常占比",
        value: 0,
      },
      {
        name: "巡更点异常占比",
        value: 0,
      },
    ]);
    const operationsAnalysis = reactive({
      operationsAnalysisTime: {
        timeType: "THIS_YEAR",
        dateRange: [],
      },
      operationsAnalysisXdata: ["4:00", "8:00", "12:00", "16:00", "20:00", "24:00"],
      operationsAnalysisYdata: {
        data: [50, 10, 30, 50, 70, 60],
        name: "平均运行次数",
        color: ["rgba(41, 137, 255, 0.80)", "rgba(41, 137, 255, 0)"],
      },
    });
    const barData = reactive({
      xData: [],
      yData: [
        {
          data: [10, 20, 30, 40],
          name: "",
          color: ["rgba(41, 137, 255, 0.80)", "rgba(41, 137, 255, 0)"],
        },
      ],
    });
    const alarmTimeType = ref({
      timeType: "THIS_YEAR",
      dateRange: [],
    });
    const alarmTimeTypeS = ref({
      timeType: "THIS_YEAR",
      dateRange: [],
    });
    const changeDates = async () => {
      const data = await TaskStatistics({
        period: alarmTimeTypeS.value.dateRange.join(","),
        type: alarmTimeTypeS.value.timeType,
      });
      deviceStatisticsData.total = data.taskNumberStatistics.totalNumber;

      deviceStatisticsData.itemize = [
        {
          name: "待接收",
          label: "执行中",
          value: data.taskStatusStatistics.inExecutionNumber,
          offline: data.taskStatusStatistics.toBeReceivedNumber,
          key: "OFFLINE",
        },
        {
          name: "已结束",
          label: "异常结束",
          value: data.taskStatusStatistics.abnormalFinishedNumber,
          offline: data.taskStatusStatistics.finishedNumber,

          key: "OFFLINE",
        },
      ];
      patrolData.value = [
        {
          title: "包含巡更路线",
          value: data.taskLineStatistics.totalNumber,
        },
        {
          title: "涉及巡更点",
          value: data.taskLineStatistics.locationNumber,
        },
        {
          title: "巡更覆盖率",
          value: data.taskLineStatistics.locationCoverageRate,
        },
      ];
    };
    const changeDate = async () => {
      TaskData();
    };

    const TaskData = async () => {
      const data = await TaskMissing({ period: alarmTimeType.value.dateRange.join(",") });
      const abnormalNum = await TaskAbnormal({ period: alarmTimeType.value.dateRange.join(",") });
      const abnormal = await taskAbnormalNum({ period: alarmTimeType.value.dateRange.join(",") });
      const completion = await completionRate({ period: alarmTimeType.value.dateRange.join(",") });
      contentList.value[1].value = completion.ratio;
      contentList.value[1].value = data.proportion;
      contentList.value[2].value = abnormalNum.proportion;
      contentList.value[3].value = abnormal.abnormalRatio ? abnormal.abnormalRatio : 0;
    };
    const taskRouteData = async () => {
      const data = await TaskRoute({
        type: operationsAnalysis.operationsAnalysisTime.timeType,
        period: operationsAnalysis.operationsAnalysisTime.dateRange.join(","),
      });
      barData.xData = data.map((item) => {
        return item.routeName;
      });
      barData.yData[0].data = data.map((item) => {
        return item.keepNum;
      });
    };

    return (): JSX.Element => (
      <>
        <div>
          <SubPanelTemplate title="监控设备统计" class="alarm-event">
            <template>
              {" "}
              <DateInlineForm
                modelValue={alarmTimeTypeS.value}
                onUpdate:modelValue={(v) => {
                  alarmTimeTypeS.value = v;
                }}
                onSearch={changeDates}
              ></DateInlineForm>
            </template>
            <DeviceStatistics imgPath="business-icon/triage-queue/7.png" statistic={deviceStatisticsData}></DeviceStatistics>
            <PatrolContent patrol={patrolData.value}></PatrolContent>
          </SubPanelTemplate>
          <SubPanelTemplate title="任务执行情况">
            <template>
              {" "}
              <DateInlineForm
                modelValue={alarmTimeType.value}
                onUpdate:modelValue={(v) => {
                  alarmTimeType.value = v;
                }}
                onSearch={changeDate}
              ></DateInlineForm>
            </template>
            <displayPanel bg-img={"overView16.png"} content-list={contentList.value} showimg={false}></displayPanel>
          </SubPanelTemplate>
          <SubPanelTemplate title="巡更路线">
            <template>
              {" "}
              <DateInlineForm
                modelValue={operationsAnalysis.operationsAnalysisTime}
                onUpdate:modelValue={(v) => {
                  operationsAnalysis.operationsAnalysisTime = v;
                }}
                onSearch={taskRouteData}
              ></DateInlineForm>
            </template>
            <div class="chart">
              {" "}
              <overviewChartBar title={"次"} xData={barData.xData} yData={barData.yData}></overviewChartBar>
            </div>
          </SubPanelTemplate>
        </div>
      </>
    );
  },
});

export default Left;
