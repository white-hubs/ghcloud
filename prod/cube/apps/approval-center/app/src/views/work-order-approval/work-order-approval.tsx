import dayjs from "dayjs";
import { defineComponent, reactive } from "vue";
import { useRoute } from "vue-router";

import { CubeLayout, DeptSelect, useCubeForm, useCubeTable } from "@ghcloud/cube-app-design";
import type { FlowProcessVO } from "@ghcloud/cube-approval-center-service";
import { Button, Page, PopOver } from "@ghcloud/cube-ui";
import { queryParameter, usePageName } from "@ghcloud/cube-utils";

import { cubeApprovalCenterService } from "@/api/service";
import { flowStatus, flowTypes, statusText } from "@/utils";

/** 工单审批列表 */
export const WorkOrderApproval = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName();
    const route = useRoute();
    const tableCode = route.path.replaceAll("/", "");
    const applicationCode = (() => {
      const application = JSON.parse(sessionStorage.getItem("GH-currentApplication") as string) as { code: string };
      return application?.code ?? "";
    })();
    const formState = reactive({
      flowId: queryParameter.getQuery()?.flowId ?? "",
      flowName: queryParameter.getQuery()?.flowName ?? "",
      businessType: queryParameter.getQuery()?.businessType ?? "",
      type: queryParameter.getQuery()?.type ?? "ALL",
      status: queryParameter.getQuery()?.status ?? "",
      submitTime: queryParameter.getQuery()?.submitTime ? (queryParameter.getQuery()!.submitTime as string).split(",") : undefined,
    });
    const page = reactive({
      pageNumber: 1,
      pageSize: 10,
      total: 0,
    });

    const searchFormSchema = [
      {
        component: "Select",
        label: "发起类型",
        fieldName: "type",
        defaultValue: formState.type,
        componentProps: {
          allowClear: false,
          placeholder: "请选择发起类型",
          options: Object.keys(flowTypes).map((item) => ({
            label: flowTypes[item as keyof typeof flowTypes],
            value: item,
          })),
          onChange: (): void => {
            tableApi.query();
          },
        },
      },
      {
        component: "Select",
        label: "状态",
        fieldName: "status",
        defaultValue: formState.status,
        componentProps: {
          allowClear: true,
          placeholder: "请选择状态",
          options: [
            {
              label: "全部",
              value: "",
            },
            ...Object.keys(flowStatus).map((item) => ({
              label: flowStatus[item as keyof typeof flowStatus],
              value: item,
            })),
          ],
          onChange: (): void => {
            tableApi.query();
          },
        },
      },
      {
        component: "RangePicker",
        label: "发起时间",
        fieldName: "submitTime",
        componentProps: {
          valueFormat: "YYYY-MM-DD",
          allowClear: true,
        },
      },
      {
        component: DeptSelect,
        label: "发起部门",
        fieldName: "organizationId",
      },
      {
        component: "Input",
        label: "发起人",
        fieldName: "username",
        componentProps: {
          placeholder: "请输入发起人姓名",
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
      schema: searchFormSchema,
      showCollapseButton: true,
    });
    const columns = [
      {
        title: "工单编号",
        dataIndex: "formNo",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || ""}>{text || "--"}</PopOver>,
      },
      {
        title: "工单名称",
        dataIndex: "instanceName",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || ""}>{text || "--"}</PopOver>,
      },
      {
        title: "发起人",
        dataIndex: "startUserName",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || ""}>{text || "--"}</PopOver>,
      },
      {
        title: "发起部门",
        dataIndex: "organizationName",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || ""}>{text || "--"}</PopOver>,
      },
      {
        title: "发起时间",
        dataIndex: "submitedTime",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => {
          const time = text ? dayjs(text).format("YYYY-MM-DD HH:mm:ss") : "-";
          return <PopOver content={time || ""}>{time || "--"}</PopOver>;
        },
      },
      {
        title: "处理状态",
        dataIndex: "status",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => {
          const textVal = text ? statusText(text) : "-";
          return <PopOver content={textVal || ""}>{textVal || "--"}</PopOver>;
        },
      },
      {
        title: "处理进度",
        dataIndex: "activeNodeName",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || ""}>{text || "--"}</PopOver>,
      },
      {
        dataIndex: "action",
        title: "操作",
        slots: {
          customRender: "action",
        },
        fixed: "right",
        width: 180,
        customRender: ({ record }: { record: FlowProcessVO }): JSX.Element => (
          <>
            <Button
              type="link"
              size="small"
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
      tableCode,
      columns,
      fetchApi: async () => {
        const param = {
          pageNumber: page.pageNumber,
          pageSize: page.pageSize,
          businessType: (formState.businessType as string) ?? "",
          type: (formApi.formValues.type as string) ?? "",
          status: (formApi.formValues.status as string) ?? "",
          organizationId: (formApi.formValues.organizationId as string) ?? "",
          username: (formApi.formValues.username as string) ?? "",
          submitTime: (formApi.formValues.submitTime as string) ?? "",
          applicationCode: applicationCode || undefined,
        };
        return cubeApprovalCenterService.getFlowProcessPage(param);
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

    /** 跳转到详情页 */
    const goDetail = (record: FlowProcessVO): void => {
      history.pushState(
        { current: location.pathname + location.search },
        "",
        `/portal/stream-engine-render/index?businessType=${record.businessType}&processInstanceId=${record.processInstanceId}&currentTaskId=${record.currentTaskId}&status=${record.status}&type=detail&title=审批详情`,
      );
    };

    /** 跳转到流引擎新增 */
    const addFlow = (): void => {
      history.pushState(
        { current: location.pathname + location.search },
        "",
        `/portal/stream-engine-render/index?businessType=${formState.businessType}&type=add&title=${formState.flowName}`,
      );
    };

    const layoutSlots = {
      "layout-header": (): JSX.Element => (
        <Button type="primary" onClick={addFlow}>
          新增
        </Button>
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

    return (): JSX.Element => <CubeLayout title={pageTitle ?? formState.flowName} v-slots={layoutSlots} />;
  },
});
