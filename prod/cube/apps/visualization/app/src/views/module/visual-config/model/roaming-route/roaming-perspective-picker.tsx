import { defineComponent, nextTick, onBeforeUnmount, ref, type PropType } from "vue";

import { Empty, Spin, message } from "@ghcloud/cube-ui";

import type { ModelEntry } from "../types";
import { isThreeEntry, isUe5Entry } from "../utils/entry";

import styles from "./roaming-route.module.less";

type VisualSdk = typeof import("@ghcloud/cube-visual-sdk");
type GhyThreeInstance = InstanceType<VisualSdk["GhyThree"]>;
type UeClientInstance = InstanceType<VisualSdk["UeClient"]>;

export interface RoamingPerspectivePickerExpose {
  capturePerspective: () => void;
}

const stringifyPerspective = (value: unknown): string => {
  if (typeof value === "string") {
    return value;
  }
  return JSON.stringify(value);
};

const parsePerspective = (value: string): unknown => {
  if (!value.trim()) {
    return undefined;
  }
  try {
    return JSON.parse(value);
  } catch {
    return undefined;
  }
};

/** 在点位弹窗内加载当前渲染模型，并将模型中的实时相机视角回传给表单。 */
export const RoamingPerspectivePicker = defineComponent({
  name: "RoamingPerspectivePicker",
  props: {
    entry: {
      type: String as PropType<ModelEntry>,
      required: true,
    },
    modelUrl: {
      type: String,
      default: "",
    },
    perspective: {
      type: String,
      default: "",
    },
  },
  emits: {
    select: (_value: string) => true,
  },
  setup(props, { emit, expose }) {
    const containerRef = ref<HTMLElement>();
    const loading = ref(false);
    const loadError = ref("");
    const containerId = `roaming-perspective-${Math.random().toString(36).slice(2)}`;
    let threeInstance: GhyThreeInstance | null = null;
    let ueClient: UeClientInstance | null = null;
    let ueConnectedHandler: (() => void) | null = null;

    const capturePerspective = (): void => {
      if (!props.modelUrl) {
        message.warning("当前区域未配置模型，无法获取视角");
        return;
      }
      if (isUe5Entry(props.entry)) {
        ueClient?.send("getCameraView", null, (cameraView: unknown) => {
          emit("select", stringifyPerspective(cameraView));
          message.success("已获取当前模型视角");
        });
        return;
      }
      if (isThreeEntry(props.entry)) {
        try {
          if (!threeInstance) {
            message.warning("模型尚未加载完成");
            return;
          }
          emit("select", JSON.stringify(threeInstance.getCameraParams()));
          message.success("已获取当前模型视角");
        } catch {
          message.warning("模型尚未加载完成");
        }
      }
    };

    const initUe5 = async (): Promise<void> => {
      if (!containerRef.value) {
        return;
      }
      const { UeClient } = await import("@ghcloud/cube-visual-sdk");
      ueClient = UeClient.getInstance();
      ueClient.isReLoad = true;
      ueConnectedHandler = () => {
        if (!containerRef.value) {
          return;
        }
        loading.value = false;
        ueClient?.send("changeResolution", {
          width: Math.max(containerRef.value.clientWidth, 960),
          height: Math.max(containerRef.value.clientHeight, 460),
        });
        ueClient?.send("enableEditing");
        if (props.perspective.trim()) {
          ueClient?.send("changeCameraView", parsePerspective(props.perspective) ?? props.perspective);
        }
      };
      ueClient.onConnected(ueConnectedHandler);
      ueClient.loadUE5(containerRef.value, props.modelUrl);
    };

    const initThree = async (): Promise<void> => {
      const { GhyThree } = await import("@ghcloud/cube-visual-sdk");
      threeInstance = new GhyThree({
        elementId: containerId,
        enabledMouseControl: true,
        enabledKeyBoardControl: true,
        enabledControlRange: false,
        enabledRoamEdit: true,
      });
      await threeInstance.initModel(props.modelUrl, parsePerspective(props.perspective) as never);
    };

    const initModel = async (): Promise<void> => {
      if (!props.modelUrl) {
        return;
      }
      loading.value = true;
      loadError.value = "";
      await nextTick();
      try {
        if (isUe5Entry(props.entry)) {
          await initUe5();
        } else if (isThreeEntry(props.entry)) {
          await initThree();
          loading.value = false;
        }
      } catch {
        loading.value = false;
        loadError.value = "模型加载失败，请检查模型地址或网络连接";
      }
    };

    const dispose = (): void => {
      if (ueClient) {
        try {
          ueClient.send("disableEditing");
          ueClient.ue5Close();
        } catch {
          // 模型连接未完成时直接关闭弹窗无需额外处理。
        }
        if (ueConnectedHandler) {
          const index = ueClient.onConnectedCallbacks.indexOf(ueConnectedHandler);
          if (index >= 0) {
            ueClient.onConnectedCallbacks.splice(index, 1);
          }
        }
      }
      try {
        threeInstance?.destroyScene();
      } catch {
        // 重复销毁或模型尚未完成初始化时忽略。
      }
      threeInstance = null;
      ueClient = null;
      ueConnectedHandler = null;
    };

    expose<RoamingPerspectivePickerExpose>({ capturePerspective });
    void initModel();
    onBeforeUnmount(dispose);

    return () => (
      <div class={styles.perspectivePicker}>
        <div class={styles.previewHeader}>
          <div>
            <div class={styles.previewTitle}>模型视角选点</div>
            <div class={styles.previewDescription}>在模型中拖动、缩放至目标位置，然后点击“获取视角”回填当前相机参数</div>
          </div>
          <span class={styles.previewStatus}>{isUe5Entry(props.entry) ? "UE5 实时模型" : "WebGPU 实时模型"}</span>
        </div>
        <div ref={containerRef} id={containerId} class={styles.modelPreview}>
          {!props.modelUrl ? (
            <div class={styles.previewPlaceholder}>
              <Empty description="当前区域未配置模型，请先在引入模型中完成配置" />
            </div>
          ) : loadError.value ? (
            <div class={styles.previewPlaceholder}>
              <Empty description={loadError.value} />
            </div>
          ) : undefined}
          {loading.value && props.modelUrl ? (
            <div class={styles.previewLoading}>
              <Spin spinning tip="模型加载中…" />
            </div>
          ) : undefined}
        </div>
      </div>
    );
  },
});

export default RoamingPerspectivePicker;
