import { message } from "ant-design-vue";
import { computed, type ComputedRef } from "vue";
import { useRoute, useRouter } from "vue-router";

import { buildProjectListLocation } from "@/hooks/use-list-return-query";

/**
 * 配置页读取 projectId；缺失时提示并回列表。
 */
export const useProjectId = (): {
  projectId: ComputedRef<string>;
  ensureProjectId: () => boolean;
} => {
  const route = useRoute();
  const router = useRouter();

  const projectId = computed(() => {
    const raw = route.query.projectId;
    return typeof raw === "string" ? raw : Array.isArray(raw) ? String(raw[0] ?? "") : "";
  });

  const ensureProjectId = (): boolean => {
    if (projectId.value) {
      return true;
    }
    message.warning("缺少项目 ID，请从项目管理列表进入");
    void router.push(buildProjectListLocation());
    return false;
  };

  return {
    projectId,
    ensureProjectId,
  };
};
