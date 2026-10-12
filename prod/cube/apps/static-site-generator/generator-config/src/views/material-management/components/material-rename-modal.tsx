import { Form, FormItem, Input, Modal, message } from "@ghcloud/cube-ui";
import { defineComponent, reactive, ref, watch, type PropType } from "vue";
import { cubeSiteGeneratorService } from "@/api/service";
import type { Material } from "../types";

interface FormState {
  name: string;
}

export const MaterialRenameModal = defineComponent({
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    material: {
      type: Object as PropType<Material | null>,
      default: null,
    },
  },
  emits: ["update:visible", "success"],
  setup(props, { emit }) {
    const submitting = ref(false);
    const formState = reactive<FormState>({
      name: "",
    });

    watch(
      () => props.visible,
      (val) => {
        if (val && props.material) {
          let name = props.material.name;
          if (props.material.ext) {
            const suffix = `.${props.material.ext}`;
            if (name.endsWith(suffix)) {
              name = name.slice(0, -suffix.length);
            }
          }
          formState.name = name;
        }
      }
    );

    const handleClose = (): void => {
      emit("update:visible", false);
      formState.name = "";
    };

    const handleSubmit = async (): Promise<void> => {
      const name = formState.name.trim();
      if (!name) {
        message.warning("请输入素材名称");
        return;
      }
      if (!props.material) {
        return;
      }
      submitting.value = true;
      try {
        await cubeSiteGeneratorService.renameMaterial({ id: props.material.id, name });
        message.success("重命名成功");
        emit("success");
        handleClose();
      } catch (error) {
        message.error((error as Error).message || "重命名失败");
      } finally {
        submitting.value = false;
      }
    };

    return (): JSX.Element => (
      <Modal
        visible={props.visible}
        title="重命名素材"
        width="480px"
        confirmLoading={submitting.value}
        onOk={handleSubmit}
        onCancel={handleClose}
        maskClosable={false}
      >
        <Form layout="vertical">
          <FormItem label="素材名称" required>
            <Input
              v-model:value={formState.name}
              placeholder="请输入素材名称"
              onPressEnter={handleSubmit}
            />
          </FormItem>
        </Form>
      </Modal>
    );
  },
});
