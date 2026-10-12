import dayjs from "dayjs";
import { List, PullRefresh, Search, Popup } from "vant";
import { computed, defineComponent, onMounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import { CubeNavBar } from "@ghcloud/cube-app-generic-component";
import type { GridTaskDTO } from "@ghcloud/cube-grid-management-service";

import { useGridState } from "../grid-info-store";
import { cubeGridManagementService, cubeOuaaService } from "@/api/server";

import styles from "./index.module.less";

export const TaskList = defineComponent({
  setup: () => {
    type TodayTimeParams = {
      period: string;
    };
    const getTodayTimeParams = (): TodayTimeParams => {
      const period = `${dayjs().startOf("day").format("YYYY-MM-DD HH:mm:ss")},${dayjs().endOf("day").format("YYYY-MM-DD HH:mm:ss")}`;
      return { period };
    };
    const route = useRoute();
    const fromOverview = computed(() => route.query.source === "overview");
    const gridState = useGridState();
    const router = useRouter();
    const state = reactive({
      refreshing: false,
      loading: false,
      finished: false,
      list: [] as GridTaskDTO[],
      showGridFilter: false,
      params: {
        pageNumber: 1,
        pageSize: 10,
        keyword: "",
      },
    });
    onMounted(() => {
      state.finished = true;
      getTaskList();
    });
    const handleRefresh = (): void => {
      // TODO: 刷新网格列表
      state.list = [];
      state.params.pageNumber = 1;
      getTaskList();
      state.refreshing = false;
    };
    const handleOnLoad = async () => {
      // TODO: 加载更多网格
      state.params.pageNumber += 1;
      await getTaskList();
    };
    const userId = ref("");
    const getQueryUserIds = (user: { id: string }): string[] => {
      const raw = route.query.userIds;
      const list = Array.isArray(raw) ? raw : typeof raw === "string" ? raw.split(",") : [];
      const ids = list.map((id) => String(id || "").trim()).filter((id) => !!id);
      return ids.length > 0 ? Array.from(new Set(ids)) : [user.id];
    };
    const getTaskList = async () => {
      const user = await cubeOuaaService.getUserMine();
      userId.value = user.id;
      state.loading = true;
      const timeParams = fromOverview.value ? {} : getTodayTimeParams();
      const res = await cubeGridManagementService.getMyGridTaskList({
        ...state.params,
        gridAreaId: (route.query.areaId as string) || gridState.getGridInfo().gridAreaId,
        taskStatus: route.query.status as string,
        userIds: getQueryUserIds(user),
        dailyType: "GRID_MANAGE",
        ...timeParams,
      } as {
        pageNumber: number;
        pageSize: number;
        keyword: string;
        gridAreaId: string;
        taskStatus: string;
        userIds: string[];
        dailyType: string;
      } & Partial<TodayTimeParams>);
      state.loading = false;
      state.list = [...state.list, ...res.records];
      if (state.params.pageNumber >= res.pages) {
        state.finished = true;
      } else {
        state.finished = false;
      }
    };
    const handleSearch = (): void => {
      state.params.pageNumber = 1;
      getTaskList();
    };
    const toDetail = (id: string, businessType: string): void => {
      window.location.href = `/apps/daily-task/h5#/task-detail?id=${id}`;
      switch (businessType) {
        case "INSPECTION":
          if (userId.value) window.location.href = `/apps/daily-inspection/h5#/inspection-detail?id=${id}&userId=${userId.value}`;
          break;
        case "ELECTRON_TASK":
          window.location.href = `/apps/electronic-patrol/h5#/patrol-task-detail?taskId=${id}`;
          break;
        default:
          window.location.href = `/apps/daily-task/h5#/task-detail?id=${id}`;
          break;
      }
    };
    return (): JSX.Element => (
      <>
        <CubeNavBar title="任务列表" />
        <div class={styles["search-container"]}>
          <Search v-model={state.params.keyword} placeholder="任务名称进行搜索" onSearch={handleSearch} />
        </div>
        <PullRefresh v-model={state.refreshing} class={styles["pull-refresh"]} onRefresh={handleRefresh}>
          <List v-model:loading={state.loading} finished={state.finished} finished-text="没有更多了" onLoad={handleOnLoad}>
            <div class={styles["list-container"]}>
              {state.list.map((item) => (
                <div class={styles["task-item"]} key={item.id} onClick={() => toDetail(item.businessKey, item.businessType)}>
                  <div class={styles["task-item-header"]}>
                    <div class={styles["task-item-title"]}>{item.taskName}</div>
                    <div class={[styles["task-item-status"], styles[item.status]]}>{item.status === "TODO" ? "待处理" : "已完成"}</div>
                  </div>
                  <div class={styles["task-item-content"]}>
                    <div class={styles["task-item-content-item"]}>
                      <div class={styles["content-item-label"]}>任务类型:</div>
                      <div class={styles["content-item-value"]}>{item.businessTypeName}</div>
                    </div>
                    <div class={styles["task-item-content-item"]}>
                      <div class={styles["content-item-label"]}>任务时间:</div>
                      <div class={styles["content-item-value"]}>{dayjs(item.taskTime).format("YYYY-MM-DD HH:mm:ss")}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </List>
        </PullRefresh>
      </>
    );
  },
});
