import { cubeDailyTaskService } from "@/api/server";
import { DailyTaskResultItem, useCubeModal } from "@ghcloud/cube-app-design";
import { getCurrentDailyType, type TaskResultModel } from "@ghcloud/cube-daily-task-service";
import { Form, FormItem, Input, Switch, message, type FormExpose } from "@ghcloud/cube-ui";
import { defineComponent, reactive, ref } from "vue";

interface Props {
  title: string;
}

export const TaskResultModal = defineComponent({
  props: ["title"],
  emits: ["enter", "cancel"],
  setup(props: Props, { emit, expose }) {
    const formRenderRef = ref<FormExpose>();
    const createResultItemRef = ref<{ checkResultList: () => Promise<unknown> }>();
    const formState = reactive<{
      id?: string | undefined;
      name: string | undefined;
      enable: boolean;
      resultLabelList: {
        label: string;
        value: string;
        errorFlag: boolean;
      }[];
    }>({
      id: undefined,
      name: undefined,
      enable: true,
      resultLabelList: [],
    });
    const modalRules = {
      name: [{ required: true, message: "请输入结果名称", trigger: "blur" }],
      resultLabelList: [
        { required: true, validator: async (): Promise<unknown> => createResultItemRef.value?.checkResultList(), trigger: "blur" },
      ],
    };
    const [CubeModal, modalApi] = useCubeModal({
      title: `${props.title}`,
      onConfirm: async () => {
        await formRenderRef.value?.validate();
        try {
          modalApi.setState({ confirmLoading: true });
          const params = {
            dailyType: getCurrentDailyType(),
            name: formState.name || "",
            enable: formState.enable || true,
            resultLabelList: formState.resultLabelList,
          };
          if (formState.id) {
            await cubeDailyTaskService.updateDailyTaskResult({
              id: formState.id,
              ...params,
            });
          } else {
            await cubeDailyTaskService.addDailyTaskResult(params);
          }
          message.success("操作成功");
          emit("enter");
          modalApi.close();
        } catch {
        } finally {
          modalApi.setState({ confirmLoading: false });
        }
      },
      onCancel: () => {
        formRenderRef.value?.resetFields();
        emit("cancel");
        modalApi.close();
      },
    });
    const openModal = (record?: TaskResultModel): void => {
      modalApi.open();
      for (const key in formState) {
        (formState as Record<string, unknown>)[key] = undefined;
      }
      if (record) {
        modalApi.setState({ title: `编辑${props.title}` });
        Object.assign(formState, record);
      } else {
        modalApi.setState({ title: `新增${props.title}` });
        formState.enable = true;
      }
    };
    expose({
      openModal,
    });
    const modalSlots = {
      default: (): JSX.Element => (
        <Form model={formState} ref={formRenderRef} rules={modalRules} label-col={{ style: { width: "80px" } }}>
          <FormItem label="结果名称" name="name">
            <Input
              v-model:value={formState.name}
              placeholder="请输入结果名称"
              onKeydown={(e: KeyboardEvent): void => {
                if (e.key === " " || e.code === "Space") {
                  e.preventDefault();
                }
              }}
              onUpdate:value={(v: string): void => {
                formState.name = (v ?? "").replace(/\s+/g, "");
              }}
            />
          </FormItem>
          <FormItem label="状态" name="enable">
            <Switch v-model:value={formState.enable} />
          </FormItem>
          <FormItem label="结果项" name="resultLabelList">
            <DailyTaskResultItem ref={createResultItemRef} v-model:value={formState.resultLabelList} />
          </FormItem>
        </Form>
      ),
    };
    return (): JSX.Element => <CubeModal v-slots={modalSlots} />;
  },
});
