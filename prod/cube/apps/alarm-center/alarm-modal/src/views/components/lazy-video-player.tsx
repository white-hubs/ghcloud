import { defineComponent, onBeforeUnmount, onMounted, ref, watch, type PropType } from "vue";

import { CubePlayer } from "@ghcloud/cube-player";

import styles from "../alarm-modal.module.less";

const MAX_ACTIVE_STREAMS = 4;
const activeStreamSlots = new Map<string, () => void>();

const acquireStreamSlot = (streamKey: string, revoke: () => void): boolean => {
  if (activeStreamSlots.has(streamKey)) {
    return true;
  }
  if (activeStreamSlots.size >= MAX_ACTIVE_STREAMS) {
    const oldestKey = activeStreamSlots.keys().next().value as string | undefined;
    if (oldestKey) {
      activeStreamSlots.get(oldestKey)?.();
      activeStreamSlots.delete(oldestKey);
    }
  }
  activeStreamSlots.set(streamKey, revoke);
  return true;
};

const releaseStreamSlot = (streamKey: string): void => {
  activeStreamSlots.delete(streamKey);
};

type AlarmVideo = {
  deviceId: string;
  deviceName: string;
  token: string;
};

export const LazyVideoPlayer = defineComponent({
  props: {
    streamKey: {
      type: String,
      required: true,
    },
    deviceId: {
      type: String,
      required: true,
    },
    onPlayerError: {
      type: Function as PropType<(deviceId: string) => void>,
      default: undefined,
    },
  },
  setup(props) {
    const rootRef = ref<HTMLElement>();
    const isIntersecting = ref(false);
    const hasStreamSlot = ref(false);
    let observer: IntersectionObserver | null = null;

    const revokeStreamSlot = (): void => {
      if (!hasStreamSlot.value) {
        return;
      }
      hasStreamSlot.value = false;
      releaseStreamSlot(props.streamKey);
    };

    const syncStreamSlot = (): void => {
      if (!isIntersecting.value) {
        revokeStreamSlot();
        return;
      }
      if (hasStreamSlot.value) {
        return;
      }
      const granted = acquireStreamSlot(props.streamKey, revokeStreamSlot);
      hasStreamSlot.value = granted;
    };

    onMounted(() => {
      if (!rootRef.value) {
        return;
      }
      observer = new IntersectionObserver(
        (entries) => {
          isIntersecting.value = entries.some((entry) => entry.isIntersecting);
          syncStreamSlot();
        },
        { threshold: 0.2, rootMargin: "0px" },
      );
      observer.observe(rootRef.value);
    });

    onBeforeUnmount(() => {
      observer?.disconnect();
      observer = null;
      revokeStreamSlot();
    });

    watch(
      () => props.streamKey,
      () => {
        revokeStreamSlot();
        syncStreamSlot();
      },
    );

    return (): JSX.Element => (
      <div ref={rootRef} class={styles["video-container"]} style="width:100%;height:100%;min-height:120px;">
        {hasStreamSlot.value && props.deviceId ? (
          <CubePlayer h5sControl={true} device-id={props.deviceId} onError={() => props.onPlayerError?.(props.deviceId)} />
        ) : (
          <div class={styles["video-fallback-empty"]}>
            <div>{isIntersecting.value ? "视频加载中..." : ""}</div>
          </div>
        )}
      </div>
    );
  },
});

export const resetLazyVideoStreamSlots = (): void => {
  activeStreamSlots.forEach((revoke) => revoke());
  activeStreamSlots.clear();
};

export type { AlarmVideo };
