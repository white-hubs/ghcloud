import { computed, defineComponent } from "vue";

import { CubePlayer } from "@ghcloud/cube-player";
import { Modal } from "@ghcloud/cube-ui";

import type { EvacuationCommandState } from "../../composables/use-evacuation-command-state";
import { getVideoAccessMode } from "../../utils/video-access-mode";

import styles from "./index.module.less";

export const CameraPreviewModal = defineComponent({
  name: "CameraPreviewModal",
  props: {
    state: { type: Object as () => EvacuationCommandState, required: true },
  },
  setup(props) {
    const videoType = computed(() => getVideoAccessMode());
    const device = computed(() => props.state.cameraPreviewDevice.value);
    const deviceId = computed(() => device.value?.id ?? "");

    return (): JSX.Element => (
      <Modal
        open={props.state.cameraPreviewOpen.value}
        title={device.value?.name ?? "实时监控"}
        footer={null}
        width={860}
        destroyOnClose
        onCancel={() => props.state.closeCameraPreview()}
      >
        <div class={styles.playerWrap}>
          {deviceId.value ? (
            <CubePlayer
              key={`modal-${deviceId.value}-${device.value?.name ?? ""}`}
              deviceId={deviceId.value}
              type={videoType.value}
              h5sControl={true}
              isShowDeviceDetails={false}
            />
          ) : null}
        </div>
      </Modal>
    );
  },
});
