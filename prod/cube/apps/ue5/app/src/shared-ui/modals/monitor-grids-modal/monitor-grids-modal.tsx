import { CloseOutlined, FullscreenExitOutlined, FullscreenOutlined } from "@ant-design/icons-vue";
import { defineComponent, ref, Teleport } from "vue";

import H5Video from "@/shared-ui/panel/H5Video";

import styles from "./monitor-grids-modal.module.less";

export const MonitorGridsModal = defineComponent({
  name: "MonitorGridsModal",
  props: {
    visible: { type: Boolean, required: true, default: false },
    cameraList: { type: Array, required: true },
  },
  emits: ["update:visible"],
  setup(props, { emit }) {
    const isFullScreen = ref(false);

    const fullVideo = (): void => {
      isFullScreen.value = !isFullScreen.value;
    };

    const closeModal = (): void => {
      emit("update:visible", false);
      isFullScreen.value = false;
    };

    return (): JSX.Element => (
      <Teleport to="body">
        {props.visible && (
          <div class={isFullScreen.value ? "full-video-pop-up" : "video-pop-up"}>
            <div class="video-head">
              <div> 视频监控</div>
              <div class="video-operation">
                {!isFullScreen.value && <FullscreenOutlined style="margin-right: 10px;cursor: pointer;" onClick={fullVideo} />}
                {isFullScreen.value && <FullscreenExitOutlined style="margin-right: 10px;cursor: pointer;" onClick={fullVideo} />}
                <CloseOutlined onClick={closeModal} />
              </div>
            </div>
            <div class="xian"></div>
            <div class="video-body">
              {props.cameraList.map((item) => (
                <div class="camera-item" key={item.id}>
                  {item.id && <H5Video control={true} cameraItem={item}></H5Video>}
                </div>
              ))}
            </div>
          </div>
        )}
      </Teleport>
    );
  },
});

export default MonitorGridsModal;
