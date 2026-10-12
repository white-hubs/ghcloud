import { defineComponent, reactive } from "vue";
import { useRoute } from "vue-router";

import { CubeLayout, useCubeForm, useCubeTable } from "@ghcloud/cube-app-design";
import type { VehicleGuideBoardConfigVO } from "@ghcloud/cube-parking-lot-service/src/type";
import { Button, PopOver, Page, PopConfirm, message } from "@ghcloud/cube-ui";
import { usePageName } from "@ghcloud/cube-utils";

import { cubeParkingLotService } from "@/api/service";

export const GuideSignList = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName();
    const route = useRoute();
    const tableCode = route.path.replaceAll("/", "");
    const searchParams = reactive({
      pageNumber: 1,
      pageSize: 10,
      total: 0,
      keyword: "",
    });

    const columns = [
      {
        dataIndex: "code",
        title: "编号",
        align: "center",
        ellipsis: true,
        customRender: ({ record }: { record: VehicleGuideBoardConfigVO }) => {
          const textVal = record?.code || "";
          return <PopOver content={textVal}>{textVal || "--"}</PopOver>;
        },
      },
      {
        dataIndex: "name",
        title: "引导牌名称",
        align: "center",
        ellipsis: true,
        customRender: ({ record }: { record: VehicleGuideBoardConfigVO }) => {
          const textVal = record?.name || "";
          return <PopOver content={textVal}>{textVal || "--"}</PopOver>;
        },
      },
      {
        dataIndex: "installationLocation",
        title: "安装位置",
        align: "center",
        ellipsis: true,
        customRender: ({ record }: { record: VehicleGuideBoardConfigVO }) => {
          let textVal = record?.installationLocation || "";
          try {
            if (textVal) {
              const parsed = JSON.parse(textVal ?? JSON.stringify({}));
              if (parsed && typeof parsed === "object") {
                textVal = parsed?.address || textVal;
              }
            }
          } catch {}
          return <PopOver content={textVal}>{textVal || "--"}</PopOver>;
        },
      },
      {
        dataIndex: "parkingInfo",
        title: "关联车场",
        align: "center",
        ellipsis: true,
        customRender: ({ record }: { record: VehicleGuideBoardConfigVO }) => {
          const textVal = record?.parkingInfo?.name || "";
          return <PopOver content={textVal}>{textVal || "--"}</PopOver>;
        },
      },
      {
        dataIndex: "contentConfigs",
        title: "引导内容",
        align: "center",
        ellipsis: true,
        customRender: ({ record }: { record: VehicleGuideBoardConfigVO }) => {
          const textVal = record?.contentConfigs?.map((item) => item?.contentName)?.join("、") ?? "";
          return <PopOver content={textVal}>{textVal || "--"}</PopOver>;
        },
      },
      {
        dataIndex: "action",
        title: "操作",
        align: "center",
        fixed: "right",
        width: 150,
        customRender: ({ record }: { record: VehicleGuideBoardConfigVO }) => (
          <>
            <Button
              type="link"
              size="small"
              onClick={() => {
                history.pushState({}, "", `/portal/parkingSystem/guide-sign-config?type=edit&id=${record.id}`);
              }}
            >
              编辑
            </Button>
            <Button
              type="link"
              size="small"
              onClick={() => {
                history.pushState({}, "", `/portal/parkingSystem/guide-sign-config?type=info&id=${record.id}`);
              }}
            >
              详情
            </Button>
            <PopConfirm
              title="确认删除该项？"
              onConfirm={() => {
                handleDelete(record?.id as unknown as string);
              }}
            >
              <Button type="link" size="small" danger>
                删除
              </Button>
            </PopConfirm>
          </>
        ),
      },
    ];
    const handleDelete = async (id: string): Promise<void> => {
      try {
        await cubeParkingLotService.deleteParkingBlack(id ?? "");
        message.success("操作成功");
        tableApi.query();
      } catch (error) {
        message.error((error as { errorMessage: string })?.errorMessage ?? "操作失败");
      }
    };
    const [CubeTable, tableApi] = useCubeTable({
      columns,
      tableCode,
      rowKey: "id",
      fetchApi: async () => {
        const params = {
          pageNumber: searchParams.pageNumber,
          pageSize: searchParams.pageSize,
          name: (searchParams.keyword as string) ?? "",
        };
        return cubeParkingLotService.getVehicleGuidePageList(params);
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
        component: "Input",
        label: "",
        fieldName: "keyword",
        componentProps: {
          placeholder: "引导牌名称",
        },
      },
    ];

    const [CubeForm] = useCubeForm({
      layout: "horizontal",
      schema: formSchema,
      syncStateRef: searchParams,
      onHydratedQuery: () => {
        tableApi.query();
      },
      handleSubmit: (data: any) => {
        Object.assign(searchParams, data);
        searchParams.pageNumber = 1;
        tableApi.query();
      },
      handleReset: () => {
        searchParams.keyword = "";
        searchParams.pageNumber = 1;
        tableApi.query();
      },
      showCollapseButton: false,
    });

    const handleAdd = (): void => {
      history.pushState({}, "", `/portal/parkingSystem/guide-sign-config?type=create`);
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
