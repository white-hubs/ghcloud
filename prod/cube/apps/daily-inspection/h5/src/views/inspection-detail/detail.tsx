import qs from "qs";
import {
  Divider,
  Loading,
  Button,
  Popup,
  Picker,
  showDialog,
  showNotify,
  Checkbox,
  CheckboxGroup,
  List,
  PullRefresh,
  Search,
  Empty,
  Icon,
} from "vant";
import { defineComponent, onMounted, ref, computed, reactive, type VNode } from "vue";
import { useRoute, useRouter } from "vue-router";

import { CubeAppBusinessBridge, cubeAppService } from "@ghcloud/cube-app-js-sdk";
import { getEnvironment } from "@ghcloud/cube-app-js-sdk/src/js/cube-h5-config";
import {
  objectStatusOptions,
  resultOptions,
  type InspectRecordToBusinessVO,
  type TaskDetailType,
} from "@ghcloud/cube-daily-inspection-service";

import { useMetaTitle } from "../hooks/use-meta-title-hook";
import { StatusColor, StatusType, StatusObjectType } from "../my-inspection/type";
import { cubeDailyInspectionService } from "@/api/server";
import { Bar } from "@/components/bar/bar";
import { timeFormat } from "@/utils";
import { refreshNativePatrolInspectOfflineData } from "@/utils/refresh-native-offline-data";
import { updateObjectLocationIfAbsent } from "@/utils/update-object-location";

import styles from "./detail.module.less";
interface FollowingObj {
  location: string;
  inspectionId: string;
  result: string;
  staff: string;
  state: string;
  targetCategory: string;
  targetId: string;
  targetName: string;
  time: number;
  latAndLon: string;
  targetCode: string;
  targetAddress: string;
  areaName?: string;
  recordToBusinessVOS?: InspectRecordToBusinessVO[];
}

export const InspectionDetail = defineComponent({
  setup() {
    useMetaTitle();
    const loading = ref(false);
    const followingList = ref<FollowingObj[]>([]);
    const detail = ref<TaskDetailType>();
    const router = useRouter();
    const route = useRoute();
    const limitTime = ref("");
    const showPicker = ref(false);
    const showObjFilterPicker = ref(false);
    const currentObjFilter = ref<"status" | "result">("status");
    const currentObj = ref();
    // 批量选择相关
    const isBatchMode = ref(false); // 是否处于批量选择模式
    const selectedObjectIds = ref<string[]>([]); // 选中的对象ID列表
    const waitRepairTotal = ref(0);
    const hasWaitRepairObjects = computed(() => waitRepairTotal.value > 0);
    const objListLoading = ref(false);
    const objFinished = ref(false);
    const objRefreshing = ref(false);
    const prevBatchStatus = ref("");
    const objSearch = reactive({
      pageNumber: 0,
      pageSize: 10,
      keyword: "",
      status: "",
      result: "",
    });
    const objStatusOptions = [
      { text: "全部", value: "" },
      ...Object.entries(objectStatusOptions).map(([value, text]) => ({ text, value })),
    ];
    const objResultOptions = resultOptions.map(({ label, value }) => ({ text: label, value }));
    const objFilterPickerColumns = computed(() => (currentObjFilter.value === "status" ? objStatusOptions : objResultOptions));
    const objStatusText = computed(() => objStatusOptions.find((item) => item.value === objSearch.status)?.text ?? "全部");
    const objResultText = computed(() => objResultOptions.find((item) => item.value === objSearch.result)?.text ?? "全部");
    const mapOptions = [
      { text: "高德地图", value: "gdMap" },
      { text: "百度地图", value: "bdMap" },
    ];
    const typeMap = new Map([
      ["DEVICE", "设备"],
      ["STALL", "档位"],
      ["PROPERTY", "资产"],
      ["SITE_POINT", "现场点"],
      ["RISK_SOURCE", "风险源"],
      ["SMALL_ENGINEERING", "小散工程"],
    ]);
    // 巡检记录
    const handleInspectionRecord = (id: string): void => {
      router.push({ path: "/inspection-record", query: { id } });
    };
    // 隐患治理
    const entityObject = ref();
    const handleHiddenDanger = (item: {
      inspectionId: string;
      result: string;
      staff: string;
      state: string;
      targetCategory: string;
      targetId: string;
      targetName: string;
      time: number;
    }): void => {
      entityObject.value = {
        entityId: item.targetId,
        entityName: item.targetName,
        entityType: item.targetCategory,
      };
      const query = new URLSearchParams({
        sourceType: "INSPECTION",
        applicationCode: "INSPECTION",
        sourceEventId: item.inspectionId,
        returnPath: `/inspection-detail?id=${String(detail.value?.id ?? route.query.id ?? "")}`,
        targetId: item.targetId,
        targetCategory: item.targetCategory,
        targetName: item.targetName,
      });
      window.location.href = `/apps/@ghcloud/cube-hazard-governance-h5#/hazard-report?${query.toString()}`;
    };
    const getHazardRelations = (item: FollowingObj): InspectRecordToBusinessVO[] =>
      (item.recordToBusinessVOS ?? []).filter((relation) => relation.businessCategory === "HAZARD_GOVERNANCE");
    const handleHazardDetail = (item: FollowingObj): void => {
      const relation = getHazardRelations(item)[0];
      if (!relation?.businessId) {
        return;
      }
      window.location.href = `/apps/hazard-governance/h5/#/hazards?hazardId=${relation.businessId}`;
    };
    // 故障报修
    const handleFault = (item: {
      inspectionId: string;
      result: string;
      staff: string;
      state: string;
      targetCategory: string;
      targetId: string;
      targetName: string;
      time: number;
    }): void => {
      entityObject.value = {
        entityId: item.targetId,
        entityName: item.targetName,
        entityType: item.targetCategory,
      };
      sessionStorage.setItem("cube-app-maintenance-object-data", JSON.stringify(item));
      sessionStorage.setItem("inspection-object-data", JSON.stringify({ ...item, taskName: "故障单", businessType: "FAULT" }));
      window.location.href = `/streamengineH5/initiating-work-order?processType=ADD&businessType=FAULT`;
    };
    const normal = ref(0);
    const refreshObjStatistics = async (): Promise<void> => {
      const taskId = route.query.id as string;
      if (!taskId) {
        return;
      }
      try {
        const c = await cubeDailyInspectionService.getInspectTaskObjCount({ taskId });
        normal.value = Number(c.completedTargetNum ?? 0);
      } catch {
        normal.value = 0;
      }
    };
    const refreshWaitRepairHint = async (): Promise<void> => {
      const taskId = route.query.id as string;
      if (!taskId) {
        return;
      }
      try {
        const res = await cubeDailyInspectionService.TaskInspectionObjPage({
          id: taskId,
          pageNumber: 1,
          pageSize: 1,
          status: "",
        });
        waitRepairTotal.value = res.total ?? 0;
      } catch {
        waitRepairTotal.value = 0;
      }
    };
    const onLoadObjs = async (): Promise<void> => {
      const taskId = route.query.id as string;
      if (!taskId || !detail.value || detail.value.status === "ACCEPT") {
        objListLoading.value = false;
        objFinished.value = true;
        return;
      }
      try {
        objListLoading.value = true;
        objSearch.pageNumber++;
        const payload: Parameters<typeof cubeDailyInspectionService.TaskInspectionObjPage>[0] = {
          id: taskId,
          pageNumber: objSearch.pageNumber,
          pageSize: objSearch.pageSize,
        };
        const keyword = objSearch.keyword.trim();
        if (keyword) {
          payload.keyword = keyword;
        }
        if (objSearch.status) {
          payload.status = objSearch.status;
        }
        if (objSearch.result) {
          payload.result = objSearch.result;
        }
        const res = await cubeDailyInspectionService.TaskInspectionObjPage(payload);
        if (res.total <= objSearch.pageSize) {
          objFinished.value = true;
        }
        if (res.records.length < objSearch.pageSize) {
          objFinished.value = true;
        }
        if (objSearch.pageNumber === 1) {
          followingList.value = [];
        }
        const mapped = res.records.map((obj) => ({
          ...obj,
          time: typeof obj.time === "string" ? Number(obj.time) : obj.time,
        }));
        followingList.value = [...followingList.value, ...mapped];
      } catch {
        objFinished.value = true;
      } finally {
        objListLoading.value = false;
        objRefreshing.value = false;
      }
    };
    const resetObjListAndReload = (): void => {
      objSearch.pageNumber = 0;
      objFinished.value = false;
      followingList.value = [];
      void onLoadObjs();
    };
    const onObjKeywordSearch = (): void => {
      resetObjListAndReload();
    };
    const onObjFilterChange = (): void => {
      resetObjListAndReload();
    };
    const openObjFilterPicker = (type: "status" | "result"): void => {
      currentObjFilter.value = type;
      showObjFilterPicker.value = true;
    };
    const onObjFilterConfirm = ({
      selectedValues,
      selectedOptions,
    }: {
      selectedValues?: Array<string | number>;
      selectedOptions?: Array<{ value?: string | number }>;
    }): void => {
      const value = String(selectedOptions?.[0]?.value ?? selectedValues?.[0] ?? "");
      if (currentObjFilter.value === "status") {
        objSearch.status = value;
      } else {
        objSearch.result = value;
      }
      showObjFilterPicker.value = false;
      onObjFilterChange();
    };
    const onObjRefresh = (): void => {
      objRefreshing.value = true;
      objSearch.pageNumber = 0;
      objFinished.value = false;
      followingList.value = [];
      void onLoadObjs();
    };
    const getTaskDetail = async (): Promise<void> => {
      loading.value = true;
      try {
        const data = await cubeDailyInspectionService.TaskDetail({ id: route.query.id as string });
        detail.value = data;
        limitTime.value = `${JSON.parse(detail.value.limitTimeJson).day}天${JSON.parse(detail.value.limitTimeJson).hour}时${JSON.parse(detail.value.limitTimeJson).minute}分`;
        await refreshObjStatistics();
        await refreshWaitRepairHint();
        if (detail.value.status === "ACCEPT") {
          followingList.value = [];
          objFinished.value = true;
          return;
        }
        resetObjListAndReload();
      } catch (err) {
        const { errorMessage } = err as { errorMessage: string };
        showNotify({ type: "danger", message: errorMessage ?? "请求错误" });
      } finally {
        loading.value = false;
      }
    };
    onMounted(async () => {
      getTaskDetail();
      const item =
        (sessionStorage.getItem("inspection-object-data") && JSON.parse(sessionStorage.getItem("inspection-object-data") ?? "")) ?? null;
      const flowTaskId = sessionStorage.getItem("flowTaskId");
      try {
        flowTaskId &&
          item &&
          (await cubeDailyInspectionService.InspectRecordToBusiness(item.inspectionId as string, {
            targetCategory: item.targetCategory,
            targetId: item.targetId,
            targetName: item.targetName,
            businessCategory: item.businessType,
            businessId: flowTaskId,
            businessName: `巡检${detail.value?.name ?? ""}发起了${item.targetName}的${item.taskName}`,
          }));
      } catch {}
      sessionStorage.removeItem("flowTaskId");
    });

    // 移交
    const handleTransfer = async (e: Event): Promise<void> => {
      e.stopPropagation();
      router.push({ path: "/choice-staff", query: { action: "transfer", id: detail.value?.id } });
    };
    // 添加协同人
    const handleAddPartner = async (e: Event): Promise<void> => {
      e.stopPropagation();
      router.push({ path: "/choice-staff", query: { action: "add-partner", id: detail.value?.id } });
    };
    const getErrorMessage = (err: unknown): string => {
      const errorObj = err as { errorMessage?: string; message?: string; toJSON?: () => { errorMessage?: string; message?: string } };
      if (typeof errorObj.toJSON === "function") {
        const { errorMessage, message } = errorObj.toJSON();
        return errorMessage || message || "请求失败";
      }
      return errorObj.errorMessage || errorObj.message || "请求失败";
    };
    const handleInspection = async (item: FollowingObj): Promise<void> => {
      try {
        await cubeDailyInspectionService.taskSubmitCheck({ recordIdList: [item.inspectionId] });
      } catch (err) {
        showNotify({ type: "danger", message: getErrorMessage(err) });
        return;
      }
      if (getEnvironment() === "cubeApp" && detail.value?.method === "SCAN_CODE") {
        try {
          // 扫码
          const code = await CubeAppBusinessBridge.handleBusinessScanCode();
          if (!code) {
            return;
          }
          const scanCode = code.includes("https") ? (qs.parse(code)?.code?.toString() ?? code.toString()) : code.toString();
          const data = await cubeDailyInspectionService.getEntityByCode(encodeURIComponent(scanCode.toString()));
          if (item.targetId.toString() === data.entityId?.toString()) {
            await updateObjectLocationIfAbsent({
              entityId: data.entityId?.toString() ?? item.targetId.toString(),
              entityType: data.entityType ?? item.targetCategory,
            });
            router.push({
              path: "/inspection-execute",
              query: {
                taskId: detail.value?.id,
                targetId: data?.entityId,
                recordId: item.inspectionId,
              },
            });
          } else {
            showNotify({ type: "danger", message: "该巡检对象不匹配" });
          }
          return;
        } catch (err) {
          showNotify({ type: "danger", message: getErrorMessage(err) });
          return;
        }
      }
      router.push({
        path: "/inspection-execute",
        query: {
          taskId: detail.value?.id,
          targetId: item.targetId,
          recordId: item.inspectionId,
        },
      });
    };
    const openPicker = (item: FollowingObj): void => {
      if (getEnvironment() === "cubeApp") {
        const latAndLon = item.latAndLon.split(",");
        cubeAppService.openTripartiteMap({
          type: "route",
          latitude: Number(latAndLon[1]),
          longitude: Number(latAndLon[0]),
          address: item.location,
        });
        return;
      }
      const isWeixinBrowser = /micromessenger/i.test(navigator.userAgent);
      if (isWeixinBrowser) {
        showDialog({ message: "请使用浏览器或在应用中打开" });
      } else {
        showPicker.value = true;
        currentObj.value = item;
      }
    };
    // 获取地图路径
    const getMapScheme = (mapType = "gdMap"): string => {
      const u = navigator.userAgent;
      const isAndroid = u.includes("Android") || u.includes("Adr"); // android终端
      const latAndLon = currentObj.value.latAndLon.split(",");
      const androidBaidu = (): string =>
        `bdapp://map/direction?destination=name:${currentObj.value.location}|latlng:${currentObj.value.latAndLon}&coord_type=gcj02&mode=driving&src=andr.jianghu.jianhao`;
      const iosBaidu = (): string =>
        `baidumap://map/direction?destination=name:${currentObj.value.location}|latlng:${currentObj.value.latAndLon}&coord_type=gcj02&mode=driving&src=ios.jianghu.jianhao`;
      const androidGaode = (): string =>
        `amapuri://route/plan/?sourceApplication=mhc&dlat=${latAndLon[0]}&dlon=${latAndLon[1]}&dname=${currentObj.value.location}&dev=0&t=0`;
      const iosGaode = (): string =>
        `iosamap://path?sourceApplication=mhc&dlat=${latAndLon[0]}&dlon=${latAndLon[1]}&dname=${currentObj.value.location}&dev=0&t=0`;
      if (mapType === "bdMap") {
        if (isAndroid) {
          return androidBaidu();
        }
        return iosBaidu();
      }
      if (isAndroid) {
        return androidGaode();
      }
      return iosGaode();
    };
    const changeMap = async (map: string[]): Promise<void> => {
      const url = getMapScheme(map[0]);
      window.location.href = url;
    };

    // 接收
    const handleResolve = async (): Promise<void> => {
      try {
        await cubeDailyInspectionService.AcceptTask({ id: detail.value?.id ?? "" });
        await refreshNativePatrolInspectOfflineData();
        await getTaskDetail();
      } catch (err) {
        const { errorMessage } = (err as { toJSON: () => { errorMessage: string } }).toJSON();
        showNotify({ type: "danger", message: errorMessage || "请求失败" });
      }
    };
    // 处理
    const toHandle = (id: string): void => {
      router.push({ path: "/inspection-record", query: { id, handle: "handle" } });
    };
    const cancel = (id: string): void => {
      router.push({ path: "/inspection-cancel", query: { id, batch: "inspection" } });
    };
    // 切换批量选择模式
    const toggleBatchMode = (): void => {
      isBatchMode.value = !isBatchMode.value;
      if (!isBatchMode.value) {
        selectedObjectIds.value = [];
        objSearch.status = prevBatchStatus.value;
        resetObjListAndReload();
        return;
      }
      prevBatchStatus.value = objSearch.status;
      objSearch.status = "WAIT_REPAIR";
      selectedObjectIds.value = [];
      resetObjListAndReload();
    };
    const toggleSelectedObject = (inspectionId: string): void => {
      const index = selectedObjectIds.value.indexOf(inspectionId);
      if (index >= 0) {
        selectedObjectIds.value.splice(index, 1);
        return;
      }
      selectedObjectIds.value.push(inspectionId);
    };
    // 批量移交对象
    const handleBatchTransfer = (): void => {
      if (selectedObjectIds.value.length === 0) {
        showNotify({ type: "warning", message: "请至少选择一个待修复对象" });
        return;
      }
      // 跳转到选择人员界面，传递选中的对象ID列表
      const objectIds = selectedObjectIds.value.join(",");
      router.push({
        path: "/user",
        query: {
          objectIds,
        },
      });
    };
    const detailDom = (): VNode => (
      <div class={styles["cell-group"]}>
        <div class={styles.title}>
          <span>巡检对象跟踪</span>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ color: "#2879ff" }}>{normal.value}</span>/<span>{detail.value?.targetNum}</span>
            {hasWaitRepairObjects.value && (
              <Button size="small" type={isBatchMode.value ? "primary" : "default"} onClick={toggleBatchMode} style={{ marginLeft: "8px" }}>
                {isBatchMode.value ? "取消移交" : "异常移交"}
              </Button>
            )}
          </div>
        </div>
        <Divider />
        <Search
          v-show={!isBatchMode.value}
          v-model={objSearch.keyword}
          placeholder="根据对象名称搜索"
          show-action={false}
          onSearch={onObjKeywordSearch}
          onClear={onObjKeywordSearch}
          style={{ marginTop: "8px", padding: "0 4px" }}
        />
        <div v-show={!isBatchMode.value} class={styles["obj-filter"]}>
          <div class={styles["obj-filter-item"]} onClick={() => openObjFilterPicker("status")}>
            <span class={styles["obj-filter-label"]}>状态：</span>
            <span class={styles["obj-filter-value"]}>{objStatusText.value}</span>
            <Icon name="arrow" color="#969799" />
          </div>
          <div class={styles["obj-filter-item"]} onClick={() => openObjFilterPicker("result")}>
            <span class={styles["obj-filter-label"]}>结果：</span>
            <span class={styles["obj-filter-value"]}>{objResultText.value}</span>
            <Icon name="arrow" color="#969799" />
          </div>
        </div>
        <PullRefresh
          v-model={objRefreshing.value}
          onRefresh={onObjRefresh}
          style={{ maxHeight: "52vh", overflowY: "auto", marginTop: "8px" }}
        >
          <List
            v-model:loading={objListLoading.value}
            finished={objFinished.value}
            finished-text={followingList.value.length === 0 ? "" : "暂无更多数据"}
            onLoad={onLoadObjs}
          >
            {isBatchMode.value ? (
              <CheckboxGroup v-model={selectedObjectIds.value}>
                {followingList.value.map((item) => (
                  <div
                    class={styles.following}
                    key={item.inspectionId}
                    onClick={() => {
                      toggleSelectedObject(item.inspectionId);
                    }}
                  >
                    <Checkbox
                      name={item.inspectionId}
                      style={{ marginRight: "8px" }}
                      onClick={(e: Event) => {
                        e.stopPropagation();
                      }}
                    />
                    <div
                      class={styles.round}
                      style={{ backgroundColor: `${item.result === "NORMAL" ? "#07c160" : item.result === "" ? "#c1c1c1" : "#e0120e"}` }}
                    />
                    <div class={styles.card}>
                      <div class={styles.title}>
                        <span>{item.targetName}</span>
                        <span style={{ color: StatusColor.get(item.state), fontWeight: "400" }}>{StatusObjectType.get(item.state)}</span>
                      </div>
                      <div class={styles.content}>
                        <span>
                          {typeMap.get(item.targetCategory)}：{item?.targetCode || "--"}
                        </span>
                        <span>{timeFormat(item.time, true) ?? "--"}</span>
                      </div>
                      <div class={styles.content}>
                        <div>
                          <span style={{ color: "black" }}>巡检人：</span>
                          <span>{item.staff || "--"}</span>
                        </div>
                        <div>
                          <span style={{ color: "black" }}>巡检结果：</span>
                          <span
                            style={{
                              color: item.result === "NORMAL" ? "#07c160" : item.result === "ABNORMAL" ? "rgb(224, 18, 14)" : "gray",
                            }}
                          >
                            {item.result === "NORMAL" ? "正常" : item.result === "" ? "--" : "异常"}
                          </span>
                        </div>
                      </div>
                      <div class={styles.location}>
                        <span>具体地址：</span>
                        <span>{item.targetAddress}</span>
                      </div>
                      <div class={styles.location}>
                        <span>所在区域：</span>
                        <span>{item.areaName ?? "--"}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </CheckboxGroup>
            ) : (
              followingList.value.map((item) => (
                <div class={styles.following} key={item.inspectionId}>
                  <div
                    class={styles.round}
                    style={{ backgroundColor: `${item.result === "NORMAL" ? "#07c160" : item.result === "" ? "#c1c1c1" : "#e0120e"}` }}
                  />
                  <div class={styles.card}>
                    <div class={styles.title}>
                      <span>{item.targetName}</span>
                      <span style={{ color: StatusColor.get(item.state), fontWeight: "400" }}>{StatusObjectType.get(item.state)}</span>
                    </div>
                    <div class={styles.content}>
                      <span>
                        {typeMap.get(item.targetCategory)}：{item?.targetCode || "--"}
                      </span>
                      <span>{timeFormat(item.time, true) ?? "--"}</span>
                    </div>
                    <div class={styles.content}>
                      <div>
                        <span style={{ color: "black" }}>巡检人：</span>
                        <span>{item.staff || "--"}</span>
                      </div>
                      <div>
                        <span style={{ color: "black" }}>巡检结果：</span>
                        <span
                          style={{ color: item.result === "NORMAL" ? "#07c160" : item.result === "ABNORMAL" ? "rgb(224, 18, 14)" : "gray" }}
                        >
                          {item.result === "NORMAL" ? "正常" : item.result === "" ? "--" : "异常"}
                        </span>
                      </div>
                    </div>
                    <div class={styles.location}>
                      <span>具体地址：</span>
                      <span>{item.targetAddress}</span>
                    </div>
                    <div class={styles.location}>
                      <span>所在区域：</span>
                      <span>{item.areaName ?? "--"}</span>
                    </div>
                    <div />
                    <Divider />
                    <div class={styles["item-footer"]}>
                      {item.state === "EXECUTING" ? (
                        <>
                          {detail.value?.status !== "STOP" && (
                            <div
                              onClick={() => {
                                handleInspection(item);
                              }}
                            >
                              巡检
                            </div>
                          )}
                          {detail.value?.status !== "STOP" && (
                            <div
                              onClick={() => {
                                cancel(item.inspectionId);
                              }}
                            >
                              取消巡检
                            </div>
                          )}
                          <div
                            v-show={item.latAndLon !== ""}
                            onClick={() => {
                              openPicker(item);
                            }}
                          >
                            定位导航
                          </div>
                        </>
                      ) : (
                        <>
                          <div
                            onClick={() => {
                              handleInspectionRecord(item.inspectionId);
                            }}
                          >
                            巡检记录
                          </div>
                          {getHazardRelations(item).length > 0 ? (
                            <div onClick={() => handleHazardDetail(item)}>
                              查看隐患{getHazardRelations(item).length > 1 ? `（${getHazardRelations(item).length}）` : ""}
                            </div>
                          ) : (
                            <div onClick={() => handleHiddenDanger(item)}>隐患治理</div>
                          )}{" "}
                          <div
                            onClick={() => {
                              handleFault(item);
                            }}
                          >
                            故障报修
                          </div>
                          {item.state === "WAIT_REPAIR" && (
                            <div
                              onClick={() => {
                                toHandle(item.inspectionId);
                              }}
                            >
                              线下处理
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
            {objFinished.value && followingList.value.length === 0 && !objListLoading.value ? <Empty description="暂无数据" /> : null}
          </List>
        </PullRefresh>
      </div>
    );
    const ItemDom = (): VNode => (
      <div class={styles.body}>
        <div class={styles["cell-group"]}>
          <div class={styles.title}>基本信息</div>
          <Divider />
          <div class={styles.content}>
            <div>
              <span>任务编号：</span>
              <span style={{ color: "black" }}>{detail.value?.id}</span>
            </div>
            <div>
              <span>任务名称：</span>
              <span style={{ color: "black" }}>{detail.value?.name}</span>
            </div>
            <div>
              <span>责任人员：</span>
              <span style={{ color: "black" }}>{detail.value?.receiveNames}</span>
            </div>
            <div>
              <span>发布时间：</span>
              <span style={{ color: "black" }}>{timeFormat(detail.value?.createTime ?? "", true)}</span>
            </div>
            <div>
              <span>任务时限：</span>
              <span style={{ color: "black" }}>{limitTime.value}</span>
            </div>
            <div>
              <span>任务状态：</span>
              <span style={{ color: "black" }}>{StatusType.get(detail.value?.status ?? "")}</span>
            </div>
            <div>
              <span>巡检对象数：</span>
              <span style={{ color: "black" }}>{detail.value?.targetNum}</span>
            </div>
            <div>
              <span>协同人：</span>
              <span style={{ color: "black" }}>{detail.value?.assistNames ?? "--"}</span>
            </div>
          </div>
        </div>
        {detail.value?.status !== "ACCEPT" ? detailDom() : null}
      </div>
    );
    return (): VNode => (
      <div class={styles.wrapper}>
        <Bar />
        {loading.value ? (
          <Loading size="24px" vertical>
            加载中...
          </Loading>
        ) : (
          ItemDom()
        )}
        <div
          class={styles.footer}
          v-show={
            (detail.value?.status === "EXECUTING" && route.query.userId === detail.value?.receiveIds) || detail.value?.status === "ACCEPT"
          }
        >
          <Button
            type="primary"
            size="small"
            v-show={detail.value?.status === "ACCEPT"}
            onClick={() => {
              handleResolve();
            }}
          >
            接收
          </Button>
          <Button
            v-show={detail.value?.status === "EXECUTING" && route.query.userId === detail.value?.receiveIds}
            plain
            type="primary"
            size="small"
            onClick={(e: Event) => {
              handleTransfer(e);
            }}
          >
            移交
          </Button>
          <Button
            v-show={detail.value?.status === "EXECUTING" && route.query.userId === detail.value?.receiveIds}
            type="primary"
            size="small"
            onClick={(e: Event) => {
              handleAddPartner(e);
            }}
          >
            添加协同
          </Button>
        </div>
        {/* 批量移交底部工具栏 */}
        <div class={styles.footer} v-show={isBatchMode.value}>
          <Button size="small" block onClick={toggleBatchMode} style={{ marginRight: "10px" }}>
            取消
          </Button>
          <Button
            size="small"
            style={{ width: "100px" }}
            type="primary"
            block
            onClick={handleBatchTransfer}
            disabled={selectedObjectIds.value.length === 0}
          >
            异常移交 ({selectedObjectIds.value.length})
          </Button>
        </div>
        <Popup v-model:show={showPicker.value} round position="bottom">
          <Picker
            columns={mapOptions}
            onConfirm={({ selectedValues }: { selectedValues: string[] }) => {
              changeMap(selectedValues);
              showPicker.value = false;
            }}
            onCancel={() => {
              showPicker.value = false;
            }}
          />
        </Popup>
        <Popup v-model:show={showObjFilterPicker.value} round position="bottom">
          <Picker
            columns={objFilterPickerColumns.value}
            onConfirm={onObjFilterConfirm}
            onCancel={() => {
              showObjFilterPicker.value = false;
            }}
          />
        </Popup>
      </div>
    );
  },
});
