import { cubeGridManagementService } from "@/api/server";
import type { ModelConfig } from "@ghcloud/cube-grid-management-service";
import { CubeGridVis } from "@ghcloud/cube-grid-vis-sdk";
import { defineComponent, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";

export const ModelRender = defineComponent({
  props: {
    areaId: {
      type: String,
      default: "",
    },
    pitchDegrees: {
      type: Number,
      default: 0,
    },
    smartCameraPaddingFactor: {
      type: Number,
      default: 0.5,
    },
  },
  emits: ["labelClick"],
  setup(props, { emit }) {
    const showError = ref(false);
    const modelConfig = ref<ModelConfig>({} as ModelConfig);
    const canvasDom = ref<HTMLCanvasElement>();
    let webglInstance: CubeGridVis;

    watch(
      () => props.areaId,
      (newVal) => {
        if (newVal) {
          renderCanvas();
        }
      },
    );

    async function initModel() {
      if (!webglInstance) {
        const canvas = canvasDom.value as HTMLCanvasElement;
        webglInstance = new CubeGridVis(canvas, {
          smartCameraPaddingFactor: props.smartCameraPaddingFactor,
          pitchDegrees: props.pitchDegrees,
        });
        await webglInstance.init();
        webglInstance.on("label-click:*", ({ data }) => {
          emit("labelClick", data.labelText);
        });
      }
    }

    async function renderCanvas() {
      const findConfig = modelConfig.value?.three.modelServer.find((item) => item.area.includes(props.areaId));
      if (findConfig) {
        await webglInstance.loadModel(findConfig.url);
        webglInstance.addLabelsToSubGrids();
        return;
      }
      webglInstance.showError("当前区域无模型配置");
    }

    onMounted(() => {
      cubeGridManagementService.getGridModelVisualizationConfig().then((res) => {
        if (!res) {
          showError.value = true;
        }
        modelConfig.value = res as ModelConfig;
        nextTick(async () => {
          await initModel();
          props.areaId && renderCanvas();
        });
      });
    });

    onBeforeUnmount(() => {
      webglInstance?.dispose();
    });

    return () => <canvas ref={canvasDom} style="width: 100%; height: 100%;outline: none"></canvas>;
  },
});
