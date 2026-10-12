import { ImportModal } from "./import-modal";
import { ProductAddModal } from "./product-add-modal";
import { cubeDeviceIotCenterService } from "@/api/service";
import { getNodeTypeLabel } from "@/constants/node-type";
import { CubeLayout, ProductBrandSelect, ProductCategoryTreeSelect, useCubeForm, useCubeTable } from "@ghcloud/cube-app-design";
import type { ProductDetailModel } from "@ghcloud/cube-iot-center-service";
import { Button, PopOver, Page, PopConfirm, message, Space } from "@ghcloud/cube-ui";
import { queryParameter, useDownloadExcel, usePageName, useTableDelete } from "@ghcloud/cube-utils";
import { defineComponent, onMounted, reactive, ref } from "vue";
import { useRoute } from "vue-router";

/** 产品列表 */
export const ProductList = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName();
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
      prodName: "",
      prodCategoryId: [] as string[],
      prodBrandId: "",
      total: 0,
    });

    const curProd = ref<{ id: string; prodName: string }>();
    const curProdName = ref("");
    const selectedRowKeysData = ref<string[]>([]);
    const selectedRowsData = ref<{ id: string; deviceCode: string; prodName: string }[]>([]);
    const importModalRef = ref<{ openModal: () => void }>();
    const productAddModalRef = ref<{ openModal: () => void }>();

    /**
     * 表格配置
     */
    const columns = [
      {
        title: "产品名称",
        dataIndex: "prodName",
        ellipsis: true,
        fixed: "left",
        width: 200,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "产品品类",
        width: 200,
        dataIndex: "prodCategoryName",
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "品牌名称",
        dataIndex: "prodBrandName",
        ellipsis: true,
        width: 200,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "节点类型",
        dataIndex: "nodeType",
        ellipsis: true,
        width: 200,
        customRender: ({ text }: { text: number | string }): JSX.Element => {
          const label = getNodeTypeLabel(text);
          return <PopOver content={label}>{label}</PopOver>;
        },
      },
      {
        title: "操作",
        dataIndex: "action",
        width: 300,
        fixed: "right",
        customRender: ({ record }: { record: ProductDetailModel }): JSX.Element => (
          <>
            <Button
              type="link"
              size="small"
              onClick={() => {
                goDetail(record);
              }}
            >
              详情
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
            <Button
              type="link"
              loading={record.id === curProd.value?.id && downLoading.value}
              size="small"
              onClick={() => {
                curProd.value = record;
                curProdName.value = record.prodName;
                handleDownload();
              }}
            >
              导出
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

    const dataSource = ref<ProductDetailModel[]>([]);

    const [CubeTable, tableApi] = useCubeTable({
      columns,
      tableCode,
      rowKey: "id",
      rowSelection: "checkbox",
      rowSelectionChange: (selectedRowKeys: unknown[], selectedRows: unknown[]) => {
        selectedRowKeysData.value = selectedRowKeys as string[];
        selectedRowsData.value = selectedRows as unknown as { id: string; deviceCode: string; prodName: string }[];
      },
      fetchApi: async () => {
        const params = {
          pageNumber: searchParams.pageNumber,
          pageSize: searchParams.pageSize,
          prodName: searchParams.prodName || undefined,
          prodCategoryId: searchParams.prodCategoryId.length
            ? searchParams.prodCategoryId[searchParams.prodCategoryId.length - 1]
            : undefined,
          prodBrandId: searchParams.prodBrandId || undefined,
        };
        return await cubeDeviceIotCenterService.getProductPage(params);
      },
      fetchLoaded: (data) => {
        searchParams.total = data.total;
        dataSource.value = data.records as ProductDetailModel[];
        setUrl();
      },
    });

    const handlePageChange = (pageNumber: number, pageSize: number): void => {
      selectedRowKeysData.value.length = 0;
      selectedRowsData.value.length = 0;
      searchParams.pageNumber = pageNumber || 1;
      searchParams.pageSize = pageSize;
      tableApi.query();
    };

    /**
     * 查询表单配置
     */
    const formSchema = [
      {
        component: ProductCategoryTreeSelect,
        label: "产品品类",
        fieldName: "prodCategoryId",
        defaultValue: [],
        componentProps: {
          width: "240px",
        },
      },
      {
        component: ProductBrandSelect,
        label: "产品品牌",
        fieldName: "prodBrandId",
        defaultValue: undefined,
        componentProps: {
          width: "240px",
        },
      },
      {
        component: "Input",
        label: "",
        fieldName: "prodName",
        componentProps: {
          placeholder: "产品名称",
        },
      },
    ];

    const [CubeForm] = useCubeForm({
      layout: "horizontal",
      handleSubmit: (data) => {
        searchParams.prodName = (data.prodName as string) || "";
        searchParams.prodCategoryId = (data.prodCategoryId as string[]) || [];
        searchParams.prodBrandId = (data.prodBrandId as string) || "";
        searchParams.pageNumber = 1;
        tableApi.query();
      },
      handleReset: () => {
        searchParams.prodName = "";
        searchParams.prodCategoryId = [];
        searchParams.prodBrandId = "";
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
        await cubeDeviceIotCenterService.deleteProduct(record.id);
        message.success("删除成功");
        useRemoved([record.id]);
      } catch (_ignore) {
        // 静默失败
      }
    };

    const add = (): void => {
      productAddModalRef.value?.openModal();
    };

    const editRow = (record: { id: string }): void => {
      history.pushState({ current: location.pathname + location.search }, "", `/portal/iot-center-admin/product-update?id=${record.id}`);
    };

    const goDetail = (record: { id: string }): void => {
      history.pushState({ current: location.pathname + location.search }, "", `/portal/iot-center-admin/product-detail?id=${record.id}`);
    };

    const setUrl = (): void => {
      queryParameter.setAddressQuery({
        ...searchParams,
        pageNumber: searchParams.pageNumber,
        pageSize: searchParams.pageSize,
        total: searchParams.total,
      });
    };

    const { downLoading, handleDownload } = useDownloadExcel({
      exportServiceApi: async (): Promise<Blob> => {
        if (!curProd.value?.id) {
          return Promise.reject(new Error("产品ID为空，无法导出"));
        }
        const res = await cubeDeviceIotCenterService.exportProduct(curProd.value?.id);
        return res;
      },
      fileName: curProdName,
    });

    const importEvent = (): void => {
      importModalRef.value?.openModal();
    };

    onMounted(() => {
      const query = queryParameter.getQuery();
      if (query) {
        searchParams.prodName = (query.prodName as string) || "";
        searchParams.prodCategoryId = query.prodCategoryId ? (query.prodCategoryId as string).split(",") : [];
        searchParams.prodBrandId = query.prodBrandId ? (query.prodBrandId as string) : "";
        searchParams.pageNumber = (query.pageNumber as number) || 1;
        searchParams.pageSize = (query.pageSize as number) || 10;
        searchParams.total = (query.total as number) || 0;
      }
      tableApi.query();
    });

    const slots = {
      "layout-header": (): JSX.Element => (
        <Space>
          <Button type="primary" onClick={importEvent}>
            导入产品
          </Button>
          <Button type="primary" onClick={add}>
            新增
          </Button>
        </Space>
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
      "footer-btn": (): JSX.Element => <span>已选：{selectedRowKeysData.value.length} 条数据</span>,
    };

    return (): JSX.Element => (
      <CubeLayout title={pageTitle || "产品列表"} v-slots={slots} showTableXScroll>
        <ImportModal
          ref={importModalRef}
          onEnter={() => {
            tableApi.query();
          }}
        />
        <ProductAddModal
          ref={productAddModalRef}
          onEnter={() => {
            tableApi.query();
          }}
        />
      </CubeLayout>
    );
  },
});
