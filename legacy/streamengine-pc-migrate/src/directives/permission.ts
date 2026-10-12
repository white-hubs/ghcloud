import { useApproval } from "@/store";
import type { Directive } from "vue";
/**
 * 权限自定义指令
 * isOpenPermission:是否开启权限
 */
const isOpenPermission = true;
export const permission: Directive = {
  mounted(el, binding) {
    const { value } = binding;
    if (!isOpenPermission) {
      return;
    }
    const store = useApproval();
    const permissionButtton = store.functionsCodes;
    if (value) {
      const hasPermission: boolean = permissionButtton.includes(value);
      if (!hasPermission) {
        el.style.display = "none";
      }
    } else {
    }
  },
};
