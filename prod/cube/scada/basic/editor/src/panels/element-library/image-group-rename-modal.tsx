import { Form, FormItem, Input, Modal, message } from "ant-design-vue";
import { defineComponent, shallowRef, watch } from "vue";

export const ImageGroupRenameModal = defineComponent({
  name: "ImageGroupRenameModal",
  props: {
    open: { type: Boolean, default: false },
    saving: { type: Boolean, default: false },
    currentGroup: { type: String, default: "" },
  },
  emits: ["cancel", "submit"],
  setup(props, { emit }) {
    const groupName = shallowRef("");

    watch(
      () => props.open,
      (open) => {
        if (open) {
          groupName.value = props.currentGroup;
        }
      },
    );

    function submit(): void {
      const normalizedGroupName = groupName.value.trim();
      if (!normalizedGroupName) {
        void message.warning("请输入分组名称");
        return;
      }
      emit("submit", normalizedGroupName);
    }

    return () => (
      <Modal
        open={props.open}
        title="重命名图库分组"
        okText="保存"
        cancelText="取消"
        confirmLoading={props.saving}
        onOk={submit}
        onCancel={() => emit("cancel")}
      >
        <Form layout="vertical" style={{ marginTop: "16px" }}>
          <FormItem label="分组名称" required>
            <Input
              value={groupName.value}
              maxlength={60}
              placeholder="请输入新的分组名称"
              onChange={(event: any) => (groupName.value = event.target?.value ?? "")}
              onPressEnter={submit}
            />
          </FormItem>
        </Form>
      </Modal>
    );
  },
});
