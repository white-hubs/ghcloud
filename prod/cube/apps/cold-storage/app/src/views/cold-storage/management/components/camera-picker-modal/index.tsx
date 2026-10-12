import { defineComponent, type PropType, watch } from "vue";

import { useCubeModal } from "@ghcloud/cube-app-design";
import type { ColdStoreCamera } from "@ghcloud/cube-service-interface/cold-storage";
import { Button } from "@ghcloud/cube-ui";

import "./index.less";

export const CameraPickerModal = defineComponent({
  name: "CameraPickerModal",
  props: {
    visible: {
      type: Boolean,
      required: true,
    },
    cameras: {
      type: Array as PropType<ColdStoreCamera[]>,
      required: true,
    },
    draftCodes: {
      type: Array as PropType<string[]>,
      required: true,
    },
  },
  emits: ["update:visible", "confirm", "toggleCamera"],
  setup: (props, { emit }) => {
    const [CubeModal, modalApi] = useCubeModal({
      title: "选择摄像头",
      width: "680px",
      onConfirm: () => emit("confirm"),
      onCancel: () => {
        emit("update:visible", false);
        modalApi.close();
      },
    });

    watch(
      () => props.visible,
      (visible) => {
        if (visible) {
          modalApi.open();
          return;
        }
        modalApi.close();
      },
    );

    return (): JSX.Element => (
      <CubeModal
        v-slots={{
          default: (): JSX.Element => (
            <>
              <p class="muted pick-count">已选 {props.draftCodes.length} 个，最多4个</p>
              <div class="camera-pick-grid">
                {props.cameras.map((camera) => (
                  <Button
                    key={camera.code}
                    class={props.draftCodes.includes(camera.code) ? "camera-pick active" : "camera-pick"}
                    onClick={() => emit("toggleCamera", camera.code)}
                  >
                    <strong>📹</strong>
                    <b>{camera.code}</b>
                    <span>{camera.name}</span>
                    <small>
                      {camera.location} · {camera.online ? "在线" : "离线"}
                    </small>
                    {props.draftCodes.includes(camera.code) && <em>✓ 已选</em>}
                  </Button>
                ))}
              </div>
            </>
          ),
        }}
      />
    );
  },
});
