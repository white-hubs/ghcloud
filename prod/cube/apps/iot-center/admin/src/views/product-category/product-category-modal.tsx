import { cubeDeviceIotCenterService } from "@/api/service";
import { useCubeModal } from "@ghcloud/cube-app-design";
import { Form, FormItem, Input, message, type FormExpose } from "@ghcloud/cube-ui";
import { debounce } from "lodash";
import { defineComponent, reactive, ref } from "vue";

interface Props {
  title: string;
}

interface CategoryForm {
  id: string;
  parentId: string;
  itemLabel: string;
}

interface EditRecord {
  id: string;
  itemLabel: string;
  itemValue: string;
  itemParentId: string;
}

/** 产品品类新增/编辑弹窗 */
export const ProductCategoryModal = defineComponent({
  props: ["title"],
  emits: ["enter", "cancel"],
  setup(props: Props, { emit, expose }) {
    const formInstance = ref<FormExpose>();

    const categoryForm = reactive<CategoryForm>({
      id: "",
      parentId: "",
      itemLabel: "",
    });

    const formRules = {
      itemLabel: [{ required: true, message: "请输入品类名称", trigger: "blur" }],
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
          };
          await cubeDeviceIotCenterService.updateProductCategory(params);
        } else {
          const params = {
            itemLabel: categoryForm.itemLabel,
            parentId: categoryForm.parentId ?? "",
          };
          await cubeDeviceIotCenterService.addProductCategory(params);
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

    const openModal = (record?: EditRecord, parentId?: string): void => {
      modalApi.open();
      // 重置表单
      for (const key in categoryForm) {
        (categoryForm as Record<string, unknown>)[key] = "";
      }
      if (record?.id) {
        modalApi.setState({ title: `编辑${props.title}` });
        categoryForm.id = record.id;
        categoryForm.parentId = record.itemParentId ?? "";
        categoryForm.itemLabel = record.itemLabel;
      } else {
        modalApi.setState({ title: `新增${props.title}` });
        categoryForm.id = "";
        categoryForm.parentId = parentId ?? "";
      }
    };

    expose({
      openModal,
    });

    const modalSlots = {
      default: (): JSX.Element => (
        <Form ref={formInstance} model={categoryForm} labelCol={{ style: { width: "100px" } }} rules={formRules}>
          <FormItem label="品类名称" name="itemLabel">
            <Input placeholder="请输入品类名称" v-model:value={categoryForm.itemLabel} />
          </FormItem>
        </Form>
      ),
    };

    return (): JSX.Element => <CubeModal v-slots={modalSlots} />;
  },
});
