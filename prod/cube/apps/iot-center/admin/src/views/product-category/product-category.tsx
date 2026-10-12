import { ProductCategoryModal } from "./product-category-modal";
import { cubeDeviceIotCenterService } from "@/api/service";
import { CubeLayout, useCubeForm, useCubeTable } from "@ghcloud/cube-app-design";
import type { ProductCategoryModel } from "@ghcloud/cube-iot-center-service";
import { Button, PopOver, Page, PopConfirm, message } from "@ghcloud/cube-ui";
import { useTableDelete } from "@ghcloud/cube-utils";
import dayjs from "dayjs";
import { defineComponent, onMounted, reactive, ref } from "vue";
import { useRoute } from "vue-router";

/** 产品品类 */
export const ProductCategory = defineComponent({
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
      openModal: (record?: ProductCategoryModel, parentId?: string) => void;
    }>();

    const setLevel = (data: ProductCategoryModel[], startLv: number): ProductCategoryModel[] => {
      for (const iterator of data) {
        iterator.level = startLv;
        if (iterator.children?.length) {
          iterator.children = setLevel(iterator.children, startLv + 1);
        }
      }
      return data;
    };

    /**
     * 表格配置
     */
    const columns = [
      {
        title: "品类名称",
        dataIndex: "itemLabel",
        ellipsis: true,
        width: 280,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "更新时间",
        dataIndex: "updateTime",
        ellipsis: true,
        width: 280,
        customRender: ({ text }: { text: string }): JSX.Element => {
          const time = text ? dayjs(text).format("YYYY-MM-DD HH:mm:ss") : "--";
          return <PopOver content={time || "--"}>{time || "--"}</PopOver>;
        },
      },
      {
        title: "操作",
        dataIndex: "action",
        width: 280,
        customRender: ({ record }: { record: ProductCategoryModel }): JSX.Element => (
          <>
            <Button
              type="link"
              size="small"
              onClick={() => {
                add(record.id);
              }}
              disabled={record.level >= 3}
            >
              新增下级
            </Button>
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

    const dataSource = ref<ProductCategoryModel[]>([]);

    const [CubeTable, tableApi] = useCubeTable({
      columns,
      tableCode,
      rowKey: "id",
      fetchApi: async () => {
        const params = {
          pageNumber: searchParams.pageNumber,
          pageSize: searchParams.pageSize,
          itemLabel: searchParams.itemLabel || undefined,
          withChildren: true,
          withAssociatedItem: true,
        };
        const res = await cubeDeviceIotCenterService.getProductCategoryPage(params);
        return {
          ...res,
          records: setLevel(res.records as ProductCategoryModel[], 1) as unknown as ProductCategoryModel[],
        };
      },
      fetchLoaded: (data) => {
        searchParams.total = data.total;
        dataSource.value = data.records as ProductCategoryModel[];
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
          placeholder: "品类名称",
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
      try {
        await cubeDeviceIotCenterService.deleteProductCategory(record.id);
        message.destroy();
        message.success("删除成功");
        useRemoved([record.id]);
      } catch (_ignore) {
        // 静默失败
      }
    };

    const add = (parentId?: string): void => {
      modalRef.value?.openModal(undefined, parentId);
    };

    const editRow = (record: ProductCategoryModel): void => {
      modalRef.value?.openModal(record);
    };

    onMounted(() => {
      tableApi.query();
    });

    const slots = {
      "layout-header": (): JSX.Element => (
        <Button type="primary" onClick={() => add()}>
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
      <CubeLayout title="产品品类" v-slots={slots} showTableXScroll>
        <ProductCategoryModal
          ref={modalRef}
          title="产品品类"
          onEnter={() => {
            tableApi.query();
          }}
        />
      </CubeLayout>
    );
  },
});
