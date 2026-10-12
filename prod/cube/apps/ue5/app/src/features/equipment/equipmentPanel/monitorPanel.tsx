import { defineComponent, type PropType } from "vue";

import DevicePanelTemplat from "./devicePanelTemplat";
import H5Video from "@/shared-ui/panel/H5Video";

import "./monitorPanel.module.less";

export const MonitorPanel = defineComponent({
  name: "MonitorPanel",
  props: {
    deviceInfo: {
      type: Object as PropType<{ name?: string; token?: string; [key: string]: unknown }>,
      default: () => ({
        name: "设备名称",
        token: "",
      }),
    },
  },
  setup(props) {
    return (): JSX.Element => (
      <DevicePanelTemplat title={props.deviceInfo?.name || "设备名称"} class="video-monitor-dialog" width={860}>
        <div class="camera-box">
          <H5Video control={true} cameraItem={props.deviceInfo} idStr={`modal_${props.deviceInfo?.token ?? ""}`} />
        </div>
      </DevicePanelTemplat>
    );
  },
});

export default MonitorPanel;
