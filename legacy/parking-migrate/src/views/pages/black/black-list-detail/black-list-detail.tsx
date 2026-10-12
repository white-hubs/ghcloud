import dayjs from "dayjs";
import { defineComponent, reactive } from "vue";
import { useRoute } from "vue-router";

import { CubeLayout, useCubeForm, useCubeTable } from "@ghcloud/cube-app-design";
import type { VehiclePenaltyRecordVO } from "@ghcloud/cube-parking-lot-service/src/type";
import { PopOver, Page, Button } from "@ghcloud/cube-ui";
import { usePageName } from "@ghcloud/cube-utils";

import { cubeParkingLotService } from "@/api/service";
import { TimeRangePicker } from "@/views/pages/components/time-range-picker/time-range-picker";

/** 黑名单违停明细 */
export const BlackListDetail = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName();
    const route = useRoute();
    const tableCode = route.path.replaceAll("/", "");
    const { plateNumber } = route.query as { plateNumber: string };

    const searchParams = reactive({
      pageNumber: 1,
      pageSize: 10,
      total: 0,
      keyword: "",
      period: "",
    });

    const searchFormSchema = [
      {
        component: TimeRangePicker,
        label: "时间范围",
        fieldName: "period",
        componentProps: {},
      },
      // {
      //   component: 'Input',
      //   label: '',
      //   fieldName: 'keyword',
      //   componentProps: {
      //     placeholder: '车牌号、车主姓名'
      //   }
      // },
    ];
    const [CubeForm, formApi] = useCubeForm({
      layout: "horizontal",
      syncStateRef: searchParams,
      onHydratedQuery: () => {
        tableApi.query();
      },
      handleSubmit: (data) => {
        searchParams.period = data.period ? (data.period as [string, string]).join(",") : "";
        searchParams.keyword = data.keyword ? (data.keyword as string) : "";
        searchParams.pageNumber = 1;
        tableApi.query();
      },
      handleReset: () => {
        searchParams.period = "";
        searchParams.keyword = "";
        searchParams.pageNumber = 1;
        tableApi.query();
      },
      schema: searchFormSchema,
      showCollapseButton: true,
    });

    const columns = [
      {
        title: "车牌号",
        dataIndex: "plateNumber",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <PopOver content={text || "--"}>{text || "--"}</PopOver>;
        },
      },
      {
        title: "车主姓名",
        dataIndex: "ownerName",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <PopOver content={text || "--"}>{text || "--"}</PopOver>;
        },
      },
      {
        title: "联系方式",
        dataIndex: "ownerPhone",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <PopOver content={text || "--"}>{text || "--"}</PopOver>;
        },
      },
      {
        dataIndex: "illegalTime",
        title: "违停时间",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => {
          const time = dayjs(text).format("YYYY-MM-DD HH:mm:ss");
          return <PopOver content={time || ""}>{time || "--"}</PopOver>;
        },
      },
      {
        title: "违停工单",
        dataIndex: "worKOrderName",
        ellipsis: true,
        align: "center",
        customRender: ({ record }: { record: VehiclePenaltyRecordVO }): JSX.Element => {
          const textVal = record.worKOrderName ?? "";
          return (
            <PopOver content={textVal || "--"}>
              <Button
                type="link"
                onClick={() => {
                  history.pushState(
                    { current: location.pathname + location.search },
                    "",
                    `/portal/stream-engine-render/index?businessType=ILLEGAL_PARKING&appName=PARKINGMANAGE&title=车辆违停&processInstanceId=${record?.processInstanceId}&status=ACTIVE&t&type=detail`,
                  );
                }}
              >
                {textVal || "--"}
              </Button>
            </PopOver>
          );
        },
      },
      {
        title: "违停扣分",
        dataIndex: "violationScore",
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => {
          const textVal = text ? `${text}分` : "--";
          return <PopOver content={textVal || "--"}>{textVal || "--"}</PopOver>;
        },
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
          plateNumber: plateNumber ?? "",
          period: searchParams.period,
          violationTime: searchParams.period,
        };
        return cubeParkingLotService.getParkingBlackDetail(params);
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
    const slots = {
      "layout-header": () => <Button onClick={() => history.back()}>返回</Button>,
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
          <Page current={searchParams.pageNumber} pageSize={searchParams.pageSize} total={searchParams.total} onPageChange={handleChange} />
        );
      },
    };
    return (): JSX.Element => (
      <>
        <CubeLayout title={pageTitle} v-slots={slots} />
      </>
    );
  },
});
