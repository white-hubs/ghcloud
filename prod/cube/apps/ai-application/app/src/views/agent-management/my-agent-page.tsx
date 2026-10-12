import { computed, defineComponent, onMounted, ref } from "vue";
import { useRouter } from "vue-router";

import { CubeLayout } from "@ghcloud/cube-app-design";
import { Button, Input, PlusCircleOutlined, SearchOutlined, Spin, message } from "@ghcloud/cube-ui";

import { AgentCard } from "./agent-card";
import { mapDescriptorToCard, type AgentCardItem } from "./agent-data";
import { cubeAiApplicationService } from "@/api/service";

import styles from "./agent-management.module.less";

export const MyAgentPage = defineComponent({
  name: "MyAgentPage",
  setup() {
    const router = useRouter();
    const keyword = ref("");
    const loading = ref(false);
    const agents = ref<AgentCardItem[]>([]);

    const filteredAgents = computed(() => {
      const value = keyword.value.trim().toLowerCase();
      if (!value) {
        return agents.value;
      }
      return agents.value.filter((item) => item.name.toLowerCase().includes(value) || item.description.toLowerCase().includes(value));
    });

    const loadAgents = async (): Promise<void> => {
      loading.value = true;
      try {
        const items = await cubeAiApplicationService.listAgents();
        agents.value = items.map(mapDescriptorToCard);
      } finally {
        loading.value = false;
      }
    };

    const deleteAgent = async (id: string): Promise<void> => {
      await cubeAiApplicationService.deleteAgent(id);
      agents.value = agents.value.filter((item) => item.id !== id);
      message.success("已删除");
    };

    onMounted(() => {
      void loadAgents();
    });

    return () => (
      <CubeLayout
        title="我的智能体"
        showFooter={false}
        v-slots={{
          "layout-header": () => (
            <div class={styles.headerActions}>
              <Input
                class={styles.searchInput}
                value={keyword.value}
                placeholder="搜索"
                allowClear
                suffix={<SearchOutlined class={styles.searchIcon} />}
                onUpdate:value={(value: string) => {
                  keyword.value = value ?? "";
                }}
              />
              <Button type="primary" class={styles.queryButton} onClick={() => void loadAgents()}>
                查询
              </Button>
              <Button
                type="primary"
                class={styles.createButton}
                onClick={() => {
                  void router.push("/agents/create");
                }}
              >
                <PlusCircleOutlined />
                <span>新建智能体</span>
              </Button>
            </div>
          ),
          "layout-content": () => (
            <Spin spinning={loading.value}>
              <div class={styles.listPage}>
                <div class={styles.cardGrid}>
                  {filteredAgents.value.map((item) => (
                    <AgentCard
                      key={item.id}
                      item={item}
                      mode="mine"
                      onEdit={() => {
                        void router.push({ path: "/agents/create", query: { id: item.id } });
                      }}
                      onDelete={() => {
                        void deleteAgent(item.id);
                      }}
                    />
                  ))}
                </div>
              </div>
            </Spin>
          ),
        }}
      />
    );
  },
});
