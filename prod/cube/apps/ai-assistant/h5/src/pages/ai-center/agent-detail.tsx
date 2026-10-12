import { Icon } from "vant";
import { defineComponent, shallowRef, watch, type VNode } from "vue";
import { useRoute, useRouter } from "vue-router";

import { fetchAgentDetail } from "./agent-service";
import type { AiCenterAgent } from "./types";

import styles from "./agent-detail.module.less";

export const AgentDetail = defineComponent({
  name: "AgentDetail",
  setup: (): (() => VNode) => {
    const route = useRoute();
    const router = useRouter();
    const agent = shallowRef<AiCenterAgent | null>(null);
    const loading = shallowRef(false);
    const loadError = shallowRef("");

    const resolveId = (): string => {
      const id = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id;
      return id ?? "";
    };

    const loadAgent = async (id: string): Promise<void> => {
      if (!id) {
        agent.value = null;
        return;
      }
      loading.value = true;
      loadError.value = "";
      try {
        agent.value = await fetchAgentDetail(id);
      } catch (error) {
        agent.value = null;
        loadError.value = error instanceof Error ? error.message : "智能体详情加载失败";
      } finally {
        loading.value = false;
      }
    };

    watch(
      () => resolveId(),
      (id) => {
        void loadAgent(id);
      },
      { immediate: true },
    );

    const handleBack = (): void => {
      router.back();
    };

    return (): VNode => (
      <div class={styles.page}>
        <header class={styles.topBar}>
          <button type="button" class={styles.backButton} aria-label="返回" onClick={handleBack}>
            <Icon name="arrow-left" size="20" />
          </button>
          <h1 class={styles.topTitle}>智能体详情</h1>
          <span class={styles.topRightSpace} />
        </header>
        {loading.value ? (
          <main class={[styles.content, styles.emptyContent]}>
            <div class={styles.emptyCard}>智能体详情加载中...</div>
          </main>
        ) : loadError.value ? (
          <main class={[styles.content, styles.emptyContent]}>
            <div class={styles.emptyCard}>{loadError.value}</div>
          </main>
        ) : agent.value ? (
          <main class={styles.content}>
            <section class={styles.summaryCard}>
              <div class={styles.agentIcon}>{agent.value.icon}</div>
              <div class={styles.summaryInfo}>
                <h2>{agent.value.name}</h2>
                <p>{agent.value.createdAt} 创建</p>
              </div>
            </section>
            <section class={styles.infoCard}>
              <h3>智能体介绍</h3>
              <p>{agent.value.description}</p>
            </section>
            <section class={styles.infoCard}>
              <h3>智能体详情</h3>
              <p>{agent.value.detail}</p>
              <p>{agent.value.skillSummary}</p>
            </section>
          </main>
        ) : (
          <main class={[styles.content, styles.emptyContent]}>
            <div class={styles.emptyCard}>未找到智能体</div>
          </main>
        )}
      </div>
    );
  },
});
