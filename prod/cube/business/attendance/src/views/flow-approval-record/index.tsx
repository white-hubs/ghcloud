import dayjs from "dayjs";
import { defineComponent, onMounted, reactive, ref, type VNode } from "vue";
import { useRoute } from "vue-router";

import { hasPermission } from "@ghcloud/cube-permission-codes";
import { Button, DateRangePicker, Form, FormItem, Input, Page, PopOver, Select, message } from "@ghcloud/cube-ui";
import { useListQueryCache, usePageName } from "@ghcloud/cube-utils";
import { AliasTable, DeptTreeSelect } from "@ghcloud/generic-component";

import { flowApprovalRecordExport, flowApprovalRecordPage } from "@/api/attendance-record";
import { Layout } from "@/components/layout/layout";
import { useTableScroll } from "@/hook/use-table-scroll";
import { logger } from "@/logger";
import { appFunctionCodes } from "@/permission";
import { businessTypeMap } from "@/types/vacation-type";

interface SearchForm {
  submitTime: string[] | undefined;
  businessTime: string[] | undefined;
  businessType: string | undefined;
  organizationId: string;
  status: string | undefined;
  username: string;
}

type QueryCacheValue = string | number | boolean | null | undefined | (string | number | boolean | null | undefined)[];

interface QueryCacheState {
  [key: string]: QueryCacheValue;
  submitTime: string[] | string | undefined;
  businessTime: string[] | string | undefined;
  businessType: string | undefined;
  organizationId: string;
  status: string | undefined;
  username: string;
  pageNumber: number;
  pageSize: number;
}

interface ApprovalRecordRow {
  processInstanceId: string;
  formNo: string;
  instanceName: string;
  startUserName: string;
  startUserInfo: { organizationName?: string } | null;
  submitedTime: string;
  status: string;
  activeNodeName: string;
  currentTaskId: string;
  businessType: string;
}

const applicationCode = "ATTENDANCE_MANAGEMENT";
const legacyDetailPermissionCode = "attendance:approval:record:info";
const statusOptions = [
  { value: "ACTIVE", label: "处理中" },
  { value: "REJECT", label: "驳回" },
  { value: "UNDO", label: "撤销" },
  { value: "FINISHED", label: "完成" },
];
const businessTypeOptions = Array.from(businessTypeMap, ([value, label]) => ({ value, label }));
const statusText = new Map([
  ["SUBMIT", "提交"],
  ["UNDO", "撤销"],
  ["REPEAT", "重新提交"],
  ["APPROVAL", "审批"],
  ["BACK", "撤回"],
  ["COPY", "抄送"],
  ["REJECT", "驳回"],
  ["FINISHED", "完成"],
]);
const parseRange = (value: string[] | string | undefined): string[] | undefined => (Array.isArray(value) ? value : value?.split(","));
const serializeRange = (value: string[] | undefined): string | undefined =>
  value?.length === 2 && value.every(Boolean) ? value.join(",") : undefined;

/** 考勤流程审批记录 */
export const FlowApprovalRecord = defineComponent({
  setup: () => {
    const route = useRoute();
    const { pageTitle } = usePageName();
    const permission = appFunctionCodes.flowApprovalRecord;
    const canViewDetail = (): boolean =>
      Boolean(permission?.info && hasPermission(permission.info)) || hasPermission(legacyDetailPermissionCode);
    const tableCode = route.path.replaceAll("/", "");
    const formState = reactive<SearchForm>({
      submitTime: undefined,
      businessTime: undefined,
      businessType: undefined,
      organizationId: "",
      status: undefined,
      username: "",
    });
    const pagination = reactive({
      pageNumber: 1,
      pageSize: 10,
      total: 0,
    });
    const loading = ref(false);
    const exportLoading = ref(false);
    const dataSource = ref<ApprovalRecordRow[]>([]);

    const goDetail = (record: ApprovalRecordRow): void => {
      const title = businessTypeMap.get(record.businessType) ?? "考勤审批";
      history.pushState(
        { current: location.pathname + location.search },
        "",
        `/portal/stream-engine-render/index?businessType=${record.businessType}&processInstanceId=${record.processInstanceId}&currentTaskId=${record.currentTaskId}&status=${record.status}&type=detail&title=${title}&appName=考勤管理`,
      );
    };

    const columns = [
      {
        title: "编号",
        dataIndex: "formNo",
        customRender: ({ text }: { text: string }): VNode => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "申请名称",
        dataIndex: "instanceName",
        customRender: ({ text }: { text: string }): VNode => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "发起人",
        dataIndex: "startUserName",
        customRender: ({ text }: { text: string }): VNode => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "发起部门",
        dataIndex: "startUserInfo",
        customRender: ({ text }: { text: ApprovalRecordRow["startUserInfo"] }): VNode => {
          const organizationName = text?.organizationName || "--";
          return <PopOver content={organizationName}>{organizationName}</PopOver>;
        },
      },
      {
        title: "发起时间",
        dataIndex: "submitedTime",
        customRender: ({ text }: { text: string }): VNode => {
          const submittedTime = text ? dayjs(text).format("YYYY-MM-DD HH:mm:ss") : "--";
          return <PopOver content={submittedTime}>{submittedTime}</PopOver>;
        },
      },
      {
        title: "处理状态",
        dataIndex: "status",
        customRender: ({ text }: { text: string }): VNode => {
          const label = text ? (statusText.get(text) ?? "处理中") : "--";
          return <PopOver content={label}>{label}</PopOver>;
        },
      },
      {
        title: "处理进度",
        dataIndex: "activeNodeName",
        customRender: ({ text }: { text: string }): VNode => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "操作",
        dataIndex: "action",
        width: "100px",
        customRender: ({ record }: { record: ApprovalRecordRow }): VNode =>
          canViewDetail() ? (
            <Button type="link" size="small" onClick={() => goDetail(record)}>
              详情
            </Button>
          ) : (
            <></>
          ),
      },
    ];

    const queryCache = useListQueryCache<QueryCacheState>({
      defaults: {
        submitTime: undefined,
        businessTime: undefined,
        businessType: undefined,
        organizationId: "",
        status: undefined,
        username: "",
        pageNumber: 1,
        pageSize: 10,
      },
      getState: () => ({
        ...formState,
        pageNumber: pagination.pageNumber,
        pageSize: pagination.pageSize,
      }),
      setState: (next) => {
        formState.submitTime = parseRange(next.submitTime);
        formState.businessTime = parseRange(next.businessTime);
        formState.businessType = next.businessType;
        formState.organizationId = next.organizationId ?? "";
        formState.status = next.status;
        formState.username = next.username ?? "";
        pagination.pageNumber = Number(next.pageNumber ?? 1);
        pagination.pageSize = Number(next.pageSize ?? 10);
      },
    });

    const getTableData = async (): Promise<void> => {
      loading.value = true;
      try {
        const { data } = await flowApprovalRecordPage({
          pageNumber: pagination.pageNumber,
          pageSize: pagination.pageSize,
          applicationCode,
          businessType: formState.businessType,
          organizationId: formState.organizationId || undefined,
          submitTime: serializeRange(formState.submitTime),
          businessTime: serializeRange(formState.businessTime),
          status: formState.status,
          username: formState.username || undefined,
        });
        dataSource.value = data.records as ApprovalRecordRow[];
        pagination.total = data.total;
      } catch (error) {
        logger.error(error);
      } finally {
        loading.value = false;
      }
    };

    const queryForm = async (): Promise<void> => {
      pagination.pageNumber = 1;
      await getTableData();
      await queryCache.sync();
    };

    const exportExcel = async (): Promise<void> => {
      if (dataSource.value.length === 0) {
        message.warn("未查询到数据，无法导出");
        return;
      }
      exportLoading.value = true;
      try {
        const { data } = await flowApprovalRecordExport({
          applicationCode,
          businessType: formState.businessType,
          organizationId: formState.organizationId || undefined,
          submitTime: serializeRange(formState.submitTime),
          businessTime: serializeRange(formState.businessTime),
          status: formState.status,
          username: formState.username || undefined,
        });
        const link = document.createElement("a");
        const blobUrl = URL.createObjectURL(
          new Blob([data as BlobPart], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          }),
        );
        link.style.display = "none";
        link.href = blobUrl;
        link.download = `${pageTitle ?? "考勤流程审批记录"}.xlsx`;
        document.body.append(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(blobUrl);
      } catch (error) {
        logger.error(error);
        message.warn("导出失败");
      } finally {
        exportLoading.value = false;
      }
    };

    const reset = async (): Promise<void> => {
      await queryCache.reset();
      await getTableData();
    };

    const pageChange = (pageNumber: number, pageSize: number): void => {
      pagination.pageNumber = pageNumber || 1;
      pagination.pageSize = pageSize;
      getTableData().then(() => queryCache.sync());
    };

    const { scorllY } = useTableScroll();

    onMounted(async () => {
      await queryCache.hydrateAndQuery(getTableData);
    });

    const layoutSlots = {
      "layout-header": (): VNode => (
        <Button type="primary" onClick={exportExcel} loading={exportLoading.value}>
          导出
        </Button>
      ),
      "layout-content": (): VNode => (
        <>
          <Form layout="inline" style={{ margin: "10px 0 0 0" }}>
            <FormItem label="发起时间" style={{ marginRight: "10px", marginBottom: "10px" }}>
              <DateRangePicker v-model:value={formState.submitTime} valueFormat="YYYY-MM-DD" />
            </FormItem>
            <FormItem label="业务开始时间" style={{ marginRight: "10px", marginBottom: "10px" }}>
              <DateRangePicker v-model:value={formState.businessTime} valueFormat="YYYY-MM-DD" />
            </FormItem>
            <FormItem label="业务类型" style={{ marginRight: "10px", marginBottom: "10px" }}>
              <Select
                v-model:value={formState.businessType}
                placeholder="请选择业务类型"
                style={{ width: "180px" }}
                options={businessTypeOptions}
                allowClear
              />
            </FormItem>
            <FormItem label="部门" style={{ marginRight: "10px", marginBottom: "10px" }}>
              <DeptTreeSelect
                value={formState.organizationId}
                onUpdate:value={(value: string | string[]): void => {
                  formState.organizationId = Array.isArray(value) ? (value[0] ?? "") : value;
                }}
                title=""
                multiple={false}
                cheakable={false}
                placeholder="请选择部门"
                readonly={false}
                showSearch={true}
                treeNodeFilterProp="name"
                treeNodeLabelProp="name"
                deleteAll={false}
                style={{ width: "180px" }}
              />
            </FormItem>
            <FormItem label="状态" style={{ marginRight: "10px", marginBottom: "10px" }}>
              <Select v-model:value={formState.status} placeholder="请选择" style={{ width: "180px" }} options={statusOptions} allowClear />
            </FormItem>
            <FormItem label="发起人" style={{ marginRight: "10px", marginBottom: "10px" }}>
              <Input v-model:value={formState.username} placeholder="请输入发起人" showCount={false} />
            </FormItem>
            <FormItem style={{ marginBottom: "10px" }}>
              <Button type="primary" onClick={queryForm}>
                查询
              </Button>
              <Button style={{ marginLeft: "10px" }} onClick={reset}>
                重置
              </Button>
            </FormItem>
          </Form>
          <AliasTable
            rowKey="processInstanceId"
            columns={columns}
            loading={loading.value}
            dataSource={dataSource.value}
            scrollX={1000}
            scrollY={scorllY.value}
            tableCode={tableCode}
            applicationCode={applicationCode}
          />
        </>
      ),
      "footer-page": (): VNode => (
        <Page
          current={pagination.pageNumber}
          pageSize={pagination.pageSize}
          total={pagination.total}
          showQuickJumper={false}
          showSizeChanger={true}
          showTotal={(total: number): string => `共 ${total} 条数据`}
          pageSizeOptions={["10", "20", "50", "100"]}
          hideOnSinglePage={false}
          onPageChange={pageChange}
        />
      ),
    };

    return (): VNode => <Layout title={pageTitle ?? "考勤流程审批记录"} v-slots={layoutSlots} />;
  },
});
