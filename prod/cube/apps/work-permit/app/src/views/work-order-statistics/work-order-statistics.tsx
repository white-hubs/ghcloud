import { defineComponent, reactive, ref } from "vue";

import { CubeLayout, useCubeForm, useCubeTable } from "@ghcloud/cube-app-design";
import { exportWorkOrderStatisticsList, getWorkOrderStatisticsList } from "@ghcloud/cube-services-client/process-engine.client";
import { Button, DateRangePicker, Page, PopOver, Space, message } from "@ghcloud/cube-ui";

import { BusinessTypeSelect } from "@/components/business-type-select/business-type-select";
import { FormGroupSelect } from "@/components/form-group-select/form-group-select";
import { getCurrentApplicationCode } from "@/utils/current-application";

export const WorkOrderStatistics = defineComponent({
  name: "WorkOrderStatistics",
  setup: () => {
    const columns = [
      {
        title: "作业类型",
        dataIndex: "businessTypeName",
        ellipsis: true,
        width: 200,
        align: "center",
        customRender: ({ text }: { text?: string }): JSX.Element => <PopOver content={text || ""}>{text || "--"}</PopOver>,
      },
      {
        title: "表单分组名称",
        dataIndex: "formGroupName",
        ellipsis: true,
        width: 200,
        align: "center",
        customRender: ({ text }: { text?: string }): JSX.Element => <PopOver content={text || ""}>{text || "--"}</PopOver>,
      },
      {
        title: "作业总数",
        dataIndex: "totalNumber",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text}>{text}</PopOver>,
      },
      {
        title: "处理中作业数",
        dataIndex: "processNumber",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text}>{text}</PopOver>,
      },
      {
        title: "驳回作业数",
        dataIndex: "rejectNumber",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text}>{text}</PopOver>,
      },
      {
        title: "撤销作业数",
        dataIndex: "undoNumber",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text}>{text}</PopOver>,
      },
      {
        title: "完成作业数",
        dataIndex: "dealNumber",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text}>{text}</PopOver>,
      },
    ];

    const [CubeForm, formApi] = useCubeForm({
      layout: "horizontal",
      handleSubmit: () => {
        page.pageNumber = 1;
        tableApi.query();
      },
      handleReset: () => {
        page.pageNumber = 1;
        tableApi.query();
      },
      schema: [
        {
          component: BusinessTypeSelect,
          label: "作业类型",
          fieldName: "businessType",
          defaultValue: null,
        },
        {
          component: FormGroupSelect,
          label: "表单分组",
          fieldName: "formGroupId",
          defaultValue: null,
        },
        {
          component: DateRangePicker,
          label: "发起时间",
          fieldName: "period",
          defaultValue: null,
        },
      ],
      showCollapseButton: true,
    });

    const periodTime = (period: unknown): string => {
      if (period && Array.isArray(period) && period.length === 2) {
        return `${period[0]} 00:00:00,${period[1]} 23:59:59`;
      }
      return "";
    };

    const page = reactive({
      pageNumber: 1,
      pageSize: 10,
      total: 0,
    });

    const [CubeTable, tableApi] = useCubeTable({
      columns,
      rowKey: "businessType",
      fetchApi: async () => {
        const { businessType, period, formGroupId } = formApi.formValues;
        return getWorkOrderStatisticsList({
          pageNumber: page.pageNumber,
          pageSize: page.pageSize,
          applicationCode: getCurrentApplicationCode(),
          businessType: (businessType as string) ?? "",
          formGroupId: typeof formGroupId === "string" && formGroupId ? formGroupId : undefined,
          period: periodTime(period),
        });
      },
      fetchLoaded: (data) => {
        page.total = data.total;
      },
    });

    const handleChange = (pageNumber: number, pageSize: number): void => {
      page.pageNumber = pageNumber;
      page.pageSize = pageSize;
      tableApi.query();
    };

    const exportLoading = ref(false);
    const handleExport = async (): Promise<void> => {
      try {
        exportLoading.value = true;
        const { businessType, period, formGroupId } = formApi.formValues;
        const res = await exportWorkOrderStatisticsList({
          applicationCode: getCurrentApplicationCode(),
          businessType: (businessType as string) ?? "",
          formGroupId: typeof formGroupId === "string" && formGroupId ? formGroupId : undefined,
          period: periodTime(period),
        });
        if (res) {
          const link = document.createElement("a");
          const blob = new Blob([res], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          });
          link.style.display = "none";
          link.href = URL.createObjectURL(blob);
          link.setAttribute("download", "作业统计.xlsx");
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
          <Button disabled={page.total === 0} type="primary" onClick={handleExport} loading={exportLoading.value}>
            导出
          </Button>
        </Space>
      ),
      "layout-content": (): JSX.Element => (
        <>
          <CubeForm />
          <CubeTable />
        </>
      ),
      "footer-page": (): JSX.Element => (
        <Page v-show={page.total > 0} current={page.pageNumber} pageSize={page.pageSize} total={page.total} onPageChange={handleChange} />
      ),
    };

    return (): JSX.Element => <CubeLayout title="作业统计" v-slots={layoutSlots} />;
  },
});
