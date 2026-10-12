import { defineComponent, ref, reactive } from "vue";

import { FileUpload, useCubeModal } from "@ghcloud/cube-app-design";
import { GLOBAL_SCENE_CODE } from "@ghcloud/cube-file-service";
import type { KnowledgeDocumentTypeModel } from "@ghcloud/cube-knowledge-document-service";
import { Form, FormItem, Input, Textarea, message, type FormExpose } from "@ghcloud/cube-ui";
import type { OSSFile } from "@ghcloud/generic-component";

import { cubeKnowledgeDocumentService } from "@/api/service";

interface Props {
  title: string;
}

export const KnowledgeDocumentTypeModal = defineComponent({
  props: ["title"],
  emits: ["enter", "cancel"],
  setup(props: Props, { emit, expose }) {
    const formRenderRef = ref<FormExpose>();
    const formState = reactive<{
      id: string | null;
      name: string | null;
      description: string | null;
      parentId: string | null;
      icon: OSSFile[];
    }>({
      id: null,
      parentId: null,
      name: null,
      description: null,
      icon: [],
    });
    const modalRules = {
      name: [{ required: true, message: "请输入类型名称", trigger: "blur" }],
    };
    const [CubeModal, modalApi] = useCubeModal({
      title: `${props.title}`,
      onConfirm: async () => {
        try {
          modalApi.setState({ confirmLoading: true });
          await formRenderRef.value?.validate();
          if (formState.id) {
            const params = {
              id: formState.id ?? "",
              name: formState.name,
              description: formState.description,
              parentId: formState.parentId,
              icon: formState.icon[0]?.id ?? null,
            };
            await cubeKnowledgeDocumentService.editKnowledgeType(params);
          } else {
            const params = {
              name: formState.name ?? "",
              description: formState.description,
              parentId: formState.parentId,
              icon: formState.icon[0]?.id ?? null,
            };
            await cubeKnowledgeDocumentService.addKnowledgeType(params);
          }
          message.success("操作成功");
          modalApi.close();
          emit("enter");
        } catch {
          message.error("操作失败");
        } finally {
          modalApi.setState({ confirmLoading: false });
        }
      },
      onCancel: () => {
        formRenderRef.value?.resetFields();
        modalApi.close();
        emit("cancel");
      },
    });
    const isEdit = ref(false);
    const openModal = (record?: KnowledgeDocumentTypeModel, addSub?: boolean): void => {
      modalApi.open();
      isEdit.value = false;
      for (const key in formState) {
        (formState as Record<string, unknown>)[key] = undefined;
      }
      if (addSub) {
        modalApi.setState({ title: `【${record?.name}】新增下级` });
        formState.parentId = record?.id ?? null;
      } else {
        if (record) {
          isEdit.value = true;
          modalApi.setState({ title: `编辑${props.title}` });
          formState.id = record.id;
          formState.name = record.name;
          formState.description = record.description;
          formState.parentId = record.parentId;
          formState.icon = record.icon ? [record.icon] : [];
        } else {
          modalApi.setState({ title: `新增${props.title}` });
        }
      }
    };
    expose({
      openModal,
    });
    const modalSlots = {
      default: (): JSX.Element => {
        return (
          <div style={{ "max-height": "300px", "overflow-y": "auto" }}>
            <Form model={formState} ref={formRenderRef} rules={modalRules} label-col={{ style: { width: "100px" } }}>
              <FormItem label="类型名称" name="name">
                <Input v-model:value={formState.name} placeholder="请输入类型名称" />
              </FormItem>
              <FormItem label="类型备注" name="description">
                <Textarea v-model:value={formState.description} placeholder="请输类型备注" maxlength={200} />
              </FormItem>
              <FormItem label="类型图标" name="icon">
                <FileUpload
                  sceneCode={GLOBAL_SCENE_CODE.knowledgeTypeIcon}
                  v-model:value={formState.icon}
                  maxCount={1}
                  type="picture-card"
                  size={100}
                  customText="支持jpg,png,svg格式"
                  typeList={[".jpg", ".png", ".svg"]}
                />
              </FormItem>
            </Form>
          </div>
        );
      },
    };
    return (): JSX.Element => <CubeModal v-slots={modalSlots} />;
  },
});
