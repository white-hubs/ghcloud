import { Form, FormItem, Input, Modal, message } from "@ghcloud/cube-ui";
import { defineComponent, reactive, ref, watch, type PropType } from "vue";
import { cubeSiteGeneratorService } from "@/api/service";

interface FormState {
  name: string;
}

export const MaterialFolderModal = defineComponent({
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: "新建文件夹",
    },
    folderId: {
      type: String as PropType<string | null>,
      default: null,
    },
    pathId: {
      type: String as PropType<string | null>,
      default: null,
    },
    initialName: {
      type: String,
      default: "",
    },
    initialSort: {
      type: Number,
      default: 0,
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
        if (val) {
          formState.name = props.initialName;
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
        message.warning("请输入文件夹名称");
        return;
      }
      submitting.value = true;
      try {
        if (props.folderId) {
          await cubeSiteGeneratorService.renameMaterialFolder({
            id: props.folderId,
            name,
            sort: props.initialSort,
            pathId: props.pathId,
          });
          message.success("重命名成功");
        } else {
          await cubeSiteGeneratorService.addMaterialFolder({
            pathId: props.pathId,
            name,
            sort: 0,
          });
          message.success("创建成功");
        }
        emit("success");
        handleClose();
      } catch (error) {
        message.error((error as { errorMessage: string })?.errorMessage ?? "操作失败");
      } finally {
        submitting.value = false;
      }
    };

    return (): JSX.Element => (
      <Modal
        visible={props.visible}
        title={props.title}
        width="480px"
        confirmLoading={submitting.value}
        onOk={handleSubmit}
        onCancel={handleClose}
        maskClosable={false}
      >
        <Form layout="vertical">
          <FormItem label="文件夹名称" required>
            <Input
              v-model:value={formState.name}
              placeholder="请输入文件夹名称"
              onPressEnter={handleSubmit}
            />
          </FormItem>
        </Form>
      </Modal>
    );
  },
});
