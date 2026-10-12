import { useGridState } from "./grid-info-store";
import styles from "./index.module.less";
import { cubeGridManagementService } from "@/api/server";
const GM_IMG = "/resource/v1/grid-management/images/grid-list";
const controlImage = `${GM_IMG}/grid-control.png`;
const gridCountIcon = `${GM_IMG}/grid-count-icon.png`;
const gridUserIcon = `${GM_IMG}/grid-user.png`;
import { CubeNavBar } from "@ghcloud/cube-app-generic-component";
import type { GridDTO } from "@ghcloud/cube-grid-management-service";
import { PullRefresh, List, Button } from "vant";
import { defineComponent, onMounted, reactive } from "vue";
import { useRouter } from "vue-router";
export const GridList = defineComponent({
  setup: () => {
    const state = reactive({
      refreshing: false,
      loading: false,
      finished: false,
      list: [] as GridDTO[],
      stat: {
        gridCount: 0,
        onDutyGridLeaderCount: 0,
      },
      params: {
        pageNumber: 1,
        pageSize: 10,
      },
    });
    const router = useRouter();
    const rightSlot = (): JSX.Element => (
      <div class={styles["nav-icons"]}>
        {/* <img src={filterImage} alt="" /> */}
        <img
          src={controlImage}
          alt=""
          onClick={() => {
            router.replace({
              path: "/grid-list-visual",
            });
          }}
        />
      </div>
    );
    const getGridList = async () => {
      state.loading = true;
      const res = await cubeGridManagementService.getGridList({
        ...state.params,
      });
      state.loading = false;
      state.list = [...state.list, ...res.records];
      if (state.params.pageNumber >= res.pages) {
        state.finished = true;
      }
    };
    const getGridStat = async () => {
      const res = await cubeGridManagementService.getGridStat();
      state.stat = res;
    };
    const handleRefresh = async () => {
      state.params.pageNumber = 1;
      state.list = [];
      state.finished = false;
      await getGridList();
      state.refreshing = false;
    };
    const handleOnLoad = async () => {
      // TODO: 加载更多网格
      state.params.pageNumber += 1;
      await getGridList();
    };
    const handleGoInfo = (gridInfo: GridDTO): void => {
      // TODO: 跳转到网格详情
      useGridState().setGridInfo(gridInfo);
      router.push({
        path: "/grid-list/info",
      });
    };
    onMounted(() => {
      getGridList();
      getGridStat();
    });
    return (): JSX.Element => (
      <div>
        <CubeNavBar title="网格列表" rightSlot={rightSlot} />
        <div class={styles["container"]}>
          <div class={styles["grid-list-title"]}>
            <span>网格列表</span>
          </div>
          <div class={styles["grid-list-stat"]}>
            <div class={styles["stat-item"]}>
              <div class={styles["stat-count"]}>
                <div class={styles["label"]}>网格数</div>
                <div class={styles["count"]}>{state.stat.gridCount}</div>
              </div>
              <img class={styles["stat-img"]} src={gridCountIcon} alt="" />
            </div>
            <div class={[styles["stat-item"], styles["stat-user"]]}>
              <div class={styles["stat-count"]}>
                <div class={styles["label"]}>当班网格长</div>
                <div class={styles["count"]}>{state.stat.onDutyGridLeaderCount}</div>
              </div>
              <img class={styles["stat-img"]} src={gridUserIcon} alt="" />
            </div>
          </div>
          <div class={styles["grid-list-container"]}>
            <div class={styles["title"]}>网格列表</div>
            <PullRefresh v-model={state.refreshing} class={styles["pull-refresh"]} onRefresh={handleRefresh}>
              <List v-model:loading={state.loading} finished={state.finished} finished-text="没有更多了" onLoad={handleOnLoad}>
                <div class={styles["list-content"]}>
                  {state.list.map((item) => (
                    <div key={item.gridAreaId} class={styles["grid-item"]} onClick={() => handleGoInfo(item)}>
                      <div class={styles["grid-header"]}>{item.gridName}</div>
                      <div class={styles["grid-content"]}>
                        <div class={styles["grid-info"]}>
                          <div class={styles["content-item"]}>
                            <div class={styles["item-label"]}>网格长：</div>
                            <div class={[styles["item-value"], styles["item-manage-list"]]}>
                              {item.gridManagers.map((manager) => (
                                <div class={styles["manage-item"]} key={manager.gridManagerId}>
                                  {manager.avatar && <img src={manager.avatar.path} srcset="" />}
                                  <span>{manager.gridManagerName}</span>
                                  {manager.workStatus && (
                                    <div class={[styles["status"], manager.workStatus === "REST" && styles["status-rest"]]}>
                                      {manager.workStatus === "REST" ? "休息" : "在岗"}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                          <div class={styles["content-item"]}>
                            <div class={styles["item-label"]}>网格员：</div>
                            <div class={styles["item-value"]}>{item.gridMembers.map((item) => item.name).join("、")}</div>
                          </div>
                          <div class={styles["content-item"]}>
                            <div class={styles["item-label"]}>下属区域：</div>
                            <div class={styles["item-value"]}>{item.childAreaName}</div>
                          </div>
                        </div>
                        {item.handoverStatus === "WAIT_HANDOVER" && item.handoverRecordId && (
                          <div
                            class={styles["takeover-action"]}
                            onClick={(event: MouseEvent) => {
                              event.stopPropagation();
                              event.preventDefault();
                              router.push({
                                path: "/grid-list/takeover",
                                query: {
                                  id: item.handoverRecordId,
                                },
                              });
                            }}
                          >
                            <Button size="small" type="primary" plain>
                              待接班
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </List>
            </PullRefresh>
          </div>
        </div>
      </div>
    );
  },
});
