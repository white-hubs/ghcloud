import { message } from "ant-design-vue";
import { computed, ref, type ComputedRef, type InjectionKey, type Ref } from "vue";

import { getVisualModelConfiguration, saveVisualModelConfiguration } from "@ghcloud/cube-services-client/visualization.client";

import { createDefaultModelConfig, parseModelConfiguration, type ModelConfig } from "../types";
import { useAuthRequest } from "@/hooks/auth-request";

export interface ModelConfigurationApi {
  loading: Ref<boolean>;
  saving: Ref<boolean>;
  loaded: Ref<boolean>;
  dirty: Ref<boolean>;
  modelConfig: Ref<ModelConfig>;
  entryLabel: ComputedRef<string>;
  load: () => Promise<void>;
  save: () => Promise<boolean>;
  markDirty: () => void;
  resetLocal: () => void;
}

export const MODEL_CONFIGURATION_KEY: InjectionKey<ModelConfigurationApi> = Symbol("MODEL_CONFIGURATION");

const ENTRY_LABEL: Record<string, string> = {
  views: "UE5",
  "views-2d": "二维组态",
  "views-gis": "WebGIS",
  "views-3d": "WebGPU",
  "views-three": "WebGL",
};

/**
 * 模型配置 JSON blob 的加载 / 保存（各模型 Tab 共用）。
 */
export const useModelConfiguration = (projectId: Ref<string> | ComputedRef<string>): ModelConfigurationApi => {
  const loading = ref(false);
  const saving = ref(false);
  const loaded = ref(false);
  const dirty = ref(false);
  const modelConfig = ref<ModelConfig>(createDefaultModelConfig());

  const entryLabel = computed(() => ENTRY_LABEL[modelConfig.value.entry] ?? modelConfig.value.entry ?? "--");

  const load = async (): Promise<void> => {
    const id = projectId.value;
    if (!id) {
      modelConfig.value = createDefaultModelConfig();
      loaded.value = false;
      return;
    }
    loading.value = true;
    try {
      const result = await useAuthRequest(() => getVisualModelConfiguration(id));
      modelConfig.value = parseModelConfiguration(result.modelConfiguration);
      dirty.value = false;
      loaded.value = true;
    } catch {
      message.error("加载模型配置失败");
      modelConfig.value = createDefaultModelConfig();
      loaded.value = false;
    } finally {
      loading.value = false;
    }
  };

  const save = async (): Promise<boolean> => {
    const id = projectId.value;
    if (!id) {
      message.warning("缺少项目 ID");
      return false;
    }
    saving.value = true;
    try {
      await useAuthRequest(() =>
        saveVisualModelConfiguration({
          projectId: id,
          modelConfiguration: JSON.stringify(modelConfig.value),
        }),
      );
      dirty.value = false;
      message.success("保存成功");
      return true;
    } catch {
      message.error("保存模型配置失败");
      return false;
    } finally {
      saving.value = false;
    }
  };

  const markDirty = (): void => {
    dirty.value = true;
  };

  const resetLocal = (): void => {
    modelConfig.value = createDefaultModelConfig();
    dirty.value = false;
    loaded.value = false;
  };

  return {
    loading,
    saving,
    loaded,
    dirty,
    modelConfig,
    entryLabel,
    load,
    save,
    markDirty,
    resetLocal,
  };
};
