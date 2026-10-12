import { defineComponent, onMounted, reactive, ref } from "vue";
import { useRoute } from "vue-router";

import { useCubeQueryState } from "@ghcloud/cube-app-design";
import type { ProductCategoryTree } from "@ghcloud/cube-iot-center-service";
import { Button, Form, FormItem, Input, Page, PopOver, message, PopConfirm, type FormExpose, Modal } from "@ghcloud/cube-ui";
import { AliasTable } from "@ghcloud/generic-component";

import { cubeDeviceCenterService } from "@/api/service";
import { Layout } from "@/components/layout/layout";
import { useTableDelete } from "@/hook/use-table-delete";
import { useTableScroll } from "@/hook/use-table-scroll";
import { debounce } from "@/utils/tool";

/** 产品品类 */
export const ProductCategory = defineComponent({
  setup: () => {
    const route = useRoute();
    const tableCode = route.path.replaceAll("/", "");
    const { getCurrentPage } = useTableDelete();
    const useRemoved = (delList: unknown[]): void => {
      const next = getCurrentPage(queryState.state, delList, dataSource.value);
      queryState.setPage(next.pageNumber, next.pageSize);
      getTableData();
    };
    const queryState = useCubeQueryState({
      storage: "url",
      initialState: { itemLabel: "", pageNumber: 1, pageSize: 10, total: 0 },
      cacheFields: ["itemLabel", "pageNumber", "pageSize"],
      resolveValue: (field, raw) => {
        if (field === "pageNumber" || field === "pageSize") {
          return Number(raw);
        }
        return raw ?? "";
      },
    });

    const formState = reactive<{
      itemLabel: string;
    }>({
      itemLabel: "",
    });
    const modalVisible = ref(false);
    const modalTitle = ref("新增产品分类");
    const modalLoading = ref(false);
    const formInstance = ref<FormExpose>();
    const categoryForm = reactive<{
      id: string;
      parentId: string;
      itemLabel: string;
    }>({
      id: "",
      parentId: "",
      itemLabel: "",
    });
    const formRules = {
      itemLabel: [{ required: true, message: "请输入品类名称", trigger: "blur" }],
    };
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
        dataIndex: "updateTimeFormat",
        ellipsis: true,
        width: 280,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      // {
      //   title: 'level',
      //   dataIndex: 'level',
      //   ellipsis: true,
      //   customRender: ({ text }: { text: string; }) => {
      //     return <PopOver content={text || '--'}>{text || '--'}</PopOver>
      //   }
      // },
      {
        title: "操作",
        dataIndex: "action",
        width: 280,
        customRender: ({
          record,
        }: {
          record: { id: string; level: number; itemLabel: string; itemValue: string; updateTime: string; parentId: string };
        }): JSX.Element => (
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

    const loading = ref(false);
    const dataSource = ref<unknown[]>([]);
    type ProductCategoryTreeWithLv = { level: number } & ProductCategoryTree;
    const setLevel = (data: ProductCategoryTree[], startLv: number): ProductCategoryTreeWithLv[] => {
      for (const iterator of data) {
        (iterator as ProductCategoryTreeWithLv).level = startLv;
        if (iterator.children?.length) {
          iterator.children = setLevel(iterator.children, startLv + 1);
        }
      }
      return data as ProductCategoryTreeWithLv[];
    };

    const getTableData = async (): Promise<void> => {
      try {
        modalLoading.value = true;
        const params = {
          pageNumber: queryState.state.pageNumber,
          pageSize: queryState.state.pageSize,
          itemLabel: queryState.state.itemLabel || undefined,
          withChildren: true,
          withAssociatedItem: true,
        };
        const res = await cubeDeviceCenterService.getProductCategoryPage(params);
        if (res) {
          const { records, total } = res;
          dataSource.value = setLevel(records, 1);
          queryState.state.total = total;
          queryState.writeCache();
        }
      } catch {
      } finally {
        modalLoading.value = false;
      }
    };

    const pageChange = (pageNumber: number, pageSize: number): void => {
      queryState.setPage(pageNumber || 1, pageSize);
      getTableData();
    };

    const queryForm = (): void => {
      queryState.resetPage();
      queryState.update({ itemLabel: formState.itemLabel });
      queryState.writeCache();
      getTableData();
    };
    const reset = (): void => {
      formState.itemLabel = "";
      queryState.update({ itemLabel: "" });
      queryState.clearCache();
      getTableData();
    };

    const delRow = async (record: { id: string }): Promise<void> => {
      try {
        await cubeDeviceCenterService.delProductCategory(record.id);
        message.destroy();
        message.success("删除成功");
        useRemoved([record.id]);
      } catch {}
    };
    const add = (parentId?: string): void => {
      modalVisible.value = true;
      modalTitle.value = "新增产品品类";
      categoryForm.itemLabel = "";
      categoryForm.parentId = parentId ?? "";
    };
    const editRow = (record: { itemLabel: string; itemValue: string; id: string; parentId: string }): void => {
      modalVisible.value = true;
      modalTitle.value = "编辑产品品类";
      categoryForm.id = record.id;
      categoryForm.parentId = record.parentId ?? "";
      categoryForm.itemLabel = record.itemLabel;
      // categoryForm.itemValue = record.itemValue
    };

    const ok = debounce(async () => {
      formInstance.value?.clearValidate();
      await formInstance.value?.validate();
      try {
        loading.value = true;
        if (modalTitle.value === "新增产品品类") {
          const params = {
            itemLabel: categoryForm.itemLabel,
            parentId: categoryForm.parentId ?? "",
          };
          await cubeDeviceCenterService.addProductCategory(params);
        } else {
          const params = {
            itemLabel: categoryForm.itemLabel,
          };
          await cubeDeviceCenterService.updateProductCategory(categoryForm.id, params);
        }
        message.success("操作成功");
        modalVisible.value = false;
        getTableData();
      } catch {
      } finally {
        loading.value = false;
      }
    }, 500);
    const cancel = (): void => {
      modalVisible.value = false;
    };

    const { scrollY } = useTableScroll();
    onMounted(() => {
      formState.itemLabel = queryState.state.itemLabel;
      getTableData();
    });
    const layoutSlots = {
      "layout-header": (): JSX.Element => (
        <>
          <div>
            <Button type="primary" onClick={() => add()}>
              新增
            </Button>
          </div>
        </>
      ),
      "layout-content": (): JSX.Element => (
        <>
          <Form layout="inline" style={{ margin: "10px 0 " }}>
            <FormItem style={{ paddingRight: 0, marginRight: "10px", marginBottom: "10px" }}>
              <Input v-model:value={formState.itemLabel} placeholder="品类名称" showCount={false} />
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
            columns={columns}
            loading={modalLoading.value}
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
    };
    return (): JSX.Element => (
      <>
        <Layout title="产品品类" v-slots={layoutSlots} />
        <Modal
          visible={modalVisible.value}
          title={modalTitle.value}
          width="500px"
          destroyOnClose
          onOk={ok}
          onCancel={cancel}
          loading={modalLoading.value}
        >
          <Form ref={formInstance} model={categoryForm} labelCol={{ style: { width: "100px" } }} rules={formRules}>
            <FormItem label="品类名称" name="itemLabel">
              <Input placeholder="请输入品类名称" v-model:value={categoryForm.itemLabel} />
            </FormItem>
          </Form>
        </Modal>
      </>
    );
  },
});
