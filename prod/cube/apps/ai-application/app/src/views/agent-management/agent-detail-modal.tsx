import { computed, defineComponent, ref, watch, type PropType } from "vue";

import { Button, Modal, Spin, Tag } from "@ghcloud/cube-ui";

import { fetchAgentCardDetail, formatAgentStatusLabel, type AgentCardDetail, type AgentCardItem } from "./agent-data";

import styles from "./agent-management.module.less";

export const AgentDetailModal = defineComponent({
  name: "AgentDetailModal",
  props: {
    visible: {
      type: Boolean,
      required: true,
    },
    agentId: {
      type: String as PropType<string | null>,
      default: null,
    },
    mode: {
      type: String as PropType<"library" | "mine">,
      default: "library",
    },
    libraryAgents: {
      type: Array as PropType<AgentCardItem[]>,
      default: () => [],
    },
    myAgents: {
      type: Array as PropType<AgentCardItem[]>,
      default: () => [],
    },
    agent: {
      type: Object as PropType<AgentCardItem | null>,
      default: null,
    },
  },
  emits: ["update:visible", "install", "update", "edit", "unlist"],
  setup(props, { emit }) {
    const promptExpanded = ref(false);
    const loadedAgent = ref<AgentCardDetail | null>(null);
    const loading = ref(false);

    const resetDetailPanelState = (): void => {
      promptExpanded.value = false;
    };

    watch(
      () => [props.visible, props.agentId, props.mode] as const,
      ([visible, agentId, mode]) => {
        if (!visible || !agentId) {
          loadedAgent.value = null;
          return;
        }
        resetDetailPanelState();
        loadedAgent.value = props.agent as AgentCardDetail | null;
        loading.value = true;
        void fetchAgentCardDetail(agentId, mode)
          .then((detail) => {
            if (detail) {
              loadedAgent.value = detail;
            }
          })
          .finally(() => {
            loading.value = false;
          });
      },
      { immediate: true },
    );

    const agent = computed(() => {
      if (loadedAgent.value) {
        return loadedAgent.value;
      }
      const source = props.mode === "library" ? props.libraryAgents : props.myAgents;
      return source.find((item) => item.id === props.agentId) || null;
    });

    const isInstalled = computed(() => props.myAgents.some((item) => item.id === props.agentId));
    const hasUpdate = computed(() => {
      const mine = props.myAgents.find((item) => item.id === props.agentId);
      return mine?.hasUpdate ?? false;
    });
    const canEdit = computed(() => {
      const current = agent.value;
      return props.mode === "mine" && Boolean(current) && !current!.fromLibrary && current!.id.startsWith("agt_");
    });
    const canUnlist = computed(() => props.mode === "library" && agent.value?.canUnlist === true);

    const handleClose = (): void => {
      emit("update:visible", false);
    };

    return () => {
      const current = agent.value;
      if (!current) {
        return null;
      }

      const Icon = current.icon;
      const installed = isInstalled.value;
      const hasUpdateFlag = hasUpdate.value;
      const editable = canEdit.value;
      const showUnlist = canUnlist.value;
      const prompt = (current as AgentCardDetail).prompt?.trim() ?? "";

      return (
        <Modal
          title="智能体详情"
          visible={props.visible}
          onCancel={handleClose}
          width={640}
          centered
          class={styles.detailModal}
          bodyStyle={{ padding: "16px 24px", overflow: "hidden" }}
          footer={
            <div style="display: flex; gap: 8px; justify-content: flex-end;">
              <Button onClick={handleClose}>关闭</Button>
              {showUnlist ? <Button onClick={() => emit("unlist", current.id)}>下架</Button> : null}
              {editable ? (
                <Button type="primary" onClick={() => emit("edit", current.id)}>
                  编辑
                </Button>
              ) : null}
              {props.mode === "library" && !showUnlist ? (
                <Button
                  type={installed && !hasUpdateFlag ? "default" : "primary"}
                  disabled={installed && !hasUpdateFlag}
                  onClick={() => {
                    if (hasUpdateFlag) {
                      emit("update", current.id);
                    } else {
                      emit("install", current.libraryRef ?? current.id);
                    }
                  }}
                >
                  {installed ? (hasUpdateFlag ? "更新到最新版本" : "已添加") : "一键添加"}
                </Button>
              ) : null}
            </div>
          }
        >
          <div class={styles.detailModalSpin}>
            <Spin spinning={loading.value}>
              <div class={styles.detailModalBody}>
                <div class={styles.detailHeader}>
                  <div
                    class={[
                      styles.detailIcon,
                      !current.avatarUrl?.trim() && styles[current.iconClass],
                      current.avatarUrl?.trim() && styles.agentIconImage,
                    ]}
                  >
                    {current.avatarUrl?.trim() ? <img src={current.avatarUrl.trim()} alt="" /> : Icon ? <Icon /> : null}
                  </div>
                  <div class={styles.detailInfo}>
                    <h3 class={styles.detailName}>{current.name}</h3>
                    <div class={styles.detailMeta}>
                      <Tag color="blue">{formatAgentStatusLabel(current)}</Tag>
                      {installed ? <Tag color="success">已添加</Tag> : null}
                      {hasUpdateFlag ? <Tag color="warning">有新版本</Tag> : null}
                    </div>
                  </div>
                </div>

                <div class={[styles.detailSection, styles.detailSectionFixed]}>
                  <h4 class={styles.detailSectionTitle}>智能体简介</h4>
                  <div class={[styles.detailContent, styles.detailScrollBox]}>{current.description || "暂无简介"}</div>
                </div>

                {prompt ? (
                  <div class={[styles.detailSection, styles.detailSectionFixed]}>
                    <div
                      class={styles.detailCollapseHeader}
                      onClick={() => {
                        promptExpanded.value = !promptExpanded.value;
                      }}
                    >
                      <h4 class={styles.detailSectionTitle}>提示词预览</h4>
                      <span class={styles.detailCollapseAction}>{promptExpanded.value ? "收起" : "展开"}</span>
                    </div>
                    {promptExpanded.value ? <div class={[styles.detailContent, styles.detailScrollBoxTall]}>{prompt}</div> : null}
                  </div>
                ) : null}
              </div>
            </Spin>
          </div>
        </Modal>
      );
    };
  },
});
