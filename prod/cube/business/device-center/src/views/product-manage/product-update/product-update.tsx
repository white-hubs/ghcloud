import { BindTagModal } from "../product-list/bind-tag-modal";
import { cubeDeviceCenterService } from "@/api/service";
import { ProductCategoryTreeSelect } from "@/components/business/product-category-tree-select/product-category-tree-select";
import { StatusConfigForm } from "@/components/business/status-config-form/status-config-form";
import type { StatusConfig } from "@/components/business/status-config-form/types";
import { Layout } from "@/components/layout/layout";
import { getAllIds, type TreeNode } from "@/utils/tool";
import { GLOBAL_SCENE_CODE } from "@ghcloud/cube-file-service";
import type { Product } from "@ghcloud/cube-iot-center-service";
import { Button, Form, FormItem, Input, Select, type FormExpose, message, Textarea, Spin, TabPane, Tabs } from "@ghcloud/cube-ui";
import { FileUpload } from "@ghcloud/generic-component";
import { defineComponent, reactive, ref } from "vue";
import { useRoute } from "vue-router";

/** 产品编辑 */
export const ProductUpdate = defineComponent({
  setup: () => {
    const detailData = ref<Product | undefined>();
    const formState = reactive<{
      prodName: string;
      prodNumber: string | undefined;
      prodModel: string;
      prodBrandId: string | undefined;
      remark: string;
      prodIcon: { id: string }[];
      prodPic: { id: string }[];
      prodCategoryId: (string | number)[];
      extendConfig: string;
    }>({
      prodName: "",
      prodNumber: "",
      prodModel: "",
      remark: "",
      prodBrandId: undefined,
      prodIcon: [],
      prodPic: [],
      prodCategoryId: [],
      extendConfig: "",
      // "extendConfig": "[{\"status\":\"on_line\",\"conditions\":{\"rules\":[{\"property\":\"pressure\",\"operator\":\"EQ\",\"value\":1,\"dataType\":\"int\",\"type\":\"and\",\"translation\":\"压力值 等于 1\"}]}},{\"status\":\"off_line\",\"conditions\":{\"rules\":[{\"property\":\"pressure\",\"operator\":\"NE\",\"value\":1,\"dataType\":\"int\",\"type\":\"and\",\"translation\":\"压力值 不等于 1\"}]}}]",
    });
    const initStatus = ref(false);
    const formRules = {
      prodName: [{ required: true, message: "请输入产品名称", trigger: "blur" }],
      prodBrandId: [{ required: true, message: "请选择品牌", trigger: "change" }],
    };
    const { id } = useRoute().query as { id: string };
    const formInstance = ref<FormExpose>();
    const loading = ref(false);
    const brandOptions = ref<{ label: string; value: string }[]>([]);
    cubeDeviceCenterService.getProductCategoryDetail(id).then((res) => {
      detailData.value = res;
      formState.prodName = res.prodName;
      formState.prodNumber = res.prodNumber;
      formState.prodBrandId = res.prodBrandId;
      formState.prodModel = res.prodModel;
      formState.remark = res.remark;
      formState.extendConfig = res.extendConfig ? JSON.stringify(JSON.parse(res.extendConfig || "{}")?.deviceStatusRules) : "";
      if (res.prodIconFile) {
        formState.prodIcon = [res.prodIconFile];
      }
      if (res.prodPicFile) {
        formState.prodPic = [res.prodPicFile];
      }
      if (res.prodCategoryItem) {
        formState.prodCategoryId = getAllIds(res.prodCategoryItem as TreeNode);
      }
      initStatus.value = true;
    });
    cubeDeviceCenterService.getProductBrandPage({ pageNumber: 1, pageSize: 10000 }).then((res) => {
      brandOptions.value = res.records.map((e) => ({
        label: e.itemLabel,
        value: e.id,
      }));
    });
    const statusConfigFormRef = ref<{ validate: () => Promise<boolean> }>();
    const save = async (): Promise<void> => {
      formInstance.value?.clearValidate();
      await formInstance.value?.validate();
      let extendConfig;
      try {
        extendConfig = await statusConfigFormRef.value?.validate();
      } catch {
        activeKey.value = "3";
        return;
      }
      const config = (extendConfig as unknown as StatusConfig[])?.filter((e) => e.conditions.rules.length > 0);
      loading.value = true;
      const params = {
        prodName: formState.prodName,
        prodModel: formState.prodModel,
        prodBrandId: formState.prodBrandId as unknown as string,
        remark: formState.remark,
        prodIcon: formState.prodIcon?.length ? formState.prodIcon[0].id : "",
        prodPic: formState.prodPic?.length ? formState.prodPic[0].id : "",
        prodCategoryId: formState.prodCategoryId?.length > 0 ? formState.prodCategoryId[formState.prodCategoryId.length - 1] : "",
        extendConfig: config?.length > 0 ? JSON.stringify({ deviceStatusRules: extendConfig }) : "",
      };
      cubeDeviceCenterService
        .updateProduct(id, params)
        .then(() => {
          loading.value = false;
          message.success("操作成功");
          history.back();
        })
        .catch((error) => {
          message.error(error?.errorMessage ?? "操作失败");
          loading.value = false;
        });
    };
    const bindTagModalRef = ref<{ openModal: (id: string) => void; batchTag: (ids: string[]) => void }>();
    const activeKey = ref("1");
    const layoutSlots = {
      "layout-content": (): JSX.Element => (
        <>
          <Spin spinning={!initStatus.value}>
            <Form
              rules={formRules}
              ref={formInstance}
              model={formState}
              style={{ margin: "10px", display: "flex", flexWrap: "wrap", minHeight: "500px" }}
              labelCol={{ style: { width: "150px" } }}
            >
              {initStatus.value && (
                <>
                  <Tabs v-model:activeKey={activeKey.value} style={{ width: "100%" }}>
                    <TabPane key="1" tab="基本信息">
                      <div style={{ display: "flex", flexWrap: "wrap" }}>
                        <div style={{ width: "45%" }}>
                          <FormItem label="产品编号">{formState.prodNumber}</FormItem>
                        </div>
                        <div style={{ width: "45%" }}>
                          <FormItem label="产品名称" name="prodName">
                            <Input v-model:value={formState.prodName} placeholder="请输入产品名称" showCount={false} />
                          </FormItem>
                        </div>
                        <div style={{ width: "45%" }}>
                          <FormItem label="产品品类">
                            <ProductCategoryTreeSelect v-model:value={formState.prodCategoryId} />
                          </FormItem>
                        </div>
                        <div style={{ width: "45%" }}>
                          <FormItem label="品牌名称" name="prodBrandId">
                            <Select
                              options={brandOptions.value}
                              placeholder="请选择品牌"
                              v-model:value={formState.prodBrandId}
                              allowClear
                            />
                          </FormItem>
                        </div>
                        <div style={{ width: "45%" }}>
                          <FormItem label="节点类型">{detailData.value?.nodeTypeName ?? "--"}</FormItem>
                        </div>
                        <div style={{ width: "45%" }}>
                          <FormItem label="产品型号" name="prodModel">
                            <Input v-model:value={formState.prodModel} placeholder="请输入产品型号" />
                          </FormItem>
                        </div>
                        <div style={{ width: "45%" }}>
                          <FormItem label="连网方式">{detailData.value?.accessTypeName ?? "--"}</FormItem>
                        </div>
                        <div style={{ width: "45%" }}>
                          <FormItem label="协议插件">{detailData.value?.protocolName ?? "--"}</FormItem>
                        </div>
                        <div style={{ width: "45%" }}>
                          <FormItem label="产品图标">
                            <FileUpload
                              sceneCode={GLOBAL_SCENE_CODE.deviceCenter}
                              type="picture-card"
                              customText="请上传图片"
                              maxNum={1}
                              v-model:value={formState.prodIcon}
                            />
                          </FormItem>
                        </div>
                        <div style={{ width: "45%" }}>
                          <FormItem label="产品图片">
                            <FileUpload
                              sceneCode={GLOBAL_SCENE_CODE.deviceCenter}
                              type="picture-card"
                              customText="请上传图片"
                              maxNum={1}
                              v-model:value={formState.prodPic}
                            />
                          </FormItem>
                        </div>
                        <div style={{ width: "45%" }}>
                          <FormItem label="关联设备数">{detailData.value?.deviceCount}</FormItem>
                        </div>
                        <div style={{ width: "45%" }}>
                          <FormItem label="创建时间">{detailData.value?.createTimeFormat ?? "--"}</FormItem>
                        </div>
                        <div style={{ width: "45%" }}>
                          <FormItem label="更新时间">{detailData.value?.updateTimeFormat ?? "--"}</FormItem>
                        </div>
                        <div style={{ width: "45%" }}>
                          <FormItem label="产品描述">
                            <Textarea v-model:value={formState.remark} placeholder="请输入产品描述" />
                          </FormItem>
                        </div>
                      </div>
                    </TabPane>
                    <TabPane key="2" tab="标签信息">
                      <div style={{ width: "100%" }}>
                        <FormItem label="产品标签">
                          <Button
                            style={{ marginBottom: "10px" }}
                            type="primary"
                            shape="round"
                            onClick={() => {
                              bindTagModalRef.value?.openModal(id);
                            }}
                          >
                            关联标签
                          </Button>
                          <BindTagModal ref={bindTagModalRef} showTagTable productId={id} />
                        </FormItem>
                      </div>
                    </TabPane>
                    <TabPane key="3" tab="状态规则" style={{ width: "100%" }}>
                      <div style={{ width: "100%" }}>
                        <FormItem label="">
                          <StatusConfigForm info={formState.extendConfig} productId={id} ref={statusConfigFormRef} />
                        </FormItem>
                      </div>
                    </TabPane>
                  </Tabs>
                </>
              )}
            </Form>
          </Spin>
        </>
      ),
      "footer-page": (): JSX.Element => (
        <>
          <Button
            onClick={() => {
              history.back();
            }}
          >
            返回
          </Button>
          <Button style={{ marginLeft: "10px" }} type="primary" onClick={save}>
            保存
          </Button>
        </>
      ),
    };
    return (): JSX.Element => (
      <>
        <Layout title="编辑产品" v-slots={layoutSlots} />
      </>
    );
  },
});
