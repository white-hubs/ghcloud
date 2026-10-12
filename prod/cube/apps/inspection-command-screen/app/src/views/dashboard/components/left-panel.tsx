import {
  AppstoreOutlined,
  EyeOutlined,
  OrderedListOutlined,
  RocketOutlined,
  SearchOutlined,
  SwapOutlined,
  StopOutlined,
} from "@ant-design/icons-vue";
import { defineComponent, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";

import { Button, Empty, Input, Progress } from "@ghcloud/cube-ui";

import { TimeFilterBar } from "./time-filter-bar";
import type { TaskItem, TimeFilter } from "@/types/dashboard";

import "./left-panel.less";

const taskStatusClass: Record<TaskItem["status"], string> = {
  待接收: "pending",
  待巡检: "processing",
  已巡检: "done",
  已终止: "stopped",
  已超时: "timeout",
};

export const LeftPanel = defineComponent({
  name: "LeftPanel",
  props: {
    overviewFilter: { type: Object as () => TimeFilter, required: true },
    taskFilter: { type: Object as () => TimeFilter, required: true },
    overview: {
      type: Object as () => { total: number; done: number; undone: number; timeout: number; completionRate: number },
      required: true,
    },
    tasks: { type: Array as () => TaskItem[], required: true },
    taskTotal: { type: Number, required: true },
    taskLoading: { type: Boolean, required: true },
    taskFinished: { type: Boolean, required: true },
    taskKeyword: { type: String, required: false, default: "" },
    selectedTaskId: { type: String, required: false, default: "" },
    onOverviewFilter: { type: Function as unknown as () => (v: TimeFilter) => void, required: true },
    onTaskFilter: { type: Function as unknown as () => (v: TimeFilter) => void, required: true },
    onUpdateTaskKeyword: { type: Function as unknown as () => (v: string) => void, required: true },
    onSearchTaskKeyword: { type: Function as unknown as () => () => void, required: true },
    onLoadMoreTask: { type: Function as unknown as () => () => void, required: true },
    onSelectTask: { type: Function as unknown as () => (task: TaskItem) => void, required: true },
    onTransfer: { type: Function as unknown as () => (task: TaskItem) => void, required: true },
    onTerminate: { type: Function as unknown as () => (task: TaskItem) => void, required: true },
    onViewObject: { type: Function as unknown as () => (task: TaskItem) => void, required: true },
  },
  setup(props) {
    const taskListRef = ref<HTMLDivElement | null>(null);
    const taskLoadSentinelRef = ref<HTMLDivElement | null>(null);
    let taskObserver: IntersectionObserver | null = null;

    const syncTaskObserver = (): void => {
      nextTick(() => {
        taskObserver?.disconnect();
        taskObserver = null;
        if (!taskListRef.value || !taskLoadSentinelRef.value) {
          return;
        }
        taskObserver = new IntersectionObserver(
          ([entry]) => {
            if (entry?.isIntersecting) {
              props.onLoadMoreTask();
            }
          },
          {
            root: taskListRef.value,
            rootMargin: "0px 0px 24px 0px",
            threshold: 0.1,
          },
        );
        taskObserver.observe(taskLoadSentinelRef.value);
      }).catch(() => undefined);
    };

    onMounted(syncTaskObserver);
    watch(() => [props.tasks.length, props.taskLoading, props.taskFinished], syncTaskObserver);

    onBeforeUnmount(() => {
      taskObserver?.disconnect();
      taskObserver = null;
    });

    const isDroneTask = (task: TaskItem): boolean => task.inspectionMode === "DRONE" || task.inspectionMode === "HYBRID";

    return () => (
      <div class="left-panel card-panel">
        <section class="card module-card">
          <div class="card-title">
            <AppstoreOutlined />
            任务总览
          </div>
          <TimeFilterBar value={props.overviewFilter} onChange={props.onOverviewFilter} />
          <div class="stats stagger">
            <div>
              <div class="num">{props.overview.total}</div>
              <div>总数</div>
            </div>
            <div>
              <div class="num success">{props.overview.done}</div>
              <div>已完成</div>
            </div>
            <div>
              <div class="num warning">{props.overview.undone}</div>
              <div>未完成</div>
            </div>
            <div>
              <div class="num danger">{props.overview.timeout}</div>
              <div>已超时</div>
            </div>
          </div>
          <div class="flex-label">
            <span class="label">完成率：</span>
            <Progress percent={props.overview.completionRate} strokeColor={{ from: "#2f7bff", to: "#2dd4bf" }} />
          </div>
        </section>

        <section class="card task-card module-card">
          <div class="card-title">
            <OrderedListOutlined />
            任务列表（{props.taskTotal}条）
          </div>
          <TimeFilterBar value={props.taskFilter} onChange={props.onTaskFilter} />
          <div class="task-search-row">
            <Input
              class="task-search-input"
              placeholder="搜索任务名称"
              value={props.taskKeyword}
              maxlength={50}
              showCount={false}
              allowClear
              onUpdate:value={props.onUpdateTaskKeyword}
              onPressEnter={props.onSearchTaskKeyword}
            />
            <Button class="task-search-button" type="primary" onClick={props.onSearchTaskKeyword}>
              <SearchOutlined />
              搜索
            </Button>
          </div>
          <div class="task-list stagger" ref={taskListRef}>
            {props.tasks.length === 0 && !props.taskLoading ? (
              <Empty class="screen-empty task-empty" description="暂无任务列表数据" />
            ) : (
              props.tasks.map((task) => (
                <div class={["task-item", props.selectedTaskId === task.id ? "active" : ""]} onClick={() => props.onSelectTask(task)}>
                  <div class="task-head">
                    <div class="task-head-main">
                      <strong>{task.name}</strong>
                      {isDroneTask(task) && (
                        <span class="task-drone-badge">
                          <RocketOutlined />
                          {task.inspectionMode === "HYBRID" ? "含无人机" : "无人机"}
                        </span>
                      )}
                    </div>
                    <span class={`task-status task-status-${taskStatusClass[task.status]}`}>{task.status}</span>
                  </div>
                  <div class="task-meta">
                    <span>类型: {task.patrolType}</span>
                    <span>级别: {task.patrolLevel}</span>
                    <span class="obj-count-wrap">
                      {task.inspectionMode === "DRONE" ? "航点数" : "对象数"} <em class="obj-count-num">{task.objectCount}</em>
                    </span>
                  </div>
                  {task.transferredTo && (
                    <div class="task-transfer">
                      已移交：{task.owner} → {task.transferredTo}
                    </div>
                  )}
                  <div class="task-actions">
                    {task.inspectionMode !== "DRONE" && (
                      <Button
                        size="small"
                        onClick={(event) => {
                          event.stopPropagation();
                          props.onViewObject(task);
                        }}
                      >
                        <EyeOutlined />
                        查看对象
                      </Button>
                    )}
                    {task.canTransfer && (
                      <Button
                        size="small"
                        onClick={(event) => {
                          event.stopPropagation();
                          props.onTransfer(task);
                        }}
                      >
                        <SwapOutlined />
                        移交
                      </Button>
                    )}
                    {task.canTerminate && (
                      <Button
                        size="small"
                        danger
                        onClick={(event) => {
                          event.stopPropagation();
                          props.onTerminate(task);
                        }}
                      >
                        <StopOutlined />
                        终止巡检
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
            {props.taskLoading && <div class="task-load-status">加载中...</div>}
            {props.tasks.length > 0 && props.taskFinished && !props.taskLoading && <div class="task-load-status">已加载全部</div>}
            {props.tasks.length > 0 && !props.taskFinished && <div ref={taskLoadSentinelRef} class="task-load-sentinel" />}
          </div>
        </section>
      </div>
    );
  },
});
