import { computed, defineComponent, ref } from "vue";

import { CubeLayout } from "@ghcloud/cube-app-design";
import { Button, Input, SearchOutlined } from "@ghcloud/cube-ui";

import { AgentCard } from "./agent-card";
import { SYSTEM_AGENT_LIBRARY } from "./agent-data";

import styles from "./agent-management.module.less";

export const AgentLibraryPage = defineComponent({
  name: "AgentLibraryPage",
  setup() {
    const keyword = ref("");
    const filteredAgents = computed(() => {
      const value = keyword.value.trim().toLowerCase();
      if (!value) {
        return SYSTEM_AGENT_LIBRARY;
      }
      return SYSTEM_AGENT_LIBRARY.filter(
        (item) => item.name.toLowerCase().includes(value) || item.description.toLowerCase().includes(value),
      );
    });

    return () => (
      <CubeLayout
        title="智能体库"
        showFooter={false}
        v-slots={{
          "layout-header": () => (
            <div class={styles.headerActions}>
              <Input
                class={styles.librarySearchInput}
                value={keyword.value}
                placeholder="在智能体库中筛选..."
                allowClear
                suffix={<SearchOutlined class={styles.searchIcon} />}
                onUpdate:value={(value: string) => {
                  keyword.value = value ?? "";
                }}
              />
              <Button type="primary" class={styles.queryButton}>
                查询
              </Button>
            </div>
          ),
          "layout-content": () => (
            <div class={styles.listPage}>
              <div class={styles.cardGrid}>
                {filteredAgents.value.map((item) => (
                  <AgentCard key={item.id} item={item} mode="library" />
                ))}
              </div>
            </div>
          ),
        }}
      />
    );
  },
});
