import { defineComponent, reactive, ref } from "vue";
import { useRoute } from "vue-router";

import { CubeLayout, useCubeForm, useCubeTable } from "@ghcloud/cube-app-design";
import { Button, PopOver, Page, PopConfirm, message } from "@ghcloud/cube-ui";
import { usePageName } from "@ghcloud/cube-utils";

import { CarTypeModal } from "./car-type-modal/car-type-modal";
import { cubeParkingLotService } from "@/api/service";

/** 车辆类型 */
export const CarType = defineComponent({
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

    const searchFormSchema = [
      {
        component: "Input",
        label: "名称查询",
        fieldName: "keyword",
        componentProps: {
          placeholder: "请输入类型名称",
        },
      },
    ];
    const [CubeForm, formApi] = useCubeForm({
      layout: "horizontal",
      syncStateRef: searchParams,
      onHydratedQuery: () => {
        tableApi.query();
      },
      handleSubmit: (data) => {
        searchParams.keyword = data.keyword ? (data.keyword as string) : "";
        searchParams.pageNumber = 1;
        tableApi.query();
      },
      handleReset: () => {
        searchParams.keyword = "";
        searchParams.pageNumber = 1;
        tableApi.query();
      },
      schema: searchFormSchema,
      showCollapseButton: true,
    });

    const columns = [
      {
        title: "车辆类型",
        dataIndex: "name",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <PopOver content={text || "--"}>{text || "--"}</PopOver>;
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
        customRender: ({ record }: { record: any }): JSX.Element => {
          return (
            <>
              <Button
                type="link"
                size="small"
                onClick={() => {
                  editRow(record);
                }}
              >
                编辑
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
          keyword: searchParams.keyword as string,
        };
        return cubeParkingLotService.getVehicleTypePageList(params);
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
    const carTypeModalRef = ref<{ openModal: (record?: unknown) => void }>();
    const handleAdd = (): void => {
      carTypeModalRef.value?.openModal();
    };
    const editRow = (record: any): void => {
      carTypeModalRef.value?.openModal(record);
    };
    const deleteRow = async (record: any): Promise<void> => {
      try {
        await cubeParkingLotService.deleteVehicleType(record?.id as unknown as string);
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
        <CarTypeModal ref={carTypeModalRef} onEnter={() => tableApi.query()} />
      </>
    );
  },
});
