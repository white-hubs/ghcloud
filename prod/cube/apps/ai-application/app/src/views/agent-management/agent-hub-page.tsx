import { computed, defineComponent, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

import { CubeLayout } from "@ghcloud/cube-app-design";
import { Button, Empty, Input, PlusCircleOutlined, SearchOutlined, Spin, TabPane, Tabs, message } from "@ghcloud/cube-ui";

import { AgentCard } from "./agent-card";
import { fetchAgentHubSnapshot, fetchLibraryAgentCards, resolveAgentEditPath, type AgentCardItem } from "./agent-data";
import { AgentDetailModal } from "./agent-detail-modal";
import { agentConsoleClient, listTenantAgent, unlistTenantAgent } from "@/api/agent-console-client";
import { readDefaultAgentId } from "@/views/assistant/assistant-default-agent";
import { DescriptorDocumentImportModal } from "@/views/descriptor-document-import-modal";

import styles from "./agent-management.module.less";

export const AGENT_HUB_TAB_MINE = "mine";
export const AGENT_HUB_TAB_LIBRARY = "library";

function resolveAgentHubTab(tab: unknown): string {
  return tab === AGENT_HUB_TAB_LIBRARY ? AGENT_HUB_TAB_LIBRARY : AGENT_HUB_TAB_MINE;
}

export function resolveAgentHubPath(tab: string = AGENT_HUB_TAB_MINE): string {
  return tab === AGENT_HUB_TAB_LIBRARY ? `/agents?tab=${AGENT_HUB_TAB_LIBRARY}` : "/agents";
}

export const AgentHubPage = defineComponent({
  name: "AgentHubPage",
  setup() {
    const route = useRoute();
    const router = useRouter();
    const activeTab = ref(resolveAgentHubTab(route.query.tab));
    const keyword = ref("");
    const loading = ref(false);
    const loadError = ref("");
    const importModalVisible = ref(false);
    const detailModalVisible = ref(false);
    const detailAgentId = ref<string | null>(null);
    const detailMode = ref<"library" | "mine">("library");
    const detailAgent = ref<AgentCardItem | null>(null);

    const libraryAgents = ref<AgentCardItem[]>([]);
    const myAgents = ref<AgentCardItem[]>([]);
    const defaultAgentId = ref<string | null>(readDefaultAgentId());

    watch(
      () => route.query.tab,
      (tab) => {
        activeTab.value = resolveAgentHubTab(tab);
      },
    );

    const filteredLibraryAgents = computed(() => {
      const q = keyword.value.trim().toLowerCase();
      return libraryAgents.value.filter((agent) => {
        if (!q) {
          return true;
        }
        return agent.name.toLowerCase().includes(q) || agent.description.toLowerCase().includes(q);
      });
    });

    const filteredMyAgents = computed(() => {
      const q = keyword.value.trim().toLowerCase();
      return myAgents.value.filter((agent) => {
        if (!q) {
          return true;
        }
        return agent.name.toLowerCase().includes(q) || agent.description.toLowerCase().includes(q);
      });
    });

    const libraryCount = computed(() => filteredLibraryAgents.value.length);
    const myAgentsCount = computed(() => filteredMyAgents.value.length);
    const activeTabCount = computed(() => (activeTab.value === AGENT_HUB_TAB_LIBRARY ? libraryCount.value : myAgentsCount.value));

    const loadLibraryAgents = async (): Promise<void> => {
      libraryAgents.value = await fetchLibraryAgentCards({
        q: keyword.value.trim() || undefined,
      });
    };

    /** 一次拉齐两 tab，避免 myAgents / browseLibrary 各打两遍 */
    const loadData = async (): Promise<void> => {
      loading.value = true;
      loadError.value = "";
      try {
        const snapshot = await fetchAgentHubSnapshot();
        libraryAgents.value = snapshot.libraryAgents;
        myAgents.value = snapshot.myAgents;
      } catch (error) {
        loadError.value = `加载失败：${String(error)}`;
        message.error(loadError.value);
      } finally {
        loading.value = false;
      }
    };

    onMounted(() => {
      void loadData();
    });

    const handleTabChange = (key: string | number): void => {
      const tab = resolveAgentHubTab(key);
      activeTab.value = tab;
      keyword.value = "";
      void router.replace(resolveAgentHubPath(tab));
    };

    const handleSearch = (): void => {
      // 「我的」已是前端过滤；仅库 tab 需要带 q 重新 browse
      if (activeTab.value === AGENT_HUB_TAB_LIBRARY) {
        loading.value = true;
        void loadLibraryAgents()
          .catch((error) => {
            loadError.value = `加载失败：${String(error)}`;
            message.error(loadError.value);
          })
          .finally(() => {
            loading.value = false;
          });
        return;
      }
    };

    const handleCreate = (): void => {
      void router.push("/agents/create");
    };

    const handleImportSuccess = async (): Promise<void> => {
      importModalVisible.value = false;
      await loadData();
      activeTab.value = AGENT_HUB_TAB_MINE;
      void router.replace(resolveAgentHubPath(AGENT_HUB_TAB_MINE));
    };

    const installAgent = async (ref: string): Promise<void> => {
      try {
        await agentConsoleClient.installAgent({ ref });
        message.success("添加成功");
        await loadData();
      } catch (error) {
        message.error(`添加失败：${String(error)}`);
      }
    };

    const updateAgent = async (id: string): Promise<void> => {
      const agent = libraryAgents.value.find((item) => item.id === id) ?? myAgents.value.find((item) => item.id === id);
      if (!agent?.shelfId) {
        message.error("未找到可更新的智能体条目");
        return;
      }
      const ref = agent.libraryRef ?? agent.id;
      try {
        await agentConsoleClient.removeShelfAgent(agent.shelfId);
        await agentConsoleClient.installAgent({ ref, pin: true });
        message.success("更新成功");
        await loadData();
      } catch (error) {
        message.error(`更新失败：${String(error)}`);
      }
    };

    const unlistAgent = async (id: string): Promise<void> => {
      const agent = libraryAgents.value.find((item) => item.id === id);
      if (!agent?.canUnlist || !agent.id.startsWith("agt_")) {
        return;
      }
      try {
        await unlistTenantAgent(agent.id);
        message.success("已从智能体库下架，已下载用户可继续使用");
        await loadData();
      } catch (error) {
        message.error(`下架失败：${String(error)}`);
      }
    };

    const listAgent = async (item: AgentCardItem, versionNo: number): Promise<void> => {
      try {
        await listTenantAgent(item.id, versionNo);
        message.success("已上架到智能体库");
        await loadData();
      } catch (error) {
        message.error(`上架失败：${String(error)}`);
      }
    };

    const findAgentById = (id: string): AgentCardItem | undefined => {
      return myAgents.value.find((item) => item.id === id) ?? libraryAgents.value.find((item) => item.id === id);
    };

    const handleViewAgent = (id: string): void => {
      detailAgentId.value = id;
      detailMode.value = activeTab.value === AGENT_HUB_TAB_LIBRARY ? "library" : "mine";
      detailAgent.value = findAgentById(id) ?? null;
      detailModalVisible.value = true;
    };

    const openEdit = (id: string): void => {
      const agent = myAgents.value.find((item) => item.id === id);
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
      const agent = myAgents.value.find((item) => item.id === id);
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

        await loadData();
      } catch (error) {
        message.error(`操作失败：${String(error)}`);
      }
    };

    return () => (
      <CubeLayout
        title="智能体"
        showFooter={false}
        v-slots={{
          "layout-header": () => (
            <div class={styles.headerActions}>
              <Input
                class={styles.searchInput}
                value={keyword.value}
                placeholder="搜索智能体名称、描述..."
                allowClear
                suffix={<SearchOutlined />}
                onPressEnter={handleSearch}
                onUpdate:value={(v: string) => {
                  keyword.value = v ?? "";
                }}
              />
              <Button class={styles.queryButton} type="primary" onClick={handleSearch}>
                查询
              </Button>
              <Button
                onClick={() => {
                  importModalVisible.value = true;
                }}
              >
                导入 Markdown
              </Button>
              <Button type="primary" class={styles.createButton} onClick={handleCreate}>
                <PlusCircleOutlined />
                新建智能体
              </Button>
            </div>
          ),
          "layout-content": () => (
            <div class={styles.agentHubPage}>
              <div class={styles.agentHubMain}>
                <Spin spinning={loading.value}>
                  <Tabs class={styles.agentTabs} activeKey={activeTab.value} onChange={handleTabChange}>
                    <TabPane key={AGENT_HUB_TAB_MINE} tab="我的智能体">
                      <div class={styles.cardGrid}>
                        {filteredMyAgents.value.map((item) => (
                          <AgentCard
                            key={item.shelfId ?? item.id}
                            item={item}
                            mode="mine"
                            defaultAgentId={defaultAgentId.value}
                            onView={(id: string) => {
                              handleViewAgent(id);
                            }}
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
                              const target = myAgents.value.find((agent) => agent.id === id);
                              if (target) {
                                void listAgent(target, versionNo);
                              }
                            }}
                          />
                        ))}
                      </div>
                      {filteredMyAgents.value.length === 0 && (
                        <div class={styles.emptyState}>
                          <Empty description={loadError.value || (keyword.value.trim() ? "未找到匹配的智能体" : "暂无智能体")} />
                        </div>
                      )}
                    </TabPane>
                    <TabPane key={AGENT_HUB_TAB_LIBRARY} tab="智能体库">
                      <div class={styles.cardGrid}>
                        {filteredLibraryAgents.value.map((item) => (
                          <AgentCard
                            key={item.id}
                            item={item}
                            mode="library"
                            onView={(id: string) => {
                              handleViewAgent(id);
                            }}
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
                      {filteredLibraryAgents.value.length === 0 && (
                        <div class={styles.emptyState}>
                          <Empty description={loadError.value || (keyword.value.trim() ? "未找到匹配的智能体" : "暂无智能体")} />
                        </div>
                      )}
                    </TabPane>
                  </Tabs>
                </Spin>
              </div>
              <div class={styles.agentHubStatsRow}>
                <span class={styles.agentHubStatsText}>
                  共 <strong>{activeTabCount.value}</strong> 个智能体
                </span>
              </div>
            </div>
          ),
        }}
      >
        <DescriptorDocumentImportModal v-model:visible={importModalVisible.value} kind="agent" onSuccess={handleImportSuccess} />
        <AgentDetailModal
          v-model:visible={detailModalVisible.value}
          agentId={detailAgentId.value}
          mode={detailMode.value}
          libraryAgents={libraryAgents.value}
          myAgents={myAgents.value}
          agent={detailAgent.value}
          onEdit={(id: string) => {
            detailModalVisible.value = false;
            openEdit(id);
          }}
          onInstall={(ref: string) => {
            detailModalVisible.value = false;
            void installAgent(ref);
          }}
          onUpdate={(id: string) => {
            detailModalVisible.value = false;
            void updateAgent(id);
          }}
          onUnlist={(id: string) => {
            detailModalVisible.value = false;
            void unlistAgent(id);
          }}
        />
      </CubeLayout>
    );
  },
});
