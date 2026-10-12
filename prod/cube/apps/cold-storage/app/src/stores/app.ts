import { defineStore } from "pinia";
import { ref } from "vue";

export const useAppStore = defineStore("app", () => {
  const collapsed = ref(false);

  const toggleCollapsed = (): void => {
    collapsed.value = !collapsed.value;
  };

  return {
    collapsed,
    toggleCollapsed,
  };
});
