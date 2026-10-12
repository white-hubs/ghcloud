import { AutoComplete, Form, FormItem, Input, Modal, message } from "ant-design-vue";
import { computed, defineComponent, shallowRef, watch, type PropType } from "vue";

export interface ImageEditPayload {
  label: string;
  group: string;
}

export const ImageEditModal = defineComponent({
  name: "ImageEditModal",
  props: {
    open: { type: Boolean, default: false },
    saving: { type: Boolean, default: false },
    currentLabel: { type: String, default: "" },
    currentGroup: { type: String, default: "" },
    groups: { type: Array as PropType<string[]>, default: () => [] },
  },
  emits: ["cancel", "submit"],
  setup(props, { emit }) {
    const label = shallowRef("");
    const group = shallowRef("");
    const groupOptions = computed(() => props.groups.map((item) => ({ value: item })));

    watch(
      () => props.open,
      (open) => {
        if (!open) return;
        label.value = props.currentLabel;
        group.value = props.currentGroup;
      },
    );

    function submit(): void {
      const normalizedLabel = label.value.trim();
      if (!normalizedLabel) {
        void message.warning("请输入图片名称");
        return;
      }
      emit("submit", {
        label: normalizedLabel,
        group: group.value.trim(),
      } satisfies ImageEditPayload);
    }

    return () => (
      <Modal
        open={props.open}
        title="编辑图片"
        okText="保存"
        cancelText="取消"
        confirmLoading={props.saving}
        onOk={submit}
        onCancel={() => emit("cancel")}
      >
        <Form layout="vertical" style={{ marginTop: "16px" }}>
          <FormItem label="图片名称" required>
            <Input
              value={label.value}
              maxlength={60}
              placeholder="用于图库中显示"
              onChange={(event: any) => (label.value = event.target?.value ?? "")}
            />
          </FormItem>
          <FormItem label="图库分组">
            <AutoComplete
              value={group.value}
              options={groupOptions.value}
              placeholder="选择已有分组或输入新分组；留空归入未分组"
              onChange={(value) => (group.value = value == null ? "" : String(value))}
            />
          </FormItem>
        </Form>
      </Modal>
    );
  },
});
