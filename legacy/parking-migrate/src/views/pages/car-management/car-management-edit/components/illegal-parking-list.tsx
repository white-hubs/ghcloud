import dayjs from "dayjs";
import { defineComponent, reactive, watch } from "vue";
import { useRoute } from "vue-router";

import { useCubeForm, useCubeTable } from "@ghcloud/cube-app-design";
import type { VehiclePenaltyRecordVO } from "@ghcloud/cube-parking-lot-service/src/type";
import { Button, PopOver } from "@ghcloud/cube-ui";

import { cubeParkingLotService } from "@/api/service";
import { TimeRangePicker } from "@/views/pages/components/time-range-picker/time-range-picker";

import styles from "../car-management-edit.module.less";

export const IllegalParkingList = defineComponent({
  props: {
    vehicleNo: {
      type: String,
      default: "",
    },
  },
  setup: (props) => {
    const route = useRoute();
    const tableCode = route.path.replaceAll("/", "");
    const searchParams = reactive({
      pageNumber: 1,
      pageSize: 10,
      total: 0,
      period: "",
    });

    const searchFormSchema = [
      {
        component: TimeRangePicker,
        label: "时间范围",
        fieldName: "period",
        componentProps: {},
      },
    ];
    const [CubeForm, formApi] = useCubeForm({
      layout: "horizontal",
      syncStateRef: searchParams,
      onHydratedQuery: () => {
        tableApi.query();
      },
      handleSubmit: (data) => {
        searchParams.period = data.period ? (data.period as [string, string]).join(",") : "";
        searchParams.pageNumber = 1;
        tableApi.query();
      },
      handleReset: () => {
        searchParams.period = "";
        searchParams.pageNumber = 1;
        tableApi.query();
      },
      schema: searchFormSchema,
      showCollapseButton: true,
    });

    const [CubeTable, tableApi] = useCubeTable({
      columns: [
        {
          title: "车牌号码",
          dataIndex: "plateNumber",
          key: "plateNumber",
          ellipsis: true,
          align: "center",
          customRender: ({ text }: { text: string }): JSX.Element => {
            return <PopOver content={text || "--"}>{text || "--"}</PopOver>;
          },
        },
        {
          title: "车主",
          dataIndex: "ownerName",
          key: "ownerName",
          ellipsis: true,
          align: "center",
          customRender: ({ text }: { text: string }): JSX.Element => {
            return <PopOver content={text || "--"}>{text || "--"}</PopOver>;
          },
        },
        {
          title: "联系方式",
          dataIndex: "ownerPhone",
          key: "ownerPhone",
          ellipsis: true,
          align: "center",
          customRender: ({ text }: { text: string }): JSX.Element => {
            return <PopOver content={text || "--"}>{text || "--"}</PopOver>;
          },
        },
        {
          title: "违停时间",
          dataIndex: "illegalTime",
          key: "illegalTime",
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
          key: "worKOrderName",
          ellipsis: true,
          align: "center",
          customRender: ({ record }: { record: VehiclePenaltyRecordVO }): JSX.Element => {
            const textVal = record?.worKOrderName ?? "--";
            return (
              <PopOver content={textVal || "--"}>
                <Button
                  type="link"
                  onClick={() => {
                    history.pushState(
                      {},
                      "",
                      `/portal/stream-engine-render/index?businessType=ILLEGAL_PARKING&appName=PARKINGMANAGE&processInstanceId=${record?.processInstanceId}&currentTaskId=&status=ACTIVE&t&type=detail&title=车辆违停`,
                    );
                  }}
                >
                  {textVal}
                </Button>
              </PopOver>
            );
          },
        },
        {
          title: "违停扣分",
          dataIndex: "violationScore",
          key: "violationScore",
          ellipsis: true,
          customRender: ({ text }: { text: string }): JSX.Element => {
            const textVal = text ? `${text}分` : "--";
            return <PopOver content={textVal || "--"}>{textVal || "--"}</PopOver>;
          },
        },
      ],
      tableCode,
      rowKey: "id",
      scrollY: 300,
      pagination: {
        current: 1, // 当前页码
        pageSize: 10, // 每页显示条数
        total: 0, // 总条数
        size: "default", // 分页组件大小
        showSizeChanger: true, // 是否允许改变每页显示条数
        showTotal: (total: number) => `总共 ${total} 条数据`,
        onChange: (current: number, pageSize: number) => {
          tableApi.setState({
            pagination: {
              ...(tableApi.state.pagination as unknown as Record<string, unknown>),
              pageSize,
              current,
            },
          });
          tableApi.query();
        },
      },
      fetchApi: async (params?: Record<string, unknown>) => {
        if (params) {
          return cubeParkingLotService.getParkingBlackDetail({
            pageNumber: params.current as number,
            pageSize: params.pageSize as number,
            plateNumber: (props.vehicleNo as string) ?? "",
            violationTime: searchParams.period ?? "",
          });
        }
        return cubeParkingLotService.getParkingBlackDetail({
          pageNumber: 1,
          pageSize: 10,
          plateNumber: props.vehicleNo as string,
          violationTime: searchParams.period,
        });
      },
    });

    watch(
      () => props.vehicleNo,
      (val) => {
        if (val) {
          tableApi.query();
        }
      },
    );

    return () => (
      <div style={{ marginTop: "24px" }}>
        <div class={styles.title}>违停记录</div>
        <CubeForm />
        <CubeTable />
      </div>
    );
  },
});
