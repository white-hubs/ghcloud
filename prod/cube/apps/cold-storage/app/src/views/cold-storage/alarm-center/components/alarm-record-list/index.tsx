import { defineComponent, nextTick, reactive, ref, watch, type PropType } from "vue";

import { useCubeForm, useCubeTable } from "@ghcloud/cube-app-design";
import type { AlarmRecord as PlatformAlarmRecord } from "@ghcloud/cube-service-interface/alarm-center";
import {
  confirmAlarmRecord,
  deleteAlarmRecords,
  getAlarmRecordPage,
  urgeAlarmRecords,
} from "@ghcloud/cube-services-client/alarm-center.client";
import { useAuthRequest } from "@ghcloud/cube-services-client/auth-request";
import { AntModal, Button, message, Page, Space, Tag } from "@ghcloud/cube-ui";

import { formatDateTime } from "../../../shared/time";
import {
  alarmLevelColor,
  alarmResultOptions,
  alarmResultText,
  alarmStatusColor,
  alarmStatusText,
  alarmTimeoutColor,
  alarmTimeoutText,
} from "../../alarm-record-data";
import type {
  AlarmActionType,
  AlarmHandlerResult,
  AlarmLevel,
  AlarmLevelId,
  AlarmRecordQuery,
  AlarmStatus,
  AlarmTimeoutStatus,
} from "../../alarm-record-types";
import { AlarmActionModal } from "../alarm-action-modal";

import "./index.less";

type ListAlarmRecord = PlatformAlarmRecord;

const canOperate = (record: ListAlarmRecord): boolean =>
  Boolean(record.alarmStatus && ["ALARM_UN_CONFIRMED", "ALARM_PROGRESS_CONFIRMED", "ALARM_SUSPEND"].includes(record.alarmStatus));

const canConfirm = (record: ListAlarmRecord): boolean => record.alarmStatus === "ALARM_UN_CONFIRMED";

const canTransfer = (record: ListAlarmRecord): boolean =>
  Boolean(record.alarmStatus && ["ALARM_UN_CONFIRMED", "ALARM_PROGRESS_CONFIRMED", "ALARM_SUSPEND"].includes(record.alarmStatus));

const canFollowUp = (record: ListAlarmRecord): boolean =>
  Boolean(record.alarmStatus && ["ALARM_PROGRESS_CONFIRMED", "ALARM_SUSPEND"].includes(record.alarmStatus));

const canSuspend = (record: ListAlarmRecord): boolean => record.alarmStatus === "ALARM_PROGRESS_CONFIRMED";

const canHandle = (record: ListAlarmRecord): boolean =>
  Boolean(record.alarmStatus && ["ALARM_UN_CONFIRMED", "ALARM_PROGRESS_CONFIRMED", "ALARM_SUSPEND"].includes(record.alarmStatus));

const canUrge = (record: ListAlarmRecord): boolean =>
  Boolean(record.alarmStatus && ["ALARM_PROGRESS_CONFIRMED", "ALARM_SUSPEND"].includes(record.alarmStatus));

const alarmLevelOptions: Array<{ label: AlarmLevel; value: AlarmLevelId }> = [
  { label: "一级", value: "1" },
  { label: "二级", value: "2" },
  { label: "三级", value: "3" },
  { label: "四级", value: "4" },
];

const alarmLevelNameById = alarmLevelOptions.reduce<Record<string, AlarmLevel>>((result, item) => {
  result[item.value] = item.label;
  return result;
}, {});

const readCurrentApplicationCode = (): string => {
  try {
    const raw = window.sessionStorage.getItem("GH-currentApplication");
    return raw ? String((JSON.parse(raw) as { code?: string }).code ?? "") : "";
  } catch {
    return "";
  }
};

const normalizeDateRange = (value: unknown): [string, string] | [] => {
  if (!Array.isArray(value) || value.length < 2) {
    return [];
  }
  const [start, end] = value;
  if (!start || !end) {
    return [];
  }
  return [String(start), String(end)];
};

const toPeriod = (date: [string, string] | []): string => {
  if (date.length !== 2) {
    return "";
  }
  return `${date[0]},${date[1]}`;
};

const displayStatus = (record: ListAlarmRecord): string => {
  if (record.alarmStatusName) {
    return record.alarmStatusName;
  }
  return record.alarmStatus ? alarmStatusText[record.alarmStatus] : "--";
};

const displayTimeout = (record: ListAlarmRecord): string => {
  if (record.alarmHandlerTimeoutStatus === "TIMED_OUT") {
    return alarmTimeoutText.TIMED_OUT;
  }
  if (record.alarmHandlerTimeoutStatus === "NORMAL") {
    return alarmTimeoutText.NORMAL;
  }
  return record.alarmHandlerTimeoutStatus ? alarmTimeoutText[record.alarmHandlerTimeoutStatus] : "--";
};

const timeoutColor = (record: ListAlarmRecord): string => {
  if (record.alarmHandlerTimeoutStatus === "TIMED_OUT") {
    return alarmTimeoutColor.TIMED_OUT;
  }
  if (record.alarmHandlerTimeoutStatus === "NORMAL") {
    return alarmTimeoutColor.NORMAL;
  }
  return record.alarmHandlerTimeoutStatus ? alarmTimeoutColor[record.alarmHandlerTimeoutStatus] : "";
};

export const AlarmRecordList = defineComponent({
  name: "AlarmRecordList",
  props: {
    tableCode: {
      type: String,
      default: "COLD_STORAGE_ALARM_RECORD_LIST",
    },
    deviceIds: {
      type: Array as PropType<string[]>,
      default: () => [],
    },
    applicationCode: {
      type: String,
      default: "",
    },
    showBatchRemove: {
      type: Boolean,
      default: true,
    },
  },
  emits: ["openDetail", "batchRemove"],
  setup: (props, { emit, expose }) => {
    const selectedRowKeys = ref<string[]>([]);
    const selectedRows = ref<ListAlarmRecord[]>([]);
    const actionModal = reactive<{ visible: boolean; action: AlarmActionType; record: ListAlarmRecord | null }>({
      visible: false,
      action: "transfer",
      record: null,
    });
    const query = reactive<AlarmRecordQuery & { pageNumber: number; pageSize: number; total: number }>({
      pageNumber: 1,
      pageSize: 10,
      total: 0,
      keyword: "",
      applicationCode: props.applicationCode || readCurrentApplicationCode(),
      deviceIds: props.deviceIds,
      alarmLevelId: "",
      alarmLevelName: "",
      alarmStatus: "",
      alarmHandlerResult: "",
      alarmHandlerTimeoutStatus: "",
      date: [],
    });

    const [CubeForm] = useCubeForm({
      layout: "horizontal",
      isCollapsed: false,
      syncStateRef: query,
      schema: [
        {
          component: "Input",
          label: "",
          fieldName: "keyword",
          componentProps: {
            placeholder: "请输入设备名称/报警事件",
          },
        },
        {
          component: "Select",
          label: "报警级别",
          fieldName: "alarmLevelId",
          componentProps: {
            placeholder: "请选择报警级别",
            options: alarmLevelOptions,
          },
        },
        {
          component: "Select",
          label: "处理状态",
          fieldName: "alarmStatus",
          componentProps: {
            placeholder: "请选择处理状态",
            options: (Object.keys(alarmStatusText) as AlarmStatus[]).map((value) => ({ label: alarmStatusText[value], value })),
          },
        },
        {
          component: "Select",
          label: "处理结果",
          fieldName: "alarmHandlerResult",
          componentProps: {
            placeholder: "请选择处理结果",
            options: alarmResultOptions,
          },
        },
        {
          component: "Select",
          label: "超时状态",
          fieldName: "alarmHandlerTimeoutStatus",
          componentProps: {
            placeholder: "请选择超时状态",
            options: (Object.keys(alarmTimeoutText) as AlarmTimeoutStatus[]).map((value) => ({ label: alarmTimeoutText[value], value })),
          },
        },
        {
          component: "RangePicker",
          label: "报警时间",
          fieldName: "date",
          componentProps: {
            valueFormat: "YYYY-MM-DD HH:mm:ss",
          },
        },
      ],
      handleSubmit: (values) => {
        query.pageNumber = 1;
        query.keyword = values.keyword ? String(values.keyword) : "";
        query.applicationCode = props.applicationCode || query.applicationCode || readCurrentApplicationCode();
        query.deviceIds = props.deviceIds;
        query.alarmLevelId = (values.alarmLevelId as "" | AlarmLevelId) ?? "";
        query.alarmLevelName = query.alarmLevelId ? alarmLevelNameById[query.alarmLevelId] : "";
        query.alarmStatus = (values.alarmStatus as "" | AlarmStatus) ?? "";
        query.alarmHandlerResult = (values.alarmHandlerResult as "" | AlarmHandlerResult) ?? "";
        query.alarmHandlerTimeoutStatus = (values.alarmHandlerTimeoutStatus as "" | AlarmTimeoutStatus) ?? "";
        query.date = normalizeDateRange(values.date);
        tableApi.query();
      },
      handleReset: () => {
        query.pageNumber = 1;
        query.keyword = "";
        query.applicationCode = props.applicationCode || readCurrentApplicationCode();
        query.deviceIds = props.deviceIds;
        query.alarmLevelId = "";
        query.alarmLevelName = "";
        query.alarmStatus = "";
        query.alarmHandlerResult = "";
        query.alarmHandlerTimeoutStatus = "";
        query.date = [];
        tableApi.query();
      },
    });

    const columns = [
      { title: "报警事件", dataIndex: "alarmEventName", align: "center" },
      {
        title: "报警级别",
        dataIndex: "alarmLevelName",
        align: "center",
        width: 96,
        customRender: ({ text }: { text?: AlarmLevel }) => <span style={{ color: text ? alarmLevelColor[text] : "" }}>{text || "--"}</span>,
      },
      { title: "报警区域", dataIndex: "areaName", align: "center" },
      { title: "详细位置", dataIndex: "alarmTargetAddress", align: "center" },
      {
        title: "报警时间",
        dataIndex: "alarmTime",
        align: "center",
        width: 170,
        customRender: ({ text }: { text?: string | number }) => formatDateTime(text),
      },
      { title: "报警设备", dataIndex: "alarmTargetName", align: "center" },
      { title: "处理时限", dataIndex: "timeoutProcessTimesName", align: "center", width: 100 },
      {
        title: "超时状态",
        dataIndex: "alarmHandlerTimeoutStatus",
        align: "center",
        width: 96,
        customRender: ({ record }: { record: ListAlarmRecord }) => (
          <span style={{ color: timeoutColor(record) }}>{displayTimeout(record)}</span>
        ),
      },
      {
        title: "处理状态",
        dataIndex: "alarmStatus",
        align: "center",
        width: 100,
        customRender: ({ record }: { record: ListAlarmRecord }) => (
          <Tag color={record.alarmStatus ? alarmStatusColor[record.alarmStatus] : undefined}>{displayStatus(record)}</Tag>
        ),
      },
      {
        title: "处理结果",
        dataIndex: "alarmHandlerResult",
        align: "center",
        width: 100,
        customRender: ({ text }: { text?: AlarmHandlerResult }) => (text ? alarmResultText[text] : "--"),
      },
      {
        title: "处理人",
        dataIndex: "alarmHandlerName",
        align: "center",
        width: 100,
        customRender: ({ text }: { text?: string }) => text || "--",
      },
      {
        title: "操作",
        align: "center",
        width: 280,
        fixed: "right",
        customRender: ({ record }: { record: ListAlarmRecord }) => (
          <Space>
            <Button type="link" size="small" onClick={() => emit("openDetail", record)}>
              详情
            </Button>
            {canOperate(record) && (
              <>
                {canConfirm(record) && (
                  <Button type="link" size="small" onClick={() => confirm(record)}>
                    接收
                  </Button>
                )}
                {canTransfer(record) && (
                  <Button type="link" size="small" onClick={() => openAction("transfer", record)}>
                    指派
                  </Button>
                )}
                {canFollowUp(record) && (
                  <Button type="link" size="small" onClick={() => openAction("followUp", record)}>
                    跟进
                  </Button>
                )}
                {canSuspend(record) && (
                  <Button type="link" size="small" onClick={() => openAction("suspend", record)}>
                    挂起
                  </Button>
                )}
                {canHandle(record) && (
                  <Button type="link" size="small" onClick={() => openAction("handle", record)}>
                    处理
                  </Button>
                )}
                {canUrge(record) && (
                  <Button type="link" size="small" onClick={() => urge(record)}>
                    催办
                  </Button>
                )}
              </>
            )}
          </Space>
        ),
      },
    ];

    const [AlarmTable, tableApi] = useCubeTable({
      rowKey: "id",
      tableCode: props.tableCode,
      columns,
      rowSelection: props.showBatchRemove ? "checkbox" : "",
      rowSelectionChange: (keys, rows) => {
        selectedRowKeys.value = keys.map(String);
        selectedRows.value = rows as ListAlarmRecord[];
      },
      fetchApi: async () => {
        if (!query.deviceIds.length) {
          return { records: [], total: 0, pages: 0 };
        }
        return useAuthRequest(() =>
          getAlarmRecordPage({
            pageNumber: query.pageNumber,
            pageSize: query.pageSize,
            keyword: query.keyword,
            applicationCode: query.applicationCode,
            deviceIds: query.deviceIds,
            alarmLevelId: query.alarmLevelId,
            alarmStatus: query.alarmStatus,
            alarmHandlerResult: query.alarmHandlerResult,
            alarmHandlerTimeoutStatus: query.alarmHandlerTimeoutStatus,
            period: toPeriod(query.date),
          }),
        );
      },
      fetchLoaded: (data) => {
        query.total = data.total;
      },
    });

    const clearSelectedRows = (): void => {
      tableApi.setSelectedRowKeys([]);
      selectedRowKeys.value = [];
      selectedRows.value = [];
    };

    const refresh = (): void => {
      clearSelectedRows();
      tableApi.query();
    };

    expose({ refresh });

    const openAction = (action: AlarmActionType, record: ListAlarmRecord): void => {
      actionModal.action = action;
      actionModal.record = record;
      actionModal.visible = true;
    };

    const confirm = (record: ListAlarmRecord): void => {
      AntModal.confirm({
        centered: true,
        title: "接收确认",
        content: `确认接收 ${record.alarmEventName || "当前报警"}？`,
        okText: "确定",
        cancelText: "取消",
        onOk: async () => {
          await useAuthRequest(() => confirmAlarmRecord(record.id));
          message.success("接收成功");
          refresh();
        },
      });
    };

    const urge = (record: ListAlarmRecord): void => {
      AntModal.confirm({
        centered: true,
        title: "催办确认",
        content: `确认催办 ${record.alarmEventName || "当前报警"}？`,
        okText: "确定",
        cancelText: "取消",
        onOk: async () => {
          await useAuthRequest(() => urgeAlarmRecords({ ids: [record.id] }));
          message.success("催办成功");
          refresh();
        },
      });
    };

    watch(
      () => [props.deviceIds.join(","), props.applicationCode],
      () => {
        query.pageNumber = 1;
        query.applicationCode = props.applicationCode || readCurrentApplicationCode();
        query.deviceIds = props.deviceIds;
        clearSelectedRows();
        void nextTick(() => tableApi.query());
      },
    );

    const handlePageChange = (pageNumber: number, pageSize: number): void => {
      query.pageNumber = pageNumber;
      query.pageSize = pageSize;
      tableApi.query();
    };

    const batchRemove = (): void => {
      const ids = selectedRowKeys.value;
      if (ids.length === 0) {
        return;
      }
      AntModal.confirm({
        centered: true,
        title: "移除确认",
        content: `确认移除已选中的 ${ids.length} 条报警记录？`,
        okText: "确定",
        cancelText: "取消",
        onOk: async () => {
          const currentPageRecords = tableApi.getDataSource() ?? [];
          await useAuthRequest(() => deleteAlarmRecords({ ids }));
          emit("batchRemove", ids, selectedRows.value);
          message.success("删除成功");
          if (query.pageNumber > 1 && ids.length >= currentPageRecords.length) {
            query.pageNumber -= 1;
          }
          refresh();
        },
      });
    };

    return () => (
      <div class="alarm-record-list">
        <div class="alarm-record-list__toolbar">
          <CubeForm />
          {props.showBatchRemove && (
            <Button type="primary" danger disabled={selectedRowKeys.value.length === 0} onClick={batchRemove}>
              批量移除
            </Button>
          )}
        </div>
        <AlarmTable />
        <div class="alarm-record-list__page">
          <Page current={query.pageNumber} pageSize={query.pageSize} total={query.total} onPageChange={handlePageChange} />
        </div>
        <AlarmActionModal
          visible={actionModal.visible}
          action={actionModal.action}
          record={actionModal.record}
          onUpdate:visible={(value: boolean) => {
            actionModal.visible = value;
          }}
          onSuccess={refresh}
        />
      </div>
    );
  },
});
