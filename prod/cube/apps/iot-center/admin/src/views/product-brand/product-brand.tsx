import { ProductBrandModal } from "./product-brand-modal";
import { cubeDeviceIotCenterService } from "@/api/service";
import { CubeLayout, useCubeForm, useCubeTable } from "@ghcloud/cube-app-design";
import type { ProductBrandModel } from "@ghcloud/cube-iot-center-service";
import { Button, PopOver, Page, PopConfirm, message, Image } from "@ghcloud/cube-ui";
import { useTableDelete } from "@ghcloud/cube-utils";
import dayjs from "dayjs";
import { defineComponent, onMounted, reactive, ref } from "vue";
import { useRoute } from "vue-router";

/** 产品品牌 */
export const ProductBrand = defineComponent({
  setup: () => {
    const route = useRoute();
    const tableCode = route.path.replaceAll("/", "");
    const { getCurrentPage } = useTableDelete();

    const useRemoved = (delList: unknown[]): void => {
      const result = getCurrentPage(searchParams, delList, dataSource.value);
      searchParams.pageNumber = result.pageNumber;
      searchParams.pageSize = result.pageSize;
      tableApi.query();
    };

    const searchParams = reactive({
      pageNumber: 1,
      pageSize: 10,
      itemLabel: "",
      total: 0,
    });

    const modalRef = ref<{
      openModal: (record?: ProductBrandModel) => void;
    }>();

    /**
     * 表格配置
     */
    const columns = [
      {
        title: "品牌名称",
        dataIndex: "itemLabel",
        ellipsis: true,
        width: 300,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "品牌logo",
        dataIndex: "fileVOs",
        ellipsis: true,
        width: 300,
        customRender: ({ text }: { text: { path: string }[] }): JSX.Element => {
          const res = text.length > 0 ? text[0].path : "";
          return <Image src={res} width={60} height={60} />;
        },
      },
      {
        title: "创建时间",
        dataIndex: "createTime",
        ellipsis: true,
        width: 300,
        customRender: ({ text }: { text: string }): JSX.Element => {
          const time = text ? dayjs(text).format("YYYY-MM-DD HH:mm:ss") : "--";
          return <PopOver content={time || "--"}>{time || "--"}</PopOver>;
        },
      },
      {
        title: "操作",
        dataIndex: "action",
        width: 300,
        fixed: "right",
        customRender: ({ record }: { record: ProductBrandModel }): JSX.Element => (
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
                delRow(record);
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

    const dataSource = ref<ProductBrandModel[]>([]);

    const [CubeTable, tableApi] = useCubeTable({
      columns,
      tableCode,
      rowKey: "id",
      fetchApi: async () => {
        const params = {
          pageNumber: searchParams.pageNumber,
          pageSize: searchParams.pageSize,
          itemLabel: searchParams.itemLabel || undefined,
        };
        return cubeDeviceIotCenterService.getProductBrandPage(params);
      },
      fetchLoaded: (data) => {
        searchParams.total = data.total;
        dataSource.value = data.records as ProductBrandModel[];
      },
    });

    const handlePageChange = (pageNumber: number, pageSize: number): void => {
      searchParams.pageNumber = pageNumber || 1;
      searchParams.pageSize = pageSize;
      tableApi.query();
    };

    /**
     * 查询表单配置
     */
    const formSchema = [
      {
        component: "Input",
        label: "",
        fieldName: "itemLabel",
        componentProps: {
          placeholder: "品牌名称",
        },
      },
    ];

    const [CubeForm] = useCubeForm({
      layout: "horizontal",
      handleSubmit: (data) => {
        searchParams.itemLabel = (data.itemLabel as string) || "";
        searchParams.pageNumber = 1;
        tableApi.query();
      },
      handleReset: () => {
        searchParams.itemLabel = "";
        searchParams.pageNumber = 1;
        tableApi.query();
      },
      schema: formSchema,
      syncStateRef: searchParams,
      onHydratedQuery: () => {
        tableApi.query();
      },
    });

    const delRow = async (record: { id: string }): Promise<void> => {
      const hide = message.loading("删除中...");
      try {
        await cubeDeviceIotCenterService.deleteProductBrand(record.id);
        setTimeout(hide, 0);
        message.success("删除成功");
        useRemoved([record.id]);
      } catch (_ignore) {
        setTimeout(hide, 0);
      }
    };

    const add = (): void => {
      modalRef.value?.openModal();
    };

    const editRow = (record: ProductBrandModel): void => {
      modalRef.value?.openModal(record);
    };

    onMounted(() => {
      tableApi.query();
    });

    const slots = {
      "layout-header": (): JSX.Element => (
        <Button type="primary" onClick={add}>
          新增
        </Button>
      ),
      "layout-content": (): JSX.Element => (
        <div>
          <CubeForm />
          <CubeTable />
        </div>
      ),
      "footer-page": (): JSX.Element => (
        <Page
          current={searchParams.pageNumber}
          pageSize={searchParams.pageSize}
          total={searchParams.total}
          onPageChange={handlePageChange}
        />
      ),
    };

    return (): JSX.Element => (
      <CubeLayout title="产品品牌" v-slots={slots} showTableXScroll>
        <ProductBrandModal
          ref={modalRef}
          title="产品品牌"
          onEnter={() => {
            tableApi.query();
          }}
        />
      </CubeLayout>
    );
  },
});
