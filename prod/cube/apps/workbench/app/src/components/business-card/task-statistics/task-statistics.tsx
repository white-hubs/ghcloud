import { CarryOutOutlined } from "@ant-design/icons-vue";
import { defineComponent, onBeforeUnmount, onMounted, reactive } from "vue";

import { MFRootEventNameEnum, publisher } from "@ghcloud/cube-mf-root";
import { PeriodStatTypeEnum } from "@ghcloud/cube-protocol";

import { cubeTodoTaskStatService } from "../../../api/service";
import PanelCard from "../../card/card";
import SelectBtn from "../../select-btn/select-btn";

import "./task-statistics.less";

interface DoneTaskItem {
  businessType: string;
  businessTypeName: string;
  total: string;
}

interface TaskStatisticsState {
  timeType: PeriodStatTypeEnum;
  tasksNum: number;
  tasksList: DoneTaskItem[];
  selectList: { label: string; value: PeriodStatTypeEnum }[];
}

export default defineComponent({
  name: "TaskStatistics",
  emits: ["close"],
  setup(_, { emit }) {
    const state = reactive<TaskStatisticsState>({
      timeType: PeriodStatTypeEnum.TODAY,
      tasksNum: 0,
      tasksList: [],
      selectList: [
        { label: "今日", value: PeriodStatTypeEnum.TODAY },
        { label: "本周", value: PeriodStatTypeEnum.THIS_WEEK },
        { label: "本月", value: PeriodStatTypeEnum.THIS_MONTH },
      ],
    });

    let requestId = 0;

    const getData = async (): Promise<void> => {
      const currentId = ++requestId;
      const payload = { timeType: state.timeType };
      const [count, tags] = await Promise.all([
        cubeTodoTaskStatService.getDoneTaskCount(payload),
        cubeTodoTaskStatService.getDoneTaskTags(payload),
      ]);
      if (currentId !== requestId) {
        return;
      }
      state.tasksNum = count;
      state.tasksList = tags;
    };

    const changeType = (timeType: PeriodStatTypeEnum): void => {
      state.timeType = timeType;
      void getData();
    };

    let timer: NodeJS.Timer | null = null;

    onMounted(() => {
      changeType(PeriodStatTypeEnum.TODAY);
      timer = setInterval(getData, 30_000);
    });

    onBeforeUnmount(() => {
      if (timer) {
        clearInterval(timer as NodeJS.Timeout);
      }
    });

    const goTask = async (item?: DoneTaskItem): Promise<void> => {
      publisher.publish(MFRootEventNameEnum.MF_ROOT_TO_APPLICATION, {
        code: "AGENCY_CENTER",
        path: item ? `/portal/agencyCenter/doneList?todoTagCode=${item.businessType}` : "/portal/agencyCenter/doneList",
      });
    };

    return (): JSX.Element => (
      <PanelCard title="任务处理统计" icon="icon-renwuchulitongji" onClose={() => emit("close")}>
        {{
          btn: () => (
            <>
              <SelectBtn list={state.selectList} onChange={changeType} />
              <a onClick={() => goTask()}>查看全部 &gt;</a>
            </>
          ),
          default: () => (
            <div class="task-statistics-container">
              <div class="task-statistics-summary" onClick={() => goTask()}>
                <div class="task-statistics-icon">
                  <CarryOutOutlined />
                </div>
                <div>
                  <span>已办总计</span>
                  <strong>{state.tasksNum}</strong>
                  <em>条</em>
                </div>
              </div>
              <div class="task-statistics-item">
                {state.tasksList.map((item) => (
                  <button key={item.businessType} type="button" onClick={() => goTask(item)}>
                    <span>{item.businessTypeName}</span>
                    <strong>{item.total}</strong>
                  </button>
                ))}
              </div>
            </div>
          ),
        }}
      </PanelCard>
    );
  },
});
