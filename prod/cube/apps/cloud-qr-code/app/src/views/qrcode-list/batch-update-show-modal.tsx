import { useCubeModal } from "@ghcloud/cube-app-design";
import { Form, FormItem, message, Switch, type FormExpose } from "@ghcloud/cube-ui";
import { defineComponent, reactive, ref } from "vue";

interface Props {
  title: string;
}

export const BatchUpdateShowModal = defineComponent({
  props: ["title"],
  emits: ["enter", "cancel"],
  setup(props: Props, { emit, expose }) {
    const formRenderRef = ref<FormExpose>();
    const formState = reactive<{
      qrCodeIds: string[];
      enabled: boolean;
    }>({
      qrCodeIds: [],
      enabled: true,
    });
    const modalRules = {
      enabled: [{ required: true, message: "二维码开关状态", trigger: "blur" }],
    };
    const [CubeModal, modalApi] = useCubeModal({
      title: `${props.title ?? "批量修改二维码开关状态"}`,
      onConfirm: async () => {
        try {
          modalApi.setState({ confirmLoading: true });
          await formRenderRef.value?.validate();
          const payload = {
            qrCodeIds: formState.qrCodeIds,
            enabled: formState.enabled,
          };
          //todo 批量修改二维码状态
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
    const openModal = (ids: string[]): void => {
      modalApi.setState({
        title: "批量修改二维码启用/禁用",
      });
      modalApi.open();
      formState.qrCodeIds = ids;
    };
    expose({
      openModal,
    });
    const modalSlots = {
      default: (): JSX.Element => (
        <div style={{ "max-height": "500px", "overflow-y": "auto" }}>
          <Form model={formState} ref={formRenderRef} rules={modalRules} label-col={{ style: { width: "100px" } }}>
            <FormItem label={"启用/禁用"} name="enabled">
              <Switch v-model:checked={formState.enabled} checkedChildren="启用" unCheckedChildren="禁用" />
            </FormItem>
          </Form>
        </div>
      ),
    };
    return (): JSX.Element => <CubeModal v-slots={modalSlots} />;
  },
});
