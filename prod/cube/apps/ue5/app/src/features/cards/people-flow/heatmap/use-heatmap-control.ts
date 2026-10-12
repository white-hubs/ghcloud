import { ref, onMounted, watch } from "vue";

import { CubeDictionaryService } from "@ghcloud/cube-dictionary-service";

import { peopleFlowHeatmapManager } from "@/features/cards/people-flow/heatmap/people-flow-heatmap-runtime";

export const useHeatmapControl = () => {
  const showHeatmapCheckbox = ref(false);
  const isHeatmapEnabled = ref(false);

  const getDictionary = async (): Promise<void> => {
    try {
      const res = await new CubeDictionaryService().getSysDictionaryByCodeAndItemCode({
        itemCode: "FRONTEND_CONFIG",
        code: "bimops-manage-web",
      });
      if (res && res.variable) {
        try {
          const config = JSON.parse(res.variable);
          if (config?.feature?.switchModelOptions?.includes("heatmap")) {
            showHeatmapCheckbox.value = true;
            isHeatmapEnabled.value = true;
          }
        } catch (error) {
          console.error("[people-flow-heatmap] failed to parse heatmap feature config", { error });
        }
      }
    } catch (error) {
      console.error("[people-flow-heatmap] failed to load heatmap feature config", { error });
    }
  };

  watch(isHeatmapEnabled, (enabled) => {
    peopleFlowHeatmapManager.setEnabled(enabled);
  });

  onMounted(() => {
    void getDictionary();
  });

  return {
    showHeatmapCheckbox,
    isHeatmapEnabled,
  };
};
