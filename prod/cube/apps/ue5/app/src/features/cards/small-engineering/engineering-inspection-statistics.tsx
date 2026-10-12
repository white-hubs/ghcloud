import { defineComponent } from "vue";
import { ref, reactive, onMounted } from "vue";

import inspectTaskDetail from "./components/inspect-detail/inspect-task-detail";
import inspectTaskRecord from "./components/inspect-task-record";
import monitorPanel from "./components/monitor-panel";
import modalTable from "@/features/equipment/modal-table/modal";
import RollTable from "@/features/panel-shell/tables/roll-table/roll-table";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { inspectAnalysisTaskExecuteUser, inspectAnalysisTaskStatistics } from "@/infrastructure/api/maintain";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import { ModelValueItf } from "@/shared-ui/panel/types";

import styles from "./engineering-inspection-statistics.module.less";

export const EngineeringInspectionStatistics = defineComponent({
  name: "EngineeringInspectionStatistics",
  setup(_props, ctx) {
    const inspectParameter = ref({
      id: "",
      businessType: "",
    });
    const inspectListParameter = ref({
      period: [],
      businessType: "SMALL_ENGINEERING",
      result: "",
    });
    const inspectionRecordShow = ref(false);
    const alarmModalShow = ref(false);
    const monitorPanelData = ref([
      {
        imgPath: "overView119.png",
        value: 30,
        ratio: 0,
        name: "工程巡查总数",
      },
      {
        imgPath: "overView120.png",
        value: 2334,
        ratio: 0,
        name: "巡查异常总数",
      },
    ]);
    const typesObj = {
      SPLIT: "待拆解",
      ACCEPT: "待接收",
      EXECUTING: "进行中",
      EXPIRE: "已过期",
      STOP: "已终止",
    };
    const data = ref<any>([]);
    const columns = ref([
      {
        title: "名称",
        dataIndex: "taskName",
      },
      {
        title: "执行人",
        dataIndex: "taskExecuteUser",
      },
      {
        title: "巡查结果",
        dataIndex: "result",
        slots: {
          customRender: "result",
        },
      },
      {
        title: "操作",
        dataIndex: "operate",
        slots: {
          customRender: "operate",
        },
      },
    ]);
    let timeFrame = ref<ModelValueItf>();
    const detail = (item) => {
      inspectParameter.value.id = item.taskId;
      inspectParameter.value.businessType = "SMALL_ENGINEERING";
      alarmModalShow.value = true;
    };
    const close = () => {
      alarmModalShow.value = false;
    };
    const getAlarmLevel = async () => {
      const res = await inspectAnalysisTaskStatistics({
        period: timeFrame.value.dateRange.join(","),
        businessType: "SMALL_ENGINEERING",
      });
      monitorPanelData.value[0].value = res.taskTotalNum;
      monitorPanelData.value[0].ratio = res.taskTotalNumRatio;
      monitorPanelData.value[1].value = res.abnormalTaskNum;
      monitorPanelData.value[1].ratio = res.abnormalTaskNumRatio;

      const value = await inspectAnalysisTaskExecuteUser({
        pageNumber: 1,
        pageSize: 10,
        period: timeFrame.value.dateRange.join(","),
        businessType: "SMALL_ENGINEERING",
      });
      data.value = value.records;
    };
    const handelClickItemize = (value) => {
      inspectionRecordShow.value = true;
      inspectListParameter.value.period = timeFrame.value.dateRange;
      inspectListParameter.value.result = "";
      if (value.name === "巡查异常总数") {
        inspectListParameter.value.result = "ABNORMAL";
      }
    };

    return (): JSX.Element => (
      <>
        <SubPanelTemplate title="工程巡查统计">
          <template>
            {" "}
            <div class="flex-align">
              {" "}
              <DateInlineForm
                modelValue={timeFrame}
                onUpdate:modelValue={(v) => {
                  timeFrame.value = v;
                }}
                onSearch={getAlarmLevel}
              />
            </div>
          </template>
          <div class="monitorPanelBox">
            {monitorPanelData.map((item, index) => (
              <monitorPanel onHandelClickItemize={handelClickItemize} key={item.name} monitorPanelData={item}></monitorPanel>
            ))}
          </div>
          <RollTable column={columns} data={data} showLength={8}>
            <template>
              {record.result === "NORMAL" && <span style="color: #00f27b"> 正常</span>}
              {record.result === "ABNORMAL" ? <span style="color: #f14545"> 异常</span> : null}
              <span> {typesObj[record.result]}</span>
            </template>
            <template>
              {" "}
              <span class="details" onClick={detail(record)}>
                {" "}
                详情
              </span>
            </template>
          </RollTable>
        </SubPanelTemplate>
        {alarmModalShow && (
          <inspectTaskDetail ref="inspectRef" title={"巡查任务详情"} parameter={inspectParameter} onClose={close}></inspectTaskDetail>
        )}
        {inspectionRecordShow && (
          <modal-table
            modalStyle={{ width: "900px" }}
            show={inspectionRecordShow}
            title="巡检统计列表"
            onClose={() => {
              inspectionRecordShow.value = false;
            }}
          >
            {" "}
            <inspect-task-record parameter={inspectListParameter}></inspect-task-record>
          </modal-table>
        )}
      </>
    );
  },
});

export default EngineeringInspectionStatistics;
