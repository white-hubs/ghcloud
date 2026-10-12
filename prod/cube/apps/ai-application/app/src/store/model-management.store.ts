import { defineStore } from "pinia";

export const useModelManagementStore = defineStore("model-management", {
  state: () => {
    return {
      providerType: "",
      selectedProviderId: "",
    };
  },
  actions: {
    setProviderType(providerType: string): void {
      this.providerType = providerType;
    },
    setSelectedProviderId(providerId: string): void {
      this.selectedProviderId = providerId;
    },
  },
});
