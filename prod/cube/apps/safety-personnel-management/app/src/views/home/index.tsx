import { computed, defineComponent, onMounted, ref } from "vue";

import { getHomeOrgArchitecture } from "@ghcloud/cube-services-client/safety-personnel.client";
import { Empty } from "@ghcloud/cube-ui";

import { OrgArchitectureCanvas } from "./components/org-architecture-canvas";
import { useAuthRequest } from "@/hooks/use-auth-request";
import type { OrgNodeUI } from "@/types/ui";
import { showApiError } from "@/utils/api-error";
import { mapOrgTree } from "@/utils/mappers";
import { enrichOrgTreeAvatars } from "@/utils/member-avatar";

import styles from "./index.module.less";

export const HomePage = defineComponent({
  setup() {
    const tree = ref<OrgNodeUI[]>([]);
    const root = computed(() => tree.value[0] ?? null);

    const load = async (): Promise<void> => {
      try {
        const data = await useAuthRequest(() => getHomeOrgArchitecture());
        const mapped = data.root ? mapOrgTree([data.root]) : [];
        if (mapped.length > 0) {
          await enrichOrgTreeAvatars(mapped);
        }
        tree.value = mapped;
      } catch (e) {
        showApiError(e);
        tree.value = [];
      }
    };

    onMounted(() => {
      void load();
    });

    return (): JSX.Element => (
      <div class="page-route">
        <div class={styles.container}>
          {root.value ? (
            <OrgArchitectureCanvas root={root.value} />
          ) : (
            <div class={styles.emptyState}>
              <Empty description="暂无组织架构数据，请先在组织管理配置中维护" />
            </div>
          )}
        </div>
      </div>
    );
  },
});
