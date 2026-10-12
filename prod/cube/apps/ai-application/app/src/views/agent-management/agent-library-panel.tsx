import { computed, defineComponent, onMounted, ref } from "vue";

import { Button, Empty, Input, SearchOutlined, Spin, message } from "@ghcloud/cube-ui";

import { AgentCard } from "./agent-card";
import { fetchLibraryAgentCards, type AgentCardItem } from "./agent-data";
import { agentConsoleClient, unlistTenantAgent } from "@/api/agent-console-client";

import styles from "./agent-management.module.less";

export const AgentLibraryPanel = defineComponent({
  name: "AgentLibraryPanel",
  setup() {
    const keyword = ref("");
    const loading = ref(false);
    const agents = ref<AgentCardItem[]>([]);
    const loadError = ref("");

    const filteredAgents = computed(() => {
      const value = keyword.value.trim().toLowerCase();
      if (!value) {
        return agents.value;
      }
      return agents.value.filter((item) => item.name.toLowerCase().includes(value) || item.description.toLowerCase().includes(value));
    });

    const loadLibraryAgents = async (): Promise<void> => {
      loading.value = true;
      loadError.value = "";
      try {
        agents.value = await fetchLibraryAgentCards({
          q: keyword.value.trim() || undefined,
        });
      } catch (error) {
        agents.value = [];
        loadError.value = `智能体库加载失败：${String(error)}`;
        message.error(loadError.value);
      } finally {
        loading.value = false;
      }
    };

    const installAgent = async (ref: string): Promise<void> => {
      try {
        await agentConsoleClient.installAgent({ ref });
        message.success("添加成功");
        await loadLibraryAgents();
      } catch (error) {
        message.error(`添加失败：${String(error)}`);
      }
    };

    const updateAgent = async (id: string): Promise<void> => {
      const agent = agents.value.find((item) => item.id === id);
      if (!agent?.shelfId) {
        message.error("未找到可更新的智能体条目");
        return;
      }
      const ref = agent.libraryRef ?? agent.id;
      try {
        await agentConsoleClient.removeShelfAgent(agent.shelfId);
        await agentConsoleClient.installAgent({ ref, pin: true });
        message.success("更新成功");
        await loadLibraryAgents();
      } catch (error) {
        message.error(`更新失败：${String(error)}`);
      }
    };

    const unlistAgent = async (id: string): Promise<void> => {
      const agent = agents.value.find((item) => item.id === id);
      if (!agent?.canUnlist || !agent.id.startsWith("agt_")) {
        return;
      }
      try {
        await unlistTenantAgent(agent.id);
        message.success("已从智能体库下架，已下载用户可继续使用");
        await loadLibraryAgents();
      } catch (error) {
        message.error(`下架失败：${String(error)}`);
      }
    };

    const handleSearch = (): void => {
      void loadLibraryAgents();
    };

    const handleReset = (): void => {
      keyword.value = "";
      void loadLibraryAgents();
    };

    onMounted(() => {
      void loadLibraryAgents();
    });

    return () => (
      <div class={styles.tabPanel}>
        <div class={styles.filterRow}>
          <div class={styles.filterGroup}>
            <div class={styles.filterField}>
              <Input
                class={styles.keywordInput}
                value={keyword.value}
                placeholder="搜索"
                showCount={false}
                allowClear={false}
                maxlength={200}
                suffix={<SearchOutlined class={styles.searchIcon} />}
                onPressEnter={handleSearch}
                onUpdate:value={(value: string) => {
                  keyword.value = value ?? "";
                }}
              />
            </div>
            <div class={styles.filterActions}>
              <Button type="primary" onClick={handleSearch}>
                查询
              </Button>
              <Button onClick={handleReset}>重置</Button>
            </div>
          </div>
        </div>
        <div class={styles.cardSection}>
          <Spin spinning={loading.value}>
            {filteredAgents.value.length > 0 ? (
              <div class={styles.cardGrid}>
                {filteredAgents.value.map((item) => (
                  <AgentCard
                    key={item.id}
                    item={item}
                    mode="library"
                    onInstall={(ref: string) => {
                      void installAgent(ref);
                    }}
                    onUpdate={(id: string) => {
                      void updateAgent(id);
                    }}
                    onUnlist={(id: string) => {
                      void unlistAgent(id);
                    }}
                  />
                ))}
              </div>
            ) : (
              <div class={styles.emptyState}>
                <Empty description={loadError.value || (keyword.value.trim() ? "未找到匹配的智能体" : "暂无智能体")} />
              </div>
            )}
          </Spin>
        </div>
        <div class={styles.paginationRow}>
          <div class={styles.paginationGroup}>
            <span class={styles.totalText}>共{filteredAgents.value.length}条数据</span>
          </div>
        </div>
      </div>
    );
  },
});
