import { computed, defineComponent, h, onMounted, reactive, ref } from "vue";
import { useRoute } from "vue-router";

import { CubeLayout, useCubeForm } from "@ghcloud/cube-app-design";
import { objectStatusColor, objectStatusMap, objectStatusOptions, type TaskObjCountResult } from "@ghcloud/cube-daily-inspection-service";
import { Button, Page, PopOver, Space, Table, message } from "@ghcloud/cube-ui";

import { cubeDailyInspectionService, cubeMaintainDroneService } from "@/api/server";
import { SmartInspectDeviceRouteConfig } from "@/components/smart-inspect-device-route-config/smart-inspect-device-route-config";
import { SmartInspectBasicForm } from "@/views/smart-inspect-common/smart-inspect-basic-form";
import {
  createSmartInspectCommonSettingsValue,
  SmartInspectCommonSettings,
  type SmartInspectCommonSettingsValue,
} from "@/views/smart-inspect-common/smart-inspect-common-settings";
import { SmartInspectTargetTypeSelect } from "@/views/smart-inspect-common/smart-inspect-target-type-select";
import {
  createDroneConfigFromTaskDetail,
  getSmartTargetCategories,
  getSmartTargetCategoryLabel,
  hasCommonTargetCategory,
  mergeSmartTargetCategories,
  smartInspectTargetCategoryOptions,
  type SmartInspectDeviceRouteConfigValue,
  type SmartInspectDroneTaskSummary,
  type SmartInspectDroneTaskWaypoint,
  type SmartInspectPoint,
  type SmartInspectTargetCategory,
} from "@/views/smart-inspect-common/types";

import styles from "@/views/smart-inspect-common/smart-inspect-page.module.less";

const getQueryValue = (value: unknown): string => {
  if (Array.isArray(value)) return String(value[0] ?? "");
  return value ? String(value) : "";
};

const toArray = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (typeof value === "string") return value ? value.split(",").filter(Boolean) : [];
  return [];
};

const toBoolean = (value: unknown): boolean => {
  return value === true || value === "true" || value === 1 || value === "1";
};

const getResultText = (value: string): JSX.Element | string => {
  if (!value) return "--";
  return value === "NORMAL" ? <span style={{ color: "#6ab539" }}>正常</span> : <span style={{ color: "#ff4158" }}>异常</span>;
};

type TaskDetailRecord = Record<string, unknown> & {
  standardDTOList?: Array<{ name?: unknown }> | null;
};

const getPointContentText = (point: TaskDetailRecord | null | undefined): string => {
  const standardList = Array.isArray(point?.standardDTOList) ? point.standardDTOList : [];
  return (
    standardList
      .map((item) => item.name)
      .filter(Boolean)
      .join(",") || "--"
  );
};

const isSpecialPointCompleted = (point: SmartInspectPoint): boolean => {
  const status = String(point.status || "").toUpperCase();
  const result = String(point.result || point.inspectionStatus || "").toUpperCase();
  return status === "OVER" || status === "COMPLETED" || result === "NORMAL" || result === "ABNORMAL";
};

export const SmartInspectTaskInfo = defineComponent({
  setup: () => {
    const route = useRoute();
    const currentTaskId = route.query.id as string;
    const queryResult = getQueryValue(route.query.result);
    const state = reactive<{
      formState: Record<string, unknown>;
      commonSettings: SmartInspectCommonSettingsValue;
      loading: boolean;
      details: TaskObjCountResult;
      dataSource: unknown[];
      selectedTargetCategories: SmartInspectTargetCategory[];
      droneConfig: SmartInspectDeviceRouteConfigValue | undefined;
      robotDogConfig: SmartInspectDeviceRouteConfigValue | undefined;
    }>({
      formState: {},
      commonSettings: createSmartInspectCommonSettingsValue(),
      loading: false,
      details: {
        targetAllNum: 0,
        waitTargetNum: 0,
        repairNum: 0,
        repairCount: 0,
        completedTargetNum: 0,
        errTargetNum: 0,
      },
      dataSource: [],
      selectedTargetCategories: [],
      droneConfig: undefined,
      robotDogConfig: undefined,
    });

    const searchParams = reactive({
      taskId: currentTaskId,
      targetCategory: "",
      status: "",
      keyword: "",
      result: queryResult,
    });
    const pagination = ref({
      pageSize: 10,
      pageNumber: 1,
      total: 0,
    });

    const hasCommonStep = computed(
      () =>
        hasCommonTargetCategory(state.selectedTargetCategories) ||
        String(state.formState.inspectionMode || "") === "HYBRID" ||
        String(state.formState.inspectionMode || "") === "HYBRID_ROBOT_DOG",
    );
    const hasDroneStep = computed(() => state.selectedTargetCategories.includes("DRONE"));
    const hasRobotDogStep = computed(() => state.selectedTargetCategories.includes("ROBOT_DOG"));

    const allSpecialPoints = computed(() => [...(state.droneConfig?.points || []), ...(state.robotDogConfig?.points || [])]);
    const isPureSpecial = computed(() => (hasDroneStep.value || hasRobotDogStep.value) && !hasCommonStep.value);

    const deriveSpecialPointDetails = (points: SmartInspectPoint[]): TaskObjCountResult => ({
      targetAllNum: points.length,
      waitTargetNum: points.filter((item) => !isSpecialPointCompleted(item)).length,
      completedTargetNum: points.filter(isSpecialPointCompleted).length,
      errTargetNum: points.filter((item) => item.result === "ABNORMAL").length,
      repairNum: 0,
      repairCount: 0,
    });

    const getDetailInfo = async (): Promise<void> => {
      const points = allSpecialPoints.value;
      if (isPureSpecial.value && points.length) {
        state.details = deriveSpecialPointDetails(points);
        return;
      }
      state.details = await cubeDailyInspectionService.getInspectTaskObjCount({
        taskId: currentTaskId,
      });
    };

    const loadDroneTaskConfig = async (summary?: SmartInspectDroneTaskSummary): Promise<void> => {
      try {
        const res = await cubeMaintainDroneService.pageDroneInspectionTaskWaypoints(currentTaskId, {
          pageNumber: 1,
          pageSize: 200,
        });
        const records = Array.isArray(res.records) ? (res.records as SmartInspectDroneTaskWaypoint[]) : [];
        state.droneConfig = createDroneConfigFromTaskDetail(summary, records);
      } catch {
        state.droneConfig = createDroneConfigFromTaskDetail(summary, []);
      }
    };

    const loadRobotDogTaskConfig = async (summary?: SmartInspectDroneTaskSummary): Promise<void> => {
      try {
        const res = await cubeMaintainDroneService.pageRobotDogInspectionTaskWaypoints(currentTaskId, {
          pageNumber: 1,
          pageSize: 200,
        });
        const records = Array.isArray(res.records) ? (res.records as SmartInspectDroneTaskWaypoint[]) : [];
        state.robotDogConfig = createDroneConfigFromTaskDetail(summary, records, "ROBOT_DOG");
      } catch {
        state.robotDogConfig = createDroneConfigFromTaskDetail(summary, [], "ROBOT_DOG");
      }
    };

    const getDetailTable = async (): Promise<void> => {
      try {
        const param = {
          id: currentTaskId,
          pageSize: pagination.value.pageSize,
          pageNumber: pagination.value.pageNumber,
          ...searchParams,
        };
        state.loading = true;
        state.dataSource = [];
        const res = await cubeDailyInspectionService.getInspectTaskRate(param);
        state.dataSource = Array.isArray(res.recordTaskResultList) ? res.recordTaskResultList : [];
        state.selectedTargetCategories = mergeSmartTargetCategories(
          state.selectedTargetCategories,
          (state.dataSource as Array<Record<string, unknown>>).map((item) => item.targetCategory as string),
        );
        pagination.value.total = ((res?.total || res?.targetNum) as number) ?? 0;
      } finally {
        state.loading = false;
      }
    };

    const getDetails = async (): Promise<void> => {
      if (!currentTaskId) return;
      try {
        const res = await cubeDailyInspectionService.getInspectTaskDetail({ id: currentTaskId, notTarget: true });
        state.formState = { ...res };
        state.commonSettings = {
          ...createSmartInspectCommonSettingsValue(),
          isCheck: toBoolean(res.isCheck),
          method: String(res.method || ""),
          checkUserType: String(res.checkUserType || "1"),
          checkUserIds: toArray(res.checkUserIds),
          checkRoleIds: res.checkRoleIds,
          checkPostIds: res.checkPostIds,
          checkDeptIds: res.checkDeptIds,
        };
        const categories = getSmartTargetCategories(res);
        state.selectedTargetCategories = categories;
        if (categories.includes("DRONE")) {
          await loadDroneTaskConfig(res.droneInspection as SmartInspectDroneTaskSummary | undefined);
        }
        if (categories.includes("ROBOT_DOG")) {
          await loadRobotDogTaskConfig(res.robotDogInspection as SmartInspectDroneTaskSummary | undefined);
        }
      } catch (error) {
        const { errorMessage } = (error as { toJSON: () => { errorMessage: string } }).toJSON();
        message.error(errorMessage || "请求失败");
      }
    };

    const columns = [
      {
        dataIndex: "targetName",
        title: "巡检对象名称",
        align: "center",
        ellipsis: true,
        customRender: ({ text, record }: { text: string; record: Record<string, unknown> }): JSX.Element => {
          const value = text || (record.name as string) || "--";
          return <PopOver content={value}>{value}</PopOver>;
        },
      },
      {
        dataIndex: "targetCategory",
        title: "巡检对象类型",
        align: "center",
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => {
          const value = getSmartTargetCategoryLabel(text);
          return <PopOver content={value || "--"}>{value || "--"}</PopOver>;
        },
      },
      {
        dataIndex: "status",
        title: "状态",
        align: "center",
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => {
          const textVal = text ? objectStatusMap.get(text) : "";
          return (
            <PopOver content={textVal || "--"}>
              <span style={{ color: objectStatusColor.get(text || "") }}>{textVal || "--"}</span>
            </PopOver>
          );
        },
      },
      {
        dataIndex: "itemName",
        title: "巡检项",
        align: "center",
        ellipsis: true,
        customRender: ({ text, record }: { text: string; record: TaskDetailRecord }): JSX.Element => {
          const value = text || getPointContentText(record);
          return <PopOver content={value || "--"}>{value || "--"}</PopOver>;
        },
      },
      {
        dataIndex: "result",
        title: "巡检结果",
        align: "center",
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element | string => getResultText(text),
      },
      {
        dataIndex: "nickname",
        title: "执行人或设备",
        align: "center",
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => {
          const value = text || "--";
          return <PopOver content={value}>{value}</PopOver>;
        },
      },
      {
        dataIndex: "action",
        title: "操作",
        align: "center",
        ellipsis: true,
        customRender: ({ record }: { record: Record<string, string> }): JSX.Element => (
          <Button
            type="link"
            size="small"
            onClick={() => {
              history.pushState({}, "", `/portal/daily-inspection/inspect-record-info?id=${record.id}`);
            }}
          >
            查看巡检记录
          </Button>
        ),
      },
    ];

    const objectStatusSelectOptions = Object.entries(objectStatusOptions).map(([value, label]) => ({ value, label }));
    const formSchema = [
      {
        component: "Select",
        label: "对象类型",
        fieldName: "targetCategory",
        defaultValue: null,
        componentProps: {
          placeholder: "对象类型",
          options: smartInspectTargetCategoryOptions,
        },
      },
      {
        component: "Select",
        label: "状态",
        fieldName: "status",
        defaultValue: null,
        componentProps: {
          placeholder: "状态",
          options: objectStatusSelectOptions,
        },
      },
      {
        component: "Input",
        label: "",
        fieldName: "keyword",
        componentProps: {
          placeholder: "巡检对象名称",
        },
      },
      {
        component: "Select",
        label: "巡检结果",
        fieldName: "result",
        defaultValue: null,
        componentProps: {
          placeholder: "巡检结果",
          allowClear: true,
          options: [
            { label: "正常", value: "NORMAL" },
            { label: "异常", value: "ABNORMAL" },
          ],
        },
      },
    ];

    const [CubeForm, formApi] = useCubeForm({
      syncStateRef: searchParams,
      onHydratedQuery: () => {
        if (searchParams.result) {
          formApi.formValues.result = searchParams.result;
        }
        getDetailTable();
      },
      layout: "horizontal",
      handleSubmit: (data) => {
        searchParams.keyword = data.keyword ? (data.keyword as string) : "";
        searchParams.targetCategory = data.targetCategory ? (data.targetCategory as string) : "";
        searchParams.status = data.status ? (data.status as string) : "";
        searchParams.result = data.result ? (data.result as string) : "";
        pagination.value.pageNumber = 1;
        getDetailTable();
      },
      handleReset: () => {
        searchParams.keyword = "";
        searchParams.targetCategory = "";
        searchParams.status = "";
        searchParams.result = "";
        pagination.value.pageNumber = 1;
        getDetailTable();
      },
      schema: formSchema,
      showCollapseButton: true,
    });
    searchParams.keyword = formApi.formValues.keyword ? (formApi.formValues.keyword as string) : "";
    searchParams.targetCategory = formApi.formValues.targetCategory ? (formApi.formValues.targetCategory as string) : "";
    searchParams.result = formApi.formValues.result ? (formApi.formValues.result as string) : searchParams.result;

    const pageChange = (pageNumber: number, pageSize: number): void => {
      pagination.value.pageNumber = pageNumber || 1;
      pagination.value.pageSize = pageSize;
      getDetailTable();
    };

    const renderSummary = (): JSX.Element => (
      <div class={styles.summary}>
        <div class={styles["summary-item"]}>
          <div class={styles["summary-label"]}>对象总数</div>
          <div class={styles["summary-value"]}>{state.details?.targetAllNum ?? 0}</div>
        </div>
        <div class={styles["summary-item"]}>
          <div class={styles["summary-label"]}>待巡检对象数</div>
          <div class={styles["summary-value"]}>{state.details?.waitTargetNum ?? 0}</div>
        </div>
        <div class={styles["summary-item"]}>
          <div class={styles["summary-label"]}>已巡检对象数</div>
          <div class={styles["summary-value"]}>{state.details?.completedTargetNum ?? 0}</div>
        </div>
        <div class={styles["summary-item"]}>
          <div class={styles["summary-label"]}>结果异常对象数</div>
          <div class={styles["summary-value"]}>{state.details?.errTargetNum ?? 0}</div>
        </div>
        <div class={styles["summary-item"]}>
          <div class={styles["summary-label"]}>异常对象修复数</div>
          <div class={styles["summary-value"]}>{state.details?.repairCount ?? state.details?.repairNum ?? 0}</div>
        </div>
      </div>
    );

    const renderBasicDetail = (): JSX.Element => (
      <section class={styles["detail-section"]}>
        <div class={styles["section-title"]}>基础信息</div>
        <SmartInspectBasicForm initFormState={state.formState} mode="task" readonly />
        <SmartInspectTargetTypeSelect value={state.selectedTargetCategories} readonly />
      </section>
    );

    const renderTaskSummary = (): JSX.Element => (
      <section class={styles["detail-section"]}>
        <div class={styles["section-title"]}>任务统计</div>
        {renderSummary()}
      </section>
    );

    const renderCommonDetail = (): JSX.Element => (
      <section class={styles["detail-section"]}>
        <div class={styles["section-title"]}>巡检对象执行明细</div>
        <SmartInspectCommonSettings value={state.commonSettings} readonly />
        <CubeForm />
        {h(Table as never, {
          columns,
          loading: state.loading,
          dataSource: state.dataSource,
          pagination: false,
          rowKey: "id",
        })}
        <Page
          style={{ textAlign: "right", marginTop: "10px" }}
          current={pagination.value.pageNumber}
          pageSize={pagination.value.pageSize}
          total={pagination.value.total}
          showQuickJumper={false}
          showSizeChanger
          showTotal={(total: number) => `总共 ${total} 条数据`}
          pageSizeOptions={["10", "20", "50", "100"]}
          onPageChange={pageChange}
        />
      </section>
    );

    const renderDroneDetail = (): JSX.Element => (
      <section class={styles["detail-section"]}>
        <div class={styles["section-title"]}>无人机巡检配置</div>
        <SmartInspectDeviceRouteConfig method="DRONE" value={state.droneConfig} readonly />
      </section>
    );

    const renderRobotDogDetail = (): JSX.Element => (
      <section class={styles["detail-section"]}>
        <div class={styles["section-title"]}>机器狗巡检配置</div>
        <SmartInspectDeviceRouteConfig method="ROBOT_DOG" value={state.robotDogConfig} readonly />
      </section>
    );

    onMounted(async () => {
      await getDetails();
      await getDetailInfo();
      await getDetailTable();
    });

    const layoutSlots = {
      "layout-content": (): JSX.Element => (
        <div class={[styles["page-content"], styles["detail-content"]]}>
          {renderBasicDetail()}
          {renderTaskSummary()}
          {hasCommonStep.value && renderCommonDetail()}
          {hasDroneStep.value && renderDroneDetail()}
          {hasRobotDogStep.value && renderRobotDogDetail()}
        </div>
      ),
      "footer-page": (): JSX.Element => (
        <Space>
          <Button
            onClick={() => {
              history.back();
            }}
          >
            返回
          </Button>
        </Space>
      ),
    };

    return (): JSX.Element => <CubeLayout title="巡检任务详情" v-slots={layoutSlots} showTableXScroll />;
  },
});
