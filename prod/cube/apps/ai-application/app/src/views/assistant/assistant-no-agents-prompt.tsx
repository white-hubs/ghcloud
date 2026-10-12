import { defineComponent } from "vue";
import { useRouter } from "vue-router";

import { COPY_NO_USER_AGENTS, COPY_NO_USER_AGENTS_HINT } from "./assistant-chat-strings";

import styles from "./assistant-chat.module.less";

export const AssistantNoAgentsPrompt = defineComponent({
  name: "AssistantNoAgentsPrompt",
  props: {
    compact: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const router = useRouter();

    const goAgents = (): void => {
      void router.push("/agents");
    };

    return () => (
      <div class={[styles.emptyStateWrap, props.compact && styles.emptyStateWrapCompact]}>
        <h2>{COPY_NO_USER_AGENTS}</h2>
        <p>{COPY_NO_USER_AGENTS_HINT}</p>
        <button type="button" class={styles.emptyStateAction} onClick={goAgents}>
          前往智能体
        </button>
      </div>
    );
  },
});
