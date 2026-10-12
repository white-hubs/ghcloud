import dayjs from "dayjs";
import { computed, defineComponent, onMounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import { CubeLayout, useCubeForm, useCubeTable } from "@ghcloud/cube-app-design";
import { InspectRecordStatusMap, InspectStatusColor, taskStatusOptions } from "@ghcloud/cube-daily-inspection-service";
import { hasPermission } from "@ghcloud/cube-permission-codes";
import { Button, PopOver, Page, PopConfirm, message } from "@ghcloud/cube-ui";
import { usePageName } from "@ghcloud/cube-utils";

import { TerminateRepairModal } from "./components/terminate-repair-modal";
import { cubeDailyInspectionService } from "@/api/server";
import { appFunctionCodes } from "@/permission";

interface InspectTaskRecord {
  id: string;
  status: string;
  errCount?: number | string | null;
  repairNum?: number | null;
  repairCount?: number | null;
  abnormalItemCount?: number | string | null;
}

export const InspectTask = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName();
    const route = useRoute();
    const router = useRouter();
    const getQueryValue = (value: unknown): string => {
      if (Array.isArray(value)) {
        return String(value[0] ?? "");
      }
      return value ? String(value) : "";
    };
    const getPeriodQueryValue = (value: unknown): string => {
      if (Array.isArray(value)) {
        return value.filter(Boolean).map(String).join(",");
      }
      return value ? String(value) : "";
    };
    const searchParams = reactive({
      pageNumber: 1,
      pageSize: 10,
      status: getQueryValue(route.query.status),
      typeId: getQueryValue(route.query.typeId),
      total: 100,
      keyword: getQueryValue(route.query.keyword),
      period: getPeriodQueryValue(route.query.period),
      taskTimeout: "",
      pendingOnly: getQueryValue(route.query.pendingOnly),
    });
    const showReturnButton = getQueryValue(route.query.fromPlanStatistics) === "1";

    const terminateRepairModalRef = ref();
    const columns = [
      {
        dataIndex: "name",
        title: "任务名称",
        slots: {
          customRender: "name",
        },
        align: "center",
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || ""}>{text || "--"}</PopOver>,
      },
      {
        dataIndex: "typeName",
        title: "巡检类型",
        slots: {
          customRender: "typeName",
        },
        align: "center",
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || ""}>{text || "--"}</PopOver>,
      },
      {
        dataIndex: "isCheck",
        title: "任务类型",
        slots: {
          customRender: "isCheck",
        },
        align: "center",
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => (
          <PopOver content={text ? "稽查" : "普通"}>{text ? "稽查" : "普通"}</PopOver>
        ),
      },
      {
        dataIndex: "receiveNames",
        title: "执行人",
        slots: {
          customRender: "receiveNames",
        },
        align: "center",
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || ""}>{text || "--"}</PopOver>,
      },
      {
        dataIndex: "publisherName",
        title: "发布人",
        slots: {
          customRender: "publisherName",
        },
        align: "center",
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || ""}>{text || "--"}</PopOver>,
      },
      {
        dataIndex: "createTime",
        title: "发布时间",
        slots: {
          customRender: "createTime",
        },
        align: "center",
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => {
          const time = dayjs(text).format("YYYY-MM-DD HH:mm:ss");
          return <PopOver content={time || ""}>{time || "--"}</PopOver>;
        },
      },
      {
        dataIndex: "validEndTime",
        title: "截止时间",
        slots: {
          customRender: "validEndTime",
        },
        align: "center",
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => {
          const time = dayjs(text).format("YYYY-MM-DD HH:mm:ss");
          return <PopOver content={time || ""}>{time || "--"}</PopOver>;
        },
      },
      {
        dataIndex: "abnormalItemCount",
        title: "异常巡检项数",
        align: "center",
        ellipsis: true,
        customRender: ({ record }: { record: InspectTaskRecord }): JSX.Element => {
          const raw = record.abnormalItemCount;
          const count = Number(raw ?? 0);
          const display = raw ?? 0;
          if (!Number.isFinite(count) || count <= 0) {
            return <PopOver content={String(display)}>{display}</PopOver>;
          }
          return (
            <span
              style={{ cursor: "pointer", color: "#2478ff" }}
              onClick={() => {
                history.pushState({}, "", `/portal/daily-inspection/inspect-task-info?type=info&id=${record.id}&result=ABNORMAL`);
              }}
            >
              {display}
            </span>
          );
        },
      },
      {
        dataIndex: "targetNum",
        title: "巡检对象数",
        slots: {
          customRender: "targetNum",
        },
        align: "center",
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || ""}>{text || "--"}</PopOver>,
      },
      {
        dataIndex: "recordCompletionRate",
        title: "巡检进度",
        slots: {
          customRender: "recordCompletionRate",
        },
        align: "center",
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => {
          const value = text !== null ? `${Number(text) * 100}%` : "--";
          return <PopOver content={value || ""}>{value || "--"}</PopOver>;
        },
      },
      {
        dataIndex: "status",
        title: "状态",
        slots: {
          customRender: "status",
        },
        align: "center",
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => {
          const textVal = text ? InspectRecordStatusMap.get(text) : "";
          return (
            <PopOver content={textVal || ""}>
              <span style={{ color: InspectStatusColor.get(text || "") }}>{textVal || "--"}</span>
            </PopOver>
          );
        },
      },
      {
        dataIndex: "errCount",
        title: "异常对象数",
        slots: {
          customRender: "errCount",
        },
        align: "center",
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text ?? ""}>{text ?? "--"}</PopOver>,
      },
      {
        dataIndex: "repairNum",
        title: "已修复对象数",
        slots: {
          customRender: "repairNum",
        },
        align: "center",
        ellipsis: true,
        customRender: ({ record }: { record: InspectTaskRecord }): JSX.Element => {
          const text = record.repairNum || record.repairCount;
          return <PopOver content={text ?? ""}>{text ?? "--"}</PopOver>;
        },
      },
      {
        dataIndex: "action",
        title: "操作",
        slots: {
          customRender: "action",
        },
        fixed: "right",
        customRender: ({ record }: { record: InspectTaskRecord }): JSX.Element => (
          <>
            <Button
              type="link"
              size="small"
              onClick={() => {
                history.pushState({}, "", `/portal/daily-inspection/inspect-task-info?type=info&id=${record.id}`);
              }}
            >
              详情
            </Button>
            {record.status === "EXECUTING" && (
              <PopConfirm
                title="确认终止巡检任务？"
                onConfirm={async () => {
                  await cubeDailyInspectionService.stopInspectTask({
                    id: record.id,
                  });
                  message.success("操作成功");
                  tableApi.query();
                }}
              >
                <Button size="small" type="link">
                  终止巡检
                </Button>
              </PopConfirm>
            )}
            {record.status === "WAIT_REPAIR" && (
              <PopConfirm
                title="确认终止修复该任务？"
                onConfirm={async () => {
                  terminateRepairModalRef.value?.openModal(record);
                }}
              >
                <Button size="small" type="link">
                  终止修复
                </Button>
              </PopConfirm>
            )}
          </>
        ),
      },
    ];
    const selectedRowKeys = ref<string[]>([]);
    const [CubeTable, tableApi] = useCubeTable({
      columns,
      tableCode: "DAILY_INSPECTION_TASK",
      rowKey: "id",
      rowSelection: "checkbox",
      fetchApi: async () => {
        const payload = {
          pageNumber: searchParams.pageNumber,
          pageSize: searchParams.pageSize,
          typeId: searchParams.typeId,
          keyword: searchParams.keyword,
          period: searchParams.period,
          taskTimeout: searchParams.taskTimeout,
          ...(!searchParams.pendingOnly ? { status: searchParams.status } : {}),
        };
        return cubeDailyInspectionService.getInspectTaskList(payload);
      },
      fetchLoaded: (data) => {
        searchParams.total = data.total;
      },
      rowSelectionChange: (keys) => {
        selectedRowKeys.value = keys as string[];
      },
    });
    const handleChange = (pageNumber: number, pageSize: number): void => {
      searchParams.pageNumber = pageNumber;
      searchParams.pageSize = pageSize;
      tableApi.query();
    };
    const exportLoading = ref(false);
    const handleExport = async (): Promise<void> => {
      try {
        exportLoading.value = true;
        const payload = {
          pageNumber: searchParams.pageNumber,
          pageSize: searchParams.pageSize,
          typeId: searchParams.typeId,
          keyword: searchParams.keyword,
          period: searchParams.period,
          taskTimeout: searchParams.taskTimeout,
          ...(!searchParams.pendingOnly ? { status: searchParams.status } : {}),
        };
        const blob = await cubeDailyInspectionService.getInspectTaskExport(payload);
        const href = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = href;
        link.download = `${pageTitle || "巡检任务列表"}.xlsx`;
        document.body.append(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(href);
      } finally {
        exportLoading.value = false;
      }
    };
    /**
     * 表单配置
     */
    const formSchema = [
      {
        component: "Select",
        label: "状态",
        fieldName: "status",
        defaultValue: null,
        componentProps: {
          placeholder: "状态",
          allowClear: true,
          options: [
            {
              label: "全部",
              value: "",
            },
            ...Object.keys(taskStatusOptions).map((item) => ({
              label: taskStatusOptions[item as keyof typeof taskStatusOptions],
              value: item,
            })),
          ],
          onChange: (value: string): void => {
            searchParams.pageNumber = 1;
            searchParams.status = value;
            searchParams.pendingOnly = "";
            tableApi.query();
          },
        },
      },
      {
        component: "Select",
        label: "巡检类型",
        fieldName: "typeId",
        componentProps: {},
      },
      {
        component: "Select",
        label: "任务时限",
        fieldName: "taskTimeout",
        defaultValue: "",
        componentProps: {
          allowClear: true,
          options: [
            {
              label: "全部",
              value: "",
            },
            {
              label: "已超时",
              value: "TIMEOUT",
            },
            {
              label: "未超时",
              value: "NO_TIMEOUT",
            },
          ],
          onChange: (value: string): void => {
            searchParams.pageNumber = 1;
            searchParams.taskTimeout = value;
            searchParams.pendingOnly = "";
            tableApi.query();
          },
        },
      },
      {
        component: "RangePicker",
        label: "发布时间",
        fieldName: "period",
        componentProps: {
          valueFormat: "YYYY-MM-DD",
          allowClear: true,
        },
      },
      {
        component: "Input",
        label: "",
        fieldName: "keyword",
        componentProps: {
          placeholder: "任务名称",
        },
      },
    ];
    const [CubeForm, formApi] = useCubeForm({
      layout: "horizontal",
      syncStateRef: searchParams,
      onHydratedQuery: () => {
        if (searchParams.pendingOnly) {
          searchParams.status = "";
        }
        tableApi.query(); // URL/session 回填后自动首查
      },
      handleSubmit: (data) => {
        searchParams.status = data.status ? (data.status as string) : "";
        if (Array.isArray(data.period)) {
          searchParams.period = data.period.join(",");
        } else if (typeof data.period === "string") {
          searchParams.period = data.period;
        } else {
          searchParams.period = "";
        }
        searchParams.keyword = data.keyword ? (data.keyword as string) : "";
        searchParams.pendingOnly = "";
        searchParams.pageNumber = 1;
        tableApi.query();
      },
      handleReset: () => {
        searchParams.period = "";
        searchParams.keyword = "";
        searchParams.status = "";
        searchParams.typeId = "";
        searchParams.taskTimeout = "";
        searchParams.pendingOnly = "";
        searchParams.pageNumber = 1;
        tableApi.query();
      },
      schema: formSchema,
      showCollapseButton: true,
    });
    onMounted(async () => {
      const result = await cubeDailyInspectionService.getInspectTypeList();
      const schema = {
        component: "Select",
        label: "巡检类型",
        fieldName: "typeId",
        defaultValue: "",
        componentProps: {
          options: result,
          placeholder: "请选择",
          allowClear: true,
          fieldNames: { label: "name", value: "id" },
          onChange: (value: string): void => {
            searchParams.pageNumber = 1;
            searchParams.typeId = value;
            searchParams.pendingOnly = "";
            tableApi.query();
          },
        },
      };
      formApi.updateFieldSchema(schema);
      formApi.formValues.typeId = searchParams.typeId;
    });
    // 获取删除权限
    const isDeletePermission = computed(() => {
      const permission = appFunctionCodes.inspectTask;
      return hasPermission(permission?.deleted);
    });
    const batchDeleteLoading = ref(false);
    const handleBatchDelete = async (): Promise<void> => {
      try {
        batchDeleteLoading.value = true;
        const ids = selectedRowKeys.value ?? [];
        await cubeDailyInspectionService.deleteInspectTask(ids);
        message.success("删除成功");
        searchParams.pageNumber = 1;
        tableApi.query();
      } catch {
      } finally {
        batchDeleteLoading.value = false;
      }
    };
    const slots = {
      "layout-header": (): JSX.Element => (
        <div>
          <Button type="primary" loading={exportLoading.value} onClick={handleExport} style={{ marginRight: "10px" }}>
            导出
          </Button>
          <Button
            type="primary"
            onClick={() => {
              history.pushState({}, "", "/portal/daily-inspection/inspect-task-edit?type=create");
            }}
          >
            新增
          </Button>
          {isDeletePermission.value && (
            <PopConfirm title="确定删除当前数据？" onConfirm={handleBatchDelete}>
              <Button
                disabled={selectedRowKeys.value.length === 0}
                type="primary"
                loading={batchDeleteLoading.value}
                danger
                style={{ margin: "0 10px" }}
              >
                批量删除
              </Button>
            </PopConfirm>
          )}
        </div>
      ),
      "layout-content": (): JSX.Element => (
        <div>
          <CubeForm />
          <CubeTable />
        </div>
      ),
      "footer-page": (): JSX.Element => (
        <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "8px" }}>
          <Page current={searchParams.pageNumber} pageSize={searchParams.pageSize} total={searchParams.total} onPageChange={handleChange} />
          {showReturnButton && (
            <Button
              onClick={() => {
                if (window.history.length > 1) {
                  router.back();
                  return;
                }
                router.push("/plan-statistics");
              }}
            >
              返回
            </Button>
          )}
        </div>
      ),
    };
    return (): JSX.Element => (
      <>
        <CubeLayout title={pageTitle} v-slots={slots} showTableXScroll />
        <TerminateRepairModal ref={terminateRepairModalRef} onEnter={() => tableApi.query()} />
      </>
    );
  },
});
