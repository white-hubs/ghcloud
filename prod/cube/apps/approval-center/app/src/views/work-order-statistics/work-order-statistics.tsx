import { defineComponent, reactive, ref } from "vue";

import { CubeLayout, useCubeForm, useCubeTable } from "@ghcloud/cube-app-design";
import { Button, PopOver, DateRangePicker, Page, Space, message } from "@ghcloud/cube-ui";
import { usePageName } from "@ghcloud/cube-utils";

import { cubeApprovalCenterService } from "@/api/service";
import { BusinessTypeSelect } from "@/components/business-type-select/business-type-select";
import { FormGroupSelect } from "@/components/form-group-select/form-group-select";

/** 工单统计列表 */
export const WorkOrderStatistics = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName();
    const applicationCode = (() => {
      const application = JSON.parse(sessionStorage.getItem("GH-currentApplication") as string) as { code: string };
      return application?.code ?? "";
    })();
    const columns = [
      {
        title: "工单类型",
        dataIndex: "businessTypeName",
        ellipsis: true,
        width: 200,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <PopOver content={text || ""}>{text || "--"}</PopOver>;
        },
      },
      {
        title: "表单分组名称",
        dataIndex: "formGroupName",
        ellipsis: true,
        width: 200,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <PopOver content={text || ""}>{text || "--"}</PopOver>;
        },
      },
      {
        title: "工单总数",
        dataIndex: "totalNumber",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <PopOver content={text}>{text}</PopOver>;
        },
      },
      {
        title: "处理中工单数",
        dataIndex: "processNumber",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <PopOver content={text}>{text}</PopOver>;
        },
      },
      {
        title: "驳回工单数",
        dataIndex: "rejectNumber",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <PopOver content={text}>{text}</PopOver>;
        },
      },
      {
        title: "撤销工单数",
        dataIndex: "undoNumber",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <PopOver content={text}>{text}</PopOver>;
        },
      },
      {
        title: "完成工单数",
        dataIndex: "dealNumber",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <PopOver content={text}>{text}</PopOver>;
        },
      },
    ];

    const [CubeForm, formApi] = useCubeForm({
      layout: "horizontal",
      handleSubmit: () => {
        tableApi.query();
      },
      handleReset: () => {
        tableApi.query();
      },
      schema: [],
      showCollapseButton: true,
    });
    const searchFormSchema = [
      {
        component: BusinessTypeSelect,
        label: "工单类型",
        fieldName: "businessType",
        defaultValue: null,
        componentProps: {},
      },
      {
        component: FormGroupSelect,
        label: "表单分组",
        fieldName: "formGroupId",
        defaultValue: null,
        componentProps: {
          applicationCode,
        },
      },
      {
        component: DateRangePicker,
        label: "发起时间",
        fieldName: "period",
        defaultValue: null,
      },
    ];
    formApi.updateSchema(searchFormSchema);

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
      rowKey: "id",
      fetchApi: async () => {
        const { businessType, period, formGroupId } = formApi.formValues;
        const params = {
          pageNumber: page.pageNumber,
          pageSize: page.pageSize,
          businessType: (businessType as string) ?? "",
          period: periodTime(period),
          formGroupId: typeof formGroupId === "string" && formGroupId ? formGroupId : undefined,
          applicationCode: applicationCode || undefined,
        };
        return cubeApprovalCenterService.getWorkOrderStatisticsList(params);
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
        const params = {
          businessType: (businessType as string) ?? "",
          period: periodTime(period),
          formGroupId: typeof formGroupId === "string" && formGroupId ? formGroupId : undefined,
          applicationCode: applicationCode || undefined,
        };
        const res = await cubeApprovalCenterService.exportWorkOrderStatisticsList(params);
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
      "layout-header": (): JSX.Element => {
        return (
          <Space>
            <Button disabled={page.total === 0} type="primary" onClick={handleExport} loading={exportLoading.value}>
              导出
            </Button>
          </Space>
        );
      },
      "layout-content": (): JSX.Element => {
        return (
          <div>
            <CubeForm />
            <CubeTable />
          </div>
        );
      },
      "footer-page": (): JSX.Element => {
        return (
          <Page v-show={page.total > 0} current={page.pageNumber} pageSize={page.pageSize} total={page.total} onPageChange={handleChange} />
        );
      },
    };
    return (): JSX.Element => <CubeLayout title={pageTitle ?? "工单统计"} v-slots={layoutSlots} />;
  },
});
