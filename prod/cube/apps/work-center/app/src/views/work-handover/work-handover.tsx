import dayjs from "dayjs";
import { defineComponent } from "vue";

import { CubeLayout, useCubeForm, useCubeTable, useCubeQueryState } from "@ghcloud/cube-app-design";
import { Button, Page, PopOver } from "@ghcloud/cube-ui";
import { usePageName } from "@ghcloud/cube-utils";
import type { HandoverRecordVO } from "@ghcloud/cube-work-center-service/src/type";

import { cubeWorkCenterService } from "@/api/service";
export const handoverStatus = {
  WAIT_HANDOVER: "待接班",
  HAND_OVERED: "已交班",
  TAKE_OVERED: "已接班",
  CANCEL: "已取消",
};
export const handoverStatusColor = new Map([
  ["WAIT_HANDOVER", "#1d66ff"],
  ["HAND_OVERED", "#6ab539"],
  ["TAKE_OVERED", "#6ab539"],
  ["CANCEL", "#F69703"],
]);
export const WorkHandover = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName();
    const queryDefaults = {
      pageNumber: 1,
      pageSize: 10,
      total: 0,
      keyword: "",
      status: "",
      period: "",
    };
    type QueryState = typeof queryDefaults;

    const queryState = useCubeQueryState<QueryState>({
      storage: "url",
      initialState: queryDefaults,
      cacheFields: ["keyword", "status", "period", "pageNumber", "pageSize"],
      resolveValue: (field, raw) => {
        if (field === "pageNumber" || field === "pageSize") {
          return Number(raw);
        }
        return raw;
      },
    });

    const handoverColumns = [
      {
        dataIndex: "recordName",
        title: "任务名称",
        slots: {
          customRender: "recordName",
        },
        align: "center",
        width: 250,
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <PopOver content={text || ""}>{text || "--"}</PopOver>;
        },
      },
      {
        dataIndex: "shiftOverUserName",
        title: "交班人",
        slots: {
          customRender: "shiftOverUserName",
        },
        align: "center",
        width: 100,
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <PopOver content={text || ""}>{text || "--"}</PopOver>;
        },
      },
      {
        dataIndex: "shiftOverTime",
        title: "交班时间",
        slots: {
          customRender: "shiftOverTime",
        },
        align: "center",
        width: 180,
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => {
          const time = text ? dayjs(text).format("YYYY-MM-DD HH:mm:ss") : "";
          return <PopOver content={time || ""}>{time || "--"}</PopOver>;
        },
      },
      {
        dataIndex: "taskNum",
        title: "交接事项数",
        slots: {
          customRender: "taskNum",
        },
        align: "center",
        width: 100,
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <PopOver content={text || ""}>{text || "--"}</PopOver>;
        },
      },
      {
        dataIndex: "takeOverUserName",
        title: "接班人",
        slots: {
          customRender: "takeOverUserName",
        },
        align: "center",
        width: 100,
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <PopOver content={text || ""}>{text || "--"}</PopOver>;
        },
      },
      {
        dataIndex: "takeOverTime",
        title: "接班时间",
        slots: {
          customRender: "takeOverTime",
        },
        align: "center",
        width: 180,
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => {
          const time = text ? dayjs(text).format("YYYY-MM-DD HH:mm:ss") : "";
          return <PopOver content={time || ""}>{time || "--"}</PopOver>;
        },
      },
      {
        dataIndex: "status",
        title: "任务状态",
        width: 100,
        slots: {
          customRender: "status",
        },
        align: "center",
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => {
          const textVal = handoverStatus[text as keyof typeof handoverStatus];
          return (
            <PopOver content={textVal || ""}>
              <span style={{ color: handoverStatusColor.get(text || "") }}>{textVal || "--"}</span>
            </PopOver>
          );
        },
      },
      {
        dataIndex: "action",
        title: "操作",
        align: "center",
        width: 100,
        customRender: ({ record }: { record: HandoverRecordVO }): JSX.Element => {
          return (
            <Button
              type="link"
              size="small"
              onClick={() => {
                history.pushState({}, "", `/portal/work-center/work-handover-detail?type=info&id=${record.id}`);
              }}
            >
              详情
            </Button>
          );
        },
      },
    ];

    const [CubeTable, tableApi] = useCubeTable({
      columns: handoverColumns,
      rowKey: "id",
      autoFetch: false,
      queryState,
      fetchApi: async () => {
        const params = {
          pageNumber: queryState.state.pageNumber,
          pageSize: queryState.state.pageSize,
          name: queryState.state.keyword ?? "",
          period: queryState.state.period,
          status: queryState.state.status,
          permission: true,
        };
        const res = await cubeWorkCenterService.getHandoverPage(params);
        queryState.update({ total: res.total });
        return res;
      },
    });

    const handleChange = (pageNumber: number, pageSize: number) => {
      queryState.setPage(pageNumber, pageSize);
      tableApi.query();
    };

    const formSchema = [
      {
        component: "Select",
        label: "状态",
        fieldName: "status",
        defaultValue: undefined,
        componentProps: {
          allowClear: true,
          placeholder: "请选择状态",
          options: [
            {
              label: "全部",
              value: "",
            },
            ...Object.keys(handoverStatus).map((item) => {
              return {
                label: handoverStatus[item as keyof typeof handoverStatus],
                value: item,
              };
            }),
          ],
          onChange: (value: string): void => {
            queryState.state.status = value;
            queryState.resetPage();
            queryState.writeCache();
            tableApi.query();
          },
        },
      },
      {
        component: "RangePicker",
        label: "交班时间",
        fieldName: "period",
        componentProps: {
          styles: {
            width: "100%",
          },
          valueFormat: "YYYY-MM-DD",
          allowClear: true,
        },
      },
      {
        component: "Input",
        label: "",
        fieldName: "keyword",
        componentProps: {
          placeholder: "任务名称、交班人、接班人",
        },
      },
    ];

    const [CubeForm] = useCubeForm({
      layout: "horizontal",
      schema: formSchema,
      showCollapseButton: true,
      queryState,
      mapFormValuesToQueryState: (values) => ({
        keyword: values.keyword ? String(values.keyword) : "",
        status: values.status ? String(values.status) : "",
        period:
          values.period && Array.isArray(values.period)
            ? (values.period as string[]).map((d) => dayjs(d).format("YYYY-MM-DD")).join(",")
            : "",
      }),
      mapQueryStateToFormValues: (state) => ({
        keyword: state.keyword,
        status: state.status,
        period: state.period ? String(state.period).split(",") : undefined,
      }),
      onHydratedQuery: () => {
        tableApi.query();
      },
      handleSubmit: () => {
        tableApi.query();
      },
      handleReset: () => {
        tableApi.query();
      },
    });

    const slots = {
      "layout-content": () => (
        <div>
          <CubeForm />
          <CubeTable />
        </div>
      ),
      "footer-page": () => (
        <Page
          current={queryState.state.pageNumber}
          pageSize={queryState.state.pageSize}
          total={queryState.state.total}
          onPageChange={handleChange}
        />
      ),
    };

    return () => <CubeLayout title={pageTitle} v-slots={slots} />;
  },
});
