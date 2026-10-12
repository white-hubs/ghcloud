import { cubeDeviceIotCenterService } from "@/api/service";
import { NODE_TYPE_OPTIONS } from "@/constants/node-type";
import { ProductBrandSelect, ProductCategoryTreeSelect, useCubeModal } from "@ghcloud/cube-app-design";
import { Form, FormItem, Input, Select, message, type FormExpose } from "@ghcloud/cube-ui";
import { debounce } from "lodash";
import { defineComponent, onMounted, reactive, ref } from "vue";

interface ProductForm {
  prodName: string;
  prodCategoryId: string[];
  prodBrandId: string | undefined;
  nodeType: number | undefined;
  protocolId: string | undefined;
}

/** 产品新增弹窗 */
export const ProductAddModal = defineComponent({
  emits: ["enter", "cancel"],
  setup(_, { emit, expose }) {
    const formInstance = ref<FormExpose>();

    // ==================== 表单数据 ====================
    const productForm = reactive<ProductForm>({
      prodName: "",
      prodCategoryId: [],
      prodBrandId: undefined,
      nodeType: undefined,
      protocolId: undefined,
    });

    const formRules = {
      prodName: [{ required: true, message: "请输入产品名称", trigger: "blur" }],
      prodCategoryId: [{ required: true, message: "请选择产品品类", trigger: "change" }],
      prodBrandId: [{ required: true, message: "请选择品牌", trigger: "change" }],
      nodeType: [{ required: true, message: "请选择节点类型", trigger: "change" }],
      protocolId: [{ required: true, message: "请选择协议插件", trigger: "change" }],
    };

    // ==================== 选项数据 ====================
    const protocolOptions = ref<{ label: string; value: string }[]>([]);

    // ==================== 数据加载 ====================
    /**
     * 加载协议列表
     */
    const loadProtocolOptions = async (): Promise<void> => {
      try {
        const res = await cubeDeviceIotCenterService.getProtocolList();
        protocolOptions.value = res.map((e: { itemLabel: string; id: string }) => ({
          label: e.itemLabel,
          value: e.id,
        }));
      } catch (_ignore) {
        // 静默失败
      }
    };

    // ==================== 业务逻辑 ====================

    /**
     * 提交表单
     */
    const onSubmit = debounce(async (): Promise<void> => {
      formInstance.value?.clearValidate();
      await formInstance.value?.validate();
      try {
        modalApi.setConfirmLoading(true);
        const params = {
          prodName: productForm.prodName,
          prodCategoryId: productForm.prodCategoryId.length > 0 ? productForm.prodCategoryId[productForm.prodCategoryId.length - 1] : "",
          prodBrandId: productForm.prodBrandId!,
          nodeType: productForm.nodeType!,
          protocolId: productForm.protocolId!,
        };
        await cubeDeviceIotCenterService.addProduct(params);
        message.success("新增成功");
        modalApi.close();
        emit("enter");
      } catch (error: unknown) {
        const err = error as { errorMessage?: string };
        message.error(err?.errorMessage ?? "新增失败");
      } finally {
        modalApi.setConfirmLoading(false);
      }
    }, 500);

    /**
     * 重置表单
     */
    const resetForm = (): void => {
      productForm.prodName = "";
      productForm.prodCategoryId = [];
      productForm.prodBrandId = undefined;
      productForm.nodeType = undefined;
      productForm.protocolId = undefined;
      formInstance.value?.resetFields();
    };

    // ==================== 弹窗管理 ====================
    const [CubeModal, modalApi] = useCubeModal({
      title: "新增产品",
      width: "600px",
      onConfirm: onSubmit,
      onCancel: () => {
        resetForm();
        modalApi.close();
        emit("cancel");
      },
    });

    /**
     * 打开弹窗
     */
    const openModal = (): void => {
      resetForm();
      modalApi.open();
    };

    expose({
      openModal,
    });

    // ==================== 初始化 ====================
    onMounted(() => {
      loadProtocolOptions();
    });

    // ==================== 渲染内容 ====================
    const modalSlots = {
      default: (): JSX.Element => (
        <Form ref={formInstance} model={productForm} labelCol={{ style: { width: "100px" } }} rules={formRules}>
          <FormItem label="产品名称" name="prodName">
            <Input placeholder="请输入产品名称" v-model:value={productForm.prodName} />
          </FormItem>
          <FormItem label="产品品类" name="prodCategoryId">
            <ProductCategoryTreeSelect v-model:value={productForm.prodCategoryId} width="100%" />
          </FormItem>
          <FormItem label="品牌名称" name="prodBrandId">
            <ProductBrandSelect v-model:value={productForm.prodBrandId} width="100%" />
          </FormItem>
          <FormItem label="节点类型" name="nodeType">
            <Select options={NODE_TYPE_OPTIONS} placeholder="请选择节点类型" v-model:value={productForm.nodeType} />
          </FormItem>
          <FormItem label="协议插件" name="protocolId">
            <Select options={protocolOptions.value} placeholder="请选择协议插件" v-model:value={productForm.protocolId} />
          </FormItem>
        </Form>
      ),
    };

    return (): JSX.Element => <CubeModal v-slots={modalSlots} />;
  },
});
