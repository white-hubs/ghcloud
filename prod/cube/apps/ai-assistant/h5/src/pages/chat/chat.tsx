import {
  buildSystemSuffixFromMessages,
  createAgenticClient,
  createAgenticEnginePort,
  provideAssistant,
  useAssistant,
  useAssistantGrants,
  useAssistantLlmModels,
  useAssistantMessages,
  useAssistantSessions,
  useAssistantTokenUsage,
  useAssistantTools,
  type AgenticClient,
  type LlmOption,
  type PendingGrant,
} from "@cube-ai/agent-sdk-client-vue";
import { ActionSheet, Icon, Popup, showConfirmDialog, showImagePreview, showToast, type ActionSheetAction } from "vant";
import { computed, defineComponent, onBeforeUnmount, onMounted, ref, watch, type VNode } from "vue";
import { useRoute, useRouter } from "vue-router";

import { cubeAppService } from "@ghcloud/cube-app-js-sdk";
import { GLOBAL_SCENE_CODE } from "@ghcloud/cube-file-service";
import { SpeechInputController, type SpeechInputStatus } from "@ghcloud/cube-speech-assistant";

import { kkFilePreview } from "../../../../../../basic/cube-utils/src/file-preview";
import { resolveAgenticEngineAuthToken } from "./assistant-agentic-auth";
import { resolveAttachmentPreviewSrc } from "./assistant-attachments";
import { readDefaultAgentId } from "./assistant-default-agent";
import { groupVisibleLlmOptions } from "./assistant-model-menu";
import {
  DEFAULT_ASSISTANT_SESSION_TITLE,
  buildRuntimeRefs,
  fetchLlmOptionsFromService,
  mapAssistantMessage,
  mapSessionToConversation,
  pendingToImageAttachments,
} from "./assistant-runtime";
import { fetchAssistantSessionPage } from "./assistant-session-service";
import { ChatComposer } from "./components/chat-composer";
import { ChatHeader } from "./components/chat-header";
import { ConversationDrawer } from "./components/conversation-drawer";
import { GrantConsentPopup } from "./components/grant-consent-popup";
import { KnowledgeSheet } from "./components/knowledge-sheet";
import { MessageList } from "./components/message-list";
import { SkillSheet } from "./components/skill-sheet";
import type { ChatAttachment, ComposerPendingAttachment, ConversationItem, KnowledgeItem } from "./types";
import { resolveAgentOptionId, useAssistantAgentOptions } from "./use-assistant-agent-options";
import { useAssistantSkillOptions } from "./use-assistant-skill-options";
import { resolveAgenticEngineBase } from "@/api/ai-center-api-base";
import { cubeKnowledgeDocumentService } from "@/api/ai-center-service";
import { authStore } from "@/api/auth-store";
import { randomUUID } from "@/util/crypto-random-uuid";

import styles from "./chat.module.less";

const CONTEXT_TURNS = 6;
const DEFAULT_COMPOSER_HEIGHT = 138;
const ENABLE_MANUAL_KNOWLEDGE_REFERENCES = false;

function isAppleTouchDevice(): boolean {
  const platform = navigator.platform;
  return /iP(hone|ad|od)/.test(platform) || (platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

type AssistantSend = (
  text: string,
  options?: {
    modelCode?: string;
    runtimeRefs?: ReturnType<typeof buildRuntimeRefs>;
    attachments?: ReturnType<typeof pendingToImageAttachments>;
  },
) => Promise<{ turnId: string }>;
type ConversationSheetAction = ActionSheetAction & {
  value: "rename" | "delete";
};

export const Chat = defineComponent({
  name: "Chat",
  setup: (): (() => VNode) => {
    const route = useRoute();
    const router = useRouter();
    const initialBackPath =
      typeof window.history.state?.back === "string" && window.history.state.back !== route.fullPath ? window.history.state.back : "";
    const agenticEngineBase = resolveAgenticEngineBase();
    const {
      agentOptions,
      hasUserAgents,
      loading: agentOptionsLoading,
      loadAgentOptions,
      resolveInitialAgentId,
    } = useAssistantAgentOptions();
    const { skillOptions, loading: loadingSkillOptions, error: skillOptionsError, loadSkillOptions } = useAssistantSkillOptions();
    const fallbackAgentId = readDefaultAgentId() ?? "";
    const selectedAgentId = ref(resolveAgentOptionId(route.query.agentId, agentOptions.value) ?? fallbackAgentId);

    const client: AgenticClient = createAgenticClient({
      baseUrl: agenticEngineBase,
      auth: {
        provider: () => resolveAgenticEngineAuthToken(authStore.token),
      },
      headersProvider: () => ({
        tenant: authStore.tenant,
        terminal: String(authStore.terminal),
      }),
    });

    provideAssistant({
      engine: createAgenticEnginePort(client),
      defaultAgentId: selectedAgentId.value || fallbackAgentId,
      listModels: fetchLlmOptionsFromService,
      autoLoad: "sessions-and-first",
      debugEventBuffer: { max: 30 },
    });

    const {
      currentSessionId,
      open: openSession,
      create: createNewSession,
      remove: removeSession,
      rename: renameSession,
    } = useAssistantSessions();
    const { messages: sdkMessages, sending, send, cancel, lastTurnFailure } = useAssistantMessages();
    const sendAssistant = send as AssistantSend;
    const { pendingGrants, respondGrant } = useAssistantGrants();
    const { models: llmOptions, loading: llmOptionsLoading } = useAssistantLlmModels();
    const { tokenUsage: liveTurnTokenUsage } = useAssistantTokenUsage();
    const { toolEvents } = useAssistantTools();
    const { state: assistantState } = useAssistant();

    const shouldUseVisualViewportLayout = isAppleTouchDevice();
    const isDrawerOpen = ref(false);
    const isKnowledgeOpen = ref(false);
    const isSkillOpen = ref(false);
    const isModelOpen = ref(false);
    const modelMenuQuery = ref("");
    const inputValue = ref("");
    const chatViewportHeight = ref(window.innerHeight);
    const chatViewportTop = ref(0);
    const keyboardOffset = ref(0);
    const composerHeight = ref(DEFAULT_COMPOSER_HEIGHT);
    const activeActionIds = ref<string[]>([]);
    const inputMode = ref<"text" | "voice">("text");
    const voiceStatus = ref<SpeechInputStatus>("idle");
    const knowledgeOptions = ref<KnowledgeItem[]>([]);
    const selectedKnowledgeIds = ref<string[]>([]);
    const selectedSkillIds = ref<string[]>([]);
    const pendingAttachments = ref<ComposerPendingAttachment[]>([]);
    const selectedModelCode = ref("");
    const attachmentUploading = ref(false);
    const activeConversationAction = ref<ConversationItem | null>(null);
    const isRenameConversationOpen = ref(false);
    const renameConversationValue = ref("");
    const drawerConversations = ref<ConversationItem[]>([]);
    const loadingDrawerConversations = ref(false);
    const loadingMoreDrawerConversations = ref(false);
    const drawerConversationCursor = ref<string | undefined>(undefined);
    const drawerConversationHasMore = ref(true);
    const composerDraftBySessionId = new Map<
      string,
      {
        inputValue: string;
        selectedKnowledgeIds: string[];
        selectedSkillIds: string[];
        pendingAttachments: ComposerPendingAttachment[];
      }
    >();
    let lastComposerSessionId: string | null = null;

    const messages = computed(() => {
      const sessionId = currentSessionId.value;
      const activeTurnId = sessionId == null ? null : (assistantState.activeTurnIdBySessionId[sessionId] ?? null);
      let lastAssistantIndex = -1;
      for (let i = sdkMessages.value.length - 1; i >= 0; i--) {
        if (sdkMessages.value[i]?.role === "assistant") {
          lastAssistantIndex = i;
          break;
        }
      }
      return sdkMessages.value
        .map((message, index) => {
          const isStreamingAssistant = message.role === "assistant" && index === lastAssistantIndex && sending.value;
          return mapAssistantMessage(message, {
            failure: index === lastAssistantIndex ? lastTurnFailure.value : null,
            liveTurnUsage: liveTurnTokenUsage.value,
            activeTurnId,
            toolEvents: toolEvents.value,
            streaming: isStreamingAssistant,
          });
        })
        .filter((item) => item != null);
    });
    const currentAgent = computed(() => agentOptions.value.find((item) => item.id === selectedAgentId.value) ?? agentOptions.value[0]);
    const selectedModel = computed<LlmOption | null>(() => {
      if (selectedModelCode.value === "") {
        return null;
      }
      return llmOptions.value.find((item) => item.modelCode === selectedModelCode.value) ?? null;
    });
    const selectedModelLabel = computed(() => {
      if (selectedModel.value != null) {
        return selectedModel.value.displayName;
      }
      if (llmOptionsLoading.value) {
        return "模型加载中...";
      }
      return llmOptions.value.length > 0 ? "请选择模型" : "暂无可用模型";
    });
    const groupedLlmOptions = computed(() => groupVisibleLlmOptions(llmOptions.value, modelMenuQuery.value));
    const agentTitle = computed(() => {
      if (currentAgent.value) {
        return currentAgent.value.name;
      }
      return agentOptionsLoading.value ? "智能体加载中..." : "暂无可用智能体";
    });
    const canUseAssistant = computed(() => hasUserAgents.value && !agentOptionsLoading.value);
    const conversations = computed(() => drawerConversations.value);
    const selectedReferences = computed(() => [
      ...(ENABLE_MANUAL_KNOWLEDGE_REFERENCES
        ? selectedKnowledgeIds.value.map((id) => ({
            id,
            type: "knowledge" as const,
            label: knowledgeOptions.value.find((item) => item.id === id)?.name ?? id,
          }))
        : []),
      ...selectedSkillIds.value.map((id) => ({
        id,
        type: "skill" as const,
        label: skillOptions.value.find((item) => item.id === id)?.name ?? id,
      })),
    ]);
    const canComposerSend = computed(
      () =>
        canUseAssistant.value && (inputValue.value.trim().length > 0 || pendingAttachments.value.length > 0) && !attachmentUploading.value,
    );
    const showNoAgentGuide = computed(() => !agentOptionsLoading.value && !hasUserAgents.value);
    const messageBottomOffset = computed(() => composerHeight.value + keyboardOffset.value);
    const pageStyle = computed<Record<string, string>>(() => ({
      "--chat-viewport-height": `${chatViewportHeight.value}px`,
      "--chat-viewport-top": `${chatViewportTop.value}px`,
    }));
    const noAgentGuideStyle = computed<Record<string, string>>(() => ({
      "--message-bottom-offset": `${messageBottomOffset.value}px`,
    }));

    const warnNoUsableAgent = (): boolean => {
      if (canUseAssistant.value) {
        return false;
      }
      showToast(agentOptionsLoading.value ? "智能体加载中，请稍后" : "暂无可用智能体");
      return true;
    };

    const createChatSession = (input: { agentId: string; context?: Record<string, unknown> }): Promise<string> => {
      const modelCode = selectedModelCode.value.trim();
      return createNewSession({
        agentId: input.agentId,
        title: DEFAULT_ASSISTANT_SESSION_TITLE,
        purpose: "chat",
        ...(modelCode ? { modelCode } : {}),
        ...(input.context ? { context: input.context } : {}),
      });
    };

    const mergeDrawerConversations = (items: ConversationItem[], reset: boolean): void => {
      if (reset) {
        drawerConversations.value = items;
        return;
      }
      const existingIds = new Set(drawerConversations.value.map((item) => item.id));
      drawerConversations.value = [...drawerConversations.value, ...items.filter((item) => !existingIds.has(item.id))];
    };

    const loadDrawerConversations = async (options: { reset?: boolean } = {}): Promise<void> => {
      const reset = options.reset === true;
      if (loadingDrawerConversations.value || loadingMoreDrawerConversations.value) {
        return;
      }
      if (!reset && !drawerConversationHasMore.value) {
        return;
      }
      if (reset) {
        loadingDrawerConversations.value = drawerConversations.value.length === 0;
        drawerConversationCursor.value = undefined;
        drawerConversationHasMore.value = true;
      } else {
        loadingMoreDrawerConversations.value = true;
      }

      try {
        const page = await fetchAssistantSessionPage(reset ? undefined : drawerConversationCursor.value);
        mergeDrawerConversations(page.items.map(mapSessionToConversation), reset);
        drawerConversationCursor.value = page.nextCursor;
        drawerConversationHasMore.value = page.hasMore;
      } catch (error) {
        showToast(error instanceof Error ? error.message : "历史对话加载失败");
      } finally {
        loadingDrawerConversations.value = false;
        loadingMoreDrawerConversations.value = false;
      }
    };

    const changeAgent = async (agentId: string, options: { createSession: boolean }): Promise<void> => {
      if (!agentId) {
        return;
      }
      const previousMessages = [...sdkMessages.value];
      selectedAgentId.value = agentId;
      if (!options.createSession) {
        return;
      }
      const systemSuffix = buildSystemSuffixFromMessages(previousMessages, CONTEXT_TURNS);
      try {
        await createChatSession({
          agentId,
          ...(systemSuffix ? { context: { systemSuffix } } : {}),
        });
      } catch (error) {
        showToast(error instanceof Error ? error.message : "切换智能体失败");
      }
    };

    let hasHandledRouteAgent = false;
    watch(
      () => [route.query.agentId, route.query.newConversationKey] as const,
      ([agentId, newConversationKey]) => {
        const nextAgentId = resolveAgentOptionId(agentId, agentOptions.value);
        if (!nextAgentId) {
          hasHandledRouteAgent = true;
          return;
        }
        const hasNewConversationRequest = typeof newConversationKey === "string" && newConversationKey.length > 0;
        const shouldCreateSession = hasHandledRouteAgent && (hasNewConversationRequest || nextAgentId !== selectedAgentId.value);
        hasHandledRouteAgent = true;
        void changeAgent(nextAgentId, { createSession: shouldCreateSession });
      },
      { immediate: true },
    );

    watch(
      llmOptions,
      (options) => {
        if (options.length === 0) {
          selectedModelCode.value = "";
          return;
        }
        if (selectedModelCode.value !== "" && options.some((option) => option.modelCode === selectedModelCode.value)) {
          return;
        }
        selectedModelCode.value = options[0].modelCode;
      },
      { immediate: true },
    );

    watch(
      () => isDrawerOpen.value,
      (open) => {
        if (open) {
          void loadDrawerConversations({ reset: true });
        }
      },
    );

    const getActiveGrant = (): PendingGrant | null => pendingGrants.value[0] ?? null;

    const handleGrantApprove = (scopeChoice: "ONCE" | "SESSION" | "PERSISTENT"): void => {
      const grant = getActiveGrant();
      if (grant == null) {
        return;
      }
      respondGrant({
        grantRequestId: grant.grantRequestId,
        decision: "APPROVE",
        scopeChoice,
      })
        .then(() => {
          showToast("已同意授权请求");
        })
        .catch((error: unknown) => {
          showToast(error instanceof Error ? error.message : "授权提交失败");
        });
    };

    const handleGrantDeny = (reason?: string): void => {
      const grant = getActiveGrant();
      if (grant == null) {
        return;
      }
      respondGrant({
        grantRequestId: grant.grantRequestId,
        decision: "DENY",
        note: reason ?? "user_denied",
      })
        .then(() => {
          if (reason !== "expired") {
            showToast("已拒绝授权请求");
          }
        })
        .catch((error: unknown) => {
          showToast(error instanceof Error ? error.message : "拒绝操作失败");
        });
    };

    const captureComposerDraft = (): {
      inputValue: string;
      selectedKnowledgeIds: string[];
      selectedSkillIds: string[];
      pendingAttachments: ComposerPendingAttachment[];
    } => ({
      inputValue: inputValue.value,
      selectedKnowledgeIds: ENABLE_MANUAL_KNOWLEDGE_REFERENCES ? [...selectedKnowledgeIds.value] : [],
      selectedSkillIds: [...selectedSkillIds.value],
      pendingAttachments: pendingAttachments.value.map((item) => ({ ...item })),
    });

    const restoreComposerDraft = (sessionId: string | null): void => {
      const draft = sessionId == null ? undefined : composerDraftBySessionId.get(sessionId);
      inputValue.value = draft?.inputValue ?? "";
      selectedKnowledgeIds.value = ENABLE_MANUAL_KNOWLEDGE_REFERENCES ? [...(draft?.selectedKnowledgeIds ?? [])] : [];
      selectedSkillIds.value = [...(draft?.selectedSkillIds ?? [])];
      pendingAttachments.value = draft?.pendingAttachments.map((item) => ({ ...item })) ?? [];
      isKnowledgeOpen.value = false;
      isSkillOpen.value = false;
    };

    const loadKnowledgeOptions = async (): Promise<void> => {
      try {
        const page = await cubeKnowledgeDocumentService.getKnowledgeDocumentList({
          pageNumber: 1,
          pageSize: 100,
          status: true,
        });
        const records = Array.isArray(page.records) ? page.records : [];
        knowledgeOptions.value = records.map((item) => ({
          id: item.id,
          name: item.name,
        }));
      } catch {
        knowledgeOptions.value = [];
        showToast("知识库加载失败");
      }
    };

    watch(
      () => agentOptions.value,
      (options) => {
        if (options.some((item) => item.id === selectedAgentId.value)) {
          return;
        }
        selectedAgentId.value = resolveInitialAgentId(options);
      },
    );

    watch(
      () => skillOptions.value,
      (options) => {
        const availableIds = new Set(options.map((item) => item.id));
        selectedSkillIds.value = selectedSkillIds.value.filter((id) => availableIds.has(id));
      },
    );

    watch(
      () => currentSessionId.value,
      (nextSessionId, previousSessionId) => {
        if (previousSessionId != null) {
          composerDraftBySessionId.set(previousSessionId, captureComposerDraft());
        } else if (lastComposerSessionId != null && lastComposerSessionId !== nextSessionId) {
          composerDraftBySessionId.set(lastComposerSessionId, captureComposerDraft());
        }
        lastComposerSessionId = nextSessionId;
        restoreComposerDraft(nextSessionId);
      },
      { immediate: true },
    );

    const ensureSession = async (): Promise<void> => {
      if (warnNoUsableAgent() || !selectedAgentId.value) {
        throw new Error("暂无可用智能体");
      }
      if (currentSessionId.value) {
        return;
      }
      await createChatSession({ agentId: selectedAgentId.value });
    };

    const sendToAssistant = async (): Promise<void> => {
      const content = inputValue.value;
      const text = content.trim();
      const attachments = pendingToImageAttachments(pendingAttachments.value);
      if (!text && attachments.length === 0) {
        return;
      }
      await ensureSession();
      const restoreValue = inputValue.value;
      const restoreAttachments = pendingAttachments.value.map((item) => ({ ...item }));
      inputValue.value = "";
      pendingAttachments.value = [];
      const modelCode = selectedModelCode.value.trim();
      const runtimeRefs = buildRuntimeRefs({
        knowledgeIds: ENABLE_MANUAL_KNOWLEDGE_REFERENCES ? selectedKnowledgeIds.value : [],
        knowledgeList: knowledgeOptions.value,
        skillIds: selectedSkillIds.value,
        skillList: skillOptions.value,
      });
      try {
        await sendAssistant(text, {
          ...(modelCode ? { modelCode } : {}),
          ...(runtimeRefs !== undefined ? { runtimeRefs } : {}),
          ...(attachments.length > 0 ? { attachments } : {}),
        });
      } catch (error) {
        inputValue.value = restoreValue;
        pendingAttachments.value = restoreAttachments;
        throw error;
      }
    };

    const handleComposerSend = (): void => {
      if (!canComposerSend.value || sending.value) {
        return;
      }
      sendToAssistant().catch((error: unknown) => {
        const errStr = String(error);
        if (
          errStr.includes("SESSION_BUSY") ||
          errStr.includes("SessionBusyError") ||
          errStr.includes("RESOURCE_CONFLICT_SESSION_BUSY") ||
          errStr.includes("409") ||
          errStr.includes("already has a running turn")
        ) {
          showToast("上一条回复尚未结束，请稍后再试");
          return;
        }
        showToast(error instanceof Error ? error.message : "消息发送失败");
      });
    };

    const handleCancel = (): void => {
      cancel().catch((error: unknown) => {
        showToast(error instanceof Error ? error.message : "停止失败");
      });
    };

    const speechInputController = new SpeechInputController({
      onStateChange: (state) => {
        voiceStatus.value = state.status;
      },
      onTranscribed: (text) => {
        if (warnNoUsableAgent()) {
          return;
        }
        const restore = inputValue.value;
        inputValue.value = text;
        sendToAssistant().catch((error: unknown) => {
          inputValue.value = restore;
          showToast(error instanceof Error ? error.message : "语音消息发送失败");
        });
      },
      onError: (error) => {
        showToast(error instanceof Error ? error.message : "语音识别失败");
      },
    });
    let voicePermissionPrepared = false;
    const activeVoicePointerIds = new Set<number>();
    const prepareVoiceInputPermission = async (): Promise<void> => {
      if (voicePermissionPrepared) {
        return;
      }
      const permission = await speechInputController.requestRecordPermission();
      if (!permission.granted) {
        throw new Error(permission.message ?? "未获取录音权限");
      }
      voicePermissionPrepared = true;
    };

    const composerActiveActionIds = computed(() => {
      const ids = new Set(activeActionIds.value);
      if (ENABLE_MANUAL_KNOWLEDGE_REFERENCES && selectedKnowledgeIds.value.length > 0) {
        ids.add("knowledge");
      }
      if (selectedSkillIds.value.length > 0) {
        ids.add("skill");
      }
      return [...ids];
    });

    const composerActions = ENABLE_MANUAL_KNOWLEDGE_REFERENCES
      ? [
          { id: "knowledge", label: "知识库" },
          { id: "skill", label: "技能" },
        ]
      : [{ id: "skill", label: "技能" }];
    const conversationSheetActions: ConversationSheetAction[] = [{ name: "删除该对话", value: "delete", color: "#dc2626" }];

    const toggleSimpleAction = (id: string): void => {
      const exists = activeActionIds.value.includes(id);
      activeActionIds.value = exists ? activeActionIds.value.filter((x) => x !== id) : [...activeActionIds.value, id];
    };

    const toggleKnowledge = (id: string): void => {
      const exists = selectedKnowledgeIds.value.includes(id);
      selectedKnowledgeIds.value = exists ? selectedKnowledgeIds.value.filter((x) => x !== id) : [...selectedKnowledgeIds.value, id];
    };

    const toggleSkill = (id: string): void => {
      const exists = selectedSkillIds.value.includes(id);
      selectedSkillIds.value = exists ? selectedSkillIds.value.filter((x) => x !== id) : [...selectedSkillIds.value, id];
    };

    const removeSelectedReference = (type: "knowledge" | "skill", id: string): void => {
      if (type === "knowledge") {
        selectedKnowledgeIds.value = selectedKnowledgeIds.value.filter((item) => item !== id);
        return;
      }
      selectedSkillIds.value = selectedSkillIds.value.filter((item) => item !== id);
    };

    const openModelSheet = (): void => {
      if (llmOptions.value.length === 0 && !llmOptionsLoading.value) {
        showToast("暂无可用模型");
        return;
      }
      modelMenuQuery.value = "";
      isModelOpen.value = true;
    };

    const closeModelSheet = (): void => {
      isModelOpen.value = false;
      modelMenuQuery.value = "";
    };

    const pickModel = (modelCode: string): void => {
      if (modelCode !== selectedModelCode.value) {
        selectedModelCode.value = modelCode;
        showToast("已切换模型");
      }
      closeModelSheet();
    };

    const handleVoicePressStart = (pointerId: number): void => {
      if (warnNoUsableAgent()) {
        return;
      }
      activeVoicePointerIds.add(pointerId);
      prepareVoiceInputPermission()
        .then(() => (activeVoicePointerIds.has(pointerId) ? speechInputController.handlePressStart(pointerId) : undefined))
        .catch((error: unknown) => {
          voicePermissionPrepared = false;
          activeVoicePointerIds.delete(pointerId);
          voiceStatus.value = "idle";
          showToast(error instanceof Error ? error.message : "语音录入启动失败");
        });
    };

    const switchInputMode = (): void => {
      if (warnNoUsableAgent()) {
        return;
      }
      const nextMode = inputMode.value === "text" ? "voice" : "text";
      inputMode.value = nextMode;
      if (nextMode !== "voice") {
        return;
      }
      prepareVoiceInputPermission().catch((error: unknown) => {
        voicePermissionPrepared = false;
        showToast(error instanceof Error ? error.message : "语音录入启动失败");
      });
    };

    const handleVoicePressEnd = (pointerId: number): void => {
      activeVoicePointerIds.delete(pointerId);
      speechInputController.handlePressEnd(pointerId).catch((error: unknown) => {
        showToast(error instanceof Error ? error.message : "语音录入结束失败");
      });
    };

    const handleVoicePressCancel = (pointerId: number): void => {
      activeVoicePointerIds.delete(pointerId);
      speechInputController.handlePressCancel(pointerId).catch((error: unknown) => {
        showToast(error instanceof Error ? error.message : "语音录入取消失败");
      });
    };

    const readBlobAsBase64 = async (blob: Blob): Promise<string> => {
      const buffer = await blob.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      let binary = "";
      for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]!);
      }
      return btoa(binary);
    };

    const getNameFromPath = (path: string): string => {
      const [name] = path.split("?")[0].split("/").toReversed();
      return name && name.length > 0 ? name : "图片";
    };

    const isAllowedImageFile = (file: { path: string; name?: string; type?: string; suffix?: string }): boolean => {
      const type = file.type?.toLowerCase() ?? "";
      if (type.startsWith("image/")) {
        return true;
      }
      const suffix = (file.suffix ?? file.name?.split(".").pop() ?? file.path.split("?")[0].split(".").pop() ?? "")
        .replace(".", "")
        .toLowerCase();
      return ["png", "jpg", "jpeg", "gif", "webp"].includes(suffix);
    };

    const uploadImagePath = async (file: {
      path: string;
      name?: string;
      type?: string;
      suffix?: string;
    }): Promise<ComposerPendingAttachment> => {
      if (!isAllowedImageFile(file)) {
        throw new Error("仅支持上传图片");
      }
      const response = await fetch(file.path);
      if (!response.ok) {
        throw new Error("图片读取失败");
      }
      const blob = await response.blob();
      const mimeType = file.type && file.type.startsWith("image/") ? file.type : blob.type || "image/jpeg";
      const name = file.name ?? getNameFromPath(file.path);
      const uploaded = await client.files.upload({
        mimeType,
        base64: await readBlobAsBase64(blob),
        fileName: name,
      });
      return {
        attachmentId: `att_${randomUUID().replace(/-/g, "")}`,
        fileId: uploaded.fileId,
        mimeType: uploaded.mimeType,
        previewUrl: uploaded.previewUrl,
        name,
        size: blob.size,
        localPreviewUrl: file.path,
      };
    };

    const addPendingImagePaths = async (files: { path?: string; name?: string; type?: string; suffix?: string }[]): Promise<void> => {
      const imageFiles = files.filter(
        (file): file is { path: string; name?: string; type?: string; suffix?: string } =>
          typeof file.path === "string" && file.path.length > 0,
      );
      if (imageFiles.length === 0) {
        return;
      }
      attachmentUploading.value = true;
      try {
        const attachments = await Promise.all(imageFiles.map(uploadImagePath));
        pendingAttachments.value = [...pendingAttachments.value, ...attachments];
      } finally {
        attachmentUploading.value = false;
      }
    };

    const removePendingAttachment = (attachmentId: string): void => {
      pendingAttachments.value = pendingAttachments.value.filter((item) => item.attachmentId !== attachmentId);
    };

    const handleTakePhoto = (): void => {
      if (warnNoUsableAgent()) {
        return;
      }
      cubeAppService
        .takePhoto({ sceneCode: GLOBAL_SCENE_CODE.aiApplicationCenter })
        .then((file) => addPendingImagePaths(file?.path ? [file] : []))
        .catch((error: unknown) => {
          showToast(error instanceof Error ? error.message : "拍照失败");
        });
    };

    const handleUploadFile = (): void => {
      if (warnNoUsableAgent()) {
        return;
      }
      cubeAppService
        .pickPhoto({ sceneCode: GLOBAL_SCENE_CODE.aiApplicationCenter, maxCount: 1 })
        .then((files) => addPendingImagePaths(files as { path?: string; name?: string; type?: string; suffix?: string }[]))
        .catch((error: unknown) => {
          showToast(error instanceof Error ? error.message : "上传图片失败，当前对话仅支持图片附件");
        });
    };

    const resolveAttachmentUrl = (url: string): string => resolveAttachmentPreviewSrc(url, agenticEngineBase);

    const previewAttachment = (attachment: ChatAttachment): void => {
      const url = resolveAttachmentUrl(attachment.url);
      if (attachment.kind === "image") {
        showImagePreview({ images: [url], closeable: true });
        return;
      }
      kkFilePreview({
        id: attachment.id,
        name: attachment.name,
        path: url,
        size: attachment.size ?? null,
        suffix: attachment.suffix ?? null,
        type: attachment.kind,
      });
    };

    const goAddAgentFromChat = (): void => {
      void router.replace({
        path: "/",
        query: {
          tab: "agents",
          from: "chat-empty",
        },
      });
    };

    const handleBack = (): void => {
      if (route.query.from === "ai-center") {
        void router.replace({ path: "/" });
        return;
      }
      if (initialBackPath && !initialBackPath.startsWith("/chat")) {
        void router.replace(initialBackPath);
        return;
      }
      cubeAppService.closePage().catch(() => {
        router.back();
      });
    };

    const startNewConversation = (): void => {
      if (warnNoUsableAgent() || !selectedAgentId.value) {
        return;
      }
      createChatSession({ agentId: selectedAgentId.value })
        .then((sessionId) => {
          composerDraftBySessionId.set(sessionId, {
            inputValue: "",
            selectedKnowledgeIds: [],
            selectedSkillIds: [],
            pendingAttachments: [],
          });
          inputValue.value = "";
          activeActionIds.value = [];
          selectedKnowledgeIds.value = [];
          selectedSkillIds.value = [];
          pendingAttachments.value = [];
          inputMode.value = "text";
          isDrawerOpen.value = false;
          void loadDrawerConversations({ reset: true });
        })
        .catch((error: unknown) => {
          showToast(error instanceof Error ? error.message : "创建会话失败");
        });
    };

    const switchConversation = (id: string): void => {
      openSession(id)
        .then(() => {
          inputValue.value = "";
          isDrawerOpen.value = false;
        })
        .catch((error: unknown) => {
          showToast(error instanceof Error ? error.message : "打开会话失败");
        });
    };

    const openConversationActions = (conversation: ConversationItem): void => {
      activeConversationAction.value = conversation;
    };

    const closeConversationActions = (): void => {
      activeConversationAction.value = null;
    };

    const deleteConversation = (conversation: ConversationItem): void => {
      closeConversationActions();
      showConfirmDialog({
        title: "删除对话",
        message: `确认删除「${conversation.title}」？`,
        confirmButtonText: "删除",
        cancelButtonText: "取消",
        confirmButtonColor: "#dc2626",
      })
        .then(async () => {
          composerDraftBySessionId.delete(conversation.id);
          if (lastComposerSessionId === conversation.id) {
            lastComposerSessionId = null;
          }
          drawerConversations.value = drawerConversations.value.filter((item) => item.id !== conversation.id);
          try {
            await removeSession(conversation.id);
            showToast("对话已删除");
          } catch (error) {
            showToast(error instanceof Error ? `已从列表移除；服务端删除未确认：${error.message}` : "已从列表移除；服务端删除未确认");
          }
        })
        .catch((error: unknown) => {
          if (error === "cancel") {
            return;
          }
          showToast(error instanceof Error ? error.message : "删除对话失败");
        });
    };

    const openRenameConversation = (conversation: ConversationItem): void => {
      closeConversationActions();
      activeConversationAction.value = conversation;
      renameConversationValue.value = conversation.title;
      isRenameConversationOpen.value = true;
    };

    const closeRenameConversation = (): void => {
      isRenameConversationOpen.value = false;
      renameConversationValue.value = "";
      activeConversationAction.value = null;
    };

    const submitRenameConversation = (): void => {
      const conversation = activeConversationAction.value;
      const title = renameConversationValue.value.trim();
      if (!conversation) {
        return;
      }
      if (title.length === 0) {
        showToast("请输入对话名称");
        return;
      }
      renameSession(conversation.id, title)
        .then(() => {
          drawerConversations.value = drawerConversations.value.map((item) => (item.id === conversation.id ? { ...item, title } : item));
          closeRenameConversation();
          showToast("对话名称已修改");
        })
        .catch((error: unknown) => {
          showToast(error instanceof Error ? error.message : "修改对话名称失败");
        });
    };

    const updateViewportLayout = (): void => {
      const layoutHeight = Math.max(0, Math.round(window.innerHeight));
      if (!window.visualViewport) {
        chatViewportHeight.value = layoutHeight;
        chatViewportTop.value = 0;
        keyboardOffset.value = 0;
        return;
      }
      const viewport = window.visualViewport;
      const visualHeight = Math.max(0, Math.round(viewport.height));
      const visualTop = Math.max(0, Math.round(viewport.offsetTop));
      chatViewportHeight.value = shouldUseVisualViewportLayout ? visualHeight : layoutHeight;
      chatViewportTop.value = shouldUseVisualViewportLayout ? visualTop : 0;

      const rawOffset = layoutHeight - viewport.height - viewport.offsetTop;
      keyboardOffset.value = !shouldUseVisualViewportLayout && rawOffset > 0 ? Math.round(rawOffset) : 0;
    };

    const scheduleViewportLayoutUpdate = (): void => {
      updateViewportLayout();
      requestAnimationFrame(updateViewportLayout);
    };

    const handleComposerHeightChange = (height: number): void => {
      const nextHeight = Math.ceil(height);
      if (nextHeight <= 0 || nextHeight === composerHeight.value) {
        return;
      }
      composerHeight.value = nextHeight;
    };

    onMounted(() => {
      if (ENABLE_MANUAL_KNOWLEDGE_REFERENCES) {
        void loadKnowledgeOptions();
      }
      void loadSkillOptions().catch(() => {
        showToast(skillOptionsError.value || "技能加载失败");
      });
      void loadAgentOptions().then(() => {
        const routeAgentId = resolveAgentOptionId(route.query.agentId, agentOptions.value);
        const nextAgentId = routeAgentId ?? resolveInitialAgentId(agentOptions.value);
        if (nextAgentId && nextAgentId !== selectedAgentId.value) {
          selectedAgentId.value = nextAgentId;
        }
      });
      scheduleViewportLayoutUpdate();
      window.addEventListener("resize", scheduleViewportLayoutUpdate);
      window.addEventListener("orientationchange", scheduleViewportLayoutUpdate);
      window.addEventListener("focusin", scheduleViewportLayoutUpdate);
      window.addEventListener("focusout", scheduleViewportLayoutUpdate);
      window.visualViewport?.addEventListener("resize", scheduleViewportLayoutUpdate);
      window.visualViewport?.addEventListener("scroll", scheduleViewportLayoutUpdate);
    });

    onBeforeUnmount(() => {
      window.removeEventListener("resize", scheduleViewportLayoutUpdate);
      window.removeEventListener("orientationchange", scheduleViewportLayoutUpdate);
      window.removeEventListener("focusin", scheduleViewportLayoutUpdate);
      window.removeEventListener("focusout", scheduleViewportLayoutUpdate);
      window.visualViewport?.removeEventListener("resize", scheduleViewportLayoutUpdate);
      window.visualViewport?.removeEventListener("scroll", scheduleViewportLayoutUpdate);
      activeVoicePointerIds.clear();
      speechInputController.dispose().catch((error: unknown) => {
        showToast(error instanceof Error ? error.message : "语音录入资源释放失败");
      });
    });

    const renderNoAgentGuide = (): VNode => (
      <section class={styles.noAgentGuide} style={noAgentGuideStyle.value}>
        <div class={styles.noAgentVisual} aria-hidden="true">
          <Icon name="friends-o" size="34" />
          <span class={styles.noAgentVisualBadge}>
            <Icon name="plus" size="14" />
          </span>
        </div>
        <h2>还没有可用智能体</h2>
        <p>先去 AI 中心添加智能体，添加后即可回到对话助手开始聊天。</p>
        <button type="button" class={styles.noAgentAction} onClick={goAddAgentFromChat}>
          <Icon name="plus" size="16" />
          <span>去 AI 中心添加</span>
        </button>
      </section>
    );

    return (): VNode => (
      <div class={styles.page} style={pageStyle.value}>
        <ChatHeader
          title={agentTitle.value}
          onBack={handleBack}
          onChangeAgent={() => {
            void router.push({ path: "/agent-select" });
          }}
          onOpenDrawer={() => {
            isDrawerOpen.value = true;
          }}
        />
        {showNoAgentGuide.value ? (
          renderNoAgentGuide()
        ) : (
          <MessageList
            messages={messages.value}
            hasMoreHistory={false}
            loadingHistory={false}
            showHistoryHeader={currentSessionId.value !== undefined && currentSessionId.value !== null}
            mediaBaseUrl={agenticEngineBase}
            bottomOffset={messageBottomOffset.value}
            onLoadHistory={undefined}
            onPreviewAttachment={previewAttachment}
          />
        )}
        <ChatComposer
          modelValue={inputValue.value}
          keyboardOffset={keyboardOffset.value}
          onHeightChange={handleComposerHeightChange}
          actions={composerActions}
          selectedModelLabel={selectedModelLabel.value}
          modelDisabled={llmOptions.value.length === 0 && !llmOptionsLoading.value}
          activeActionIds={composerActiveActionIds.value}
          selectedReferences={selectedReferences.value}
          pendingAttachments={pendingAttachments.value}
          inputMode={inputMode.value}
          voiceStatus={voiceStatus.value}
          sending={sending.value}
          canSend={canComposerSend.value}
          disabled={!canUseAssistant.value}
          onUpdateValue={(value: string) => {
            if (!canUseAssistant.value) {
              return;
            }
            inputValue.value = value;
          }}
          onClickAction={(id: string) => {
            if (warnNoUsableAgent()) {
              return;
            }
            if (ENABLE_MANUAL_KNOWLEDGE_REFERENCES && id === "knowledge") {
              isKnowledgeOpen.value = true;
              return;
            }
            if (id === "skill") {
              isSkillOpen.value = true;
              return;
            }
            toggleSimpleAction(id);
          }}
          onClickModel={openModelSheet}
          onToggleInputMode={() => {
            switchInputMode();
          }}
          onVoicePressStart={handleVoicePressStart}
          onVoicePressEnd={handleVoicePressEnd}
          onVoicePressCancel={handleVoicePressCancel}
          onTakePhoto={handleTakePhoto}
          onRemoveAttachment={removePendingAttachment}
          onRemoveReference={removeSelectedReference}
          handleUploadFile={handleUploadFile}
          onSend={handleComposerSend}
          onCancel={handleCancel}
        />
        <GrantConsentPopup grant={pendingGrants.value[0] ?? null} onApprove={handleGrantApprove} onDeny={handleGrantDeny} />
        <ConversationDrawer
          show={isDrawerOpen.value}
          conversations={conversations.value}
          activeConversationId={currentSessionId.value ?? ""}
          loading={loadingDrawerConversations.value}
          loadingMore={loadingMoreDrawerConversations.value}
          hasMore={drawerConversationHasMore.value}
          onClose={() => {
            isDrawerOpen.value = false;
          }}
          onNewConversation={startNewConversation}
          onSelectConversation={switchConversation}
          onMoreConversation={openConversationActions}
          onLoadMore={() => {
            void loadDrawerConversations();
          }}
        />
        <ActionSheet
          show={activeConversationAction.value != null && !isRenameConversationOpen.value}
          actions={conversationSheetActions}
          cancelText="取消"
          closeOnClickAction={false}
          onCancel={closeConversationActions}
          onUpdate:show={(show: boolean) => {
            if (!show) {
              closeConversationActions();
            }
          }}
          onSelect={(action: ConversationSheetAction) => {
            const conversation = activeConversationAction.value;
            if (!conversation) {
              return;
            }
            if (action.value === "delete") {
              deleteConversation(conversation);
              return;
            }
            if (action.value === "rename") {
              openRenameConversation(conversation);
            }
          }}
        />
        <Popup
          show={isRenameConversationOpen.value}
          position="center"
          class={styles.renamePopup}
          overlayClass={styles.renameOverlay}
          onClickOverlay={closeRenameConversation}
        >
          <div class={styles.renamePanel}>
            <div class={styles.renameTitle}>修改对话名称</div>
            <input
              class={styles.renameInput}
              value={renameConversationValue.value}
              maxlength={40}
              placeholder="请输入对话名称"
              onInput={(event) => {
                renameConversationValue.value = (event.target as HTMLInputElement).value;
              }}
              onKeydown={(event) => {
                if (event.key === "Enter") {
                  submitRenameConversation();
                }
              }}
            />
            <div class={styles.renameActions}>
              <button type="button" class={styles.renameCancelBtn} onClick={closeRenameConversation}>
                取消
              </button>
              <button type="button" class={styles.renameConfirmBtn} onClick={submitRenameConversation}>
                确定
              </button>
            </div>
          </div>
        </Popup>
        {ENABLE_MANUAL_KNOWLEDGE_REFERENCES ? (
          <KnowledgeSheet
            show={isKnowledgeOpen.value}
            knowledgeList={knowledgeOptions.value}
            selectedIds={selectedKnowledgeIds.value}
            onClose={() => {
              isKnowledgeOpen.value = false;
            }}
            onToggleKnowledge={toggleKnowledge}
          />
        ) : null}
        <SkillSheet
          show={isSkillOpen.value}
          skillList={skillOptions.value}
          loading={loadingSkillOptions.value}
          error={skillOptionsError.value}
          selectedIds={selectedSkillIds.value}
          onClose={() => {
            isSkillOpen.value = false;
          }}
          onToggleSkill={toggleSkill}
        />
        <Popup
          show={isModelOpen.value}
          position="bottom"
          class={styles.modelSheetPopup}
          overlayClass={styles.modelSheetOverlay}
          onClickOverlay={closeModelSheet}
          onUpdate:show={(show: boolean) => {
            if (!show) {
              closeModelSheet();
            }
          }}
        >
          <div class={styles.modelSheet}>
            <div class={styles.modelSheetHeader}>
              <div class={styles.modelSheetTitleWrap}>
                <span class={styles.modelSheetTitle}>选择模型</span>
                <span class={styles.modelSheetSubtitle}>{selectedModel.value?.modelCode ?? selectedModelLabel.value}</span>
              </div>
              <button type="button" class={styles.modelSheetClose} aria-label="关闭模型选择" onClick={closeModelSheet}>
                <Icon name="cross" size="18" />
              </button>
            </div>
            <div class={styles.modelSearchBox}>
              <Icon name="search" size="16" />
              <input
                class={styles.modelSearchInput}
                value={modelMenuQuery.value}
                placeholder="搜索模型名称或编码"
                onInput={(event) => {
                  modelMenuQuery.value = (event.target as HTMLInputElement).value;
                }}
              />
            </div>
            <div class={styles.modelOptionList}>
              {llmOptionsLoading.value && llmOptions.value.length === 0 ? (
                <div class={styles.modelEmptyState}>模型加载中...</div>
              ) : llmOptions.value.length === 0 ? (
                <div class={styles.modelEmptyState}>暂无可用模型，请先到模型管理新增</div>
              ) : groupedLlmOptions.value.length === 0 ? (
                <div class={styles.modelEmptyState}>未找到匹配模型</div>
              ) : (
                groupedLlmOptions.value.map((group) => (
                  <div key={group.providerName} class={styles.modelProviderGroup}>
                    <div class={styles.modelProviderHead}>{group.providerName}</div>
                    {group.items.map((option) => (
                      <button
                        type="button"
                        key={option.modelCode}
                        class={[styles.modelOption, selectedModelCode.value === option.modelCode ? styles.modelOptionActive : ""]}
                        onClick={() => pickModel(option.modelCode)}
                      >
                        <span class={styles.modelOptionIcon}>M</span>
                        <span class={styles.modelOptionBody}>
                          <span class={styles.modelOptionTitle}>{option.displayName}</span>
                          <span class={styles.modelOptionCode}>{option.modelCode}</span>
                        </span>
                        {selectedModelCode.value === option.modelCode ? <Icon name="success" size="18" /> : null}
                      </button>
                    ))}
                  </div>
                ))
              )}
            </div>
          </div>
        </Popup>
      </div>
    );
  },
});
