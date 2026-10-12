import { DownloadOutlined, FileExcelOutlined, FileTextOutlined } from "@ant-design/icons-vue";
import dayjs from "dayjs";
import { computed, defineComponent, reactive, ref, shallowRef, type VNode } from "vue";
import { useRoute } from "vue-router";

import { CubeLayout, useCubeForm, useCubeTable } from "@ghcloud/cube-app-design";
import {
  InspectRecordStatus,
  inspectRecordResultSourceMap,
  inspectRecordResultSourceOptions,
  objectStatusMap,
  objectStatusColor,
  objectStatusOptions,
  type InspectRecordResultSource,
  type InspectRecordPageExportData,
  type InspectRecordVo,
} from "@ghcloud/cube-daily-inspection-service";
import { PopOver, Page, Button, Menu, MenuItem, DropDown, TimeRangePicker, Tabs, TabPane, type ColumnType } from "@ghcloud/cube-ui";
import { usePageName } from "@ghcloud/cube-utils";
import { DeptTreeSelect } from "@ghcloud/generic-component";

import {
  formatDroneDateTime,
  getCoordinateText,
  getResultDisplay,
  getResultValue,
  pickDroneText,
  toDroneDisplayText,
  type DroneInspectRecordDetail,
} from "./drone-inspect-record-detail";
import { DroneInspectRecordDetailModal } from "./drone-inspect-record-detail-modal";
import { ExportHtml } from "./export-html/export-html";
import { ExportReport } from "./export-report/export-report";
import { cubeDailyInspectionService, cubeMaintainDroneService } from "@/api/server";

import styles from "./inspect-records.module.less";

type InspectRecordTabKey = "COMPREHENSIVE" | "DRONE" | "ROBOT_DOG";
type InspectRecordRow = InspectRecordVo & Record<string, unknown>;
type InspectRecordPageResult = { records: InspectRecordRow[]; total: number; pages: number };

interface InspectRecordTab {
  key: InspectRecordTabKey;
  label: string;
  keywordPlaceholder: string;
  targetCategory?: string;
}

const INSPECT_RECORD_TABS: InspectRecordTab[] = [
  {
    key: "COMPREHENSIVE",
    label: "综合巡检",
    keywordPlaceholder: "巡检对象名称/任务名称",
  },
  {
    key: "DRONE",
    label: "无人机巡检",
    keywordPlaceholder: "航线名称/任务名称",
    targetCategory: "DRONE",
  },
  {
    key: "ROBOT_DOG",
    label: "机器狗巡检",
    keywordPlaceholder: "路线名称/任务名称",
    targetCategory: "ROBOT_DOG",
  },
];

const isInspectRecordTabKey = (value: unknown): value is InspectRecordTabKey => {
  return INSPECT_RECORD_TABS.some((item) => item.key === value);
};

const getTabConfig = (key: InspectRecordTabKey): InspectRecordTab => {
  return INSPECT_RECORD_TABS.find((item) => item.key === key) || INSPECT_RECORD_TABS[0];
};

const isAutoInspectRecordTab = (key: InspectRecordTabKey): boolean => key === "DRONE" || key === "ROBOT_DOG";

const isEmptyValue = (value: unknown): boolean => {
  return value === undefined || value === null || value === "";
};

const toDisplayText = toDroneDisplayText;
const pickText = pickDroneText;
const formatDateTime = formatDroneDateTime;

const joinUniqueText = (values: unknown[]): string => {
  return [...new Set(values.filter((item) => !isEmptyValue(item)).map(String))].join("、");
};

const pickValue = (record: Record<string, unknown>, keys: string[]): unknown => {
  return keys.map((key) => record[key]).find((value) => !isEmptyValue(value));
};

const getInspectItemText = (record: InspectRecordRow): string => {
  const direct = pickValue(record, ["itemName", "standardItemName", "inspectItemName"]);
  if (!isEmptyValue(direct)) return String(direct);

  const recordItems = record.recordItemVOS;
  if (Array.isArray(recordItems)) {
    const text = joinUniqueText(recordItems.map((item) => (item as Record<string, unknown>).itemName));
    if (text) return text;
  }

  const standardVOS = record.standardVOS;
  if (Array.isArray(standardVOS)) {
    const itemNames = standardVOS.flatMap((standard) => {
      const standardRecord = standard as unknown as Record<string, unknown>;
      const standardItems = standardRecord.standardItems;
      if (Array.isArray(standardItems) && standardItems.length) {
        return standardItems.map((item) => {
          const itemRecord = item as Record<string, unknown>;
          return itemRecord.name || itemRecord.itemName || itemRecord.alias;
        });
      }
      const itemVOS = standardRecord.itemVOS;
      if (Array.isArray(itemVOS) && itemVOS.length) {
        return itemVOS.map((item) => (item as Record<string, unknown>).itemName);
      }
      return [standardRecord.standardName || standardRecord.name];
    });
    const text = joinUniqueText(itemNames);
    if (text) return text;
  }

  return "--";
};

type StatusDisplay = { label: string; color: string };

const RECORD_STATUS_DISPLAY_MAP: Record<string, StatusDisplay> = {
  EXECUTING: { label: "待巡检", color: "#1677ff" },
  OVER: { label: "已巡检", color: "#6ab539" },
  WAIT_REPAIR: { label: "待修复", color: "#ff7d00" },
  WAITING: { label: "等待执行", color: "#86909c" },
  SENT: { label: "已下发", color: "#1677ff" },
  FLYING: { label: "飞行中", color: "#1677ff" },
  WAITING_ACTION: { label: "等待动作", color: "#86909c" },
  WAITING_MEDIA: { label: "等待媒体", color: "#86909c" },
  WAITING_RECORD: { label: "等待录像", color: "#86909c" },
  COMPLETED: { label: "已完成", color: "#6ab539" },
  FAILED: { label: "失败", color: "#ff4158" },
  PENDING: { label: "待巡检", color: "#86909c" },
};

const normalizeEnumKey = (value: unknown): string => toDisplayText(value, "").trim().toUpperCase();

const normalizePageRecords = (records: Record<string, unknown>[]): InspectRecordRow[] => {
  return records.map((record, index) => {
    const id = pickValue(record, ["id", "recordId", "inspectionRecordId", "waypointId", "routePointId"]);
    return {
      ...record,
      id: toDisplayText(id, `drone-waypoint-${index}`),
    } as InspectRecordRow;
  });
};

const renderText = (value: unknown): VNode => {
  const text = toDisplayText(value);
  return <PopOver content={text}>{text}</PopOver>;
};

const renderTime = (value: unknown): VNode => {
  const text = formatDateTime(value);
  return <PopOver content={text}>{text}</PopOver>;
};

const renderResult = (value: unknown): VNode => {
  const { label, color } = getResultDisplay(value);
  return (
    <PopOver content={label}>
      <span style={{ color }}>{label}</span>
    </PopOver>
  );
};

const renderResultSource = (value: unknown): VNode => {
  const source = normalizeEnumKey(value) || "MANUAL";
  const label = inspectRecordResultSourceMap.get(source as InspectRecordResultSource) || source;
  return renderText(label);
};

const renderObjectStatus = (value: unknown): VNode => {
  const status = toDisplayText(value, "").trim();
  const upperStatus = normalizeEnumKey(status);
  const preset = RECORD_STATUS_DISPLAY_MAP[upperStatus];
  const label = status ? objectStatusMap.get(status) || objectStatusMap.get(upperStatus) || preset?.label || status : "--";
  const color = objectStatusColor.get(status) || objectStatusColor.get(upperStatus) || preset?.color || "#86909c";
  return (
    <PopOver content={label}>
      <span style={{ color }}>{label}</span>
    </PopOver>
  );
};

export const InspectRecords = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName();
    const route = useRoute();
    const tableCode = route.path.replaceAll("/", "");
    const routeTab = Array.isArray(route.query.recordTab) ? route.query.recordTab[0] : route.query.recordTab;
    const activeTab = shallowRef<InspectRecordTabKey>(isInspectRecordTabKey(routeTab) ? routeTab : "COMPREHENSIVE");
    const activeTabConfig = computed(() => getTabConfig(activeTab.value));
    const defaultBegin = dayjs().startOf("day").format("YYYY-MM-DD HH:mm:ss");
    const defaultEnd = dayjs().endOf("day").format("YYYY-MM-DD HH:mm:ss");
    const tabTotals = reactive<Record<InspectRecordTabKey, number | null>>({
      COMPREHENSIVE: null,
      DRONE: null,
      ROBOT_DOG: null,
    });
    const searchParams = reactive({
      pageNumber: 1,
      pageSize: 10,
      result: "",
      resultSource: "",
      inspectionStatus: "",
      status: "",
      temporary: "",
      total: 0,
      period: `${defaultBegin},${defaultEnd}`,
      organizationId: "",
      keyword: "",
      timeStart: "",
      timeEnd: "",
      recordTab: activeTab.value,
    });
    const droneRecordDetailVisible = shallowRef(false);
    const selectedDroneRecord = shallowRef<DroneInspectRecordDetail | null>(null);

    const openDroneRecordDetail = (record: InspectRecordRow): void => {
      selectedDroneRecord.value = record as DroneInspectRecordDetail;
      droneRecordDetailVisible.value = true;
    };

    const closeDroneRecordDetail = (): void => {
      droneRecordDetailVisible.value = false;
    };

    const renderIndex = (index: number): VNode => {
      const current = (searchParams.pageNumber - 1) * searchParams.pageSize + index + 1;
      return renderText(current);
    };

    const actionColumn: ColumnType = {
      dataIndex: "__action",
      title: "操作",
      align: "center",
      width: 100,
      customRender: ({ record }: { record: InspectRecordRow }): VNode => {
        return (
          <Button
            type="link"
            size="small"
            onClick={() => {
              if (isAutoInspectRecordTab(activeTab.value)) {
                openDroneRecordDetail(record);
                return;
              }
              history.pushState({}, "", `/portal/daily-inspection/inspect-record-info?id=${record.id}`);
            }}
          >
            详情
          </Button>
        );
      },
    };

    const createCommonColumns = (): ColumnType[] => [
      {
        title: "序号",
        dataIndex: "__index",
        ellipsis: true,
        align: "center",
        width: 70,
        customRender: ({ index }: { index: number }): VNode => renderIndex(index),
      },
      {
        dataIndex: "taskName",
        title: "任务名称",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: string }): VNode => renderText(text),
      },
      {
        dataIndex: "targetName",
        title: "巡检对象",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: string }): VNode => renderText(text),
      },
      {
        dataIndex: "__inspectItem",
        title: "巡检项",
        ellipsis: true,
        align: "center",
        customRender: ({ record }: { record: InspectRecordRow }): VNode => renderText(getInspectItemText(record)),
      },
      {
        dataIndex: "result",
        title: "巡检结果",
        ellipsis: true,
        align: "center",
        customRender: ({ text, record }: { text: string; record: InspectRecordRow }): VNode => renderResult(getResultValue(record, text)),
      },
      {
        dataIndex: "resultSource",
        title: "结果来源",
        ellipsis: true,
        align: "center",
        width: 110,
        customRender: ({ text }: { text: string }): VNode => renderResultSource(text),
      },
      {
        dataIndex: "nickname",
        title: "执行人",
        ellipsis: true,
        align: "center",
        customRender: ({ text, record }: { text: string; record: InspectRecordRow }): VNode =>
          renderText(text || pickText(record, ["username", "staff", "executionUserName", "executorName"])),
      },
      {
        dataIndex: "time",
        title: "巡检时间",
        ellipsis: true,
        align: "center",
        width: 170,
        customRender: ({ text, record }: { text: string; record: InspectRecordRow }): VNode =>
          renderTime(
            text ||
              pickValue(record, ["flyFinishAt", "finishTime", "inspectTime", "inspectionTime", "executeTime", "updateTime", "createTime"]),
          ),
      },
      actionColumn,
    ];

    const createDroneColumns = (): ColumnType[] => [
      {
        title: "序号",
        dataIndex: "__index",
        ellipsis: true,
        align: "center",
        width: 70,
        customRender: ({ index }: { index: number }): VNode => renderIndex(index),
      },
      {
        dataIndex: "__routeName",
        title: "航线名称",
        ellipsis: true,
        align: "center",
        width: 160,
        customRender: ({ record }: { record: InspectRecordRow }): VNode =>
          renderText(pickText(record, ["routeName", "flightRouteName", "droneRouteName", "inspectionRouteName", "targetName"])),
      },
      {
        dataIndex: "__pointSeq",
        title: "航点序号",
        ellipsis: true,
        align: "center",
        width: 100,
        customRender: ({ record }: { record: InspectRecordRow }): VNode =>
          renderText(pickText(record, ["seqNo", "waypointSeqNo", "waypointNo", "pointSeqNo", "order", "sortNo"])),
      },
      {
        dataIndex: "__coordinate",
        title: "坐标（WGS84）",
        ellipsis: true,
        align: "center",
        width: 190,
        customRender: ({ record }: { record: InspectRecordRow }): VNode => {
          const text = getCoordinateText(record);
          return (
            <PopOver content={text}>
              <span class={styles.coordinateCell}>{text}</span>
            </PopOver>
          );
        },
      },
      {
        dataIndex: "__inspectMethod",
        title: "巡检方式",
        ellipsis: true,
        align: "center",
        width: 120,
        customRender: ({ record }: { record: InspectRecordRow }): VNode =>
          renderText(pickText(record, ["inspectMethod", "inspectionMethod", "methodName", "method"], "无人机巡检")),
      },
      {
        dataIndex: "taskName",
        title: "任务名称",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: string }): VNode => renderText(text),
      },
      {
        dataIndex: "__deviceName",
        title: "巡检设备",
        ellipsis: true,
        align: "center",
        width: 150,
        customRender: ({ record }: { record: InspectRecordRow }): VNode =>
          renderText(pickText(record, ["executionDeviceName", "deviceName", "droneDeviceName", "equipmentName", "nickname"])),
      },
      {
        dataIndex: "time",
        title: "巡检时间",
        ellipsis: true,
        align: "center",
        width: 170,
        customRender: ({ text, record }: { text: string; record: InspectRecordRow }): VNode =>
          renderTime(
            text ||
              pickValue(record, ["flyFinishAt", "finishTime", "inspectTime", "inspectionTime", "executeTime", "updateTime", "createTime"]),
          ),
      },
      {
        dataIndex: "status",
        title: "对象状态",
        ellipsis: true,
        align: "center",
        width: 110,
        customRender: ({ text, record }: { text: string; record: InspectRecordRow }): VNode =>
          renderObjectStatus(text || pickValue(record, ["flyStatus", "executionStatus", "taskStatus"])),
      },
      {
        dataIndex: "result",
        title: "巡检结果",
        ellipsis: true,
        align: "center",
        width: 110,
        customRender: ({ text, record }: { text: string; record: InspectRecordRow }): VNode => renderResult(getResultValue(record, text)),
      },
      actionColumn,
    ];

    const createRobotDogColumns = (): ColumnType[] => [
      {
        title: "序号",
        dataIndex: "__index",
        ellipsis: true,
        align: "center",
        width: 70,
        customRender: ({ index }: { index: number }): VNode => renderIndex(index),
      },
      {
        dataIndex: "__routeName",
        title: "路线名称",
        ellipsis: true,
        align: "center",
        width: 160,
        customRender: ({ record }: { record: InspectRecordRow }): VNode =>
          renderText(pickText(record, ["routeName", "robotDogRouteName", "groundRouteName", "inspectionRouteName", "targetName"])),
      },
      {
        dataIndex: "__pointSeq",
        title: "路线点序号",
        ellipsis: true,
        align: "center",
        width: 110,
        customRender: ({ record }: { record: InspectRecordRow }): VNode =>
          renderText(pickText(record, ["seqNo", "routePointSeqNo", "routePointNo", "pointSeqNo", "order", "sortNo"])),
      },
      {
        dataIndex: "__coordinate",
        title: "坐标（WGS84）",
        ellipsis: true,
        align: "center",
        width: 190,
        customRender: ({ record }: { record: InspectRecordRow }): VNode => {
          const text = getCoordinateText(record);
          return (
            <PopOver content={text}>
              <span class={styles.coordinateCell}>{text}</span>
            </PopOver>
          );
        },
      },
      {
        dataIndex: "__pointName",
        title: "点位名称",
        ellipsis: true,
        align: "center",
        width: 150,
        customRender: ({ record }: { record: InspectRecordRow }): VNode =>
          renderText(pickText(record, ["pointName", "routePointName", "waypointName", "name", "targetName"])),
      },
      {
        dataIndex: "taskName",
        title: "任务名称",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: string }): VNode => renderText(text),
      },
      {
        dataIndex: "__deviceName",
        title: "巡检设备",
        ellipsis: true,
        align: "center",
        width: 150,
        customRender: ({ record }: { record: InspectRecordRow }): VNode =>
          renderText(pickText(record, ["executionDeviceName", "deviceName", "robotDogDeviceName", "equipmentName", "nickname"])),
      },
      {
        dataIndex: "time",
        title: "巡检时间",
        ellipsis: true,
        align: "center",
        width: 170,
        customRender: ({ text, record }: { text: string; record: InspectRecordRow }): VNode =>
          renderTime(text || pickValue(record, ["finishTime", "inspectTime", "inspectionTime", "executeTime", "updateTime", "createTime"])),
      },
      {
        dataIndex: "status",
        title: "对象状态",
        ellipsis: true,
        align: "center",
        width: 110,
        customRender: ({ text, record }: { text: string; record: InspectRecordRow }): VNode =>
          renderObjectStatus(text || pickValue(record, ["executionStatus", "taskStatus"])),
      },
      {
        dataIndex: "result",
        title: "巡检结果",
        ellipsis: true,
        align: "center",
        width: 110,
        customRender: ({ text, record }: { text: string; record: InspectRecordRow }): VNode => renderResult(getResultValue(record, text)),
      },
      actionColumn,
    ];

    const createColumns = (): ColumnType[] => {
      if (activeTab.value === "DRONE") return createDroneColumns();
      if (activeTab.value === "ROBOT_DOG") return createRobotDogColumns();
      return createCommonColumns();
    };

    const buildBaseQueryPayload = (): {
      pageNumber: number;
      pageSize: number;
      result?: string;
      resultSource?: InspectRecordResultSource;
      temporary?: string;
      status?: InspectRecordStatus;
      keyword?: string;
      period?: string;
      organizationId?: string;
      timeStart?: string;
      timeEnd?: string;
    } => ({
      pageNumber: searchParams.pageNumber,
      pageSize: searchParams.pageSize,
      result: searchParams.result,
      resultSource: searchParams.resultSource as InspectRecordResultSource,
      temporary: searchParams.temporary,
      status: searchParams.status as InspectRecordStatus,
      keyword: searchParams.keyword,
      period: searchParams.period,
      organizationId: searchParams.organizationId,
      timeStart: searchParams.timeStart,
      timeEnd: searchParams.timeEnd,
    });

    const buildDroneQueryPayload = (): {
      pageNumber: number;
      pageSize: number;
      inspectionStatus?: string;
      keyword?: string;
      completedRecordOnly: true;
    } => ({
      pageNumber: searchParams.pageNumber,
      pageSize: searchParams.pageSize,
      inspectionStatus: searchParams.inspectionStatus,
      keyword: searchParams.keyword,
      completedRecordOnly: true,
    });

    const buildRecordQueryPayload = (): ReturnType<typeof buildBaseQueryPayload> & { targetCategory?: string } => ({
      ...buildBaseQueryPayload(),
      ...(activeTabConfig.value.targetCategory ? { targetCategory: activeTabConfig.value.targetCategory } : {}),
    });

    const fetchDroneRecords = async (): Promise<InspectRecordPageResult> => {
      const result = await cubeMaintainDroneService.pageDroneInspectionTaskWaypointRecords(buildDroneQueryPayload());
      return {
        records: normalizePageRecords(result.records || []),
        total: result.total || 0,
        pages: result.pages || 0,
      };
    };

    const fetchRobotDogRecords = async (): Promise<InspectRecordPageResult> => {
      const result = await cubeMaintainDroneService.pageRobotDogInspectionTaskPointRecords(buildDroneQueryPayload());
      return {
        records: normalizePageRecords(result.records || []),
        total: result.total || 0,
        pages: result.pages || 0,
      };
    };

    /**
     * 表单配置
     */
    const createResultFormSchema = (fieldName: "result" | "inspectionStatus" = "result") => ({
      component: "Select",
      label: "巡查结果",
      fieldName,
      defaultValue: null,
      componentProps: {
        placeholder: "巡查结果",
        allowClear: true,
        options: [
          ...(fieldName === "inspectionStatus"
            ? [
                {
                  label: "待巡检",
                  value: "PENDING",
                },
              ]
            : []),
          {
            label: "正常",
            value: "NORMAL",
          },
          {
            label: "异常",
            value: "ABNORMAL",
          },
        ],
        onChange: (value: string): void => {
          if (fieldName === "inspectionStatus") {
            searchParams.inspectionStatus = value;
          } else {
            searchParams.result = value;
          }
          searchParams.pageNumber = 1;
          tableApi.query();
        },
      },
    });

    const createKeywordFormSchema = () => ({
      component: "Input",
      label: "",
      fieldName: "keyword",
      componentProps: {
        placeholder: activeTabConfig.value.keywordPlaceholder,
      },
    });

    const createResultSourceFormSchema = () => ({
      component: "Select",
      label: "结果来源",
      fieldName: "resultSource",
      defaultValue: null,
      componentProps: {
        placeholder: "结果来源",
        allowClear: true,
        options: inspectRecordResultSourceOptions,
        onChange: (value: string): void => {
          searchParams.resultSource = value;
          searchParams.pageNumber = 1;
          tableApi.query();
        },
      },
    });

    const createCommonFormSchema = () => [
      {
        component: "Select",
        label: "记录类型",
        fieldName: "temporary",
        defaultValue: null,
        componentProps: {
          placeholder: "记录类型",
          options: [
            {
              label: "全部记录",
              value: 0,
            },
            {
              label: "日常记录",
              value: 1,
            },
            {
              label: "临时记录",
              value: 2,
            },
          ],
          onChange: (value: string): void => {
            searchParams.temporary = value;
            searchParams.pageNumber = 1;
            tableApi.query();
          },
        },
      },
      {
        component: "Select",
        label: "对象状态",
        fieldName: "status",
        defaultValue: null,
        componentProps: {
          placeholder: "对象状态",
          allowClear: true,
          options: [
            {
              label: "全部",
              value: "",
            },
            ...Object.keys(objectStatusOptions).map((item) => {
              return {
                label: objectStatusOptions[item as keyof typeof objectStatusOptions],
                value: item,
              };
            }),
          ],
          onChange: (value: string): void => {
            searchParams.status = value;
            searchParams.pageNumber = 1;
            tableApi.query();
          },
        },
      },
      createResultFormSchema(),
      createResultSourceFormSchema(),
      {
        component: "RangePicker",
        label: "巡检时间",
        fieldName: "period",
        defaultValue: [defaultBegin, defaultEnd],
        componentProps: {
          valueFormat: "YYYY-MM-DD HH:mm:ss",
        },
      },
      {
        component: TimeRangePicker,
        label: "时间段",
        fieldName: "timeRange",
        defaultValue: null,
        componentProps: {
          valueFormat: "HH:mm",
          format: "HH:mm",
          placeholder: ["开始时间", "结束时间"],
        },
      },
      {
        component: DeptTreeSelect,
        label: "所属部门",
        fieldName: "organizationId",
        componentProps: {
          placeholder: "所属部门",
        },
      },
      createKeywordFormSchema(),
    ];

    const createDroneFormSchema = () => [createResultFormSchema("inspectionStatus"), createKeywordFormSchema()];

    const createFormSchema = () => (isAutoInspectRecordTab(activeTab.value) ? createDroneFormSchema() : createCommonFormSchema());

    const clearNonDroneFilters = (): void => {
      searchParams.status = "";
      searchParams.temporary = "";
      searchParams.result = "";
      searchParams.resultSource = "";
      searchParams.period = "";
      searchParams.organizationId = "";
      searchParams.timeStart = "";
      searchParams.timeEnd = "";
      formApi.setFormValues({
        status: null,
        temporary: null,
        resultSource: null,
        period: null,
        timeRange: null,
        organizationId: null,
      });
    };

    const syncFormSchema = (): void => {
      formApi.updateSchema(createFormSchema());
      formApi.setState({ showCollapseButton: !isAutoInspectRecordTab(activeTab.value) });
    };

    const [CubeForm, formApi] = useCubeForm({
      syncStateRef: searchParams,
      onHydratedQuery: () => {
        if (isInspectRecordTabKey(searchParams.recordTab)) {
          activeTab.value = searchParams.recordTab;
          tableApi.setColumns(createColumns());
          if (isAutoInspectRecordTab(activeTab.value)) {
            clearNonDroneFilters();
          }
          syncFormSchema();
        }
        if (!searchParams.period) {
          if (isAutoInspectRecordTab(activeTab.value)) {
            searchParams.period = "";
          } else {
            searchParams.period = `${defaultBegin},${defaultEnd}`;
            formApi.formValues.period = [defaultBegin, defaultEnd];
          }
        }
        tableApi.query(); // URL/session 回填后自动首查
      },
      layout: "horizontal",
      handleSubmit: (data) => {
        searchParams.keyword = data.keyword ? (data.keyword as string) : "";
        if (isAutoInspectRecordTab(activeTab.value)) {
          searchParams.inspectionStatus = data.inspectionStatus ? (data.inspectionStatus as string) : "";
          clearNonDroneFilters();
          searchParams.pageNumber = 1;
          tableApi.query();
          return;
        }
        searchParams.result = data.result ? (data.result as string) : "";
        searchParams.resultSource = data.resultSource ? (data.resultSource as string) : "";
        searchParams.inspectionStatus = "";
        if (data.period && Array.isArray(data.period) && data.period.length >= 2) {
          const start = dayjs(data.period[0]).format("YYYY-MM-DD") + " 00:00:00";
          const end = dayjs(data.period[1]).format("YYYY-MM-DD") + " 23:59:59";
          searchParams.period = [start, end].join(",");
        } else {
          searchParams.period = "";
        }
        searchParams.status = data.status ? (data.status as string) : "";
        searchParams.temporary = data.temporary ? (data.temporary as string) : "";
        searchParams.organizationId = data.organizationId ? (data.organizationId as string) : "";
        const timeRange = data.timeRange as [string, string] | null | undefined;
        searchParams.timeStart = timeRange?.[0] ?? "";
        searchParams.timeEnd = timeRange?.[1] ?? "";
        searchParams.pageNumber = 1;
        tableApi.query();
      },
      handleReset: () => {
        searchParams.keyword = "";
        searchParams.result = "";
        searchParams.resultSource = "";
        searchParams.inspectionStatus = "";
        searchParams.pageNumber = 1;
        if (isAutoInspectRecordTab(activeTab.value)) {
          clearNonDroneFilters();
        } else {
          searchParams.period = `${defaultBegin},${defaultEnd}`;
          searchParams.status = "";
          searchParams.temporary = "";
          searchParams.organizationId = "";
          searchParams.timeStart = "";
          searchParams.timeEnd = "";
          formApi.formValues.period = [defaultBegin, defaultEnd];
        }
        tableApi.query();
      },
      schema: createFormSchema(),
      showCollapseButton: true,
    });

    /**
     * 表格
     */
    const [CubeTable, tableApi] = useCubeTable({
      columns: createColumns(),
      tableCode,
      rowKey: "id",
      fetchApi: async () => {
        if (activeTab.value === "DRONE") {
          return fetchDroneRecords();
        }
        if (activeTab.value === "ROBOT_DOG") {
          return fetchRobotDogRecords();
        }
        return cubeDailyInspectionService.getInspectRecordList(buildRecordQueryPayload());
      },
      fetchLoaded: (data) => {
        searchParams.total = data.total;
        tabTotals[activeTab.value] = data.total;
      },
    });

    const handleTabChange = (key: string | number): void => {
      if (!isInspectRecordTabKey(key)) return;
      activeTab.value = key;
      searchParams.recordTab = key;
      searchParams.pageNumber = 1;
      if (isAutoInspectRecordTab(key)) {
        clearNonDroneFilters();
      } else if (!searchParams.period) {
        searchParams.period = `${defaultBegin},${defaultEnd}`;
        formApi.formValues.period = [defaultBegin, defaultEnd];
      }
      tableApi.setColumns(createColumns());
      tableApi.setDataSource([]);
      syncFormSchema();
      tableApi.query();
    };

    const handleChange = (pageNumber: number, pageSize: number): void => {
      searchParams.pageNumber = pageNumber;
      searchParams.pageSize = pageSize;
      tableApi.query();
    };

    const getExportData = async (): Promise<InspectRecordPageExportData | null> => {
      try {
        exportLoading.value = true;
        if (isAutoInspectRecordTab(activeTab.value)) {
          return { inspectRecordList: (tableApi.getDataSource() || []) as InspectRecordVo[] };
        }
        const exportData = await cubeDailyInspectionService.getInspectRecordExport(buildRecordQueryPayload());
        // exportData.inspectRecordList = exportData.inspectRecordList?.slice(1, 20) || []
        return exportData;
      } catch {
        return null;
      } finally {
        exportLoading.value = false;
      }
    };
    const exportLoading = ref(false);
    const exportHtmlRef = ref<{ handleExport: (data?: InspectRecordPageExportData) => void }>();
    const exportExcelRef = ref<{ handleExport: (data?: InspectRecordPageExportData) => void }>();
    const exportFileName = computed(() => `${pageTitle}-${activeTabConfig.value.label}`);
    const handleExport = async (type: "html" | "excel"): Promise<any> => {
      try {
        exportLoading.value = true;
        const exportData = await getExportData();
        if (!exportData) {
          return null;
        }
        if (type === "html") {
          await exportHtmlRef.value?.handleExport(exportData);
        } else if (type === "excel") {
          await exportExcelRef.value?.handleExport(exportData);
        }

        return exportData;
      } catch {
        return null;
      } finally {
        exportLoading.value = false;
      }
    };

    const renderDroneRecordDetailModal = (): VNode => (
      <DroneInspectRecordDetailModal
        visible={droneRecordDetailVisible.value}
        record={selectedDroneRecord.value}
        onClose={closeDroneRecordDetail}
      />
    );

    const renderTabLabel = (tab: InspectRecordTab): VNode => {
      const total = tabTotals[tab.key];
      return (
        <span>
          {tab.label}
          {typeof total === "number" && <span class={styles.tabCount}>{total}</span>}
        </span>
      );
    };

    const renderRecordContent = (): VNode => (
      <div class={styles.recordTableContent}>
        <CubeForm />
        <CubeTable />
      </div>
    );

    const slots = {
      "layout-header": (): VNode => {
        return (
          <>
            <div class={styles.exportButtonContainer}>
              <DropDown
                v-slots={{
                  overlay: () => (
                    <Menu class={styles.exportMenu}>
                      <MenuItem key="html" icon={<FileTextOutlined />} onClick={() => handleExport("html")}>
                        导出HTML
                      </MenuItem>
                      <MenuItem key="excel" icon={<FileExcelOutlined />} onClick={() => handleExport("excel")}>
                        导出Excel
                      </MenuItem>
                    </Menu>
                  ),
                  default: () => (
                    <Button type="primary" loading={exportLoading.value} class={styles.exportButton}>
                      <DownloadOutlined />
                      导出
                    </Button>
                  ),
                }}
                trigger={["click"]}
                placement="bottomRight"
                disabled={exportLoading.value}
              />
            </div>
            <>
              <ExportHtml fileName={exportFileName.value} style={{ marginRight: "10px" }} ref={exportHtmlRef} />
              <ExportReport fileName={exportFileName.value} ref={exportExcelRef} />
            </>
            {renderDroneRecordDetailModal()}
          </>
        );
      },
      "layout-content": (): VNode => {
        return (
          <div class={styles.recordPage}>
            <Tabs activeKey={activeTab.value} onTabChange={handleTabChange}>
              {INSPECT_RECORD_TABS.map((tab) => (
                <TabPane key={tab.key} tab={renderTabLabel(tab)}>
                  {activeTab.value === tab.key ? renderRecordContent() : null}
                </TabPane>
              ))}
            </Tabs>
          </div>
        );
      },
      "footer-page": (): VNode => {
        return (
          <Page
            current={searchParams.pageNumber}
            pageSize={searchParams.pageSize}
            total={searchParams.total}
            showQuickJumper={false}
            showSizeChanger
            showTotal={(total: number) => `总共 ${total} 条数据`}
            pageSizeOptions={["10", "20", "50", "100"]}
            onPageChange={handleChange}
          />
        );
      },
    };
    return (): VNode => <CubeLayout class={styles.container} title={pageTitle} v-slots={slots} showTableXScroll />;
  },
});
