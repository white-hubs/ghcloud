import dayjs from "dayjs";
import { defineComponent, onMounted, ref } from "vue";

import { CubeLayout, useCubeForm, useCubeQueryState, useCubeTable } from "@ghcloud/cube-app-design";
import { Button, message, PopOver, Page, Select, DateRangePicker, Input } from "@ghcloud/cube-ui";
import { usePageName } from "@ghcloud/cube-utils";

import { cubeFaultRepairService, cubeOuaaService } from "@/api/service";
import { mapFormValuesToQueryDefaults } from "@/utils";
import { exportExcel } from "@/utils/export-excel";

interface FaultData {
  [key: string]: unknown;
  period: string[];
  organizationId: string | undefined;
  keyword: string;
  pageSize: number;
  pageNumber: number;
}

export const PersonnelStatistics = defineComponent({
  // 组件的setup函数
  setup: () => {
    onMounted(() => {
      getDepList();
    });
    // 使用usePageName函数获取页面名称
    const { pageTitle } = usePageName();
    const flowCode = JSON.parse(sessionStorage.getItem("GH-currentApplication") ?? "").code;
    // 获取本月的开始时间
    const monthStartDate = dayjs().startOf("month").format("YYYY-MM-DD");
    const monthEndDate = dayjs().format("YYYY-MM-DD");
    const queryDefaults = {
      period: [monthStartDate, monthEndDate],
      organizationId: undefined as string | undefined,
      keyword: "",
    };
    const queryState = useCubeQueryState<FaultData & { total: number }>({
      storage: "url",
      initialState: {
        ...queryDefaults,
        pageNumber: 1,
        pageSize: 10,
        total: 0,
      },
      cacheFields: ["period", "organizationId", "keyword", "pageNumber", "pageSize"],
    });
    const deptOptions = ref();
    const getDepList = async (): Promise<void> => {
      try {
        const result = await cubeOuaaService.getDeptList();
        deptOptions.value = result.map((item) => {
          return {
            value: item.id,
            label: item.name,
          };
        });
        formApi.updateFieldSchema({
          component: Select,
          label: "部门",
          fieldName: "organizationId",
          defaultValue: undefined,
          componentProps: {
            allowClear: true,
            placeholder: "请选择",
            style: "width: 180px",
            options: deptOptions.value,
          },
        });
      } catch (error) {
        const { errorMessage } = (error as { toJSON: () => { errorMessage: string } }).toJSON();
        message.error(errorMessage || "请求失败");
      }
    };

    const [CubeForm, formApi] = useCubeForm({
      layout: "horizontal",
      schema: [
        {
          component: Input,
          label: "人员",
          fieldName: "keyword",
          defaultValue: "",
          componentProps: {
            placeholder: "请输入人员名称",
            allowClear: true,
          },
        },
        {
          component: Select,
          label: "部门",
          fieldName: "organizationId",
          defaultValue: undefined,
          componentProps: {
            allowClear: true,
            placeholder: "请选择",
            style: "width: 180px",
            options: deptOptions.value,
          },
        },
        {
          component: DateRangePicker,
          label: "时间",
          fieldName: "period",
          defaultValue: [monthStartDate, monthEndDate],
          componentProps: {
            showTime: true,
          },
        },
      ],
      showCollapseButton: true,
      queryState: queryState as never,
      queryStateFields: ["period", "organizationId", "keyword"],
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

    const handleChange = (pageNumber: number, pageSize: number): void => {
      queryState.setPage(pageNumber, pageSize);
      tableApi.query();
    };

    const exportLoading = ref(false);
    const downloadExcel = async (): Promise<void> => {
      try {
        exportLoading.value = true;
        await exportExcel(
          "/flow/exportWordOrderStatisticsByUser",
          {
            pageNumber: 1,
            pageSize: 99999,

            keyword: queryState.state.keyword,
            organizationId: queryState.state.organizationId,
            period: queryState.state.period ? queryState.state.period.join(",") : "",
            applicationCode: flowCode,
          },
          `${pageTitle}.xlsx`,
        );
      } catch (error) {
      } finally {
        exportLoading.value = false;
      }
    };
    const columns = [
      {
        title: "序号",
        dataIndex: "tableIndex",
        ellipsis: true,
        customRender: ({ index }: { index: number }) => {
          return <>{index + 1}</>;
        },
      },
      {
        title: "人员",
        dataIndex: "userName",
        ellipsis: true,
        customRender: ({ text }: { text: string }) => {
          return <PopOver content={text || ""}>{text || "--"}</PopOver>;
        },
      },
      {
        dataIndex: "organizationName",
        title: "所属部门",
        ellipsis: true,
        customRender: ({ text }: { text: string }) => {
          return <PopOver content={text || ""}>{text || "--"}</PopOver>;
        },
      },
      {
        dataIndex: "totalNumber",
        title: "工单数",
        ellipsis: true,
        customRender: ({ text }: { text: string }) => {
          return <PopOver content={text || ""}>{text || "--"}</PopOver>;
        },
      },
      {
        dataIndex: "waitNumber",
        title: "待处理",
        ellipsis: true,
        customRender: ({ text }: { text: string }) => {
          return <PopOver content={text || ""}>{text || "--"}</PopOver>;
        },
      },
      {
        dataIndex: "dealNumber",
        title: "已处理",
        ellipsis: true,
        customRender: ({ text }: { text: string }) => {
          return <PopOver content={text}>{text || "--"}</PopOver>;
        },
      },
      {
        dataIndex: "dealRate",
        title: "处理率",
        customRender: ({ text }: { text: string }) => {
          return <PopOver content={text}>{text || "--"}</PopOver>;
        },
      },
      {
        title: "平均处理时长",
        dataIndex: "avgWaitTime",
        customRender: ({ text }: { text: string }) => {
          return <PopOver content={text}>{text || "--"}</PopOver>;
        },
      },
    ];
    const [CubeTable, tableApi] = useCubeTable({
      rowKey: "id",
      columns,
      tableCode: "FAULT_PERSON_STAT",
      queryState: queryState as never,
      fetchApi: async () => {
        const data = await cubeFaultRepairService.getWordOrderStatisticsByUser({
          keyword: queryState.state.keyword,
          organizationId: queryState.state.organizationId,
          period: queryState.state.period ? queryState.state.period.join(",") : "",
          pageNumber: queryState.state.pageNumber,
          pageSize: queryState.state.pageSize,
          applicationCode: flowCode,
        } as Parameters<typeof cubeFaultRepairService.getWordOrderStatisticsByUser>[0] & {
          keyword?: string;
          organizationId?: string;
        });
        return {
          ...data,
          pages: Number((data as { page?: string }).page) || 0,
        };
      },
      fetchLoaded: (data) => {
        queryState.update({ total: data.total });
      },
    });
    const layoutSlots = {
      "layout-header": () => {
        return (
          <Button type="primary" onClick={downloadExcel} loading={exportLoading.value} disabled={queryState.state.total === 0}>
            导出
          </Button>
        );
      },
      "layout-content": () => {
        return (
          <div>
            <CubeForm />
            <CubeTable />
          </div>
        );
      },
      "footer-page": () => {
        return (
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
        );
      },
    };
    return () => <CubeLayout v-slots={layoutSlots} title={pageTitle} />;
  },
});
