import { CloseOutlined } from "@ant-design/icons-vue";
import { computed, defineComponent, type PropType } from "vue";

import bus from "@/infrastructure/utils/bus";

import "./devicePanelTemplat.module.less";

export const DevicePanelTemplat = defineComponent({
  name: "DevicePanelTemplat",
  inheritAttrs: false,
  props: {
    title: { type: String, required: false, default: "设备名称" },
    color: { type: String, required: false, default: "" },
    /** 弹窗宽度，与卡片放大弹窗对齐时可传 860 */
    width: { type: [String, Number] as PropType<string | number>, required: false, default: 1000 },
  },
  setup(props, { slots, attrs }) {
    const titleStyle = computed(() => (props.color ? { color: props.color } : undefined));

    const panelStyle = computed(() => {
      const widthValue = typeof props.width === "number" ? `${props.width}px` : props.width;
      return {
        width: widthValue,
        maxWidth: "90vw",
      };
    });

    const close = (): void => {
      bus.emit("closeDevicePanel");
    };

    return (): JSX.Element => (
      <div class={["sub-panel", "device-panel-shell", attrs.class as string | string[] | undefined]} style={panelStyle.value}>
        <div class="sub-panel-header flex-between">
          <div class="title" style={titleStyle.value}>
            {props.title}
          </div>
          <div class="close flex-center" onClick={close}>
            <CloseOutlined />
          </div>
        </div>
        <div class="sub-panel-content">{slots.default?.()}</div>
      </div>
    );
  },
});

export default DevicePanelTemplat;
