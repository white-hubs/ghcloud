import { computed, defineComponent, onMounted, ref } from "vue";
import { useRouter } from "vue-router";

import { Button, Empty, Input, SearchOutlined, Spin, message } from "@ghcloud/cube-ui";

import { AgentCard } from "./agent-card";
import { fetchMyAgentCards, resolveAgentEditPath, type AgentCardItem } from "./agent-data";
import { agentConsoleClient, listTenantAgent } from "@/api/agent-console-client";
import { readDefaultAgentId } from "@/views/assistant/assistant-default-agent";

import styles from "./agent-management.module.less";

export const MyAgentPanel = defineComponent({
  name: "MyAgentPanel",
  setup() {
    const router = useRouter();
    const keyword = ref("");
    const loading = ref(false);
    const agents = ref<AgentCardItem[]>([]);
    const loadError = ref("");
    const defaultAgentId = ref<string | null>(readDefaultAgentId());

    const filteredAgents = computed(() => {
      const value = keyword.value.trim().toLowerCase();
      if (!value) {
        return agents.value;
      }
      return agents.value.filter((item) => item.name.toLowerCase().includes(value) || item.description.toLowerCase().includes(value));
    });

    const loadAgents = async (): Promise<void> => {
      loading.value = true;
      loadError.value = "";
      try {
        agents.value = await fetchMyAgentCards();
      } catch (error) {
        agents.value = [];
        loadError.value = `我的智能体加载失败：${String(error)}`;
        message.error(loadError.value);
      } finally {
        loading.value = false;
      }
    };

    const listAgent = async (item: AgentCardItem, versionNo: number): Promise<void> => {
      try {
        await listTenantAgent(item.id, versionNo);
        message.success("已上架到智能体库");
        await loadAgents();
      } catch (error) {
        message.error(`上架失败：${String(error)}`);
      }
    };

    const openEdit = (id: string): void => {
      const agent = agents.value.find((item) => item.id === id);
      if (agent?.fromLibrary) {
        message.info("从智能体库下载的智能体不支持编辑");
        return;
      }
      if (!id.startsWith("agt_")) {
        message.info("该智能体不支持编辑");
        return;
      }
      void router.push(resolveAgentEditPath(id));
    };

    const removeAgent = async (id: string): Promise<void> => {
      const agent = agents.value.find((item) => item.id === id);
      if (!agent) {
        return;
      }
      try {
        if (agent.shelfId) {
          await agentConsoleClient.removeShelfAgent(agent.shelfId);
        }

        if (agent.fromLibrary) {
          message.success("已从我的智能体移除");
        } else if (agent.listedInLibrary ?? agent.listed) {
          message.success("已从我的智能体移除，智能体仍保留在智能体库");
        } else if (agent.id.startsWith("agt_")) {
          await agentConsoleClient.deleteAgent(agent.id);
          message.success("删除成功");
        } else if (!agent.shelfId) {
          message.error("无法删除该智能体");
          return;
        } else {
          message.success("移除成功");
        }

        await loadAgents();
      } catch (error) {
        message.error(`操作失败：${String(error)}`);
      }
    };

    const handleSearch = (): void => {
      void loadAgents();
    };

    const handleReset = (): void => {
      keyword.value = "";
      void loadAgents();
    };

    onMounted(() => {
      void loadAgents();
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
                    key={item.shelfId ?? item.id}
                    item={item}
                    mode="mine"
                    defaultAgentId={defaultAgentId.value}
                    onEdit={(id: string) => {
                      openEdit(id);
                    }}
                    onDelete={(id: string) => {
                      void removeAgent(id);
                    }}
                    onDefaultChange={(id) => {
                      defaultAgentId.value = id;
                    }}
                    onList={(id, versionNo) => {
                      const target = agents.value.find((agent) => agent.id === id);
                      if (target) {
                        void listAgent(target, versionNo);
                      }
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
