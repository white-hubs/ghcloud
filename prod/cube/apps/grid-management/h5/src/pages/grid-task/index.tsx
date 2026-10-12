import styles from "./index.module.less";
import { cubeGridManagementService } from "@/api/server";
const filterPng = '/resource/v1/grid-management/images/grid-list/filter.png';
import { GridTree } from "@/components/grid-tree";
import { CubeNavBar } from "@ghcloud/cube-app-generic-component";
import type { GridTaskDTO } from "@ghcloud/cube-grid-management-service";
import dayjs from "dayjs";
import { List, PullRefresh, Search, Popup } from "vant";
import { defineComponent, onMounted, reactive } from "vue";
import { useRouter } from "vue-router";

export const GridTask = defineComponent({
  setup: () => {
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
      getTaskList();
    });
    const handleRefresh = (): void => {
      // TODO: 刷新网格列表
      state.params.pageNumber = 1;
      state.list = [];
      state.finished = false;
      getTaskList();
      state.refreshing = false;
    };
    const handleOnLoad = async () => {
      // TODO: 加载更多网格
      state.params.pageNumber += 1;
      await getTaskList();
    };
    const handleAddTask = (): void => {
      router.push({
        path: "/grid-task/add",
      });
    };
    const getTaskList = async () => {
      state.loading = true;
      const res = await cubeGridManagementService.getGridTaskList({
        ...state.params,
      });
      state.loading = false;
      state.list = [...state.list, ...res.records];
      if (state.params.pageNumber >= res.pages) {
        state.finished = true;
      }
    };
    const rightSlot = (): JSX.Element => (
      <div class={styles["nav-add"]} onClick={handleAddTask}>
        添加
      </div>
    );
    const handleSearch = (): void => {
      state.params.pageNumber = 1;
      getTaskList();
    };
    const handleConfirmGrid = (grid: { id: string; name: string }) => {
      state.showGridFilter = false;
      getTaskList();
    };
    return (): JSX.Element => (
      <>
        <CubeNavBar title="网格任务" rightSlot={rightSlot} />
        <div class={styles["search-container"]}>
          <Search v-model={state.params.keyword} placeholder="任务名称进行搜索" onSearch={handleSearch} />
          <img
            src={filterPng}
            alt=""
            onClick={() => {
              state.showGridFilter = true;
            }}
          />
        </div>
        <PullRefresh v-model={state.refreshing} class={styles["pull-refresh"]} onRefresh={handleRefresh}>
          <List v-model:loading={state.loading} finished={state.finished} finished-text="没有更多了" onLoad={handleOnLoad}>
            <div class={styles["list-container"]}>
              {state.list.map((item) => (
                <div class={styles["list-item"]} key={item.id}>
                  <div class={styles["list-header"]}>
                    <span>{item.taskName}</span>
                    <div class={styles["item-status"]}>{item.applicationName}</div>
                  </div>
                  <div class={styles["list-content"]}>
                    <div class={styles["content-item"]}>
                      <div class={styles["item-label"]}>任务时间：</div>
                      <div class={styles["item-value"]}>{dayjs(item.taskTime).format("YYYY-MM-DD HH:mm:ss")}</div>
                    </div>
                    <div class={styles["content-item"]}>
                      <div class={styles["item-label"]}>任务类型：</div>
                      <div class={styles["item-value"]}>{item.businessTypeName}</div>
                    </div>
                    <div class={styles["content-item"]}>
                      <div class={styles["item-label"]}>任务状态：</div>
                      <div class={styles["item-value"]}>{item.businessStatusName}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </List>
        </PullRefresh>
        <Popup v-model:show={state.showGridFilter} position="right" style={{ width: "90vw", height: "100vh" }}>
          <GridTree onConfirm={handleConfirmGrid} />
        </Popup>
      </>
    );
  },
});
