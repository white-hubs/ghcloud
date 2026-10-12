import dayjs from "dayjs";
import { defineComponent, reactive } from "vue";
import { useRoute } from "vue-router";

import { CubeLayout, useCubeForm, useCubeTable } from "@ghcloud/cube-app-design";
import type { IllegalParkingRecordVO } from "@ghcloud/cube-parking-lot-service/src/type";
import { Button, PopOver, Page, Tag } from "@ghcloud/cube-ui";
import { usePageName } from "@ghcloud/cube-utils";

import { cubeParkingLotService } from "@/api/service";
import { TimeRangePicker } from "@/views/pages/components/time-range-picker/time-range-picker";

export const IllegalParkingList = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName();
    const route = useRoute();
    const tableCode = route.path.replaceAll("/", "");
    const searchParams = reactive({
      pageNumber: 1,
      pageSize: 10,
      total: 0,
      keyword: "",
      type: "ALL",
      period: "",
    });

    const statusText = (str: string) => {
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
    const illegalLevelText = (str: string) => {
      const levelMap = new Map([
        ["GENERAL", "一般"],
        ["SERIOUS", "严重"],
        ["LIGHT", "轻微"],
        ["FATAL", "致命"],
      ]);
      return levelMap.get(str) || "";
    };

    const illegalLevelColor = (str: string) => {
      const colorMap = new Map([
        ["GENERAL", "orange"],
        ["SERIOUS", "red"],
        ["LIGHT", "green"],
        ["FATAL", "purple"],
      ]);
      return colorMap.get(str);
    };

    const columns = [
      {
        dataIndex: "code",
        title: "编号",
        align: "center",
        ellipsis: true,
        customRender: ({ record }: { record: IllegalParkingRecordVO }) => {
          const textVal = record?.code || record?.formNo || "";
          return <PopOver content={textVal || ""}>{textVal || "--"}</PopOver>;
        },
      },
      {
        dataIndex: "plateNumber",
        title: "违停对象",
        align: "center",
        ellipsis: true,
        customRender: ({ record }: { record: IllegalParkingRecordVO }) => {
          const textVal = record?.plateNumber || "";
          return <PopOver content={textVal || ""}>{textVal || "--"}</PopOver>;
        },
      },
      {
        dataIndex: "illegalLevel",
        title: "违停程度",
        align: "center",
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => {
          const textVal = illegalLevelText(text);
          const colorVal = illegalLevelColor(text);

          return textVal ? <Tag color={colorVal}>{textVal}</Tag> : <span>--</span>;
        },
      },
      {
        dataIndex: "startUserName",
        title: "发起人",
        align: "center",
        ellipsis: true,
        customRender: ({ text }: { text: string }) => <PopOver content={text || ""}>{text || "--"}</PopOver>,
      },
      {
        title: "发起部门",
        dataIndex: "startUserInfo",
        align: "center",
        ellipsis: true,
        customRender: ({ text }: { text: { organizationName: string } }): string => {
          return text?.organizationName;
        },
      },
      {
        title: "发起时间",
        dataIndex: "submitedTime",
        align: "center",
        width: 180,
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => {
          const time = text ? dayjs(text).format("YYYY-MM-DD HH:mm:ss") : "--";
          return <PopOver content={time}>{time}</PopOver>;
        },
      },
      {
        dataIndex: "status",
        title: "处理状态",
        align: "center",
        width: 100,
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => {
          const textVal = statusText(text);
          return <PopOver content={textVal || "--"}>{textVal || "--"}</PopOver>;
        },
      },
      {
        dataIndex: "activeNodeName",
        title: "处理进度",
        align: "center",
        ellipsis: true,
        customRender: ({ text }: { text: string }) => <PopOver content={text || ""}>{text || "--"}</PopOver>,
      },
      {
        dataIndex: "instanceName",
        title: "申请名称",
        align: "center",
        ellipsis: true,
        customRender: ({ text }: { text: string }) => <PopOver content={text || ""}>{text || "--"}</PopOver>,
      },
      {
        dataIndex: "action",
        title: "操作",
        fixed: "right",
        width: 100,
        customRender: ({ record }: { record: IllegalParkingRecordVO }) => (
          <Button
            type="link"
            size="small"
            onClick={() => {
              history.pushState(
                {},
                "",
                `/portal/stream-engine-render/index?businessType=ILLEGAL_PARKING&appName=PARKINGMANAGE&processInstanceId=${record?.processInstanceId}&currentTaskId=&status=ACTIVE&t&type=detail&title=车辆违停`,
              );
            }}
          >
            详情
          </Button>
        ),
      },
    ];

    const [CubeTable, tableApi] = useCubeTable({
      columns,
      tableCode,
      rowKey: "id",
      fetchApi: async () => {
        const params = {
          pageNumber: searchParams.pageNumber,
          pageSize: searchParams.pageSize,
          keyword: (searchParams.keyword as string) ?? "",
          type: (searchParams.type as string) ?? "",
          period: (searchParams.period as string) ?? "",
          submitTime: (searchParams.period as string) ?? "",
          businessType: "ILLEGAL_PARKING",
        };
        return cubeParkingLotService.getIllegalParkingList(params);
      },
      fetchLoaded: (data) => {
        searchParams.total = data.total;
      },
    });

    const handleChange = (pageNumber: number, pageSize: number) => {
      searchParams.pageNumber = pageNumber;
      searchParams.pageSize = pageSize;
      tableApi.query();
    };

    const formSchema = [
      {
        component: "Select",
        label: "类型",
        fieldName: "type",
        defaultValue: "ALL",
        componentProps: {
          allowClear: false,
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
        component: TimeRangePicker,
        label: "发起时间",
        fieldName: "period",
        componentProps: {},
      },
      {
        component: "Input",
        label: "",
        fieldName: "keyword",
        componentProps: {
          placeholder: "工单名称",
        },
      },
    ];

    const [CubeForm, formApi] = useCubeForm({
      layout: "horizontal",
      schema: formSchema,
      syncStateRef: searchParams,
      onHydratedQuery: () => {
        tableApi.query();
      },
      handleSubmit: (data) => {
        Object.assign(searchParams, data);
        searchParams.pageNumber = 1;
        tableApi.query();
      },
      handleReset: () => {
        searchParams.keyword = "";
        searchParams.type = "ALL";
        searchParams.period = "";
        searchParams.pageNumber = 1;
        tableApi.query();
      },
      showCollapseButton: true,
    });

    const handleAdd = (): void => {
      history.pushState(
        { current: location.pathname + location.search },
        "",
        `/portal/stream-engine-render/index?businessType=ILLEGAL_PARKING&appName=PARKINGMANAGE&type=add&title=车辆违停`,
      );
    };

    const slots = {
      "layout-header": (): JSX.Element => {
        return (
          <Button type="primary" onClick={handleAdd}>
            新增
          </Button>
        );
      },
      "layout-content": () => (
        <div>
          <CubeForm />
          <CubeTable />
        </div>
      ),
      "footer-page": () => (
        <Page current={searchParams.pageNumber} pageSize={searchParams.pageSize} total={searchParams.total} onPageChange={handleChange} />
      ),
    };

    return () => <CubeLayout title={pageTitle} v-slots={slots} showTableXScroll />;
  },
});
