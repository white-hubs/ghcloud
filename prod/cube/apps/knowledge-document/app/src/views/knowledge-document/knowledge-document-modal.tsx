import { defineComponent, reactive, ref } from "vue";

import { DeptCascaderSelect, ProductSelect, FileUpload, useCubeModal } from "@ghcloud/cube-app-design";
import { GLOBAL_SCENE_CODE } from "@ghcloud/cube-file-service";
import type { KnowledgeDocumentModel } from "@ghcloud/cube-knowledge-document-service";
import { Form, FormItem, Input, InputNumber, message, type FormExpose } from "@ghcloud/cube-ui";
import type { OSSFile } from "@ghcloud/generic-component";

import { cubeKnowledgeDocumentService } from "@/api/service";
import { KnowledgeDocumentSelect } from "@/components/knowledge-document-select";

interface Props {
  title: string;
}

export const KnowledgeDocumentModal = defineComponent({
  props: ["title"],
  emits: ["enter", "cancel"],
  setup(props: Props, { emit, expose }) {
    const formRenderRef = ref<FormExpose>();
    const isReadonly = ref<boolean>(false);
    const formState = reactive<{
      id: string | null;
      name: string;
      typeId: string;
      deptId: string | null;
      productId: string | null;
      entryCount: number | null;
      files: OSSFile[];
    }>({
      id: null,
      name: "",
      typeId: "",
      deptId: null,
      productId: null,
      entryCount: 0,
      files: [],
    });
    const modalRules = {
      name: [{ required: true, message: "请输入文档名称", trigger: "blur" }],
      typeId: [{ required: true, message: "请选择文档类型", trigger: "blur" }],
      files: [{ required: true, message: "请上传文档文件", trigger: "blur" }],
    };
    const [CubeModal, modalApi] = useCubeModal({
      title: `${props.title}`,
      onConfirm: async () => {
        if (isReadonly.value) {
          modalApi.close();
          return;
        }
        try {
          modalApi.setState({ confirmLoading: true });
          await formRenderRef.value?.validate();
          const { files } = formState;
          const fileIds = files.map((item) => item.id);
          if (formState.id) {
            const params = {
              id: formState.id,
              name: formState.name ?? "",
              typeId: formState.typeId ?? "",
              deptId: formState.deptId,
              productId: formState.productId,
              entryCount: formState.entryCount,
              fileIds: fileIds,
            };
            await cubeKnowledgeDocumentService.editKnowledgeDocument(params);
          } else {
            const params = {
              name: formState.name ?? "",
              typeId: formState.typeId ?? "",
              deptId: formState.deptId,
              productId: formState.productId,
              entryCount: formState.entryCount,
              fileIds: fileIds,
            };
            await cubeKnowledgeDocumentService.addKnowledgeDocument(params);
          }
          message.success("操作成功");
          emit("enter");
          modalApi.close();
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
    const openModal = (record?: KnowledgeDocumentModel, readonly?: boolean): void => {
      modalApi.open();
      isReadonly.value = readonly ?? false;
      for (const key in formState) {
        (formState as Record<string, unknown>)[key] = undefined;
      }
      if (record) {
        modalApi.setState({ title: `${isReadonly.value ? "" : "编辑"}${props.title}` });
        formState.id = record.id;
        formState.name = record.name;
        formState.typeId = record.typeId;
        formState.deptId = record.deptId;
        formState.productId = record.productId;
        formState.entryCount = record.entryCount ?? 0;
        formState.files = record.fileList;
      } else {
        modalApi.setState({ title: `新增${props.title}` });
      }
    };
    expose({
      openModal,
    });
    const modalSlots = {
      default: (): JSX.Element => {
        return (
          <div style={{ "max-height": "500px", "overflow-y": "auto" }}>
            <Form model={formState} ref={formRenderRef} rules={modalRules} label-col={{ style: { width: "100px" } }}>
              <FormItem label="文档名称" name="name">
                <Input readonly={isReadonly.value} v-model:value={formState.name} placeholder="请输入文档名称" />
              </FormItem>
              <FormItem label="文档类型" name="typeId">
                <KnowledgeDocumentSelect readonly={isReadonly.value} v-model:value={formState.typeId} />
              </FormItem>
              <FormItem label="关联产品" name="productId">
                <ProductSelect readonly={isReadonly.value} v-model:value={formState.productId} />
              </FormItem>
              <FormItem label="所属部门" name="deptId">
                <DeptCascaderSelect readonly={isReadonly.value} v-model:value={formState.deptId} />
              </FormItem>
              <FormItem label="条目数" name="entryCount">
                <InputNumber
                  readonly={isReadonly.value}
                  v-model:value={formState.entryCount}
                  min={0}
                  style="width: 100%"
                  placeholder="请输入条目数"
                />
              </FormItem>
              <FormItem label="上传文件" name="files">
                <FileUpload
                  readonly={isReadonly.value}
                  sceneCode={GLOBAL_SCENE_CODE.knowledgeDocument}
                  v-model:value={formState.files}
                  showText={true}
                  maxCount={1}
                  type="picture-card"
                  size={100}
                  customText="支持jpg,png,svg,doc,docx,xls,xlsx,pptx,pdf,md格式,单个附件最大支持100MB"
                  typeList={[".jpg", ".png", ".svg", ".doc", ".docx", ".xls", ".xlsx", ".pptx", ".pdf", ".md"]}
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
