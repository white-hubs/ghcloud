import { defineComponent, onMounted, reactive, ref, watch } from "vue";

import type { ProductIotCategoryTree, ProductModel, DeviceKnowledgeVo } from "@ghcloud/cube-iot-center-service";
import {
  Button,
  Form,
  FormItem,
  Input,
  message,
  PopOver,
  TreeSelect,
  Page,
  Modal,
  Select,
  Image,
  PopConfirm,
  AntModal,
  type FormInstance,
} from "@ghcloud/cube-ui";
import { usePageName, useListQueryCache } from "@ghcloud/cube-utils";
import { AliasTable, UploadFile } from "@ghcloud/generic-component";

import { cubeDeviceCenterService, cubeDeviceSuperviseService } from "@/api/service";
import { Layout } from "@/components/layout/layout";
import { getBase64 } from "@/utils";

import styles from "./index.module.less";

let selectedProduct: { id: string; name: string }[] = [];
let selectProductGre = {
  categoryCode: "",
  categoryCodeConcat: "",
  categoryName: "",
};
interface StateVo {
  categoryList: ProductIotCategoryTree[];
  dataSource: DeviceKnowledgeVo[];
  loading: boolean;
  searchState: {
    deviceProdCategoryCodeConcat: string;
    keyword: string;
  };
  page: {
    pageSize: number;
    pageNumber: number;
    total: number;
  };
  imagePreview: boolean;
  imgSrc: string;
  modalState: {
    visible: boolean;
    productOptions: ProductModel[];
    formState: {
      name: string;
      productGenreConfig: null | string;
      productIds: string[];
      fileId: { id: string }[];
    };
  };
} // 设备实例列表 - 查询

export const DeviceDocument = defineComponent({
  // 组件的setup函数
  setup: () => {
    // 使用usePageName函数获取页面名称
    const { pageTitle } = usePageName();
    const formRef = ref<FormInstance>();
    const queryCache = useListQueryCache({
      defaults: {
        deviceProdCategoryCodeConcat: "",
        keyword: "",
        pageNumber: 1,
        pageSize: 10,
      },
      getState: () => ({
        deviceProdCategoryCodeConcat: state.searchState.deviceProdCategoryCodeConcat,
        keyword: state.searchState.keyword,
        pageNumber: state.page.pageNumber,
        pageSize: state.page.pageSize,
      }),
      setState: (next) => {
        state.searchState.deviceProdCategoryCodeConcat = (next.deviceProdCategoryCodeConcat as string) ?? "";
        state.searchState.keyword = (next.keyword as string) ?? "";
        state.page.pageNumber = Number(next.pageNumber ?? 1);
        state.page.pageSize = Number(next.pageSize ?? 10);
      },
    });
    const state = reactive<StateVo>({
      imagePreview: false,
      categoryList: [],
      imgSrc: "",
      dataSource: [],
      searchState: {
        deviceProdCategoryCodeConcat: "",
        keyword: "",
      },
      loading: false,
      page: {
        pageSize: 10,
        pageNumber: 1,
        total: 0,
      },
      modalState: {
        visible: false,
        productOptions: [],
        formState: {
          productGenreConfig: null,
          productIds: [],
          name: "",
          fileId: [],
        },
      },
    });
    const rules = {
      name: [{ required: true, message: "请输入文档名称" }],
      productIds: [{ required: true, message: "请选择关联设备" }],
      productGenreConfig: [{ required: true, message: "请选择产品品类" }],
      fileId: [{ required: true, message: "请上传文档" }],
    };
    // 获取品类关联产品
    const getContactProduct = async (): Promise<void> => {
      try {
        const result = await cubeDeviceCenterService.getProductModel(state.modalState.formState.productGenreConfig ?? "");
        state.modalState.productOptions = result;
      } catch (error) {
        const { errorMessage } = (error as { toJSON: () => { errorMessage: string } }).toJSON();
        message.error(errorMessage || "请求失败");
      }
    };
    const getDeviceDocumentList = async (): Promise<void> => {
      try {
        state.loading = true;
        const result = await cubeDeviceSuperviseService.getDeviceKnowledgeFile({
          deviceProdCategoryCodeConcat: state.searchState.deviceProdCategoryCodeConcat,
          keyword: state.searchState.keyword,
          pageNumber: state.page.pageNumber,
          pageSize: state.page.pageSize,
        });
        state.dataSource = result.records;
        state.page.total = result.total;
      } catch (error) {
        const { errorMessage } = (error as { toJSON: () => { errorMessage: string } }).toJSON();
        message.error(errorMessage || "请求失败");
      } finally {
        state.loading = false;
      }
    };
    // 获取产品品类
    const getProductCategory = async (): Promise<void> => {
      try {
        const result = await cubeDeviceCenterService.getIotProductCategoryTree();
        state.categoryList = result;
      } catch (error) {
        const { errorMessage } = (error as { toJSON: () => { errorMessage: string } }).toJSON();
        message.error(errorMessage || "请求失败");
      }
    };

    const pageChange = (page: number, pageSize: number): void => {
      state.page.pageNumber = page;
      state.page.pageSize = pageSize;
      getDeviceDocumentList().then(() => {
        queryCache.sync();
      });
    };
    onMounted(async () => {
      getProductCategory();
      await queryCache.hydrateAndQuery(getDeviceDocumentList);
    });
    const selectedRowKeysData = ref<string[]>([]);
    const rowSelection = ref({
      preserveSelectedRowKeys: true,
      onChange: (selectedRowKeys: string[]) => {
        selectedRowKeysData.value = selectedRowKeys;
      },
    });

    const handleOk = async (): Promise<void> => {
      await formRef.value?.validate();
      const params = {
        name: state.modalState.formState.name,
        products: selectedProduct.map((item) => {
          return { deviceProdId: item.id, deviceProdName: item.name };
        }),
        fileId: state.modalState.formState.fileId[0].id,
        deviceProdCategoryCode: selectProductGre.categoryCode ?? "",
        deviceProdCategoryCodeConcat: selectProductGre.categoryCodeConcat ?? "",
        deviceProdCategoryName: selectProductGre.categoryName ?? "",
      };
      await cubeDeviceSuperviseService.createDeviceKnowledgeFile(params);
      message.success("上传成功");
      formRef.value?.resetFields();
      state.modalState.visible = false;
      getDeviceDocumentList();
    };
    const handleSearch = async (): Promise<void> => {
      state.page.pageNumber = 1;
      await getDeviceDocumentList();
      await queryCache.sync();
    };
    const handleReset = async (): Promise<void> => {
      await queryCache.reset();
      await getDeviceDocumentList();
    };
    const handlePreview = (record: DeviceKnowledgeVo): void => {
      const typeList = ["jpg", "jpeg", "svg", "png", "gif", "tif", "pdf", "PDF"];
      if (!typeList.includes(record.format)) {
        message.error("该文件格式不支持预览");
        return;
      }
      if (record.format.toLowerCase() === "pdf") {
        window.open(record?.fileVO?.path);
        return;
      }
      state.imgSrc = record?.fileVO?.path;
      state.imagePreview = true;
    };

    const handleDownload = async (record: DeviceKnowledgeVo): Promise<void> => {
      const typeList = ["jpg", "jpeg", "svg", "png", "gif", "tif", "pdf"];
      // 适用于非图片和非pdf格式
      if (!typeList.includes(record?.fileVO?.type)) {
        const a = document.createElement("a");
        a.download = record.name;
        a.style.display = "none";
        a.href = record?.fileVO?.path;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        getBase64(record?.fileVO?.path, record.name);
      }
    };
    watch(
      () => state.modalState.formState.fileId,
      () => {
        if (state.modalState.formState.fileId.length) {
          formRef.value?.validateFields(["fileId"]);
        }
      },
    );
    const handleDelete = async (record: DeviceKnowledgeVo): Promise<void> => {
      try {
        await cubeDeviceSuperviseService.deleteDeviceKnowledgeFile(record.id);
        message.success("删除成功");
        getDeviceDocumentList();
      } catch (error) {
        const { errorMessage } = (error as { toJSON: () => { errorMessage: string } }).toJSON();
        message.error(errorMessage || "请求失败");
      }
    };
    const handleBatchDelete = (): void => {
      if (!selectedRowKeysData.value.length) {
        message.error("请选择要删除的文件");
        return;
      }
      AntModal.confirm({
        title: "删除",
        content: "确定要删除选中的文件吗？",
        onOk: async () => {
          try {
            await cubeDeviceSuperviseService.deleteDeviceKnowledgeFiles(selectedRowKeysData.value);
            message.success("删除成功");
            getDeviceDocumentList();
          } catch (error) {
            const { errorMessage } = (error as { toJSON: () => { errorMessage: string } }).toJSON();
            message.error(errorMessage || "请求失败");
          } finally {
            selectedRowKeysData.value = [];
          }
        },
      });
    };
    const columns = [
      {
        title: "文档名称",
        dataIndex: "name",
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <PopOver content={text || ""}>{text || "--"}</PopOver>;
        },
      },
      {
        title: "产品品类",
        dataIndex: "deviceProdCategoryName",
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <PopOver content={text || ""}>{text || "--"}</PopOver>;
        },
      },
      {
        title: "文档格式",
        dataIndex: "format",
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <PopOver content={text || ""}>{text || "--"}</PopOver>;
        },
      },
      {
        title: "文档大小",
        dataIndex: "size",
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <PopOver content={text || ""}>{text || "--"}</PopOver>;
        },
      },
      {
        title: "上传人",
        dataIndex: "submitter",
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <PopOver content={text || ""}>{text || "--"}</PopOver>;
        },
      },
      {
        title: "更新时间",
        dataIndex: "updateTime",
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <PopOver content={text}>{text}</PopOver>;
        },
      },
      {
        dataIndex: "action",
        title: "操作",
        slots: {
          customRender: "action",
        },
        customRender: ({ record }: { record: DeviceKnowledgeVo }): JSX.Element => {
          return (
            <>
              <Button
                style={{
                  padding: "4px",
                }}
                type="link"
                onClick={() => {
                  handleDownload(record);
                }}
              >
                下载
              </Button>
              <Button
                style={{
                  padding: "4px",
                }}
                type="link"
                onClick={() => {
                  handlePreview(record);
                }}
              >
                预览
              </Button>
              <PopConfirm title="是否确认删除?" ok-text="确定" cancel-text="取消" onConfirm={async () => handleDelete(record)}>
                <Button type="link" danger style={{ padding: "4px" }}>
                  删除
                </Button>
              </PopConfirm>
            </>
          );
        },
      },
    ];

    const layoutSlots = {
      "layout-header": (): JSX.Element => {
        return (
          <Button
            type="primary"
            onClick={() => {
              state.modalState.visible = true;
            }}
          >
            新增
          </Button>
        );
      },
      "layout-content": (): JSX.Element => {
        return (
          <div class={styles.content}>
            <Form layout="inline" style={{ margin: "10px 0 0 0" }}>
              <FormItem style={{ paddingRight: 0, marginRight: "10px", marginBottom: "10px" }} label="产品品类">
                <TreeSelect
                  v-model:value={state.searchState.deviceProdCategoryCodeConcat}
                  treeData={state.categoryList}
                  fieldNames={{
                    children: "children",
                    label: "categoryName",
                    value: "categoryCodeConcat",
                  }}
                  style={{ width: "200px" }}
                />
              </FormItem>
              <FormItem style={{ paddingRight: 0, marginRight: "10px", marginBottom: "10px" }}>
                <Input v-model:value={state.searchState.keyword} placeholder="输入文档名称" showCount={false} />
              </FormItem>
              <FormItem style={{ paddingRight: 0, marginRight: "10px", marginBottom: "10px" }}>
                <Button type="primary" onClick={handleSearch}>
                  查询
                </Button>
                <Button style={{ marginLeft: "10px" }} onClick={handleReset}>
                  重置
                </Button>
              </FormItem>
            </Form>
            <AliasTable
              rowKey="id"
              rowSelection={rowSelection.value}
              dataSource={state.dataSource}
              columns={columns}
              loading={state.loading}
              applicationCode="KNOWLEDGE_DOCUMENT"
              tableCode="DEVICE_DOCUMENT"
            />
          </div>
        );
      },
      "footer-btn": (): JSX.Element => {
        return (
          <>
            <span style={{ marginRight: "10px" }}>已选{selectedRowKeysData.value.length}项</span>
            <Button type="primary" danger onClick={handleBatchDelete}>
              删除
            </Button>
          </>
        );
      },
      "footer-page": (): JSX.Element => {
        return (
          <Page
            v-show={state.page.total > 0}
            v-model:current={state.page.pageNumber}
            v-model:pageSize={state.page.pageSize}
            v-model:total={state.page.total}
            onPageChange={pageChange}
          />
        );
      },
    };
    return (): JSX.Element => (
      <Layout v-slots={layoutSlots} class={styles.container} title={pageTitle}>
        <Modal v-model:visible={state.modalState.visible} onOk={handleOk} width="500px" title="新增">
          <Form rules={rules} model={state.modalState.formState} ref={formRef}>
            <FormItem label="文档名称" name="name">
              <Input v-model:value={state.modalState.formState.name} showCount={false} maxlength={500} />
            </FormItem>
            <FormItem label="产品品类" name="productGenreConfig">
              <TreeSelect
                treeData={state.categoryList}
                onChange={(
                  value: string,
                  label: string,
                  extra: {
                    triggerNode: {
                      props: {
                        categoryCode: string;
                        categoryCodeConcat: string;
                        categoryName: string;
                      };
                    };
                  },
                ) => {
                  getContactProduct();
                  selectProductGre = extra.triggerNode.props;
                }}
                v-model:value={state.modalState.formState.productGenreConfig}
                fieldNames={{
                  children: "children",
                  label: "categoryName",
                  value: "categoryCode",
                }}
                style={{ width: "100%" }}
              />
            </FormItem>
            <FormItem label="关联产品" name="productIds">
              <Select
                v-model:value={state.modalState.formState.productIds}
                mode="multiple"
                onChange={(value: string[], option: { id: string; name: string }[]) => {
                  selectedProduct = option.map((item) => {
                    return {
                      id: item.id,
                      name: item.name,
                    };
                  });
                }}
                options={state.modalState.productOptions}
                fieldNames={{
                  label: "name",
                  value: "id",
                }}
              />
            </FormItem>
            <FormItem label="上传文件" name="fileId">
              <UploadFile v-model:value={state.modalState.formState.fileId} maxCount={1} type="picture-card" showPlaceholder={false} />
            </FormItem>
          </Form>
        </Modal>
        {/* 图片预览 */}
        <Modal v-model:visible={state.imagePreview} centered footer={null} title="图片预览">
          <div class={styles.imgCtr}>
            <Image src={state.imgSrc} width="200" height="200" preview={false} />
          </div>
        </Modal>
      </Layout>
    );
  },
});
