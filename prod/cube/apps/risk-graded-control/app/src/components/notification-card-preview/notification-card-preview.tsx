import { defineComponent, type PropType } from "vue";

import { Modal, Button, Space } from "@ghcloud/cube-ui";

import { NotificationCardContent } from "@/components/notification-card/notification-card-content";
import type { NotificationCardVO } from "@/types/risk";

export const NotificationCardPreview = defineComponent({
  props: {
    visible: { type: Boolean, default: false },
    card: { type: Object as PropType<NotificationCardVO | null>, default: null },
  },
  emits: ["update:visible", "print", "exportPdf"],
  setup(props, { emit }) {
    return (): JSX.Element => (
      <Modal
        visible={props.visible}
        title="风险告知卡预览"
        width="760px"
        closable={false}
        footer={
          <Space>
            <Button onClick={() => emit("update:visible", false)}>关闭</Button>
            <Button onClick={() => emit("print")}>打印</Button>
            <Button type="primary" onClick={() => emit("exportPdf")}>
              导出PDF
            </Button>
          </Space>
        }
        onCancel={() => emit("update:visible", false)}
      >
        {props.card && <NotificationCardContent card={props.card} />}
      </Modal>
    );
  },
});
