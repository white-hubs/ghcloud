import dayjs from "dayjs";
import { defineComponent } from "vue";

import { CubeLayout, useCubeForm, useCubeQueryState, useCubeTable } from "@ghcloud/cube-app-design";
import type { FaultListType } from "@ghcloud/cube-maintain-service";
import { Button, PopOver, Page, Select, DateRangePicker } from "@ghcloud/cube-ui";
import RadioGroup from "@ghcloud/cube-ui/src/components/radio-group/radio-group";
import { usePageName } from "@ghcloud/cube-utils";

import { cubeMaintainService } from "@/api/service";
import { getBusinessPrefix, getObjectNameColumnText, mapFormValuesToQueryDefaults } from "@/utils";

import styles from "./fault-list.module.less";

interface FaultData {
  [key: string]: unknown;
  status: string | undefined;
  submitTime: string[];
  type: string;
  pageSize: number;
  pageNumber: number;
}

export const FaultList = defineComponent({
  // 组件的setup函数
  setup: () => {
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
      status: undefined,
      submitTime: [] as string[],
      type: "ALL",
    };
    const queryState = useCubeQueryState<FaultData & { total: number }>({
      storage: "url",
      initialState: {
        ...queryDefaults,
        pageNumber: 1,
        pageSize: 10,
        total: 0,
      },
      cacheFields: ["status", "submitTime", "type", "pageNumber", "pageSize"],
    });
    const options = [
      { value: "ACTIVE", label: "处理中" },
      { value: "REJECT", label: "驳回" },
      { value: "UNDO", label: "撤销" },
      { value: "FINISHED", label: "完成" },
    ];

    const [CubeForm] = useCubeForm({
      layout: "horizontal",
      schema: [
        {
          component: RadioGroup,
          label: "",
          fieldName: "type",
          defaultValue: "ALL",
          componentProps: {
            buttonStyle: "solid",
            options: [
              { label: "全部", value: "ALL" },
              { label: "待我处理", value: "WAITING" },
              { label: "我发起的", value: "SUBMIT" },
              { label: "抄送给我", value: "SERVED" },
              { label: "已处理", value: "PROCESSED" },
            ],
          },
        },
        {
          component: Select,
          label: "状态",
          fieldName: "status",
          defaultValue: undefined,
          componentProps: {
            allowClear: true,
            placeholder: "请选择",
            options,
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
      queryStateFields: ["status", "submitTime", "type"],
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
    const goDetail = (row: FaultListType): void => {
      const { processInstanceId, currentTaskId, status } = row;
      const target = `/portal/stream-engine-render/index?businessType=${flowCode}&processInstanceId=${processInstanceId}&currentTaskId=${currentTaskId}&status=${status}&type=detail&title=${pageTitle}`;
      history.pushState(history.state, "", target);
    };
    const columns = [
      {
        title: "编号",
        dataIndex: "code",
        ellipsis: true,
        customRender: ({ text }: { text: string }) => {
          return <PopOver content={text || ""}>{text || "--"}</PopOver>;
        },
      },
      {
        title: "发起时间",
        dataIndex: "submitedTime",
        ellipsis: true,
        customRender: ({ text }: { text: string }) => {
          return <PopOver content={text || ""}>{text ? dayjs(text).format("YYYY-MM-DD HH:mm:ss") : "-"}</PopOver>;
        },
      },
      {
        title: "工单名称",
        dataIndex: "instanceName",
        ellipsis: true,
        customRender: ({ text }: { text: string }) => {
          return <PopOver content={text || ""}>{text || "--"}</PopOver>;
        },
      },
      {
        title: getObjectNameColumnText(),
        dataIndex: "objName",
        ellipsis: true,
        customRender: ({ text }: { text: string }) => {
          return <PopOver content={text || ""}>{text || "--"}</PopOver>;
        },
      },
      {
        title: `${businessPrefix}类型`,
        dataIndex: "faultType",
        ellipsis: true,
        customRender: ({ text }: { text: string }) => {
          return <PopOver content={text || ""}>{text || "--"}</PopOver>;
        },
      },
      {
        title: "紧急程度",
        dataIndex: "urgencyLevel",
        ellipsis: true,
        customRender: ({ text }: { text: string }) => {
          return <PopOver content={text}>{text || "--"}</PopOver>;
        },
      },
      {
        title: "发起人",
        dataIndex: "startUserName",
        key: "startUserName",
        customRender: ({ text }: { text: string }) => {
          return <PopOver content={text}>{text || "--"}</PopOver>;
        },
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
        customRender: ({ text }: { text: string }) => {
          return <PopOver content={text}>{text || "--"}</PopOver>;
        },
      },
      {
        title: "处理结果",
        dataIndex: "result",
        key: "result",
        customRender: ({ text }: { text: string }) => {
          return <PopOver content={text}>{text || "--"}</PopOver>;
        },
      },
      {
        dataIndex: "action",
        title: "操作",
        slots: {
          customRender: "action",
        },
        customRender: ({ record }: { record: FaultListType }) => {
          return (
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
          );
        },
      },
    ];

    const [CubeTable, tableApi] = useCubeTable({
      rowKey: "id",
      columns,
      tableCode: "FAULT_LIST",
      queryState: queryState as never,
      fetchApi: async () => {
        const data = await cubeMaintainService.faultApplyPersonal({
          status: queryState.state.status,
          type: queryState.state.type,
          submitTime: queryState.state.submitTime ? queryState.state.submitTime.join(",") : "",
          businessType: flowCode,
          pageNumber: queryState.state.pageNumber,
          pageSize: queryState.state.pageSize,
        } as Parameters<typeof cubeMaintainService.faultApplyPersonal>[0] & {
          status?: string;
          type?: string;
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
    const addFlow = (): void => {
      const target = `/portal/stream-engine-render/index?businessType=${flowCode}&type=add&title=${pageTitle}`;
      history.pushState({}, "", target);
    };
    const layoutSlots = {
      "layout-header": () => {
        return (
          <Button type="primary" onClick={addFlow}>
            新增
          </Button>
        );
      },
      "layout-content": () => {
        return (
          <div class={styles.faultList}>
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
