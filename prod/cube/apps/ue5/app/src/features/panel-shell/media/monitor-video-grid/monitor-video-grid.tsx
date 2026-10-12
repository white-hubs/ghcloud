import { defineComponent, type PropType } from "vue";

import H5Video from "@/shared-ui/panel/H5Video";
import NoData from "@/shared-ui/panel/noData";
import {
  getMonitorCameraId,
  getMonitorCameraKey,
  type MonitorCameraItem,
  type MonitorPlaybackErrorPayload,
} from "@/visualization-core/hooks/use-monitor-camera-list";

import "./monitor-video-grid.module.less";

export const MonitorVideoGrid = defineComponent({
  name: "MonitorVideoGrid",
  props: {
    cameraList: {
      type: Array as PropType<Array<MonitorCameraItem | null>>,
      default: () => [],
    },
    idPrefix: { type: String, default: "" },
    isZoom: { type: Boolean, default: false },
    externalRecovery: { type: Boolean, default: true },
    resolveKey: {
      type: Function as PropType<(item: MonitorCameraItem, index: number) => string>,
      default: undefined,
    },
  },
  emits: ["select", "error"],
  setup(props, { emit }) {
    const resolveKey = (item: MonitorCameraItem, index: number): string => {
      if (props.resolveKey) {
        return props.resolveKey(item, index);
      }
      return getMonitorCameraKey(item, props.idPrefix);
    };

    const resolveSlotKey = (index: number): string => `${props.idPrefix}monitor-slot-${index}`;

    const resolveIdStr = (item: MonitorCameraItem, index: number): string => {
      const base = `${item.token ?? getMonitorCameraId(item) ?? "cam"}${index}`;
      return props.idPrefix ? `${base}-${props.idPrefix}` : base;
    };

    const selectCamera = (item: MonitorCameraItem | null): void => {
      if (item) {
        emit("select", item);
      }
    };

    const onError = (id: string | number | undefined, payload?: MonitorPlaybackErrorPayload): void => {
      const key = id != null && id !== "" ? String(id) : "";
      if (!key) return;
      emit("error", key, payload);
    };

    return () => (
      <div class={["monitor-video-grid", props.isZoom ? "is-zoom" : ""]}>
        <div class="video-body" data-no-zoom>
          {props.cameraList.length === 1 ? (
            <div class="camera-item">
              <div class={["camera-frame", !props.cameraList[0] ? "is-empty" : ""]} onClick={() => selectCamera(props.cameraList[0])}>
                {props.cameraList[0] ? (
                  <H5Video
                    key={resolveKey(props.cameraList[0], 0)}
                    cameraItem={props.cameraList[0]}
                    idStr={resolveIdStr(props.cameraList[0], 0)}
                    onError={onError}
                  />
                ) : (
                  <NoData />
                )}
              </div>
            </div>
          ) : props.cameraList.length > 0 ? (
            <div class="group">
              {props.cameraList.map((item, index) => (
                <div class={["camera-frame", !item ? "is-empty" : ""]} key={resolveSlotKey(index)} onClick={() => selectCamera(item)}>
                  {item ? (
                    <H5Video key={resolveKey(item, index)} cameraItem={item} idStr={resolveIdStr(item, index)} onError={onError} />
                  ) : (
                    <NoData />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div class="group empty-group">
              <NoData />
            </div>
          )}
        </div>
      </div>
    );
  },
});

export default MonitorVideoGrid;
