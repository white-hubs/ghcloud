import { defineComponent, reactive, ref } from "vue";

import { CubeLayout, useCubeForm, useCubeTable } from "@ghcloud/cube-app-design";
import { Button, PopOver, DateRangePicker, Page, Space, message } from "@ghcloud/cube-ui";
import { usePageName } from "@ghcloud/cube-utils";

import { cubeWorkOrderCenterService } from "@/api/service";
import { BusinessTypeSelect } from "@/components/business-type-select/business-type-select";

/** 工单统计列表 */
export const WorkOrderStatistics = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName();
    const columns = [
      {
        title: "工单类型",
        dataIndex: "businessTypeName",
        ellipsis: true,
        width: 200,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || ""}>{text || "--"}</PopOver>,
      },
      {
        title: "工单总数",
        dataIndex: "totalNumber",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text}>{text}</PopOver>,
      },
      {
        title: "处理中工单数",
        dataIndex: "processNumber",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text}>{text}</PopOver>,
      },
      {
        title: "驳回工单数",
        dataIndex: "rejectNumber",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text}>{text}</PopOver>,
      },
      {
        title: "撤销工单数",
        dataIndex: "undoNumber",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text}>{text}</PopOver>,
      },
      {
        title: "完成工单数",
        dataIndex: "dealNumber",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text}>{text}</PopOver>,
      },
    ];

    const searchFormSchema = [
      {
        component: BusinessTypeSelect,
        label: "工单类型",
        fieldName: "businessType",
        defaultValue: null,
        componentProps: {},
      },
      {
        component: DateRangePicker,
        label: "发起时间",
        fieldName: "period",
        defaultValue: null,
      },
    ];

    const searchParams = reactive({
      pageNumber: 1,
      pageSize: 10,
      total: 0,
      businessType: null as string | null,
      period: "",
    });

    const [CubeForm, formApi] = useCubeForm({
      layout: "horizontal",
      schema: searchFormSchema,
      showCollapseButton: true,
      syncStateRef: searchParams,
      onHydratedQuery: () => {
        tableApi.query();
      },
      handleSubmit: (data) => {
        searchParams.businessType = (data.businessType as string | null) ?? null;
        searchParams.period = data.period ? (data.period as [string, string]).join(",") : "";
        searchParams.pageNumber = 1;
        tableApi.query();
      },
      handleReset: () => {
        searchParams.businessType = null;
        searchParams.period = "";
        searchParams.pageNumber = 1;
        tableApi.query();
      },
    });

    const formatPeriodForApi = (period: string): string => {
      if (!period) {
        return "";
      }
      const [start, end] = period.split(",");
      if (!start || !end) {
        return "";
      }
      return `${start} 00:00:00,${end} 23:59:59`;
    };

    const [CubeTable, tableApi] = useCubeTable({
      columns,
      rowKey: "id",
      fetchApi: async () => {
        const params = {
          pageNumber: searchParams.pageNumber,
          pageSize: searchParams.pageSize,
          businessType: searchParams.businessType ?? "",
          period: formatPeriodForApi(searchParams.period),
        };
        return cubeWorkOrderCenterService.getWorkOrderStatisticsList(params);
      },
      fetchLoaded: (data) => {
        searchParams.total = data.total;
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
        const params = {
          businessType: searchParams.businessType ?? "",
          period: formatPeriodForApi(searchParams.period),
        };
        const res = await cubeWorkOrderCenterService.exportWorkOrderStatisticsList(params);
        if (res) {
          const link = document.createElement("a");
          const blob = new Blob([res], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          });
          link.style.display = "none";
          link.href = URL.createObjectURL(blob);
          link.setAttribute("download", "工单统计.xlsx");
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      } catch {
        message.error("操作失败");
      } finally {
        exportLoading.value = false;
      }
    };

    const layoutSlots = {
      "layout-header": (): JSX.Element => (
        <Space>
          <Button disabled={searchParams.total === 0} type="primary" onClick={handleExport} loading={exportLoading.value}>
            导出
          </Button>
        </Space>
      ),
      "layout-content": (): JSX.Element => (
        <div>
          <CubeForm />
          <CubeTable />
        </div>
      ),
      "footer-page": (): JSX.Element => (
        <Page
          v-show={searchParams.total > 0}
          current={searchParams.pageNumber}
          pageSize={searchParams.pageSize}
          total={searchParams.total}
          onPageChange={handleChange}
        />
      ),
    };
    return (): JSX.Element => <CubeLayout title={pageTitle} v-slots={layoutSlots} />;
  },
});
