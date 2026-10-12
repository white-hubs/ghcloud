import { defineStore } from "pinia";
import { ref } from "vue";

import type { CollectionConfig, TransformerLink } from "@/types/electrical";

let sequence = 100;
const nextId = (prefix: string): string => `${prefix}-${Date.now()}-${sequence++}`;

export const useElectricalStore = defineStore("electrical-safety", () => {
  const collectionConfig = ref<CollectionConfig>({
    cycle: "1小时",
    meterTime: "08:00",
    transformerLinks: [
      {
        id: "link-1",
        transformer: "2号变压器（500kVA）",
        highVoltageDevice: "2号高压进线柜（10kV）",
      },
    ],
  });

  function updateCollectionConfig(payload: Pick<CollectionConfig, "cycle" | "meterTime">): void {
    collectionConfig.value.cycle = payload.cycle;
    collectionConfig.value.meterTime = payload.meterTime;
  }

  function addTransformerLink(payload: Omit<TransformerLink, "id">): void {
    collectionConfig.value.transformerLinks.push({ ...payload, id: nextId("link") });
  }

  function removeTransformerLink(id: string): void {
    collectionConfig.value.transformerLinks = collectionConfig.value.transformerLinks.filter((item) => item.id !== id);
  }

  return {
    collectionConfig,
    updateCollectionConfig,
    addTransformerLink,
    removeTransformerLink,
  };
});
