import { Modal } from "ant-design-vue/es";
import { defineComponent } from "vue";

interface Props {
  visible: boolean;
  width: string;
  title: string;
  confirmLoading: boolean;
  destroyOnClose: boolean;
  maskClosable: boolean;
  okText: string;
  cancelText: string;
  footer?: string;
  closable?: boolean;
  wrapClassName?: string;
  okButtonProps?: Record<string, any>;
  cancelButtonProps?: Record<string, any>;
}

export default defineComponent({
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    width: {
      type: String,
      default: "800px",
    },
    title: {
      type: String,
      default: "",
    },
    confirmLoading: {
      type: Boolean,
      default: false,
    },
    destroyOnClose: {
      type: Boolean,
      default: false,
    },
    okButtonProps: {
      type: Object,
      default: {},
    },
    cancelButtonProps: {
      type: Object,
      default: {},
    },
    okText: {
      type: String,
      default: "确定",
    },
    cancelText: {
      type: String,
      default: "取消",
    },
    footer: {
      type: String,
    },
    maskClosable: {
      type: Boolean,
      default: false,
    },
    wrapClassName: {
      type: String,
      default: "",
    },
    closable: {
      type: Boolean,
      default: true,
    },
  },
  emits: ["cancel", "update:visible", "ok"],
  setup(props: Props, { emit, slots, attrs }) {
    const cancel = (): void => {
      emit("cancel");
    };
    const ok = (): void => {
      emit("ok");
    };

    return (): JSX.Element => (
      <Modal
        {...attrs}
        closable={props.closable}
        centered
        open={props.visible}
        width={props.width}
        title={props.title}
        confirmLoading={props.confirmLoading}
        destroyOnClose={props.destroyOnClose}
        maskClosable={props.maskClosable}
        okText={props.okText}
        cancelText={props.cancelText}
        footer={props.footer}
        wrapClassName={props.wrapClassName}
        okButtonProps={props.okButtonProps}
        cancelButtonProps={props.cancelButtonProps}
        onCancel={cancel}
        onOk={ok}
        onUpdate:open={(e: Event) => {
          emit("update:visible", e);
        }}
      >
        {slots}
      </Modal>
    );
  },
});
