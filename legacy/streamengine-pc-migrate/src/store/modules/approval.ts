import { defineStore } from "pinia";
interface mainState {
  permissionId: string;
  functionsCodes: string[];
}
export const useApproval = defineStore("approval-store", {
  state: (): mainState => ({
    permissionId: "",
    functionsCodes: [],
  }),
  actions: {
    updatePermissionId(permissionId: string) {
      this.permissionId = permissionId;
    },
    updateFunctionCodes(functionCodes: string[]) {
      this.functionsCodes = functionCodes;
    },
  },
});
