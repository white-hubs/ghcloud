import { useGridState } from "../grid-info-store";
import { cubeAlarmCenterService, cubeGridManagementService } from "@/api/server";

import styles from "./index.module.less";
const GM_IMG = "/resource/v1/grid-management/images/grid-list";
const assetIcon = `${GM_IMG}/asset-icon.png`;
const deviceIcon = `${GM_IMG}/device-icon.png`;
const filterImage = `${GM_IMG}/filter.png`;
const gearIcon = `${GM_IMG}/gear-icon.png`;
const listImage = `${GM_IMG}/list.png`;
const patrolIcon = `${GM_IMG}/patrol-icon.png`;
const pointIcon = `${GM_IMG}/point-icon.png`;
import dayjs from "dayjs";
import { Popup, showLoadingToast, Skeleton } from "vant";
import { defineComponent, onMounted, reactive, ref, watch } from "vue";
import { useRouter } from "vue-router";

import { CubeNavBar } from "@ghcloud/cube-app-generic-component";
import type { GridDTO, ModelConfig } from "@ghcloud/cube-grid-management-service";
import type { AreaTree as AreaTreeType } from "@ghcloud/cube-mdata-service";

import { GridTree } from "@/components/grid-tree";
import { ModelRender } from "@/components/model-render/model-render";

export const GridListVisual = defineComponent({
  setup: () => {
    type TodayTimeParams = {
      period: string;
    };
    const getTodayTimeParams = (): TodayTimeParams => {
      const period = `${dayjs().startOf("day").format("YYYY-MM-DD HH:mm:ss")},${dayjs().endOf("day").format("YYYY-MM-DD HH:mm:ss")}`;
      return { period };
    };
    const router = useRouter();
    const selectArea = ref<AreaTreeType>();
    const queryLoading = ref(true);
    const objectStatLoading = ref(true);
    const taskStatLoading = ref(true);
    const showError = ref(false);
    const modelConfig = ref<ModelConfig>();
    const popupVisible = ref(false);
    const generateGridInfo = () => ({
      gridAreaId: "",
      gridName: "",
      gridDepartmentId: "",
      gridDepartmentName: "",
      childAreaName: "",
      gridManagers: [],
      gridMembers: [],
      gridMemberNames: [],
    });
    const gridInfo = ref<GridDTO>(generateGridInfo());
    const state = reactive({
      gridSubordinateStat: {
        deviceCount: 0,
        patrolLocationCount: 0,
        propertyCount: 0,
        scenePointCount: 0,
        stallCount: 0,
      },
      statInfo: {
        totalNum: 0,
        doneTotalNum: 0,
        normalNum: 0,
        doneNormalNum: 0,
        alarmNum: 0,
        doneAlarmNum: 0,
        approveNum: 0,
        doneApproveNum: 0,
        faultOrderNum: 0,
      },
    });
    const rightSlot = (): JSX.Element => (
      <div class={styles["nav-icons"]}>
        <img
          src={filterImage}
          alt=""
          onClick={() => {
            popupVisible.value = true;
          }}
        />
        <img
          src={listImage}
          alt=""
          onClick={() => {
            router.replace({
              path: "/grid-list",
            });
          }}
        />
      </div>
    );
    // 通过List改造
    const getGridInfo = async () => {
      if (!selectArea.value?.id) {
        return;
      }
      const result = await cubeGridManagementService.getGridList({
        pageNumber: 1,
        pageSize: 1,
        gridAreaIds: [selectArea.value?.id],
      });
      if (!result.records[0]) {
        return;
      }
      gridInfo.value = result.records[0];
    };
    const getObjectStat = async () => {
      try {
        objectStatLoading.value = true;
        const result = await cubeGridManagementService.getGridAreaObjectCountStat({ gridAreaIds: [selectArea.value?.id || ""] });
        const totalStat = result.reduce(
          //@ts-expect-error
          (pre, cur) => {
            cur.deviceCount = pre.deviceCount + cur.deviceCount;
            cur.patrolLocationCount = pre.patrolLocationCount + cur.patrolLocationCount;
            cur.propertyCount = pre.propertyCount + cur.propertyCount;
            cur.scenePointCount = pre.scenePointCount + cur.scenePointCount;
            cur.stallCount = pre.stallCount + cur.stallCount;
            return cur;
          },
          {
            deviceCount: 0,
            patrolLocationCount: 0,
            propertyCount: 0,
            scenePointCount: 0,
            stallCount: 0,
          },
        );
        state.gridSubordinateStat = {
          ...state.gridSubordinateStat,
          ...totalStat,
        };
      } finally {
        objectStatLoading.value = false;
      }
    };
    const getAlarmStat = async () => {
      const timeParams = getTodayTimeParams();
      const result = await cubeAlarmCenterService.getAlarmStatusStatistics({
        areaId: selectArea.value?.id || "",
        areaLike: false,
        ...timeParams,
      } as {
        areaId: string;
        areaLike: boolean;
      } & TodayTimeParams);
      const calcList = result.filter((item) => item.alarmStatus !== "TIME_OUT_UN_HANDLER");
      const alarmNum = calcList.reduce((cur, pre) => cur + pre.alarmNum, 0);
      const doneAlarmNum = calcList.find((item) => item.alarmStatus === "ALARM_HANDLER")?.alarmNum || 0;
      state.statInfo.alarmNum = alarmNum;
      state.statInfo.doneAlarmNum = doneAlarmNum;
    };
    const getTaskStat = async () => {
      try {
        taskStatLoading.value = true;
        const result = await cubeGridManagementService.getMyGridTaskStat({
          pageNumber: 1,
          pageSize: 200,
          gridAreaId: selectArea.value?.id || "",
          dailyType: "GRID_MANAGE",
          ...getTodayTimeParams(),
        } as {
          pageNumber: number;
          pageSize: number;
          gridAreaId: string;
          dailyType: string;
        } & TodayTimeParams);
        state.statInfo = result;
        await getAlarmStat();
      } finally {
        taskStatLoading.value = false;
      }
    };
    const queryData = async () => {
      await Promise.all([getGridInfo(), getObjectStat(), getTaskStat()]);
    };
    const subordinateEntityList: {
      icon: string;
      title: string;
      key: keyof typeof state.gridSubordinateStat;
      path: string;
    }[] = [
      {
        icon: gearIcon,
        title: "档位",
        key: "stallCount",
        path: "",
      },
      {
        icon: deviceIcon,
        title: "设备",
        key: "deviceCount",
        path: "",
      },
      {
        icon: assetIcon,
        title: "资产",
        key: "propertyCount",
        path: "",
      },
      {
        icon: pointIcon,
        title: "现场点",
        key: "scenePointCount",
        path: "",
      },
      {
        icon: patrolIcon,
        title: "巡更点",
        key: "patrolLocationCount",
        path: "",
      },
    ];

    watch(
      () => selectArea.value?.id,
      async () => {
        if (selectArea.value?.id) {
          await queryData();
        }
      },
    );
    onMounted(async () => {
      // 查询网格模型配置
      const toast = showLoadingToast({
        message: "获取模型配置",
        forbidClick: true,
        duration: 0,
      });
      cubeGridManagementService
        .getGridModelVisualizationConfig()
        //@ts-expect-error
        .then((res) => {
          if (!res) {
            showError.value = true;
          }
          modelConfig.value = res as ModelConfig;
          queryLoading.value = false;
        })
        .finally(() => {
          toast.close();
        });
    });
    return (): JSX.Element => (
      <div class={styles["visual-container"]}>
        <CubeNavBar title="网格可视化" rightSlot={rightSlot} />
        <div class={styles["container"]}>
          <div class={styles["model-container"]}>
            <ModelRender areaId={selectArea.value?.id ?? ""} smartCameraPaddingFactor={1.2} pitchDegrees={60} />
          </div>
          <div
            class={styles["market-card"]}
            onClick={() => {
              useGridState().setGridInfo(gridInfo.value);
              router.push({
                path: "/grid-list-visual/info",
                query: {
                  gridAreaId: selectArea.value?.id,
                },
              });
            }}
          >
            <Skeleton loading={objectStatLoading.value} row={4}>
              <div class={styles["market-title"]}>{selectArea.value?.name}</div>
              <div class={styles["card-content"]}>
                <div class={styles["horizontal-list"]}>
                  {subordinateEntityList.map((item) => (
                    <div class={styles["list-item"]} key={item.key}>
                      <img src={item.icon} alt="" />
                      <div class={styles["item-stat"]}>
                        <div class={styles["stat-value"]}>
                          {item.key in state.gridSubordinateStat ? state.gridSubordinateStat[item.key] : 0}
                        </div>
                        <div class={styles["stat-label"]}>{item.title}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Skeleton>
          </div>
          <div class={styles["card-container"]}>
            <Skeleton loading={taskStatLoading.value} row={6}>
              <div class={styles["card-item"]}>
                <div class={styles["card-stat"]}>
                  <div class={styles["stat-label"]}>任务</div>
                  <div class={styles["stat-value"]}>{state.statInfo.totalNum}</div>
                </div>
                <div class={styles["status-stat"]}>
                  <div class={styles["status-item"]}>
                    <div class={styles["status-label"]}>进行中</div>
                    <div class={styles["status-value"]}>{state.statInfo.totalNum - state.statInfo.doneTotalNum}</div>
                  </div>
                  <div class={styles["status-item"]}>
                    <div class={styles["status-label"]}>已完成</div>
                    <div class={styles["status-value"]}>{state.statInfo.doneTotalNum}</div>
                  </div>
                </div>
                <div class={styles["progress-stat"]}>
                  <div class={styles["progress-top"]}>
                    <div class={styles["progress-label"]}>进度</div>
                    <div class={styles["progress-value"]}>
                      {((state.statInfo.doneTotalNum / state.statInfo.totalNum) * 100).toFixed(2)}%
                    </div>
                  </div>
                  <div class={styles["progress-container"]}>
                    <div
                      class={styles["progress-bar"]}
                      style={{ width: `${((state.statInfo.doneTotalNum / state.statInfo.totalNum) * 100).toFixed(2)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              <div class={styles["card-item"]}>
                <div class={[styles["card-stat"], styles["alarm"]]}>
                  <div class={styles["stat-label"]}>报警</div>
                  <div class={styles["stat-value"]}>{state.statInfo.alarmNum}</div>
                </div>
                <div class={styles["status-stat"]}>
                  <div class={styles["status-item"]}>
                    <div class={styles["status-label"]}>进行中</div>
                    <div class={styles["status-value"]}>{state.statInfo.alarmNum - state.statInfo.doneAlarmNum}</div>
                  </div>
                  <div class={styles["status-item"]}>
                    <div class={styles["status-label"]}>已完成</div>
                    <div class={styles["status-value"]}>{state.statInfo.doneAlarmNum}</div>
                  </div>
                </div>
                <div class={styles["progress-stat"]}>
                  <div class={styles["progress-top"]}>
                    <div class={styles["progress-label"]}>处理率</div>
                    <div class={styles["progress-value"]}>
                      {((state.statInfo.alarmNum > 0 ? state.statInfo.doneAlarmNum / state.statInfo.alarmNum : 0) * 100).toFixed(2)}%
                    </div>
                  </div>
                  <div class={styles["progress-container"]}>
                    <div
                      class={styles["progress-bar"]}
                      style={{
                        width: `${((state.statInfo.alarmNum > 0 ? state.statInfo.doneAlarmNum / state.statInfo.alarmNum : 0) * 100).toFixed(2)}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </Skeleton>
          </div>
        </div>
        <Popup
          v-model:show={popupVisible.value}
          position="right"
          lazy-render={false}
          style={{ width: "90vw", height: "100vh", zIndex: 10001 }}
        >
          <GridTree
            onGetAreaTreeData={(data: AreaTreeType[]) => {
              // 递归查询节点与模型配置相匹配的
              const matchNode = (nodes: AreaTreeType[]): AreaTreeType | null => {
                for (const node of nodes) {
                  if (modelConfig.value?.three.modelServer.find((item) => item.area.includes(node.id))) {
                    return node;
                  }
                  if (node.children?.length) {
                    const childNode = matchNode(node.children);
                    if (childNode) {
                      return childNode;
                    }
                  }
                }
                return null;
              };

              const selectedNode = matchNode(data);
              if (selectedNode) {
                selectArea.value = selectedNode;
              } else {
                showError.value = true;
              }
            }}
            onConfirm={(node: { id: string; name: string }) => {
              popupVisible.value = false;
              selectArea.value = node as AreaTreeType;
            }}
          />
        </Popup>
      </div>
    );
  },
});
