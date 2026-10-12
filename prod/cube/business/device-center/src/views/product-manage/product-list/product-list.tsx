import { defineComponent, onMounted, ref } from "vue";
import { useRoute } from "vue-router";

import { useCubeQueryState } from "@ghcloud/cube-app-design";
import { Button, Form, FormItem, Input, Page, PopOver, message, PopConfirm } from "@ghcloud/cube-ui";
import { useDownloadExcel, usePageName } from "@ghcloud/cube-utils";
import { AliasTable } from "@ghcloud/generic-component";

import { BindTagModal } from "./bind-tag-modal";
import { ImportModal } from "./components/import-modal";
import { cubeDeviceCenterService } from "@/api/service";
import { ProductCategoryTreeSelect } from "@/components/business/product-category-tree-select/product-category-tree-select";
import { Layout } from "@/components/layout/layout";
import { useTableDelete } from "@/hook/use-table-delete";
import { useTableScroll } from "@/hook/use-table-scroll";

/** 产品列表 */
export const ProductList = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName();
    const route = useRoute();
    const tableCode = route.path.replaceAll("/", "");
    const queryState = useCubeQueryState<{
      prodName: string;
      prodCategoryId: string[];
      pageNumber: number;
      pageSize: number;
      total: number;
    }>({
      storage: "url",
      initialState: {
        prodName: "",
        prodCategoryId: [],
        pageNumber: 1,
        pageSize: 10,
        total: 0,
      },
      cacheFields: ["prodName", "prodCategoryId", "pageNumber", "pageSize"],
      resolveValue: (field, raw) => {
        if (field === "pageNumber" || field === "pageSize") {
          return Number(raw);
        }
        if (field === "prodCategoryId") {
          return raw ? raw.split(",") : [];
        }
        return raw;
      },
    });
    const { getCurrentPage } = useTableDelete();
    const useRemoved = (delList: unknown[]): void => {
      const newPage = getCurrentPage(
        { pageNumber: queryState.state.pageNumber, pageSize: queryState.state.pageSize, total: queryState.state.total },
        delList,
        dataSource.value,
      );
      queryState.setPage(newPage.pageNumber, newPage.pageSize);
      queryState.update({ total: newPage.total ?? queryState.state.total });
      getTableData();
    };
    const curProd = ref<{ id: string; prodName: string }>();
    const curProdName = ref("");
    const selectedRowKeysData = ref<string[]>([]);
    const selectedRowsData = ref<{ id: string; deviceCode: string; prodName: string }[]>([]);
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
        title: "产品编码",
        dataIndex: "prodNumber",
        ellipsis: true,
        width: 200,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "产品品类",
        width: 200,
        dataIndex: "prodCategoryNameWithCascade",
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
        dataIndex: "nodeTypeName",
        ellipsis: true,
        width: 200,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "关联设备数",
        dataIndex: "deviceCount",
        ellipsis: true,
        width: 200,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "操作",
        dataIndex: "action",
        width: 300,
        customRender: ({ record }: { record: { id: string; prodName: string } }): JSX.Element => (
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
              size="small"
              onClick={() => {
                bindTagModalRef.value?.openModal(record.id);
              }}
            >
              关联标签
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

    const loading = ref(false);
    const dataSource = ref<unknown[]>([]);
    const bindTagModalRef = ref<{ openModal: (id: string) => void; batchTag: (ids: string[]) => void }>();
    const importModalRef = ref<{ openModal: () => void }>();
    const getTableData = async (): Promise<void> => {
      try {
        loading.value = true;
        const params = {
          pageNumber: queryState.state.pageNumber,
          pageSize: queryState.state.pageSize,
          prodName: queryState.state.prodName || undefined,
          prodCategoryId: queryState.state.prodCategoryId.length
            ? queryState.state.prodCategoryId[queryState.state.prodCategoryId.length - 1]
            : undefined,
        };
        const res = await cubeDeviceCenterService.getProductPage(params);
        if (res) {
          const { records, total } = res;
          dataSource.value = records;
          queryState.update({ total });
          queryState.writeCache();
        }
      } catch {
      } finally {
        loading.value = false;
      }
    };

    const pageChange = (pageNumber: number, pageSize: number): void => {
      selectedRowKeysData.value.length = 0;
      selectedRowsData.value.length = 0;
      queryState.setPage(pageNumber || 1, pageSize);
      getTableData();
    };

    const queryForm = (): void => {
      queryState.resetPage();
      getTableData();
    };
    const reset = (): void => {
      queryState.update({ prodName: "", prodCategoryId: [] });
      queryState.resetPage();
      queryState.clearCache();
      getTableData();
    };

    const delRow = async (record: { id: string }): Promise<void> => {
      try {
        await cubeDeviceCenterService.delProduct(record.id);
        message.success("删除成功");
        useRemoved([record.id]);
      } catch {}
    };
    const add = (): void => {
      history.pushState({ current: location.pathname + location.search }, "", "/portal/device-center/product-add");
    };
    const editRow = (record: { id: string }): void => {
      history.pushState({ current: location.pathname + location.search }, "", `/portal/device-center/product-update?id=${record.id}`);
    };
    const goDetail = (record: { id: string }): void => {
      history.pushState({ current: location.pathname + location.search }, "", `/portal/device-center/product-detail?id=${record.id}`);
    };
    const rowSelection = ref({
      preserveSelectedRowKeys: true,
      onChange: (selectedRowKeys: string[], selectedRows: { id: string; deviceCode: string; prodName: string }[]) => {
        selectedRowKeysData.value = selectedRowKeys;
        selectedRowsData.value = selectedRows;
      },
    });
    const batchBindSystemTag = async (): Promise<void> => {
      if (selectedRowKeysData.value.length === 0) {
        message.warning("请选择要关联标签的产品");
      } else {
        const ids = selectedRowsData.value.map((item) => item.id);
        bindTagModalRef.value?.batchTag(ids);
      }
    };

    const { scrollY } = useTableScroll();
    onMounted(() => {
      getTableData();
    });
    const { downLoading, handleDownload } = useDownloadExcel({
      exportServiceApi: async (): Promise<Blob> => {
        const res = await cubeDeviceCenterService.exportProduct({
          productId: curProd.value?.id || "",
        });
        return res;
      },
      fileName: curProdName,
    });
    const layoutSlots = {
      "layout-header": (): JSX.Element => (
        <>
          <div>
            <Button class="mr-16px" type="primary" disabled={selectedRowKeysData.value.length === 0} onClick={batchBindSystemTag}>
              批量关联标签
            </Button>
            <Button class="mr-16px" type="primary" onClick={importEvent}>
              导入产品
            </Button>
            <Button type="primary" onClick={add}>
              新增
            </Button>
          </div>
        </>
      ),
      "layout-content": (): JSX.Element => (
        <>
          <Form layout="inline" style={{ margin: "10px 0 " }}>
            <FormItem label="产品品类" style={{ paddingRight: 0, marginRight: "10px", marginBottom: "10px" }}>
              <ProductCategoryTreeSelect v-model:value={queryState.state.prodCategoryId} />
            </FormItem>
            <FormItem style={{ paddingRight: 0, marginRight: "10px", marginBottom: "10px" }}>
              <Input v-model:value={queryState.state.prodName} placeholder="产品名称" showCount={false} />
            </FormItem>
            <FormItem style={{ paddingRight: 0, marginRight: "10px", marginBottom: "10px" }}>
              <Button type="primary" onClick={queryForm}>
                查询
              </Button>
              <Button style={{ marginLeft: "10px" }} onClick={reset}>
                重置
              </Button>
            </FormItem>
          </Form>
          <AliasTable
            rowKey="id"
            rowSelection={rowSelection.value}
            columns={columns}
            loading={loading.value}
            dataSource={dataSource.value}
            tableCode={tableCode}
            pagination={false}
            scrollY={scrollY.value}
            scrollX={1000}
            applicationCode={__ENV__.applicationCode}
          />
        </>
      ),
      "footer-page": (): JSX.Element => (
        <Page
          v-model:current={queryState.state.pageNumber}
          v-model:pageSize={queryState.state.pageSize}
          v-model:total={queryState.state.total}
          onPageChange={pageChange}
        />
      ),
      "footer-btn": (): JSX.Element => <span>已选：{selectedRowKeysData.value.length} 条数据</span>,
    };

    const importEvent = (): void => {
      importModalRef.value?.openModal();
    };
    return (): JSX.Element => (
      <>
        <Layout title={pageTitle} v-slots={layoutSlots} />
        <BindTagModal ref={bindTagModalRef} />
        <ImportModal ref={importModalRef} onEnter={getTableData} />
      </>
    );
  },
});
