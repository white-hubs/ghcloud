import { defineComponent, onMounted, reactive, ref } from "vue";
import { useRoute } from "vue-router";

import { useCubeQueryState } from "@ghcloud/cube-app-design";
import { GLOBAL_SCENE_CODE } from "@ghcloud/cube-file-service";
import { Button, Form, FormItem, Input, Page, PopOver, message, PopConfirm, type FormExpose, Modal, Image } from "@ghcloud/cube-ui";
import { AliasTable, FileUpload } from "@ghcloud/generic-component";

import { cubeDeviceCenterService } from "@/api/service";
import { Layout } from "@/components/layout/layout";
import { useTableDelete } from "@/hook/use-table-delete";
import { useTableScroll } from "@/hook/use-table-scroll";
import { debounce } from "@/utils/tool";

interface ProductBrandQueryState {
  itemLabel: string;
  pageNumber: number;
  pageSize: number;
  total: number;
}

/** 产品品牌 */
export const ProductBrand = defineComponent({
  setup: () => {
    const route = useRoute();
    const tableCode = route.path.replaceAll("/", "");
    const { getCurrentPage } = useTableDelete();

    const queryState = useCubeQueryState<ProductBrandQueryState>({
      initialState: {
        itemLabel: "",
        pageNumber: 1,
        pageSize: 10,
        total: 0,
      },
      storage: "url",
      cacheFields: ["itemLabel", "pageNumber", "pageSize"],
      resolveValue: (field, raw) => {
        if (field === "pageNumber" || field === "pageSize") {
          return Number(raw);
        }
        return raw;
      },
    });

    const useRemoved = (delList: unknown[]): void => {
      // @ts-expect-error
      const newPage = getCurrentPage(
        { pageNumber: queryState.state.pageNumber, pageSize: queryState.state.pageSize, total: queryState.state.total },
        delList,
        dataSource.value,
      );
      queryState.setPage(newPage.pageNumber, newPage.pageSize);
      getTableData();
    };
    const modalVisible = ref(false);
    const modalTitle = ref("新增产品分类");
    const modalLoading = ref(false);
    const formInstance = ref<FormExpose>();
    const categoryForm = reactive<{
      id: string;
      itemLabel: string;
      itemKey: string;
      itemValue: string;
      picUrl: { id: string; name: string; path: string }[];
    }>({
      id: "",
      itemLabel: "",
      itemKey: "",
      itemValue: "",
      picUrl: [],
    });
    const formRules = {
      itemLabel: [{ required: true, message: "请输入品牌名称", trigger: "blur" }],
    };
    const isEditMode = (): boolean => modalTitle.value === "编辑产品品牌";
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
        dataIndex: "updateTimeFormat",
        ellipsis: true,
        width: 300,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "操作",
        dataIndex: "action",
        width: 300,
        fixed: "right",
        customRender: ({
          record,
        }: {
          record: {
            id: string;
            level: number;
            itemLabel: string;
            itemKey?: string;
            itemValue: string;
            updateTime: string;
            parentId: string;
          };
        }): JSX.Element => (
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

    const loading = ref(false);
    const dataSource = ref<unknown[]>([]);

    const getTableData = async (): Promise<void> => {
      try {
        modalLoading.value = true;
        const params = {
          pageNumber: queryState.state.pageNumber,
          pageSize: queryState.state.pageSize,
          itemLabel: queryState.state.itemLabel || undefined,
        };
        const res = await cubeDeviceCenterService.getProductBrandPage(params);
        if (res) {
          const { records, total } = res;
          dataSource.value = records;
          queryState.update({ total });
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
      queryState.writeCache();
      getTableData();
    };
    const reset = (): void => {
      queryState.update({
        itemLabel: "",
      });
      queryState.resetPage();
      queryState.clearCache();
      getTableData();
    };

    const delRow = async (record: { id: string }): Promise<void> => {
      const hide = message.loading("删除中...");
      try {
        await cubeDeviceCenterService.delProductBrand(record.id);
        setTimeout(hide, 0);
        message.success("删除成功");
        useRemoved([record.id]);
      } catch {
        setTimeout(hide, 0);
      }
    };
    const add = (): void => {
      modalVisible.value = true;
      modalTitle.value = "新增产品品牌";
      categoryForm.itemLabel = "";
      categoryForm.itemKey = "";
      categoryForm.itemValue = "";
      categoryForm.picUrl = [];
    };
    const editRow = (record: { itemLabel: string; itemKey?: string; itemValue: string; id: string; parentId: string }): void => {
      modalVisible.value = true;
      modalTitle.value = "编辑产品品牌";
      categoryForm.id = record.id;
      categoryForm.itemLabel = record.itemLabel;
      categoryForm.itemKey = record.itemKey ?? "";
      categoryForm.itemValue = record.itemValue;
      // categoryForm.picUrl = record.picUrl
    };

    const ok = debounce(async () => {
      formInstance.value?.clearValidate();
      await formInstance.value?.validate();
      try {
        loading.value = true;
        if (modalTitle.value === "新增产品品牌") {
          const params = {
            itemLabel: categoryForm.itemLabel,
            itemValue: categoryForm.picUrl.length > 0 ? categoryForm.picUrl[0].id : undefined,
          };
          await cubeDeviceCenterService.addProductBrand(params);
        } else {
          const params = {
            itemLabel: categoryForm.itemLabel,
            itemKey: categoryForm.itemKey,
            itemValue: categoryForm.picUrl.length > 0 ? categoryForm.picUrl[0].id : undefined,
          };
          await cubeDeviceCenterService.updateProductBrand(categoryForm.id, params);
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
      getTableData();
    });
    const layoutSlots = {
      "layout-header": (): JSX.Element => (
        <>
          <div>
            <Button type="primary" onClick={add}>
              新增
            </Button>
          </div>
        </>
      ),
      "layout-content": (): JSX.Element => (
        <>
          <Form layout="inline" style={{ margin: "10px 0 " }}>
            <FormItem style={{ paddingRight: 0, marginRight: "10px", marginBottom: "10px" }}>
              <Input v-model:value={queryState.state.itemLabel} placeholder="品牌名称" showCount={false} />
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
            scrollY={scrollY.value - 50}
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
        <Layout title="产品品牌" v-slots={layoutSlots} />
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
            <FormItem label="品牌名称" name="itemLabel">
              <Input placeholder="请输入品牌名称" v-model:value={categoryForm.itemLabel} />
            </FormItem>
            {isEditMode() ? (
              <FormItem label="品牌键" name="itemKey">
                <Input placeholder="请输入品牌键" v-model:value={categoryForm.itemKey} />
              </FormItem>
            ) : null}
            <FormItem label="品牌logo">
              <FileUpload
                sceneCode={GLOBAL_SCENE_CODE.deviceCenter}
                v-model:value={categoryForm.picUrl}
                customText="请上传图片|单个附件最大支持100MB"
                type="picture-card"
                maxNum={1}
              />
            </FormItem>
          </Form>
        </Modal>
      </>
    );
  },
});
