import { defineComponent, onMounted, ref } from "vue";

import { CubeLayout, useCubeForm, useCubeQueryState, useCubeTable } from "@ghcloud/cube-app-design";
import { Button, message, PopOver, Page, Select, DateRangePicker } from "@ghcloud/cube-ui";
import { usePageName } from "@ghcloud/cube-utils";

import { cubeMaintainService } from "@/api/service";
import { getBusinessPrefix, mapFormValuesToQueryDefaults } from "@/utils";
import { exportExcel } from "@/utils/export-excel";

interface FaultData {
  [key: string]: unknown;
  period: string[];
  faultTypeId: string | undefined;
  pageSize: number;
  pageNumber: number;
}

export const WorkOrderStatistics = defineComponent({
  // 组件的setup函数
  setup: () => {
    onMounted(() => {
      getTypeList();
    });
    // 使用usePageName函数获取页面名称
    const { pageTitle } = usePageName();
    const flowCode = JSON.parse(sessionStorage.getItem("GH-currentApplication") ?? "").code;

    const queryDefaults = {
      period: [] as string[],
      faultTypeId: undefined as string | undefined,
    };
    const queryState = useCubeQueryState<FaultData & { total: number }>({
      storage: "url",
      initialState: {
        ...queryDefaults,
        pageNumber: 1,
        pageSize: 10,
        total: 0,
      },
      cacheFields: ["period", "faultTypeId", "pageNumber", "pageSize"],
    });
    const typeOptions = ref();
    const getTypeList = async (): Promise<void> => {
      try {
        const result = await cubeMaintainService.faultTypeList({ applicationCode: flowCode });
        typeOptions.value = result.map((item) => {
          return {
            label: item.name,
            value: item.id,
          };
        });
        formApi.updateFieldSchema({
          component: Select,
          label: businessPrefix + "类型",
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

    const businessPrefix = getBusinessPrefix();

    const [CubeForm, formApi] = useCubeForm({
      layout: "horizontal",
      schema: [
        {
          component: Select,
          label: businessPrefix + "类型",
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
          component: DateRangePicker,
          label: "时间",
          fieldName: "period",
          defaultValue: [],
          componentProps: {
            showTime: true,
          },
        },
      ],
      showCollapseButton: true,
      queryState: queryState as never,
      queryStateFields: ["period", "faultTypeId"],
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
          "/maintain/fault/apply/statistics/typeExcel",
          {
            pageNumber: 1,
            pageSize: 999999,
            faultTypeId: queryState.state.faultTypeId,
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
        title: businessPrefix + "类型",
        dataIndex: "objName",
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
          return <PopOver content={text || ""}>{text || "--"}</PopOver>;
        },
      },
      {
        dataIndex: "dealRate",
        title: "处理率",
        ellipsis: true,
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
      {
        title: "解决率",
        dataIndex: "result",
        customRender: ({ text }: { text: string }) => {
          return <PopOver content={text}>{text || "--"}</PopOver>;
        },
      },
    ];
    const [CubeTable, tableApi] = useCubeTable({
      rowKey: "id",
      columns,
      tableCode: "WORK_ORDER_STAT",
      queryState: queryState as never,
      fetchApi: async () => {
        const data = await cubeMaintainService.getFaultApplyStatistics({
          faultTypeId: queryState.state.faultTypeId,
          period: queryState.state.period ? queryState.state.period.join(",") : "",
          pageNumber: queryState.state.pageNumber,
          pageSize: queryState.state.pageSize,
          applicationCode: flowCode,
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
