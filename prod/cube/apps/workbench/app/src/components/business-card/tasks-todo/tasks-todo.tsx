import { CarryOutOutlined } from "@ant-design/icons-vue";
import { defineComponent, onBeforeUnmount, onMounted, reactive } from "vue";

import { MFRootEventNameEnum, publisher } from "@ghcloud/cube-mf-root";

import { cubeTodoTaskStatService } from "../../../api/service";
import PanelCard from "../../card/card";

import "./tasks-todo.less";

interface TaskItem {
  businessType: string;
  businessTypeName: string;
  total: number;
}

interface TasksState {
  tasksNum: number;
  tasksList: TaskItem[];
}

export default defineComponent({
  name: "TasksTodo",
  emits: ["close"],
  setup(props, { emit }) {
    const state = reactive<TasksState>({
      tasksNum: 0,
      tasksList: [],
    });

    const getData = async (): Promise<void> => {
      const [count, tags] = await Promise.all([cubeTodoTaskStatService.getTodoTaskCount(), cubeTodoTaskStatService.getTodoTaskTags()]);
      state.tasksNum = count;
      state.tasksList = tags;
    };

    let timer: NodeJS.Timer | null = null;

    onMounted(() => {
      getData();
      timer = setInterval(getData, 30000);
    });

    onBeforeUnmount(() => {
      if (timer) {
        clearInterval(timer as NodeJS.Timeout);
      }
    });

    const handleClose = (): void => {
      emit("close");
    };

    const goTask = async (item?: TaskItem): Promise<void> => {
      publisher.publish(MFRootEventNameEnum.MF_ROOT_TO_APPLICATION, {
        code: "AGENCY_CENTER",
        path: item ? "/portal/agencyCenter/waitingList?businessType=" + item.businessType : "/portal/agencyCenter/waitingList",
      });
    };

    return (): JSX.Element => (
      <PanelCard title="我的待办总览" icon="icon-wodedaibanzonglan" onClose={handleClose}>
        {{
          btn: () => <a onClick={() => goTask()}>查看全部 &gt;</a>,
          default: () => (
            <div class="tasks-container">
              <div class="tasks-summary" onClick={() => goTask()}>
                <div class="tasks-icon">
                  <CarryOutOutlined />
                </div>
                <div>
                  <span>待办总计</span>
                  <strong>{state.tasksNum}</strong>
                  <em>条</em>
                </div>
              </div>
              <div class="tasks-item">
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
