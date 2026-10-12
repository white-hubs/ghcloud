import { cubeDeviceIotCenterService } from "@/api/service";
import { useCubeModal } from "@ghcloud/cube-app-design";
import { GLOBAL_SCENE_CODE } from "@ghcloud/cube-file-service";
import type { ProductBrandModel } from "@ghcloud/cube-iot-center-service";
import { Form, FormItem, Input, message, type FormExpose } from "@ghcloud/cube-ui";
import { FileUpload } from "@ghcloud/generic-component";
import { debounce } from "lodash";
import { defineComponent, reactive, ref } from "vue";

interface Props {
  title: string;
}

interface CategoryForm {
  id: string;
  itemLabel: string;
  itemValue: string;
  picUrl: { id: string; name: string; path: string }[];
}

/** 产品品牌新增/编辑弹窗 */
export const ProductBrandModal = defineComponent({
  props: ["title"],
  emits: ["enter", "cancel"],
  setup(props: Props, { emit, expose }) {
    const formInstance = ref<FormExpose>();

    const categoryForm = reactive<CategoryForm>({
      id: "",
      itemLabel: "",
      itemValue: "",
      picUrl: [],
    });

    const formRules = {
      itemLabel: [{ required: true, message: "请输入品牌名称", trigger: "blur" }],
      picUrl: [{ required: true, message: "请输入品牌logo", trigger: "blur" }],
    };

    const onSubmit = debounce(async () => {
      formInstance.value?.clearValidate();
      await formInstance.value?.validate();
      try {
        modalApi.setConfirmLoading(true);
        if (categoryForm.id) {
          const params = {
            id: categoryForm.id,
            itemLabel: categoryForm.itemLabel,
            itemValue: categoryForm.picUrl.length > 0 ? categoryForm.picUrl[0].id : undefined,
          };
          await cubeDeviceIotCenterService.updateProductBrand(params);
        } else {
          const params = {
            itemLabel: categoryForm.itemLabel,
            itemValue: categoryForm.picUrl.length > 0 ? categoryForm.picUrl[0].id : undefined,
          };
          await cubeDeviceIotCenterService.addProductBrand(params);
        }
        message.success("操作成功");
        modalApi.close();
        emit("enter");
      } catch (_ignore) {
      } finally {
        modalApi.setConfirmLoading(false);
      }
    }, 500);

    const [CubeModal, modalApi] = useCubeModal({
      title: `${props.title}`,
      width: "500px",
      onConfirm: onSubmit,
      onCancel: () => {
        formInstance.value?.resetFields();
        modalApi.close();
        emit("cancel");
      },
    });

    const openModal = (record?: ProductBrandModel): void => {
      modalApi.open();
      // 重置表单
      for (const key in categoryForm) {
        (categoryForm as Record<string, unknown>)[key] = key === "picUrl" ? [] : "";
      }
      if (record?.id) {
        modalApi.setState({ title: `编辑${props.title}` });
        categoryForm.id = record.id;
        categoryForm.itemLabel = record.itemLabel;
        categoryForm.itemValue = record.itemValue;
        categoryForm.picUrl = record.fileVOs;
      } else {
        modalApi.setState({ title: `新增${props.title}` });
        categoryForm.id = "";
      }
    };

    expose({
      openModal,
    });

    const modalSlots = {
      default: (): JSX.Element => (
        <Form ref={formInstance} model={categoryForm} labelCol={{ style: { width: "100px" } }} rules={formRules}>
          <FormItem label="品牌名称" name="itemLabel">
            <Input placeholder="请输入品牌名称" v-model:value={categoryForm.itemLabel} />
          </FormItem>
          <FormItem label="品牌logo" name="picUrl">
            <FileUpload
              sceneCode={GLOBAL_SCENE_CODE.deviceCenter}
              v-model:value={categoryForm.picUrl}
              customText="请上传图片|单个附件最大支持100MB"
              type="picture-card"
              maxNum={1}
            />
          </FormItem>
        </Form>
      ),
    };

    return (): JSX.Element => <CubeModal v-slots={modalSlots} />;
  },
});
