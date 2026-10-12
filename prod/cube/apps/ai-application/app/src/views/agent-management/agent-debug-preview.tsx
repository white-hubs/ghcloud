import {
  createAgenticEnginePort,
  createIndexedDbReasoningStore,
  provideAssistant,
  useAssistant,
  useAssistantLlmModels,
  useAssistantMessages,
  useAssistantSessions,
} from "@cube-ai/agent-sdk-client-vue";
import { computed, defineComponent, nextTick, ref, watch, type PropType } from "vue";

import { Button, SendOutlined, Textarea, message } from "@ghcloud/cube-ui";

import { mergeComposerAndBoundKnowledgeRefs } from "../assistant/assistant-runtime-refs";
import type { AgentKnowledgeRef } from "./agent-knowledge-refs";
import { createGatewayAgenticClient } from "@/api/agentic-client";
import { fetchAssistantLlmOptions, pickDefaultLlmModelCode } from "@/api/assistant-llm-options";
import { authStore } from "@/api/auth-store";

import styles from "./agent-management.module.less";

function formatDebugError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

async function waitForModelsLoaded(loading: { value: boolean }, timeoutMs = 10_000): Promise<void> {
  if (!loading.value) {
    return;
  }
  await new Promise<void>((resolve) => {
    const stop = watch(
      loading,
      (isLoading) => {
        if (!isLoading) {
          stop();
          resolve();
        }
      },
      { immediate: true },
    );
    setTimeout(() => {
      stop();
      resolve();
    }, timeoutMs);
  });
}

interface PreviewMessage {
  role: "user" | "assistant";
  content: string;
}

export const AgentDebugPreview = defineComponent({
  name: "AgentDebugPreview",
  props: {
    agentId: {
      type: String as PropType<string | null>,
      default: null,
    },
    modelCode: {
      type: String as PropType<string>,
      default: "",
    },
    /** 调试指定已发布版本；缺省使用当前 head（草稿/已保存） */
    agentVersionNo: {
      type: Number as PropType<number | undefined>,
      default: undefined,
    },
    ensureAgentId: {
      type: Function as PropType<() => Promise<string | null>>,
      default: null,
    },
    getKnowledgeRefs: {
      type: Function as PropType<() => AgentKnowledgeRef[]>,
      default: null,
    },
    knowledgeRefs: {
      type: Array as PropType<AgentKnowledgeRef[]>,
      default: () => [],
    },
  },
  emits: ["update:modelCode"],
  setup(props, { emit }) {
    const inputText = ref("");
    const previewMessages = ref<PreviewMessage[]>([]);
    const messagesRef = ref<HTMLDivElement | null>(null);
    const sessionAgentId = ref<string | null>(null);

    const client = createGatewayAgenticClient();

    provideAssistant({
      engine: createAgenticEnginePort(client),
      listModels: () => fetchAssistantLlmOptions("agent-debug-preview"),
      autoLoad: false,
      placeholderIdPrefix: "debug-",
      reasoningStore: createIndexedDbReasoningStore({ dbName: "cube-ai-agent-debug-reasoning" }),
    });

    const { state, store } = useAssistant();
    const { create: createNewSession, remove: removeSession } = useAssistantSessions();
    const { send, sending, messages } = useAssistantMessages();
    const { models: llmOptions, loading: loadingModels } = useAssistantLlmModels();
    const effectiveModelCode = ref(props.modelCode.trim());

    watch(
      () => props.modelCode,
      (code) => {
        const trimmed = code.trim();
        if (trimmed) {
          effectiveModelCode.value = trimmed;
        }
      },
    );

    watch(
      () => llmOptions.value,
      (next) => {
        if (next.length === 0) {
          return;
        }
        const first = next[0]?.modelCode?.trim();
        if (!first) {
          return;
        }
        const current = effectiveModelCode.value.trim();
        if (!current || !next.some((option) => option.modelCode === current)) {
          effectiveModelCode.value = first;
          if (!props.modelCode.trim()) {
            emit("update:modelCode", first);
          }
        }
      },
      { immediate: true },
    );

    const syncDefaultModel = (code: string): string => {
      const trimmed = code.trim();
      if (!trimmed) {
        return "";
      }
      effectiveModelCode.value = trimmed;
      if (!props.modelCode.trim()) {
        emit("update:modelCode", trimmed);
      }
      return trimmed;
    };

    const resolveModelCode = async (): Promise<string> => {
      const fromProps = props.modelCode.trim();
      if (fromProps) {
        return fromProps;
      }
      await waitForModelsLoaded(loadingModels);
      const fromEffective = effectiveModelCode.value.trim();
      if (fromEffective) {
        return fromEffective;
      }
      const fromStore = pickDefaultLlmModelCode(llmOptions.value);
      if (fromStore) {
        return syncDefaultModel(fromStore);
      }
      try {
        const options = await fetchAssistantLlmOptions("agent-debug-preview");
        if (options.length > 0) {
          store.setModels(options);
        }
        return syncDefaultModel(pickDefaultLlmModelCode(options));
      } catch (error) {
        // eslint-disable-next-line no-console
        console.warn("[agent-debug-preview] 拉取模型列表失败", error);
        return "";
      }
    };

    const resetDebugSession = async (): Promise<void> => {
      const sessionId = state.currentSessionId;
      if (sessionId) {
        try {
          await removeSession(sessionId);
        } catch {
          /* 清理失败不阻塞后续调试 */
        }
      }
      sessionAgentId.value = null;
      previewMessages.value = [];
    };

    watch(
      () => props.agentId,
      (next, prev) => {
        if (next !== prev) {
          void resetDebugSession();
        }
      },
    );

    const resolveKnowledgeRefs = (): AgentKnowledgeRef[] => props.getKnowledgeRefs?.() ?? props.knowledgeRefs ?? [];

    watch(
      messages,
      (items) => {
        previewMessages.value = items
          .filter((item) => item.role === "user" || item.role === "assistant")
          .map((item) => ({ role: item.role as "user" | "assistant", content: item.content }));
        void nextTick(() => {
          messagesRef.value?.scrollTo({ top: messagesRef.value.scrollHeight, behavior: "smooth" });
        });
      },
      { deep: true },
    );

    const canSend = computed(() => inputText.value.trim().length > 0 && !sending.value);

    const ensureDebugSession = async (agentId: string, modelCode: string): Promise<void> => {
      if (state.currentSessionId && sessionAgentId.value === agentId) {
        return;
      }
      await resetDebugSession();
      await createNewSession({
        agentId,
        title: "调试会话",
        modelCode,
        purpose: "debug",
        ...(props.agentVersionNo !== undefined ? { agentVersionNo: props.agentVersionNo } : {}),
      });
      sessionAgentId.value = agentId;
    };

    const handleSend = async (): Promise<void> => {
      const text = inputText.value.trim();
      if (!text) {
        return;
      }
      if (!authStore.token.trim() || !authStore.tenant.trim()) {
        message.warning("缺少登录信息，请从主应用进入后再调试");
        return;
      }
      const modelCode = await resolveModelCode();
      if (!modelCode) {
        message.warning("未获取到可用模型，请检查租户模型配置或网络连接");
        return;
      }
      let agentId = props.agentId;
      if (!agentId && props.ensureAgentId) {
        agentId = await props.ensureAgentId();
      }
      if (!agentId) {
        message.warning("请先保存草稿后再调试");
        return;
      }
      inputText.value = "";
      try {
        await ensureDebugSession(agentId, modelCode);
        const runtimeRefs = mergeComposerAndBoundKnowledgeRefs([], resolveKnowledgeRefs());
        await send(text, {
          modelCode,
          ...(runtimeRefs !== undefined ? { runtimeRefs } : {}),
        });
      } catch (error) {
        message.error(`发送失败：${formatDebugError(error)}`);
      }
    };

    const clearMessages = (): void => {
      void resetDebugSession();
    };

    return () => (
      <div class={styles.debugPreview}>
        <div ref={messagesRef} class={styles.debugMessages}>
          {previewMessages.value.length === 0 ? (
            <div class={styles.previewHint}>保存草稿后可在此与当前智能体对话调试（草稿对创建者可见）。</div>
          ) : (
            previewMessages.value.map((item, index) => (
              <div
                key={`${item.role}-${index}`}
                class={[styles.debugMessage, item.role === "user" ? styles.debugMessageUser : styles.debugMessageAssistant]}
              >
                {item.content}
              </div>
            ))
          )}
        </div>
        <div class={styles.previewBottom}>
          <Button class={styles.clearButton} onClick={clearMessages}>
            清除对话
          </Button>
          <div class={styles.chatInputBox}>
            <Textarea
              value={inputText.value}
              placeholder="输入您的问题"
              rows={3}
              disabled={sending.value}
              onUpdate:value={(value: string) => {
                inputText.value = value ?? "";
              }}
              onKeydown={(event: KeyboardEvent) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void handleSend();
                }
              }}
            />
            <div class={styles.chatTools}>
              <span />
              <div class={styles.chatSendGroup}>
                <button
                  type="button"
                  class={styles.sendButton}
                  aria-label="发送"
                  disabled={!canSend.value}
                  onClick={() => void handleSend()}
                >
                  <SendOutlined />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  },
});
