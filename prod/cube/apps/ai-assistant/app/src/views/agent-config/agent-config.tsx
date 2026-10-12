import { defineComponent, onMounted, reactive, ref } from "vue";
import { useRoute } from "vue-router";

import { CubeLayout, FileUpload } from "@ghcloud/cube-app-design";
import type { FileVOState } from "@ghcloud/cube-protocol";
import { Button, Checkbox, Form, Input, message, AntModal, Space } from "@ghcloud/cube-ui";
import FormItem from "@ghcloud/cube-ui/src/components/form-item/form-item";

import { addAgent, deleteAgent, getAgentList, updateAgent } from "@/api/server";
import type { Agent } from "@/api/type";

export const AgentConfig = defineComponent({
  name: "AgentConfig",
  setup() {
    const route = useRoute();
    const id = route.query.id as string;
    const avatarData = ref<FileVOState[]>([]);
    const formRef = ref();
    const formState = reactive<{
      id: string;
      name: string;
      avatar: FileVOState | null;
      description: string;
      platform: string;
      flowId: string;
      useInUE: boolean;
    }>({
      id: "",
      name: "",
      avatar: null,
      description: "",
      platform: "",
      flowId: "",
      useInUE: false,
    });
    const rules = {
      name: [{ required: true, message: "请输入智能体名称" }],
      avatar: [{ required: true, message: "请上传图标" }],
      description: [{ required: true, message: "请输入描述" }],
      platform: [{ required: true, message: "请输入平台名称" }],
      flowId: [{ required: true, message: "请输入流程ID" }],
    };
    const guid = (): string => {
      return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
    };
    const subLoading = ref(false);
    const save = async (): Promise<void> => {
      try {
        subLoading.value = true;
        await formRef.value?.validate();
        if (formState.id) {
          await updateAgent(formState as Agent);
        } else {
          const data = {
            ...formState,
            id: guid(),
          };
          await addAgent(data as Agent);
        }
        message.success("保存成功");
        history.back();
      } catch {
        message.error("保存失败");
      } finally {
        subLoading.value = false;
      }
    };

    onMounted(async () => {
      if (id) {
        formState.id = id;
        const agentList = await getAgentList();
        const find = agentList.find((e) => e.id === id);
        if (find) {
          avatarData.value = [find.avatar];
          formState.name = find.name;
          formState.avatar = find.avatar;
          formState.description = find.description;
          formState.platform = find.platform;
          formState.flowId = find.flowId;
          formState.useInUE = find.useInUE;
        }
      }
    });

    return (): JSX.Element => (
      <CubeLayout title={id ? "编辑" : "创建"}>
        {{
          "layout-content": () => (
            <Form style={{ width: "50%", marginTop: "20px" }} model={formState} rules={rules} ref={formRef}>
              <Space align="start">
                <FormItem label="智能体名称" name="name">
                  <Input v-model:value={formState.name} />
                </FormItem>
                <FormItem label="图标" name="avatar">
                  <FileUpload
                    type="picture-card"
                    accept="image/*"
                    customText=""
                    showText={false}
                    v-model:value={avatarData.value}
                    maxCount={1}
                    onUpdate:value={(val) => {
                      formState.avatar = val[0];
                      formRef.value?.clearValidate();
                    }}
                  />
                </FormItem>
              </Space>
              <FormItem label="描述" name="description">
                <Input v-model:value={formState.description} maxlength={100} />
              </FormItem>
              <FormItem label="平台名称" name="platform">
                <Input v-model:value={formState.platform} />
              </FormItem>
              <FormItem label="流程ID" name="flowId">
                <Input v-model:value={formState.flowId} maxlength={999} />
              </FormItem>
              <FormItem label="运用到孪生端" name="useInUE">
                <Checkbox v-model:checked={formState.useInUE} />
              </FormItem>
            </Form>
          ),
          "footer-page": () => (
            <Space>
              <Button
                onClick={() => {
                  history.back();
                }}
              >
                返回
              </Button>
              {id && (
                <Button
                  type="primary"
                  danger
                  onClick={() => {
                    AntModal.confirm({
                      title: "删除智能体",
                      content: "删除智能体后，智能体将无法使用",
                      okText: "删除",
                      centered: true,
                      onOk: async () => {
                        await deleteAgent(id);
                        history.back();
                      },
                    });
                  }}
                >
                  删除
                </Button>
              )}
              <Button onClick={save} type="primary" loading={subLoading.value}>
                保存
              </Button>
            </Space>
          ),
        }}
      </CubeLayout>
    );
  },
});
