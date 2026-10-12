import dayjs from "dayjs";
import { defineComponent, onMounted, ref } from "vue";

import { CubeLayout, useCubeForm, useCubeQueryState, useCubeTable } from "@ghcloud/cube-app-design";
import type { FaultListType } from "@ghcloud/cube-maintain-service";
import { Button, message, PopOver, Page, Select, DateRangePicker, Input } from "@ghcloud/cube-ui";
import { usePageName } from "@ghcloud/cube-utils";

import { exportExcel } from "./export-excel";
import { FaultRecordDetailDrawer, type FaultRecordDetailParams } from "./fault-record-detail-drawer";
import { cubeMaintainService, cubeFaultRepairService } from "@/api/service";
import { SearchSelect } from "@/components/search-select/search-select";
import { getBusinessPrefix, getObjectNameColumnText, mapFormValuesToQueryDefaults } from "@/utils";

interface FaultData {
  [key: string]: unknown;
  status: string | undefined;
  result: string | undefined;
  submitTime: string[];
  faultTypeId: string | undefined;
  progress: string | undefined;
  keyword: string;
  pageSize: number;
  pageNumber: number;
}

export const FaultRecord = defineComponent({
  // 组件的setup函数
  setup: () => {
    onMounted(() => {
      getTypeList();
      getProgressOptions();
    });
    const businessPrefix = getBusinessPrefix();
    // 使用usePageName函数获取页面名称
    const { pageTitle } = usePageName();
    const flowCode = JSON.parse(sessionStorage.getItem("GH-currentApplication") ?? "").code;
    const statusText = (str: string): string => {
      const statusMap = new Map([
        ["SUBMIT", "提交"],
        ["UNDO", "撤销"],
        ["REPEAT", "重新提交"],
        ["APPROVAL", "审批"],
        ["BACK", "撤回"],
        ["COPY", "抄送"],
        ["REJECT", "驳回"],
        ["FINISHED", "完成"],
      ]);
      return statusMap.get(str) || "处理中";
    };
    const queryDefaults = {
      submitTime: [] as string[],
      faultTypeId: undefined as string | undefined,
      keyword: "",
      status: undefined as string | undefined,
      result: undefined as string | undefined,
      progress: undefined as string | undefined,
    };
    const queryState = useCubeQueryState<FaultData & { total: number }>({
      storage: "url",
      initialState: {
        ...queryDefaults,
        pageNumber: 1,
        pageSize: 10,
        total: 0,
      },
      cacheFields: ["keyword", "faultTypeId", "status", "result", "progress", "submitTime", "pageNumber", "pageSize"],
    });
    const statusOptions = [
      { value: "ACTIVE", label: "处理中" },
      { value: "REJECT", label: "驳回" },
      { value: "UNDO", label: "撤销" },
      { value: "PASS", label: "完成" },
    ];
    const formatDateTime = (value?: string): string => (value ? dayjs(value).format("YYYY-MM-DD HH:mm:ss") : "-");
    const formatTimeConsuming = (value?: number): string => (value || value === 0 ? `${value}分钟` : "-");
    const resultOptions = [
      { value: "已解决", label: "已解决" },
      { value: "未解决", label: "未解决" },
    ];
    const progressOptions = ref();
    const typeOptions = ref();
    const getTypeList = async (): Promise<void> => {
      try {
        const result = await cubeMaintainService.faultTypeList({ applicationCode: flowCode });
        typeOptions.value = result.map((item) => ({
          label: item.name,
          value: item.id,
        }));
        formApi.updateFieldSchema({
          component: Select,
          label: `${businessPrefix}类型`,
          fieldName: "faultTypeId",
          defaultValue: undefined,
          componentProps: {
            allowClear: true,
            placeholder: "请选择",
            style: "width: 180px",
            options: typeOptions.value,
          },
        });
      } catch (error) {
        const { errorMessage } = (error as { toJSON: () => { errorMessage: string } }).toJSON();
        message.error(errorMessage || "请求失败");
      }
    };
    const getProgressOptions = async (): Promise<void> => {
      try {
        const result = await cubeFaultRepairService.getFlowBusinessNodeNames({ businessType: flowCode });
        progressOptions.value = result.map((item) => ({
          label: item,
          value: item,
        }));
        formApi.updateFieldSchema({
          component: SearchSelect,
          label: "处理进度",
          fieldName: "progress",
          defaultValue: undefined,
          componentProps: {
            placeholder: "请选择/输入",
            style: "width: 180px",
            options: progressOptions.value,
          },
        });
      } catch {}
    };

    const [CubeForm, formApi] = useCubeForm({
      layout: "horizontal",
      schema: [
        {
          component: Input,
          label: "关键字",
          fieldName: "keyword",
          defaultValue: "",
          componentProps: {
            placeholder: "请输入",
            styles: { width: "180px" },
          },
        },
        {
          component: Select,
          label: `${businessPrefix}类型`,
          fieldName: "faultTypeId",
          defaultValue: undefined,
          componentProps: {
            allowClear: true,
            placeholder: "请选择",
            style: "width: 180px",
            options: typeOptions.value,
          },
        },
        {
          component: Select,
          label: "处理状态",
          fieldName: "status",
          defaultValue: undefined,
          componentProps: {
            allowClear: true,
            placeholder: "请选择",
            style: "width: 180px",
            options: statusOptions,
          },
        },
        {
          component: Select,
          label: "处理结果",
          fieldName: "result",
          defaultValue: undefined,
          componentProps: {
            allowClear: true,
            placeholder: "请选择",
            style: "width: 180px",
            options: resultOptions,
          },
        },
        {
          component: SearchSelect,
          label: "处理进度",
          fieldName: "progress",
          defaultValue: undefined,
          componentProps: {
            placeholder: "请选择/输入",
            style: "width: 180px",
            options: progressOptions.value,
          },
        },
        {
          component: DateRangePicker,
          label: "发起时间",
          fieldName: "submitTime",
          defaultValue: [],
          componentProps: {
            showTime: true,
          },
        },
      ],
      showCollapseButton: true,
      queryState: queryState as never,
      queryStateFields: ["keyword", "faultTypeId", "status", "result", "progress", "submitTime"],
      mapFormValuesToQueryState: (values) => mapFormValuesToQueryDefaults(values, queryDefaults),
      handleSubmit: () => {
        tableApi.query();
      },
      handleReset: () => {
        queryState.update(queryDefaults);
        queryState.resetPage();
        tableApi.query();
      },
    });
    const detailDrawerOpen = ref(false);
    const detailDrawerParams = ref<FaultRecordDetailParams | undefined>();
    const detailDrawerTitle = ref("报修详情");

    const goDetail = (row: FaultListType): void => {
      const { processInstanceId, currentTaskId, status } = row;
      detailDrawerTitle.value = pageTitle || "报修详情";
      detailDrawerParams.value = {
        businessType: flowCode,
        processInstanceId,
        currentTaskId,
        status,
        title: pageTitle,
      };
      detailDrawerOpen.value = true;
    };
    const exportLoading = ref(false);
    const downloadExcel = async (): Promise<void> => {
      try {
        exportLoading.value = true;
        const count = Math.ceil(queryState.state.total / 999);
        const exportData = [];
        for (let i = 0; i < count; i++) {
          const params = {
            pageNumber: i + 1,
            pageSize: 999,
            keyword: queryState.state.keyword,
            faultTypeId: queryState.state.faultTypeId,
            status: queryState.state.status,
            result: queryState.state.result,
            progress: queryState.state.progress,
            submitTime: queryState.state.submitTime
              ? queryState.state.submitTime.map((item) => dayjs(item).format("YYYY-MM-DD")).join(",")
              : "",
            businessType: flowCode,
          };
          const result = await cubeMaintainService.getFlowProcessPage(params);
          exportData.push(...result.records);
        }
        const excelColumns = columns.slice(0, -1);
        await exportExcel(pageTitle, excelColumns, exportData);
      } catch {
      } finally {
        exportLoading.value = false;
      }
    };
    const columns = [
      {
        title: "编号",
        dataIndex: "code",
        ellipsis: true,
        customRender: ({ text }: { text: string }) => <PopOver content={text || ""}>{text || "--"}</PopOver>,
      },
      {
        title: "发起时间",
        dataIndex: "submitedTime",
        ellipsis: true,
        customRender: ({ text }: { text: string }) => (
          <PopOver content={text || ""}>{text ? dayjs(text).format("YYYY-MM-DD HH:mm:ss") : "-"}</PopOver>
        ),
      },
      {
        title: "工单名称",
        dataIndex: "instanceName",
        ellipsis: true,
        customRender: ({ text }: { text: string }) => <PopOver content={text || ""}>{text || "--"}</PopOver>,
      },
      {
        title: getObjectNameColumnText(),
        dataIndex: "objName",
        ellipsis: true,
        customRender: ({ text }: { text: string }) => <PopOver content={text || ""}>{text || "--"}</PopOver>,
      },
      {
        title: `${businessPrefix}类型`,
        dataIndex: "faultType",
        ellipsis: true,
        customRender: ({ text }: { text: string }) => <PopOver content={text || ""}>{text || "--"}</PopOver>,
      },
      {
        title: "紧急程度",
        dataIndex: "urgencyLevel",
        ellipsis: true,
        customRender: ({ text }: { text: string }) => <PopOver content={text}>{text || "--"}</PopOver>,
      },
      {
        title: "发起人",
        dataIndex: "startUserName",
        key: "startUserName",
        customRender: ({ text }: { text: string }) => <PopOver content={text}>{text || "--"}</PopOver>,
      },
      {
        title: "处理状态",
        dataIndex: "status",
        key: "status",
        customRender: ({ text }: { text: string }) => {
          const res = text ? statusText(text) : "-";
          return <PopOver content={res}>{res}</PopOver>;
        },
      },
      {
        title: "处理进度",
        dataIndex: "activeNodeName",
        key: "activeNodeName",
        customRender: ({ text }: { text: string }) => <PopOver content={text}>{text || "--"}</PopOver>,
      },
      {
        title: "处理结果",
        dataIndex: "result",
        key: "result",
        customRender: ({ text }: { text: string }) => <PopOver content={text}>{text || "--"}</PopOver>,
      },
      {
        title: "确认时间",
        dataIndex: "confirmTime",
        key: "confirmTime",
        ellipsis: true,
        customRender: ({ text }: { text: string }) => {
          const res = formatDateTime(text);
          return <PopOver content={res}>{res}</PopOver>;
        },
      },
      {
        title: "完成时间",
        dataIndex: "completeTime",
        key: "completeTime",
        ellipsis: true,
        customRender: ({ text }: { text: string }) => {
          const res = formatDateTime(text);
          return <PopOver content={res}>{res}</PopOver>;
        },
      },
      {
        title: "耗时",
        dataIndex: "timeConsuming",
        key: "timeConsuming",
        ellipsis: true,
        customRender: ({ text }: { text: number }) => {
          const res = formatTimeConsuming(text);
          return <PopOver content={res}>{res}</PopOver>;
        },
      },
      {
        dataIndex: "action",
        title: "操作",
        width: 80,
        fixed: "right",
        slots: {
          customRender: "action",
        },
        customRender: ({ record }: { record: FaultListType }) => (
          <>
            <Button
              style={{
                padding: "4px",
              }}
              type="link"
              onClick={() => {
                goDetail(record);
              }}
            >
              详情
            </Button>
          </>
        ),
      },
    ];

    const [CubeTable, tableApi] = useCubeTable({
      rowKey: "id",
      columns,
      tableCode: "FAULT_RECORD",
      queryState: queryState as never,
      fetchApi: async () => {
        const data = await cubeMaintainService.getFlowProcessPage({
          keyword: queryState.state.keyword,
          faultTypeId: queryState.state.faultTypeId,
          status: queryState.state.status,
          result: queryState.state.result,
          progress: queryState.state.progress,
          submitTime: queryState.state.submitTime ? queryState.state.submitTime.join(",") : "",
          businessType: flowCode,
          pageNumber: queryState.state.pageNumber,
          pageSize: queryState.state.pageSize,
        } as Parameters<typeof cubeMaintainService.getFlowProcessPage>[0] & {
          keyword?: string;
          faultTypeId?: string;
          result?: string;
          progress?: string;
        });
        return {
          ...data,
          pages: Number(data.page) || 0,
        };
      },
      fetchLoaded: (data) => {
        queryState.update({ total: data.total });
      },
    });

    const handleChange = (pageNumber: number, pageSize: number): void => {
      queryState.setPage(pageNumber, pageSize);
      tableApi.query();
    };

    const layoutSlots = {
      "layout-header": () => (
        <Button type="primary" onClick={downloadExcel} loading={exportLoading.value} disabled={queryState.state.total === 0}>
          导出
        </Button>
      ),
      "layout-content": () => (
        <div>
          <CubeForm />
          <CubeTable />
        </div>
      ),
      "footer-page": () => (
        <Page
          v-show={queryState.state.total > 0}
          current={queryState.state.pageNumber}
          pageSize={queryState.state.pageSize}
          total={queryState.state.total}
          showQuickJumper={false}
          showSizeChanger={true}
          showTotal={(total: number) => `共 ${total} 条数据`}
          pageSizeOptions={["10", "20", "50", "100"]}
          onPageChange={handleChange}
        />
      ),
    };
    return () => (
      <>
        <CubeLayout v-slots={layoutSlots} title={pageTitle} showTableXScroll />
        <FaultRecordDetailDrawer
          open={detailDrawerOpen.value}
          detailParams={detailDrawerParams.value}
          title={detailDrawerTitle.value}
          onClose={() => {
            detailDrawerOpen.value = false;
            detailDrawerParams.value = undefined;
          }}
        />
      </>
    );
  },
});
