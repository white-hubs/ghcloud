import dayjs from "dayjs";
import qs from "qs";
import {
  Popup,
  Button,
  Field,
  List,
  Empty,
  Image,
  Picker,
  type PickerConfirmEventParams,
  showImagePreview,
  showNotify,
  ActionSheet,
  showDialog,
  Icon,
} from "vant";
import { defineComponent, onMounted, reactive, ref, watch, type VNode } from "vue";
import { useRoute, useRouter } from "vue-router";

import { CubeNavBar } from "@ghcloud/cube-app-generic-component";
import { CubeAppBusinessBridge, cubeAppService } from "@ghcloud/cube-app-js-sdk";
import { getEnvironment } from "@ghcloud/cube-app-js-sdk/src/js/cube-h5-config";
import type { OSSFile, TaskDetailModel, TaskFeedbackRecordVO } from "@ghcloud/cube-daily-task-service";
import type { FileState } from "@ghcloud/cube-file-service";

import { kkFilePreview } from "../../../../../../../basic/cube-utils/src/file-preview";
import { status } from "../type";
import { imgType, typeList } from "./utils";
import { cubeDailyTaskService, cubeOuaaService } from "@/api/server";
import { storeInspect } from "@/store/inspect";

import styles from "./detail.module.less";
import listStyles from "./task-feedback-list.module.less";
// type AttachmentItem = { id: string; name: string; path: string; endpointPath: string;createTime:string;size:string }
// type TaskDetailModel = {
//   id: string
//   name: string
//   principalName: string
//   typeName: string
//   urgentLevel: string
//   deadline: string
//   description: string
//   fileList: AttachmentItem[]
//   taskItemList: TaskItemList[]
//   status: string
// }
// Type TaskItemList = {
//   Content: string
//   CreateTime: string
//   Id: string
//   Name:string;
//   Tag: string
//   ResultList: TaskItem[]
// }
// Type TaskItem = {
//   DefaultResultItem: string
//   CreateTime: string
//   Id: string
//   MustRemarkResultItems:string;
//   MustTakePhotoResultItems: string
//   Name: string
//   ResultLabelJson: string
// }
interface TaskObjectItem {
  id: string;
  targetName: string;
  executorName: string;
  executorTime: string;
  location: string;
  handlerName: string;
  status: string;
  targetType: string;
  recordId: string;
  allowedHande: boolean;
  taskId: string;
  allowAssign: boolean;
  targetLntAndLat: string;
  address: string;
  targetCode: string;
}

export const TaskDetail = defineComponent({
  name: "TaskDetail",
  setup: () => {
    const router = useRouter();
    const route = useRoute();
    const store = storeInspect();
    const detail = ref<TaskDetailModel | null>(null);
    const objects = ref<TaskObjectItem[]>([]);
    const refreshing = ref(false);
    const loading = ref(false);
    const buttonLoading = ref(false);
    const finished = ref(false);
    const dailyType = ref("");
    const pageNumber = ref(0);
    const pageSize = ref(10);
    const id = route.query.id as string;
    const taskType = ref("NORMAL");
    const currentUserId = ref("");
    const filters = reactive({
      result: "",
      status: "",
    });
    const objectSum = ref({
      total: 0,
      checked: 0,
    });
    const feedbackList = ref<TaskFeedbackRecordVO[]>([]);
    const resultColumns = [
      { text: "全部", value: "" },
      { text: "正常", value: "NORMAL" },
      { text: "异常", value: "ABNORMAL" },
    ];
    const statusColumns = [
      { text: "全部", value: "" },
      { text: "待处理", value: "WAIT" },
      { text: "已完成", value: "DONE" },
    ];
    const getLabel = (value: string, columns: { text: string; value: string | null }[]): string =>
      columns.find((item) => item.value === value)?.text ?? "";
    const showTypePicker = ref(false);
    const showAreaPicker = ref(false);
    const showDistributeSheet = ref(false);
    const distributeActions = [
      { name: "按进度分发", value: "PROGRESS" },
      { name: "按对象分发", value: "OBJECT" },
    ];
    /**
     * 加载任务详情数据
     */
    const fetchDetail = async (): Promise<void> => {
      // 使用已存在的分页接口获取单条任务详情（占位实现，可按实际替换为按ID查询）
      const res = await cubeDailyTaskService.getDailyTaskDetail?.({ id });
      detail.value = {
        ...res,
        deadline: String(res?.deadline ? dayjs(res?.deadline).format("YYYY年M月D日 HH:mm:ss ") : "-"),
      };
      dailyType.value = res.dailyType;
      taskType.value = res.taskType;
    };

    const fetchFeedbackList = async (): Promise<void> => {
      if (!detail.value?.continuity) {
        feedbackList.value = [];
        return;
      }
      try {
        const list = await cubeDailyTaskService.getDailyTaskFeedbackList({ taskId: id });
        feedbackList.value = list ?? [];
      } catch {
        feedbackList.value = [];
      }
    };

    const getFeedbackMinSchedule = (): number => {
      if (!feedbackList.value.length) {
        return 0;
      }
      return Math.max(...feedbackList.value.map((r) => Number(r.schedule ?? 0)));
    };

    const handleTaskFeedback = (): void => {
      router.push({
        path: "/task-feedback",
        query: { id, minSchedule: String(getFeedbackMinSchedule()) },
      });
    };

    const previewFeedbackFile = (
      record: TaskFeedbackRecordVO,
      file: { id?: string; path?: string; type?: string; name?: string },
    ): void => {
      const ext = (file.type ?? "").toLowerCase();
      if (["zip", "rar"].includes(ext)) {
        showNotify({ type: "warning", message: "暂不支持该文件类型的预览, 请到电脑端查看" });
        return;
      }
      if (typeList.includes(ext)) {
        kkFilePreview(file as unknown as FileState);
        return;
      }
      const imgs = (record.fileList ?? []).filter((f) => imgType.includes((f.type ?? "").toLowerCase()));
      const idx = imgs.findIndex((f) => f.id === file.id || f.path === file.path);
      if (imgs.length && idx >= 0) {
        showImagePreview(
          imgs.map((f) => f.path ?? ""),
          idx,
        );
      } else if (file.path) {
        showImagePreview([file.path], 0);
      }
    };

    const fileSlots = {
      loading: (): JSX.Element => <Icon name="description-o" size="20" />,
    };
    const fetchDetailSummary = async (): Promise<void> => {
      // 使用已存在的分页接口获取单条任务详情（占位实现，可按实际替换为按ID查询）
      const res = await cubeDailyTaskService.getTaskSummary({ taskId: id });
      objectSum.value = res;
    };

    /**
     * 加载对象列表（分页）
     */
    const fetchObjects = async (): Promise<void> => {
      loading.value = true;
      pageNumber.value += 1;
      const params = {
        pageNumber: String(pageNumber.value),
        pageSize: String(pageSize.value),
        taskId: id,
        dailyType: dailyType.value,
        result: filters.result,
        status: filters.status,
      };
      const res = await cubeDailyTaskService.getRelateformId?.(params);
      const rows = res?.records?.map((r) => ({
        id: String(r.id ?? ""),
        targetName: String(r.targetName ?? ""),
        location: String(r.location ?? ""),
        executorName: String(r.executorName ?? ""),
        status: String(r.status),
        recordId: String(r.recordId ?? ""),
        executorTime: String(dayjs(r.executionTime).format("YYYY-MM-DD HH:mm:ss ")),
        allowedHande: Boolean(r.allowedHande),
        allowAssign: Boolean(r.allowAssign),
        taskId: String(r.taskId ?? ""),
        targetType: String(r.targetType ?? ""),
        targetLntAndLat: String(r.targetLntAndLat ?? ""),
        address: String(r.address ?? ""),
        targetCode: String(r.targetCode ?? ""),
      })) as TaskObjectItem[];

      if (pageNumber.value === 1) {
        objects.value = [];
      }
      objects.value = [...objects.value, ...rows];
      if ((res?.total ?? rows.length) <= pageNumber.value * pageSize.value || rows.length < pageSize.value) {
        finished.value = true;
      }

      loading.value = false;
    };

    /**
     * 下拉刷新
     */
    const onRefresh = async (): Promise<void> => {
      pageNumber.value = 0;
      finished.value = false;
      await fetchObjects();
      refreshing.value = false;
    };

    /**
     * 列表滚动触发加载
     */
    const onLoad = async (): Promise<void> => {
      await fetchObjects();
    };

    /**
     * 选择对象类型确认
     */
    const onConfirmType = (val: PickerConfirmEventParams): void => {
      const v = val.selectedOptions;
      filters.result = String(v?.[0]?.value ?? "");
      showTypePicker.value = false;
      pageNumber.value = 0;
      finished.value = false;
      fetchObjects();
    };

    /**
     * 选择业务区域确认
     */
    const onConfirmArea = (val: PickerConfirmEventParams): void => {
      const v = val.selectedOptions;
      filters.status = String(v?.[0]?.value ?? "");
      showAreaPicker.value = false;
      pageNumber.value = 0;
      finished.value = false;
      fetchObjects();
    };

    /**
     * 处理某个对象
     */
    const handleProcess = async (obj: TaskObjectItem): Promise<void> => {
      if (getEnvironment() === "cubeApp" && detail.value?.method === "SCAN_CODE" && obj.targetType !== "AREA") {
        try {
          // 扫码
          const code = await CubeAppBusinessBridge.handleBusinessScanCode();
          const scanCode = code.includes("https") ? (qs.parse(code)?.code?.toString() ?? code.toString()) : code.toString();
          const data = await cubeDailyTaskService.getEntityByCode(encodeURIComponent(scanCode.toString()));
          if (obj.id.toString() === data.entityId?.toString()) {
            router.push({
              path: "/task-execute",
              query: {
                dailyType: dailyType.value,
                taskId: id,
                taskName: detail.value?.name,
                targetObj: JSON.stringify(obj),
              },
            });
          } else {
            showNotify({ type: "danger", message: "该对象不匹配" });
          }
          return;
        } catch (err) {
          // eslint-disable-next-line no-console
          showNotify({ type: "danger", message: "请求失败" });
          return;
        }
      } else {
        router.push({
          path: "/task-execute",
          query: {
            dailyType: dailyType.value,
            taskId: id,
            taskName: detail.value?.name,
            targetObj: JSON.stringify(obj),
          },
        });
      }
    };
    const getUserInfo = async (): Promise<void> => {
      const res = await cubeOuaaService.getUserInfo();
      currentUserId.value = res.id;
    };
    const refreshTaskDetailPage = async (): Promise<void> => {
      await fetchDetail();
      await fetchFeedbackList();
      fetchDetailSummary();
      getUserInfo();
      pageNumber.value = 0;
      finished.value = false;
      objects.value = [];
    };

    onMounted(async () => {
      await refreshTaskDetailPage();
      const item =
        (sessionStorage.getItem("inspection-object-data") && JSON.parse(sessionStorage.getItem("inspection-object-data") ?? "")) ?? null;
      const flowTaskId = sessionStorage.getItem("flowTaskId");
      try {
        flowTaskId &&
          item &&
          (await cubeDailyTaskService.linkWork({
            targetId: item.targetId,
            taskId: id,
            workOrderType: item.businessType,
            recordId: item.recordId,
            processInstanceId: flowTaskId,
            processInstanceName: `巡检${detail.value?.name ?? ""}发起了${item.targetName}的${item.taskName}`,
          }));
      } catch {}
      sessionStorage.removeItem("flowTaskId");
    });

    /** 从反馈等子页返回同一详情（含 KeepAlive）时 fullPath 变化，需重新拉数据 */
    watch(
      () => route.fullPath,
      async () => {
        if (route.name !== "task-detail" || !id) {
          return;
        }
        await refreshTaskDetailPage();
      },
    );
    const handOver = (): void => {
      router.push({ path: "/task-handOver", query: { id } });
    };
    const previewImg = (files: FileState): void => {
      // showImagePreview([path])
      const item = files;
      const ext = (item.type ?? "").toLowerCase();

      if (["zip", "rar"].includes(ext)) {
        showNotify({ type: "warning", message: "暂不支持该文件类型的预览, 请到电脑端查看" });
        return;
      }

      // Const isVideoFile = ['mp4', 'avi', 'wmv', 'mov', 'mkv', 'flv', 'webm'].includes(ext)
      // If (isVideoFile && isIOS()) {
      //   OpenVideoPreview(files)
      //   Return
      // }

      if (typeList.includes(ext)) {
        kkFilePreview(item);
      } else {
        const img = imgType.includes((files.type ?? "").toLowerCase());
        const index = 0;
        if (img && files.path) {
          showImagePreview([files.path], index);
        }
      }
    };
    const previewStandardImages = (files: OSSFile[], currentIndex: number): void => {
      const images = files.map((file) => file.path).filter(Boolean);
      if (images.length === 0) {
        return;
      }
      showImagePreview(images, currentIndex);
    };
    const handleBz = (): void => {
      if (taskType.value === "NORMAL") {
        router.push({
          path: "/task-handle-normal",
          query: {
            id,
          },
        });
      } else {
        router.push({
          path: "/task-execute",
          query: {
            taskItemList: JSON.stringify(detail.value?.taskItemList),
            taskId: id,
            taskName: detail.value?.name,
            dailyType: dailyType.value,
          },
        });
      }
    };
    const handleSubmit = async (): Promise<void> => {
      buttonLoading.value = true;
      try {
        const params = {
          taskId: id,
          dailyType: dailyType.value,
        };
        await cubeDailyTaskService.taskSubmit(params);
        onCancel();
        showNotify({ type: "success", message: "提交成功" });
      } catch {
      } finally {
        buttonLoading.value = false;
      }
    };
    const onCancel = (): void => {
      if (getEnvironment() === "cubeApp") {
        cubeAppService.backPage();
      } else {
        history.back();
      }
    };
    const handleDispatch = (): void => {
      showDistributeSheet.value = true;
    };
    const getPercentMethods = async (): Promise<number> => {
      const data = await cubeDailyTaskService.getRelatePercent({ taskId: id });
      return data;
    };
    const onSelectDistribute = async (item: { name: string; value: string }): Promise<void> => {
      showDistributeSheet.value = false;
      const distributeType = item.value;
      if (distributeType == "OBJECT") {
        router.push({ path: "/task-dispatch", query: { id } });
      } else {
        const percent = await getPercentMethods();
        store.resetCache();
        const num = objects.value.filter((item) => item.status === "WAIT").length;
        router.push({ path: "/task-distribute-user", query: { id, allNumber: num, percent } });
      }
    };

    const getUserName = (
      userList:
        | {
            id: string;
            masterId: string;
            participateType: string;
            targetId: string;
            targetName: string;
          }[]
        | undefined,
    ): string => {
      if (!userList) {
        return "-";
      }
      const nameList: string[] = [];
      userList.map((item) => {
        nameList.push(item.targetName);
      });
      return nameList.join("、");
    };
    // 巡检记录
    const handleInspectionRecord = (item: TaskObjectItem): void => {
      if (!item.taskId) {
        showNotify({ type: "danger", message: "数据异常，未关联任务" });
        return;
      }
      router.push({
        path: "/task-handle-detail",
        query: { taskId: item.taskId, targetId: item.id, handleTime: item.executorTime, handlerName: item.executorName },
      });
    };

    const handleHiddenDanger = (item: {
      id: string;
      targetName: string;
      executorName: string;
      location: string;
      handlerName: string;
      status: string;
      targetType: string;
      recordId: string;
    }): void => {
      const tansferItem = {
        targetCategory: item.targetType,
        targetId: item.id,
        targetName: item.targetName,
        recordId: item.recordId,
      };
      sessionStorage.setItem("cube-app-maintenance-object-data", JSON.stringify(tansferItem));
      sessionStorage.setItem(
        "inspection-object-data",
        JSON.stringify({ ...tansferItem, taskName: "隐患单", businessType: "HIDDENDANGER" }),
      );
      window.location.href = `/streamengineH5/initiating-work-order?processType=ADD&businessType=HIDDENDANGER&processId=${item.id}`;
    };
    // 故障报修
    const handleFault = (item: {
      id: string;
      targetName: string;
      executorName: string;
      location: string;
      handlerName: string;
      status: string;
      targetType: string;
      recordId: string;
    }): void => {
      const tansferItem = {
        targetCategory: item.targetType,
        targetId: item.id,
        targetName: item.targetName,
        recordId: item.recordId,
      };
      sessionStorage.setItem("cube-app-maintenance-object-data", JSON.stringify(tansferItem));
      sessionStorage.setItem("inspection-object-data", JSON.stringify({ ...tansferItem, taskName: "故障单", businessType: "FAULT" }));
      window.location.href = `/streamengineH5/initiating-work-order?processType=ADD&businessType=FAULT&processId=${item.id}`;
    };
    const openPicker = (
      e: Event,
      item: {
        id: string;
        address?: string;
        targetLntAndLat: string;
      },
    ): void => {
      e.stopPropagation();
      if (getEnvironment() === "cubeApp") {
        const latAndLon = item.targetLntAndLat.split(",");
        cubeAppService.openTripartiteMap({
          type: "route",
          latitude: Number(latAndLon[1]),
          longitude: Number(latAndLon[0]),
          address: item.address ?? "",
        });
        return;
      }
      showDialog({ message: "请使用应用打开" });
      // const isWeixinBrowser = /micromessenger/i.test(navigator.userAgent)
      // if (isWeixinBrowser) {
      //   showDialog({ message: '请使用浏览器或在应用中打开' })
      // } else {
      //   showPicker.value = true
      //   currentObj.value = item
      // }
    };
    return (): VNode => (
      <div class={styles.container}>
        <CubeNavBar showBack title="任务详情" rightSlot={() => <>{detail.value?.allowTransfer && <div onClick={handOver}>移交</div>}</>} />
        <div class={styles.detail_container}>
          {/* 任务信息 */}
          <div class={styles.section}>
            <div class={styles.row}>
              <div class={styles.label}>任务名称</div>
              <div class={styles.value}>{detail.value?.name ?? "-"}</div>
            </div>
            <div class={styles.row}>
              <div class={styles.label}>负责人</div>
              <div class={styles.value}>{getUserName(detail.value?.participateList)}</div>
            </div>
            <div class={styles.row}>
              <div class={styles.label}>任务类型</div>
              <div class={styles.value}>{detail.value?.taskCategoryName ?? "-"}</div>
            </div>
            <div class={styles.row}>
              <div class={styles.label}>紧急程度</div>
              <div class={styles.value}>{detail.value?.urgencyName ?? "-"}</div>
            </div>
            <div class={styles.row}>
              <div class={styles.label}>任务时限</div>
              <div class={styles.value}>{detail.value?.deadline ?? "-"}</div>
            </div>
            <div class={styles.row}>
              <div class={styles.label}>持续性任务</div>
              <div class={styles.value}>{detail.value?.continuity ? "是" : "否"}</div>
            </div>
            <div class={styles.row_column}>
              <div class={styles.label}>任务说明</div>
              <div class={styles.desc}>{detail.value?.description ?? ""}</div>
            </div>
          </div>

          {/* 附件上传 */}
          <div class={styles.section}>
            <div class={styles.subTitle}>附件</div>
            {(detail.value?.fileList ?? []).map((item) => (
              <div
                key={item.id}
                class={styles.file_item}
                onClick={() => {
                  previewImg(item);
                }}
              >
                {/* <div class={styles.file_icon}><Icon name='description' /></div> */}
                <Image class={styles.file_icon} style={{ width: "50px", height: "50px" }} src={item.path} alt="" width="50" height="50" />
                <div class={styles.file_meta}>
                  <div class={styles.file_name}>{item.name}</div>
                  <div class={styles.file_info}>
                    <span>{(Number(item.size) / 1024).toFixed(2)}KB</span>
                    <span class={styles.dot}>·</span>
                    {/* <span>dfdsf</span><span class={styles.dot}>·</span> */}
                    <span>{dayjs(new Date(item.createTime)).format("YYYY-MM-DD HH:mm:ss")}</span>
                  </div>
                </div>
              </div>
            ))}
            {(detail.value?.fileList ?? []).length === 0 && <div class={styles.empty}>暂无数据</div>}
            {/* {
            (detail.value?.fileList??[]).map((item) =>{
              return (
                <div key={item.id} onClick={() => {
                  previewImg(item.path)
                }} style={{ width: '50px', height: '50px' }}>
                  <Image src={item.path} alt='' width='50' height='50' />
                </div>
              )
            })
          } */}
          </div>

          {detail.value?.continuity && (
            <div class={styles.section}>
              <div class={styles.subTitle}>反馈记录</div>
              <div class={listStyles.processing}>
                {!!feedbackList.value.length &&
                  feedbackList.value.map((item, index) => {
                    const depName = item.feedbackDepName ?? item.FeedbackDepName ?? "--";
                    return (
                      <div class={listStyles["record-item"]} key={`${item.id ?? ""}-${item.feedbackTime ?? ""}-${index}`}>
                        <div class={listStyles["step-icon"]} />
                        <div class={listStyles.time}>{item?.feedbackTime ? dayjs(item.feedbackTime).format("YYYY-MM-DD HH:mm") : "--"}</div>
                        <div class={listStyles.result}>
                          <div class={listStyles.person}>反馈人：{item?.username ?? "--"}</div>
                          <div class={listStyles.person}>反馈部门：{depName}</div>
                          <div class={listStyles.person}>任务进度：{item?.schedule ?? "--"}</div>
                          <div class={listStyles.person}>
                            内容：{item?.description ?? "--"}
                            <div>
                              {(item?.fileList ?? []).map((e) => (
                                <div
                                  class={typeList.includes((e.type ?? "").toLowerCase()) ? "" : listStyles["img-warp"]}
                                  key={`${e.path ?? ""}-${e.id ?? ""}`}
                                  onClick={() => {
                                    previewFeedbackFile(item, e);
                                  }}
                                >
                                  {typeList.includes((e.type ?? "").toLowerCase()) ? (
                                    <div class={listStyles["img-item"]}>
                                      <Image v-slots={fileSlots} class={listStyles["file-img"]} />
                                      <div class={listStyles["file-name"]}>{e.name}</div>
                                    </div>
                                  ) : (
                                    <div class={listStyles["img-item"]}>
                                      <Image src={e.path} class={listStyles["file-img"]} />
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                {!feedbackList.value.length && <Empty description="暂无反馈记录" />}
              </div>
            </div>
          )}

          {/* 任务对象 */}
          {taskType.value === "TARGET" && (
            <div class={styles.section}>
              <div class={styles.subTitle}>
                <span>任务对象</span>{" "}
                <span>
                  {objectSum.value.checked}/{objectSum.value.total}
                </span>{" "}
              </div>
              <div class={styles.filter_bar}>
                <div class={styles.filter_field}>
                  <div class={styles.label}>结果:</div>{" "}
                  <Field
                    modelValue={getLabel(filters.result, resultColumns)}
                    is-link
                    readonly
                    placeholder="巡检结果"
                    onClick={() => {
                      showTypePicker.value = true;
                    }}
                  />
                </div>
                <div class={styles.filter_field}>
                  <div class={styles.label}>状态: </div>{" "}
                  <Field
                    modelValue={getLabel(filters.status, statusColumns)}
                    is-link
                    readonly
                    placeholder="对象状态"
                    onClick={() => {
                      showAreaPicker.value = true;
                    }}
                  />
                </div>
              </div>

              {/* <PullRefresh v-model={refreshing.value} onRefresh={onRefresh} style={{ overflow: "auto", paddingBottom: "38px" }}> */}
              <div style={{ overflow: "auto", paddingBottom: "38px" }}>
                <List
                  class={styles.pullRefresh}
                  v-model:loading={loading.value}
                  finished={finished.value}
                  finished-text={objects.value.length === 0 ? "" : "暂无更多数据"}
                  onLoad={onLoad}
                >
                  {objects.value.length > 0 ? (
                    objects.value.map((item) => (
                      <div key={item.id} class={styles.object_item}>
                        <div class={styles.object_header}>
                          <div class={styles.object_name}>{item.targetName}</div>
                          {/* <Tag type={item.status ?? 'warning'}>{item.status}</Tag> */}
                          <div
                            class={styles.tags}
                            style={{
                              backgroundColor: status[item.status as keyof typeof status]?.background,
                              color: status[item.status as keyof typeof status]?.color,
                            }}
                          >
                            {" "}
                            {status[item.status as keyof typeof status]?.name ?? ""}{" "}
                          </div>
                        </div>
                        <div class={styles.object_row}>
                          <div class={styles.object_label}>具体地址：</div>
                          <div class={styles.object_value}>{item.location}</div>
                        </div>
                        <div class={styles.object_row}>
                          <div class={styles.object_label}>处理人：</div>
                          <div class={styles.object_value}>{item.executorName}</div>
                        </div>
                        <div class={styles.object_row}>
                          <div class={styles.object_label}>风险源编码：</div>
                          <div class={styles.object_value}>{item.targetCode}</div>
                        </div>
                        {item.status === "DONE" && (
                          <div class={styles.object_row}>
                            <div class={styles.object_label}>处理时间：</div>
                            <div class={styles.object_value}>{item.executorTime}</div>
                          </div>
                        )}
                        <div class={styles.object_actions}>
                          {item.allowedHande && <div onClick={async () => handleProcess(item)}>处理</div>}
                          {item.status === "DONE" && (
                            <>
                              <div onClick={() => handleInspectionRecord(item)}>处理记录</div>
                              {dailyType.value === "DAILY_INSPECTION" && <div onClick={() => handleHiddenDanger(item)}>隐患排查</div>}
                              {dailyType.value === "DAILY_INSPECTION" && <div onClick={() => handleFault(item)}>故障报修</div>}
                            </>
                          )}
                          {item.targetLntAndLat && <div onClick={(e: Event) => openPicker(e, item)}>导航</div>}
                        </div>
                      </div>
                    ))
                  ) : (
                    <Empty description="暂无数据" />
                  )}
                </List>
              </div>
              {/* </PullRefresh> */}
            </div>
          )}
          {taskType.value === "STANDARD" && detail.value?.status === "DONE" && detail.value.taskItemList.length ? (
            <div class={styles.task_item_list}>
              <div class={styles.subTitleTitle}>处理结果</div>
              {detail.value.taskItemList.map((item) => {
                const list = item.executeResult;
                return (
                  <>
                    <div class={styles.title}>{list.itemName}</div>
                    <div>处理结果：{list.resultName}</div>
                    {list.remark && <div>处理备注：{list.remark}</div>}
                    {list.fileList.length ? (
                      <div>
                        <div>附件：</div>
                        <div class={styles.standard_image_list}>
                          {(list.fileList ?? []).map((item, index) => (
                            <Image
                              key={item.id}
                              class={styles.standard_image}
                              src={item.path}
                              fit="cover"
                              width="80"
                              height="80"
                              radius="4"
                              onClick={() => {
                                previewStandardImages(list.fileList ?? [], index);
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    ) : (
                      ""
                    )}
                  </>
                ); //   )
                // })
              })}
            </div>
          ) : (
            ""
          )}
          {taskType.value === "NORMAL" && detail.value?.status === "DONE" ? (
            <div class={styles.task_item_list}>
              <div class={styles.subTitleTitle}>处理结果</div>
              <div>备注：{detail.value.normalTaskRecord.remark ?? "--"}</div>
              <div>处理人：{detail.value.normalTaskRecord.executorName ?? "--"}</div>
              <div>
                处理时间：
                {detail.value.normalTaskRecord.executionTime
                  ? dayjs(detail.value.normalTaskRecord.executionTime).format("YYYY-MM-DD HH:mm:ss")
                  : "--"}
              </div>
              {detail.value.normalTaskRecord.fileList.length ? (
                <>
                  <div>附件：</div>
                  {(detail.value.normalTaskRecord.fileList ?? []).map((item) => (
                    <div
                      key={item.id}
                      class={styles.file_item}
                      onClick={() => {
                        previewImg(item);
                      }}
                    >
                      {/* <div class={styles.file_icon}><Icon name='description' /></div> */}
                      <Image
                        class={styles.file_icon}
                        style={{ width: "50px", height: "50px" }}
                        src={item.path}
                        alt=""
                        width="50"
                        height="50"
                      />
                      <div class={styles.file_meta}>
                        <div class={styles.file_name}>{item.name}</div>
                        <div class={styles.file_info}>
                          <span>{(Number(item.size) / 1024).toFixed(2)}KB</span>
                          <span class={styles.dot}>·</span>
                          {/* <span>dfdsf</span><span class={styles.dot}>·</span> */}
                          <span>{dayjs(new Date(item.createTime ?? "")).format("YYYY-MM-DD HH:mm:ss")}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                ""
              )}
            </div>
          ) : (
            ""
          )}
          {/* 结果选择弹层 */}
          <Popup v-model:show={showTypePicker.value} position="bottom">
            <Picker
              columns={resultColumns}
              onConfirm={(val: PickerConfirmEventParams) => onConfirmType(val)}
              onCancel={() => (showTypePicker.value = false)}
            />
          </Popup>

          {/* 状态选择弹层 */}
          <Popup v-model:show={showAreaPicker.value} position="bottom">
            <Picker
              columns={statusColumns}
              onConfirm={(val: PickerConfirmEventParams) => onConfirmArea(val)}
              onCancel={() => (showAreaPicker.value = false)}
            />
          </Popup>

          <ActionSheet
            v-model:show={showDistributeSheet.value}
            actions={distributeActions}
            onSelect={onSelectDistribute}
            cancelText="取消"
            closeOnClickAction
          />
        </div>
        {
          <div class={styles.footer_button}>
            {detail.value?.allowDistribute && (
              <Button block onClick={() => handleDispatch()}>
                分发
              </Button>
            )}
            {detail.value?.allowHandle && (
              <Button type="primary" block onClick={() => handleBz()}>
                处理
              </Button>
            )}
            {detail.value?.allowSubmit && (
              <Button type="primary" block loading={buttonLoading.value} onClick={() => handleSubmit()}>
                提交
              </Button>
            )}
            {detail.value?.allowFeedback && (
              <Button type="primary" block onClick={() => handleTaskFeedback()}>
                反馈
              </Button>
            )}
          </div>
        }
      </div>
    );
  },
});
