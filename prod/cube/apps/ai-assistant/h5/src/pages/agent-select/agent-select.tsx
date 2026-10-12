import { Icon, NavBar } from "vant";
import { defineComponent, onMounted, type VNode } from "vue";
import { useRouter } from "vue-router";

import { useAssistantAgentOptions, type AssistantAgentOption } from "../chat/use-assistant-agent-options";

import styles from "./agent-select.module.less";

export const AgentSelect = defineComponent({
  name: "AgentSelect",
  setup: (): (() => VNode) => {
    const router = useRouter();
    const { agentOptions, loading, loadAgentOptions } = useAssistantAgentOptions();

    const goAddAgent = (): void => {
      void router.replace({
        path: "/",
        query: {
          tab: "agents",
          from: "agent-select",
        },
      });
    };

    const onPick = (item: AssistantAgentOption): void => {
      void router.replace({
        path: "/chat",
        query: {
          agentId: item.id,
          agentName: item.name,
          newConversationKey: `${Date.now()}`,
        },
      });
    };

    onMounted(() => {
      void loadAgentOptions();
    });

    const renderContent = (): VNode => {
      if (loading.value) {
        return <div class={styles.loadingState}>智能体加载中...</div>;
      }
      if (agentOptions.value.length === 0) {
        return (
          <section class={styles.emptyState}>
            <div class={styles.emptyVisual} aria-hidden="true">
              <Icon name="friends-o" size="34" />
              <span class={styles.emptyVisualBadge}>
                <Icon name="plus" size="14" />
              </span>
            </div>
            <h2>还没有可用智能体</h2>
            <p>去 AI 中心添加智能体后，即可回到这里选择并开始对话。</p>
            <button type="button" class={styles.emptyAction} onClick={goAddAgent}>
              <Icon name="plus" size="16" />
              <span>去 AI 中心添加</span>
            </button>
          </section>
        );
      }
      return (
        <ul class={styles.list}>
          {agentOptions.value.map((item) => (
            <li key={item.id} class={styles.listItem}>
              <button
                type="button"
                class={styles.row}
                onClick={() => {
                  onPick(item);
                }}
              >
                <div class={styles.iconWrap}>
                  <div class={styles.iconInner} />
                  <div class={styles.iconDot} />
                </div>
                <div class={styles.textCol}>
                  <div class={styles.title}>{item.name}</div>
                  <div class={styles.desc}>{item.description}</div>
                </div>
              </button>
            </li>
          ))}
        </ul>
      );
    };

    return (): VNode => (
      <div class={styles.page}>
        <NavBar
          fixed
          placeholder
          border={false}
          title="智能体"
          v-slots={{
            left: () => (
              <Icon
                name="arrow-left"
                size="20"
                color="#111827"
                onClick={() => {
                  void router.back();
                }}
              />
            ),
          }}
        />
        <main class={styles.content}>{renderContent()}</main>
      </div>
    );
  },
});
