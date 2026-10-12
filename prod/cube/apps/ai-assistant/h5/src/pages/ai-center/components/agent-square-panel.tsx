import { defineComponent, type PropType, type VNode } from "vue";

import type { AiCenterAgent } from "../types";
import { ActionPill } from "./action-pill";
import { SearchBox } from "./search-box";

import styles from "../ai-center.module.less";

interface AgentGroup {
  id: string;
  name: string;
  agents: AiCenterAgent[];
}

export const AgentSquarePanel = defineComponent({
  name: "AgentSquarePanel",
  props: {
    keyword: {
      type: String,
      required: true,
    },
    groups: {
      type: Array as PropType<AgentGroup[]>,
      required: true,
    },
    myAgentIds: {
      type: Object as PropType<ReadonlySet<string>>,
      required: true,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    error: {
      type: String,
      default: "",
    },
    onUpdateKeyword: {
      type: Function as PropType<(value: string) => void>,
      required: true,
    },
    onAddAgent: {
      type: Function as PropType<(id: string) => void | Promise<void>>,
      required: true,
    },
    onViewAgent: {
      type: Function as PropType<(id: string) => void>,
      required: true,
    },
  },
  setup:
    (props): (() => VNode) =>
    (): VNode => (
      <section class={styles.panel}>
        <div class={styles.panelFixed}>
          <SearchBox value={props.keyword} placeholder="搜索智能体" onUpdateValue={props.onUpdateKeyword} />
        </div>
        <div class={[styles.panelScroll, styles.agentGroups]}>
          {props.loading ? <div class={styles.emptyState}>智能体加载中...</div> : null}
          {!props.loading && props.error ? <div class={styles.emptyState}>{props.error}</div> : null}
          {!props.loading && !props.error
            ? props.groups.map((group) => (
                <section key={group.id} class={styles.agentGroup}>
                  <div class={styles.cardStack}>
                    {group.agents.map((agent) => {
                      const added = agent.installed === true || props.myAgentIds.has(agent.libraryRef ?? agent.id);
                      return (
                        <article
                          key={agent.id}
                          class={styles.agentCard}
                          onClick={() => {
                            props.onViewAgent(agent.id);
                          }}
                        >
                          <div class={styles.agentIcon}>{agent.icon}</div>
                          <div class={styles.agentInfo}>
                            <h2>{agent.name}</h2>
                            <p>{agent.description}</p>
                          </div>
                          <ActionPill
                            added={added}
                            onPress={() => {
                              props.onAddAgent(agent.id);
                            }}
                          />
                        </article>
                      );
                    })}
                  </div>
                </section>
              ))
            : null}
          {!props.loading && !props.error && props.groups.length === 0 ? <div class={styles.emptyState}>暂无匹配智能体</div> : null}
        </div>
      </section>
    ),
});
