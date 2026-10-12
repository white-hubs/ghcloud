import dayjs from "dayjs";
import { defineComponent, reactive, ref } from "vue";
import { useRoute } from "vue-router";

import { CubeLayout, useCubeForm, useCubeTable } from "@ghcloud/cube-app-design";
import type { IllegalParkingBlacklistVO } from "@ghcloud/cube-parking-lot-service/src/type";
import { Button, PopOver, Page, PopConfirm, message } from "@ghcloud/cube-ui";
import { usePageName } from "@ghcloud/cube-utils";

import { BlacklistModal } from "./black-list-modal/black-list-modal.tsx";
import { cubeParkingLotService } from "@/api/service";
import { TimeRangePicker } from "@/views/pages/components/time-range-picker/time-range-picker";

/** 违停黑名单列表 */
export const BlackList = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName();
    const route = useRoute();
    const tableCode = route.path.replaceAll("/", "");

    const searchParams = reactive<{
      pageNumber: number;
      pageSize: number;
      total: number;
      keyword: string;
      period: string;
    }>({
      pageNumber: 1,
      pageSize: 10,
      total: 0,
      keyword: "",
      period: "",
    });

    const formSchema = [
      {
        component: TimeRangePicker,
        label: "时间范围",
        fieldName: "period",
        componentProps: {},
      },
      {
        component: "Input",
        label: "",
        fieldName: "keyword",
        componentProps: {
          placeholder: "车牌号、车主姓名",
        },
      },
    ];

    const [CubeForm, formApi] = useCubeForm({
      layout: "horizontal",
      schema: formSchema,
      showCollapseButton: true,
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
        dataIndex: "owner",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <PopOver content={text || "--"}>{text || "--"}</PopOver>;
        },
      },
      {
        title: "联系方式",
        dataIndex: "phone",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <PopOver content={text || "--"}>{text || "--"}</PopOver>;
        },
      },
      {
        dataIndex: "createTime",
        title: "加入黑名单时间",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => {
          const time = dayjs(text).format("YYYY-MM-DD HH:mm:ss");
          return <PopOver content={time || ""}>{time || "--"}</PopOver>;
        },
      },
      {
        title: "加入黑名单原因",
        dataIndex: "reason",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <PopOver content={text || "--"}>{text || "--"}</PopOver>;
        },
      },
      {
        title: "违停扣分",
        dataIndex: "violationScore",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => {
          const textVal = text ? `${text}分` : "--";
          return <PopOver content={textVal || "--"}>{textVal || "--"}</PopOver>;
        },
      },
      {
        dataIndex: "action",
        title: "操作",
        slots: {
          customRender: "action",
        },
        fixed: "right",
        width: 180,
        customRender: ({ record }: { record: IllegalParkingBlacklistVO }): JSX.Element => {
          return (
            <>
              <Button
                type="link"
                size="small"
                onClick={() => {
                  detailRow(record);
                }}
              >
                详情
              </Button>
              <PopConfirm
                title="确认删除该项？"
                onConfirm={() => {
                  deleteRow(record);
                }}
              >
                <Button type="link" size="small" danger>
                  删除
                </Button>
              </PopConfirm>
            </>
          );
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
          keyword: (searchParams.keyword as string) ?? "",
          period: searchParams.period ?? "",
        };
        return cubeParkingLotService.getParkingBlackList(params);
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
    const blacklistModalRef = ref<{ openModal: (record?: unknown) => void }>();
    const handleAdd = (): void => {
      blacklistModalRef.value?.openModal();
    };
    const detailRow = (record: IllegalParkingBlacklistVO): void => {
      history.pushState(
        { current: location.pathname + location.search },
        "",
        `/portal/parkingSystem/black-list-detail?plateNumber=${record?.plateNumber}`,
      );
    };
    const deleteRow = async (record: IllegalParkingBlacklistVO): Promise<void> => {
      try {
        await cubeParkingLotService.deleteParkingBlack(record?.id as unknown as string);
        message.success("操作成功");
        tableApi.query();
      } catch (error) {
        message.error((error as { errorMessage: string })?.errorMessage ?? "操作失败");
      }
    };
    const slots = {
      "layout-header": (): JSX.Element => {
        return (
          <Button type="primary" onClick={handleAdd}>
            新增
          </Button>
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
          <Page current={searchParams.pageNumber} pageSize={searchParams.pageSize} total={searchParams.total} onPageChange={handleChange} />
        );
      },
    };
    return (): JSX.Element => (
      <>
        <CubeLayout title={pageTitle} v-slots={slots} showTableXScroll />
        <BlacklistModal
          ref={blacklistModalRef}
          onEnter={() => {
            tableApi.query();
          }}
        />
      </>
    );
  },
});
