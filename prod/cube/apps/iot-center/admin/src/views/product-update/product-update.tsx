import { cubeDeviceIotCenterService } from "@/api/service";
import { getNodeTypeLabel } from "@/constants/node-type";
import { CubeLayout, FileUpload, ProductBrandSelect, ProductCategoryTreeSelect } from "@ghcloud/cube-app-design";
import { GLOBAL_SCENE_CODE } from "@ghcloud/cube-file-service";
import type { ProductDetailModel } from "@ghcloud/cube-iot-center-service";
import { Button, Form, FormItem, Input, Textarea, Spin, message, type FormExpose } from "@ghcloud/cube-ui";
import { usePageName } from "@ghcloud/cube-utils";
import dayjs from "dayjs";
import { defineComponent, onMounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

interface TreeNode {
  id?: string;
  children?: TreeNode[];
}

/**
 * 从树形结构中提取所有ID
 */
const getAllIds = (node: TreeNode | null, acc: string[] = []): string[] => {
  if (!node) {
    return acc;
  }
  if (node.id) {
    acc.push(node.id);
  }
  const { children } = node;
  if (children) {
    for (const child of children) {
      getAllIds(child, acc);
    }
  }
  return acc;
};

interface ProductForm {
  prodName: string;
  prodModel: string;
  prodBrandId: string | undefined;
  remark: string;
  prodIcon: { id: string }[];
  prodPic: { id: string }[];
  prodCategoryId: (string | number)[];
}

/** 产品编辑 */
export const ProductUpdate = defineComponent({
  setup() {
    const { pageTitle } = usePageName();
    const route = useRoute();
    const router = useRouter();
    const { id } = route.query as { id: string };

    const detailData = ref<ProductDetailModel>({} as ProductDetailModel);
    const formInstance = ref<FormExpose>();
    const loading = ref(false);
    const initStatus = ref(false);

    const formState = reactive<ProductForm>({
      prodName: "",
      prodModel: "",
      remark: "",
      prodBrandId: undefined,
      prodIcon: [],
      prodPic: [],
      prodCategoryId: [],
    });

    const formRules = {
      prodName: [{ required: true, message: "请输入产品名称", trigger: "blur" }],
      prodCategoryId: [{ required: true, message: "请选择产品品类", trigger: "change" }],
      prodBrandId: [{ required: true, message: "请选择品牌", trigger: "change" }],
    };

    /**
     * 加载产品详情
     */
    const loadProductDetail = async (): Promise<void> => {
      try {
        const res = await cubeDeviceIotCenterService.getProductDetail(id);
        detailData.value = res;
        formState.prodName = res.prodName;
        formState.prodBrandId = res.prodBrandId;
        formState.prodModel = res.prodModel;
        formState.remark = res.remark || "";
        if (res.iconFileVO) {
          formState.prodIcon = [res.iconFileVO];
        }
        if (res.picFileVO) {
          formState.prodPic = [res.picFileVO];
        }
        // 获取品类完整路径（从根节点到末级节点的所有ID）
        try {
          const { path } = await cubeDeviceIotCenterService.getProductCategoryFullDetail(res.prodCategoryId);
          if (path) {
            formState.prodCategoryId = getAllIds(path as TreeNode);
          } else {
            // 如果接口返回的 path 为空，使用末级ID
            formState.prodCategoryId = [res.prodCategoryId];
          }
        } catch (_ignore) {
          // 如果接口调用失败，使用末级ID
          formState.prodCategoryId = [res.prodCategoryId];
        }
        initStatus.value = true;
      } catch (_ignore) {
        // 静默失败
      }
    };

    /**
     * 保存产品信息
     */
    const save = async (): Promise<void> => {
      formInstance.value?.clearValidate();
      await formInstance.value?.validate();
      loading.value = true;
      try {
        const params = {
          prodName: formState.prodName,
          prodModel: formState.prodModel,
          nodeType: detailData.value!.nodeType as number,
          protocolId: detailData.value!.protocolId as string,
          prodBrandId: formState.prodBrandId as string,
          prodCategoryId:
            formState.prodCategoryId.length > 0 ? (formState.prodCategoryId[formState.prodCategoryId.length - 1] as string) : "",
          prodIcon: formState.prodIcon?.length ? formState.prodIcon[0].id : "",
          prodPic: formState.prodPic?.length ? formState.prodPic[0].id : "",
          remark: formState.remark,
          extendConfig: "",
        };
        await cubeDeviceIotCenterService.updateProduct(id, params);
        message.success("操作成功");
        router.back();
      } catch (error: unknown) {
        const err = error as { errorMessage?: string };
        message.error(err?.errorMessage ?? "操作失败");
      } finally {
        loading.value = false;
      }
    };

    /**
     * 返回上一页
     */
    const handleBack = (): void => {
      router.back();
    };

    onMounted(() => {
      loadProductDetail();
    });

    const slots = {
      "layout-content": (): JSX.Element => (
        <Spin spinning={!initStatus.value}>
          <Form
            rules={formRules}
            ref={formInstance}
            model={formState}
            style={{ margin: "10px", display: "flex", flexWrap: "wrap", minHeight: "500px" }}
            labelCol={{ style: { width: "150px" } }}
          >
            {initStatus.value && (
              <div style={{ display: "flex", flexWrap: "wrap", width: "100%" }}>
                <div style={{ width: "45%" }}>
                  <FormItem label="产品编号">{id}</FormItem>
                </div>
                <div style={{ width: "45%" }}>
                  <FormItem label="产品名称" name="prodName">
                    <Input v-model:value={formState.prodName} placeholder="请输入产品名称" showCount={false} />
                  </FormItem>
                </div>
                <div style={{ width: "45%" }}>
                  <FormItem label="产品品类" name="prodCategoryId">
                    <ProductCategoryTreeSelect v-model:value={formState.prodCategoryId} width="100%" />
                  </FormItem>
                </div>
                <div style={{ width: "45%" }}>
                  <FormItem label="品牌名称" name="prodBrandId">
                    <ProductBrandSelect v-model:value={formState.prodBrandId} width="100%" />
                  </FormItem>
                </div>
                <div style={{ width: "45%" }}>
                  <FormItem label="节点类型">{getNodeTypeLabel(detailData.value?.nodeType)}</FormItem>
                </div>
                <div style={{ width: "45%" }}>
                  <FormItem label="产品型号" name="prodModel">
                    <Input v-model:value={formState.prodModel} placeholder="请输入产品型号" />
                  </FormItem>
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
                      maxCount={1}
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
                      maxCount={1}
                      v-model:value={formState.prodPic}
                    />
                  </FormItem>
                </div>
                <div style={{ width: "45%" }}>
                  <FormItem label="创建时间">
                    {(detailData.value as ProductDetailModel & { createTime?: string })?.createTime
                      ? dayjs((detailData.value as ProductDetailModel & { createTime: string }).createTime).format("YYYY-MM-DD HH:mm:ss")
                      : "--"}
                  </FormItem>
                </div>
                <div style={{ width: "45%" }}>
                  <FormItem label="更新时间">
                    {(detailData.value as ProductDetailModel & { updateTime?: string })?.updateTime
                      ? dayjs((detailData.value as ProductDetailModel & { updateTime: string }).updateTime).format("YYYY-MM-DD HH:mm:ss")
                      : "--"}
                  </FormItem>
                </div>
                <div style={{ width: "45%" }}>
                  <FormItem label="产品描述">
                    <Textarea v-model:value={formState.remark} placeholder="请输入产品描述" />
                  </FormItem>
                </div>
              </div>
            )}
          </Form>
        </Spin>
      ),
      "footer-page": (): JSX.Element => (
        <>
          <Button onClick={handleBack}>返回</Button>
          <Button style={{ marginLeft: "10px" }} type="primary" onClick={save} loading={loading.value}>
            保存
          </Button>
        </>
      ),
    };

    return (): JSX.Element => <CubeLayout title={pageTitle || "编辑产品"} v-slots={slots} />;
  },
});
