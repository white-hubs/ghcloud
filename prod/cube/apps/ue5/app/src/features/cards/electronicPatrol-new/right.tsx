import { defineComponent } from "vue";
import { ref, reactive, onMounted } from "vue";

import modalCommandDispatch from "./components/modal-command-dispatch";
import DeviceStatistics from "@/features/cards/security-monitoring-safty/device-statistics";
import RollTable from "@/features/panel-shell/tables/roll-table/roll-table";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { TaskAbnormalTop, electronArea, taskAbnormalList, taskAbnormalNum } from "@/infrastructure/api/maintain";
import elevatorAnalysisPie from "@/shared-ui/panel/charts/pie/elevator-analysis-pie";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import elevatorAnalysisList from "@/shared-ui/panel/elevator-analysis-list";
import EventAlarmItem from "@/shared-ui/panel/eventAlarmItem";

import styles from "./right.module.less";

export const Right = defineComponent({
  name: "Right",
  setup(_props, ctx) {
    const deviceStatisticsData = reactive({
      title: "巡更点总数",
      total: 0,
    });
    const taskStatisticsData = reactive({
      title: "异常任务数",
      total: 0,
      itemize: [
        {
          label: "未处理数",
          name: "已处理数",
          value: 0,
          offline: 0,
        },
      ],
    });
    const commandParameter = ref<Record<string, any>>({
      id: "",
    });
    const commandModalShow = ref<boolean>(false);
    const areaAlarmRank = ref([]);
    const alarmTimeTypeS = ref({
      timeType: "THIS_YEAR",
      dateRange: [],
    });
    const taskExceptionTime = ref({
      timeType: "THIS_YEAR",
      dateRange: [],
    });
    const detectionData = ref([]);
    const patrolData = ref([]);
    const column = [
      {
        title: "任务名称",
        dataIndex: "taskName",
      },
      {
        title: "时间段",
        dataIndex: "timePeriod",
      },
      {
        title: "状态",
        dataIndex: "state",
      },
      {
        title: "执行人",
        dataIndex: "username",
      },
    ];
    const changeDates = () => {
      abnormalTop();
    };
    const abnormalTop = async () => {
      const data = await TaskAbnormalTop({ period: alarmTimeTypeS.value.dateRange.join(","), type: alarmTimeTypeS.value.timeType });
      areaAlarmRank.value = data.map((item) => {});
    };
    const changePatrol = async () => {
      const colors = ["#29C2FF", "#74AEE7", "#FFC700", "#655DD1", "#B9D9FF", "#6EE3E1"];
      const res = await electronArea({});
      deviceStatisticsData.total = res.total;
      //  detectionData.value = res.locationAreaList.map((e,index)=>{
      //   return {
      //     areaId:e.areaId,
      //     name:e.areaName,
      //     value:e.num,
      //     color:colors[index]
      //   }
      //  })
      res.locationAreaList.sort((a, b) => {
        return b.num - a.num;
      });
      let other = 0;
      res.locationAreaList.forEach((item, index) => {
        if (index <= 2) {
          detectionData.value.push({
            areaId: item.areaId,
            name: item.areaName,
            value: item.num,
            color: colors[index],
          });
        } else {
          other += item.num;
        }
      });
      if (res.locationAreaList.length > 3) {
        detectionData.value.push({
          name: "其他",
          value: other,
          color: "#19F8F7",
        });
      }
    };
    const changeTaskException = async () => {
      const res = await taskAbnormalNum({ type: taskExceptionTime.value.timeType, period: taskExceptionTime.value.dateRange.join(",") });
      const data = await taskAbnormalList({
        type: taskExceptionTime.value.timeType,
        period: taskExceptionTime.value.dateRange.join(","),
        pageNumber: 1,
        pageSize: 50,
      });
      taskStatisticsData.total = res.abnormalNum;
      taskStatisticsData.itemize[0].value = res.undoNum;
      taskStatisticsData.itemize[0].offline = res.finishedNum;
      patrolData.value = data.records;
    };
    const clickRow = async (params) => {
      commandParameter.value.id = params.taskId;
      commandModalShow.value = true;
    };
    onMounted(() => {
      abnormalTop();
      changePatrol();
    });

    return (): JSX.Element => (
      <>
        <div>
          <SubPanelTemplate title="巡更点分布情况" class="alarm-event">
            <DeviceStatistics imgPath="business-icon/triage-queue/9.png" statistic={deviceStatisticsData}></DeviceStatistics>
            <div class="elevator-analysis">
              <div class="chart">
                <elevator-analysis-pie pieData={detectionData.value}>
                  <div style="color: #fff;text-align: center;font-size: 0.072rem;"> {deviceStatisticsData.total}</div>
                  <div style="color: #fff;text-align: center;font-size: 0.072rem;"> 总量</div>
                </elevator-analysis-pie>
              </div>
              <elevatorAnalysisList contentList={detectionData.value} class="pie_list"></elevatorAnalysisList>
            </div>
          </SubPanelTemplate>
          <SubPanelTemplate title="巡更点异常Top5">
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
            <div class="body" style="min-height: 1.04166rem">
              {areaAlarmRank.map((item, index) => (
                <EventAlarmItem sort={index + 1} name={item.name} count={item.num} ratio={item.ratio + "%"} />
              ))}
            </div>
          </SubPanelTemplate>
          <SubPanelTemplate title="任务异常记录">
            <template>
              {" "}
              <DateInlineForm
                modelValue={taskExceptionTime.value}
                onUpdate:modelValue={(v) => {
                  taskExceptionTime.value = v;
                }}
                onSearch={changeTaskException}
              ></DateInlineForm>
            </template>
            <DeviceStatistics imgPath="business-icon/triage-queue/9.png" statistic={taskStatisticsData}></DeviceStatistics>
            <div class="roll-table">
              {" "}
              <RollTable onClickRow={clickRow} column={column} data={patrolData.value}></RollTable>
            </div>
          </SubPanelTemplate>
          <modal-command-dispatch
            show-modal={commandModalShow.value}
            onClose={() => {
              commandModalShow.value = false;
            }}
            parameter={commandParameter}
          ></modal-command-dispatch>
        </div>
      </>
    );
  },
});

export default Right;
