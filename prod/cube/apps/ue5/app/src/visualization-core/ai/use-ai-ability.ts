import { ref } from "vue";

import { CubeDictionaryService } from "@ghcloud/cube-dictionary-service";

const aiAbilityEnabled = ref(false);
let loaded = false;

export function useAiAbility() {
  const loadAiAbility = async (): Promise<void> => {
    if (loaded) {
      return;
    }
    loaded = true;
    try {
      const res = await new CubeDictionaryService().getSysDictionaryByCodeAndItemCode({
        itemCode: "AI_ABILTY",
        code: "AI_ABILTY",
      });
      aiAbilityEnabled.value = res.variable === "true";
    } catch (error) {
      console.warn("[ue5] load AI_ABILTY failed", error);
      aiAbilityEnabled.value = false;
    }
  };

  return {
    aiAbilityEnabled,
    loadAiAbility,
  };
}
