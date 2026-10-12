import dayjs from "dayjs";
import { Icon, Popup, Button, Space, Checkbox, showConfirmDialog, showNotify } from "vant";
import { computed, defineComponent, onMounted, reactive } from "vue";
import { useRouter } from "vue-router";

import type { AlarmRecord } from "@ghcloud/cube-alarm-center-service/src/types/alarm-center";
import { CubeNavBar } from "@ghcloud/cube-app-generic-component";
import type { GridTaskDTO, GridTaskStatDTO, handoverRecordDTO, MyGridDTO } from "@ghcloud/cube-grid-management-service";

import { cubeAlarmCenterService, cubeGridManagementService, cubeOuaaService } from "@/api/server";
import { AlarmCard } from "@/components/alarm-card";
import { TaskCard } from "@/components/task-card";
import { SelectionPopup } from "@/pages/grid-task/add-task/components/selection-popup";

import styles from "./index.module.less";
export const MyGrid = defineComponent({
  setup: () => {
    type GridMember = {
      id: string | number;
      name: string;
    };
    type GridAreaItem = {
      areaId: string;
      areaName: string;
      canEdit?: boolean;
      gridMembers?: GridMember[];
      children?: GridAreaItem[];
    };
    type TodayTimeParams = {
      period: string;
    };
    const getTodayTimeParams = (): TodayTimeParams => {
      const period = `${dayjs().startOf("day").format("YYYY-MM-DD HH:mm:ss")},${dayjs().endOf("day").format("YYYY-MM-DD HH:mm:ss")}`;
      return { period };
    };
    const PAGE_SIZE = 10;
    const state = reactive<{
      showCenter: boolean;
      myGridInfo: MyGridDTO;
      activeGrid: string;
      handoverList: handoverRecordDTO[];
      expandedAreaIds: string[];
      showMemberSelectPopup: boolean;
      editingAreaId: string;
      selectedMemberIds: string[];
      areaMemberMap: Record<string, GridMember[]>;
      userNameMap: Record<string, string>;
      clearMemberMode: boolean;
      selectedClearGridIds: string[];
      clearMemberLoading: boolean;
      taskInfo: {
        taskList: GridTaskDTO[];
        taskStat: GridTaskStatDTO;
      };
      alarmInfo: {
        alarmList: AlarmRecord[];
        alarmStat: GridTaskStatDTO;
      };
      taskPagination: {
        pageNumber: number;
        loading: boolean;
        finished: boolean;
      };
      alarmPagination: {
        pageNumber: number;
        loading: boolean;
        finished: boolean;
      };
    }>({
      showCenter: false,
      handoverList: [],
      expandedAreaIds: [],
      showMemberSelectPopup: false,
      editingAreaId: "",
      selectedMemberIds: [],
      areaMemberMap: {},
      userNameMap: {},
      clearMemberMode: false,
      selectedClearGridIds: [],
      clearMemberLoading: false,
      myGridInfo: {
        user: {
          id: "",
          name: "",
          email: "",
          mobile: "",
          gender: "",
          workStatus: "",
          remark: "",
          username: "",
          password: "",
          enabled: false,
          organization: {
            id: "",
            name: "",
          },
          organizations: [],
          positions: [],
          appointments: [],
          roles: [],
          photographList: [],
          tenants: [],
        },
        gridAreas: [],
      },
      taskInfo: {
        taskList: [],
        taskStat: {
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
      },
      activeGrid: "",
      alarmInfo: {
        alarmList: [],
        alarmStat: {
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
      },
      taskPagination: {
        pageNumber: 0,
        loading: false,
        finished: false,
      },
      alarmPagination: {
        pageNumber: 0,
        loading: false,
        finished: false,
      },
    });
    const router = useRouter();
    onMounted(async () => {
      await getMyGrid();
      getAlarmStat();
      getMyTaskList();
      getAlarmList();
      getMyHandoverList();
      getUserNameMap();
    });
    const getTaskUserIds = (): string[] => {
      const areaList = (state.myGridInfo.gridAreas as GridAreaItem[]) || [];
      const userIds = [state.myGridInfo.user.id];
      const stack = [...areaList];
      while (stack.length > 0) {
        const area = stack.pop();
        if (!area) {
          continue;
        }
        const memberIds = (area.gridMembers || []).map((member) => String(member.id)).filter((id) => !!id);
        userIds.push(...memberIds);
        if (area.children?.length) {
          stack.push(...area.children);
        }
      }
      return Array.from(new Set(userIds.filter((id) => !!id)));
    };
    const getUserNameMap = async () => {
      const users = await cubeOuaaService.getUserList({ enabled: true });
      state.userNameMap = users.reduce(
        (map, item) => {
          map[item.id] = item.name;
          return map;
        },
        {} as Record<string, string>,
      );
    };
    // 查询我的交接列表
    const getMyHandoverList = async () => {
      try {
        const res = await cubeGridManagementService.getMyGridShiftList({
          pageNumber: 1,
          pageSize: 100,
          takeOverUser: state.myGridInfo.user.id,
        });
        state.handoverList = res.records;
        if (state.handoverList.length > 0) {
          state.showCenter = true;
        }
      } catch (error) {
        const { errorMessage } = (error as { toJSON: () => { errorMessage: string } }).toJSON();
        showNotify({ type: "danger", message: errorMessage || "请求失败" });
      }
    };

    const currentHandoverTask = computed(() => {
      if (state.handoverList.length === 0) {
        return null;
      }
      return state.handoverList[0];
    });
    const getMyTaskList = async (pageNumber = 1) => {
      if (state.taskPagination.loading) {
        return;
      }
      state.taskPagination.loading = true;
      const timeParams = getTodayTimeParams();
      try {
        const statPromise =
          pageNumber === 1
            ? cubeGridManagementService.getMyGridTaskStat({
                pageNumber: 1,
                pageSize: 200,
                gridAreaId: state.activeGrid,
                dailyType: "GRID_MANAGE",
                userIds: getTaskUserIds(),
                ...timeParams,
              } as {
                pageNumber: number;
                pageSize: number;
                gridAreaId: string;
                dailyType: string;
                userIds: string[];
              } & TodayTimeParams)
            : Promise.resolve(null);
        const [res, stat] = await Promise.all([
          cubeGridManagementService.getMyGridTaskList({
            pageNumber,
            pageSize: PAGE_SIZE,
            gridAreaId: state.activeGrid,
            userIds: getTaskUserIds(),
            dailyType: "GRID_MANAGE",
            ...timeParams,
          } as {
            pageNumber: number;
            pageSize: number;
            gridAreaId: string;
            userIds: string[];
            dailyType: string;
          } & TodayTimeParams),
          statPromise,
        ]);
        state.taskPagination.pageNumber = pageNumber;
        state.taskInfo.taskList = pageNumber === 1 ? res.records : [...state.taskInfo.taskList, ...res.records];
        state.taskPagination.finished = pageNumber >= res.pages;
        if (stat) {
          state.taskInfo.taskStat = stat;
        }
      } finally {
        state.taskPagination.loading = false;
      }
    };
    const loadMoreTasks = (): void => {
      if (!state.taskPagination.loading && !state.taskPagination.finished) {
        getMyTaskList(state.taskPagination.pageNumber + 1);
      }
    };
    const getAlarmStat = async () => {
      const timeParams = getTodayTimeParams();
      const result = await cubeAlarmCenterService.getAlarmStatusStatistics({
        areaId: state.activeGrid,
        areaLike: false,
        userIds: getTaskUserIds(),
        ...timeParams,
      } as {
        areaId: string;
        areaLike: boolean;
        userIds: string[];
      } & TodayTimeParams);
      const calcList = result.filter((item) => item.alarmStatus !== "TIME_OUT_UN_HANDLER");
      const alarmNum = calcList.reduce((cur, pre) => cur + pre.alarmNum, 0);
      const doneAlarmNum = calcList.find((item) => item.alarmStatus === "ALARM_HANDLER")?.alarmNum || 0;
      state.alarmInfo.alarmStat.alarmNum = alarmNum;
      state.alarmInfo.alarmStat.doneAlarmNum = doneAlarmNum;
    };
    const getAlarmList = async (pageNumber = 1) => {
      if (state.alarmPagination.loading) {
        return;
      }
      state.alarmPagination.loading = true;
      const timeParams = getTodayTimeParams();
      try {
        const res = await cubeAlarmCenterService.getAlarmRecordsPage({
          pageNumber,
          pageSize: PAGE_SIZE,
          userIds: getTaskUserIds(),
          areaIds: state.activeGrid,
          ...timeParams,
        } as {
          pageNumber: number;
          pageSize: number;
          userIds: string[];
          areaIds: string;
        } & TodayTimeParams);
        state.alarmPagination.pageNumber = pageNumber;
        state.alarmInfo.alarmList = pageNumber === 1 ? res.records : [...state.alarmInfo.alarmList, ...res.records];
        state.alarmPagination.finished = pageNumber >= res.pages;
      } finally {
        state.alarmPagination.loading = false;
      }
    };
    const loadMoreAlarms = (): void => {
      if (!state.alarmPagination.loading && !state.alarmPagination.finished) {
        getAlarmList(state.alarmPagination.pageNumber + 1);
      }
    };
    const getMyGrid = async () => {
      const res = await cubeGridManagementService.getMyGrid();
      state.myGridInfo = res;
      state.activeGrid = "";
      state.expandedAreaIds = [];
      state.selectedClearGridIds = [];
      state.clearMemberMode = false;
    };
    const hasChildren = (item: GridAreaItem): boolean => Array.isArray(item.children) && item.children.length > 0;
    const toggleExpand = (areaId: string) => {
      const index = state.expandedAreaIds.indexOf(areaId);
      if (index > -1) {
        state.expandedAreaIds.splice(index, 1);
      } else {
        state.expandedAreaIds.push(areaId);
      }
    };
    const getAreaMembers = (item: GridAreaItem): GridMember[] => {
      if (state.areaMemberMap[item.areaId]) {
        return state.areaMemberMap[item.areaId];
      }
      return item.gridMembers || [];
    };
    const getMemberNames = (item: GridAreaItem): string => {
      const names = getAreaMembers(item)
        .map((member) => member.name)
        .filter((name) => !!name);
      return names.join("、");
    };
    const openEditMembers = (item: GridAreaItem) => {
      if (!item.canEdit) {
        return;
      }
      state.editingAreaId = item.areaId;
      state.selectedMemberIds = getAreaMembers(item).map((member) => String(member.id));
      state.showMemberSelectPopup = true;
    };
    const handleConfirmMembers = async (ids: string[]) => {
      const gridAreaId = state.editingAreaId;
      const memberIds = ids;
      try {
        await cubeGridManagementService.updateGridAreaMembers([
          {
            gridAreaId,
            memberIds,
          },
        ]);
      } catch (error) {
        const { errorMessage } = (error as { toJSON: () => { errorMessage: string } }).toJSON();
        showNotify({ type: "danger", message: errorMessage || "更新网格员失败" });
        return;
      }
      const members = ids.map((id) => ({
        id,
        name: state.userNameMap[id] || "",
      }));
      state.areaMemberMap[state.editingAreaId] = members;
      showNotify({ type: "success", message: "网格员更新成功" });
    };
    const toggleClearGrid = (item: GridAreaItem): void => {
      if (!item.canEdit) {
        return;
      }
      const index = state.selectedClearGridIds.indexOf(item.areaId);
      if (index === -1) {
        state.selectedClearGridIds.push(item.areaId);
      } else {
        state.selectedClearGridIds.splice(index, 1);
      }
    };
    const cancelClearMembers = (): void => {
      state.clearMemberMode = false;
      state.selectedClearGridIds = [];
    };
    const confirmClearMembers = async (): Promise<void> => {
      if (state.selectedClearGridIds.length === 0) {
        showNotify({ type: "warning", message: "请选择需要重置网格员的网格" });
        return;
      }
      try {
        await showConfirmDialog({
          title: "重置网格员",
          message: `确认清空已选择的 ${state.selectedClearGridIds.length} 个网格的网格员吗？`,
        });
      } catch {
        return;
      }
      try {
        state.clearMemberLoading = true;
        await cubeGridManagementService.clearGridAreaMembers([...state.selectedClearGridIds]);
        state.selectedClearGridIds.forEach((gridAreaId) => {
          state.areaMemberMap[gridAreaId] = [];
        });
        showNotify({ type: "success", message: "网格员重置成功" });
        cancelClearMembers();
      } catch (error) {
        const { errorMessage } = (error as { toJSON: () => { errorMessage: string } }).toJSON();
        showNotify({ type: "danger", message: errorMessage || "网格员重置失败" });
      } finally {
        state.clearMemberLoading = false;
      }
    };
    const renderGridRows = (areas: GridAreaItem[], level = 0): JSX.Element[] =>
      areas.map((item) => {
        const isExpanded = state.expandedAreaIds.includes(item.areaId);
        const children = item.children || [];
        const memberNames = getMemberNames(item);
        return (
          <>
            <div
              class={styles["grid-row"]}
              key={item.areaId}
              onClick={() => {
                if (state.clearMemberMode) {
                  toggleClearGrid(item);
                }
              }}
            >
              <div class={styles["grid-col-name"]}>
                <div class={styles["name-content"]} style={{ paddingLeft: `${level * 18}px` }}>
                  {state.clearMemberMode && (
                    <Checkbox
                      class={styles["clear-checkbox"]}
                      modelValue={state.selectedClearGridIds.includes(item.areaId)}
                      disabled={!item.canEdit}
                      shape="square"
                      onClick={(event: Event) => {
                        event.stopPropagation();
                        toggleClearGrid(item);
                      }}
                    />
                  )}
                  <div
                    class={[
                      styles["expand-icon"],
                      hasChildren(item) && isExpanded && styles["expand-icon-open"],
                      !hasChildren(item) && styles["expand-icon-placeholder"],
                    ]}
                    onClick={() => {
                      if (hasChildren(item)) {
                        toggleExpand(item.areaId);
                      }
                    }}
                  >
                    {hasChildren(item) && <Icon name="play" size="10" />}
                  </div>
                  <span>{item.areaName}</span>
                </div>
              </div>
              <div class={styles["grid-col-member"]}>
                <div class={styles["member-text-wrap"]} tabindex={0}>
                  <span class={styles["member-text"]}>{memberNames || "-"}</span>
                  {memberNames && <div class={styles["member-tooltip"]}>{memberNames}</div>}
                </div>
                {!state.clearMemberMode && item.canEdit && (
                  <Icon name="edit" class={styles["edit-icon"]} onClick={() => openEditMembers(item)} />
                )}
              </div>
            </div>
            {hasChildren(item) && isExpanded && renderGridRows(children, level + 1)}
          </>
        );
      });
    const handleCheckHandover = () => {
      if (state.handoverList.length === 0) {
        return;
      }
      state.showCenter = true;
    };
    const handleConfirm = () => {
      if (!currentHandoverTask.value?.id) {
        return;
      }
      state.showCenter = false;
      router.push({
        path: "/grid-list/takeover",
        query: {
          id: currentHandoverTask.value.id,
        },
      });
    };
    return (): JSX.Element => (
      <>
        <div class={styles["my-container"]}>
          <CubeNavBar title="我的网格" />
          <div class={styles["container"]}>
            <div class={styles["user-info"]}>
              <div class={styles["avatar"]}>
                <img src="https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg" alt="avatar" />
                <div class={[styles["user-status"], state.myGridInfo.user.workStatus === "REST" && styles["status-rest"]]}>
                  {state.myGridInfo.user.workStatus === "REST" ? "休息" : "在岗"}
                </div>
              </div>
              <div class={styles["user-name"]}>{state.myGridInfo.user.name}</div>
              <div class={styles["user-task"]}>
                <div class={styles["task-header"]}>
                  <div class={styles["task-title"]}>
                    负责的网格<span>{((state.myGridInfo.gridAreas as GridAreaItem[]) || []).length}</span>
                  </div>
                  <div class={styles["task-actions"]}>
                    <div
                      class={styles["handover"]}
                      onClick={() => {
                        state.clearMemberMode = true;
                        state.selectedClearGridIds = [];
                      }}
                    >
                      <Icon name="replay" size="16" />
                      重置网格员
                    </div>
                    <div
                      class={styles["handover"]}
                      onClick={() => {
                        router.push({ path: "/my-grid/handover" });
                      }}
                    >
                      <Icon name="friends" size="16" />
                      交接
                    </div>
                  </div>
                </div>
                <div class={styles["grid-table"]}>
                  <div class={styles["grid-header-row"]}>
                    <div class={styles["grid-col-name"]}>网格</div>
                    <div class={styles["grid-col-member"]}>网格员</div>
                  </div>
                  <div class={styles["grid-body"]}>{renderGridRows((state.myGridInfo.gridAreas as GridAreaItem[]) || [])}</div>
                </div>
                {state.clearMemberMode && (
                  <div class={styles["clear-actions"]}>
                    <Button block round onClick={cancelClearMembers}>
                      取消
                    </Button>
                    <Button block round type="primary" loading={state.clearMemberLoading} onClick={confirmClearMembers}>
                      确认重置（{state.selectedClearGridIds.length}）
                    </Button>
                  </div>
                )}
              </div>
            </div>
            <TaskCard
              taskInfo={state.taskInfo}
              userIds={getTaskUserIds()}
              gridAreaId={state.activeGrid}
              loading={state.taskPagination.loading}
              finished={state.taskPagination.finished}
              onLoadMore={loadMoreTasks}
            />
            <AlarmCard
              alarmInfo={state.alarmInfo}
              userIds={getTaskUserIds()}
              loading={state.alarmPagination.loading}
              finished={state.alarmPagination.finished}
              onLoadMore={loadMoreAlarms}
            />
          </div>
          <SelectionPopup
            v-model:show={state.showMemberSelectPopup}
            type="USER"
            selectedIds={state.selectedMemberIds}
            onConfirm={handleConfirmMembers}
          />
          <Popup v-model:show={state.showCenter} round>
            <div class={styles["handover-popup"]}>
              <div class={styles["title"]}>交接确认</div>
              <div class={styles["avatar"]}>
                <img src="https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg" alt="avatar" />
              </div>
              <div class={styles["content"]}>
                你有一条来自<span>【{currentHandoverTask.value?.shiftOverUserName}】</span>发起的{currentHandoverTask.value?.recordName}
                交班请求，请确认无误进行交班
              </div>
              <div class={styles["buttons"]}>
                <Space direction="vertical" fill>
                  <Button type="primary" round block size="large" onClick={handleConfirm}>
                    确定
                  </Button>
                  <Button
                    type="default"
                    round
                    block
                    size="large"
                    onClick={() => {
                      // 拒绝这一条取下一条
                      state.handoverList.shift();
                      state.showCenter = false;
                      handleCheckHandover();
                    }}
                  >
                    取消
                  </Button>
                </Space>
              </div>
            </div>
          </Popup>
        </div>
      </>
    );
  },
});
