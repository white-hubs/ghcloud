import { ArrowsAltOutlined, CloseOutlined, LoadingOutlined, MinusOutlined, ShrinkOutlined } from "@ant-design/icons-vue";
import * as lottie from "lottie-web";
import { defineAsyncComponent, defineComponent, nextTick, onBeforeUnmount, onMounted, ref, Teleport } from "vue";

import {
  type AssistantChatHostExpose,
  formatModelCommandAck,
  parseAssistantCommandFromContent,
  readAssistantMessageContent,
  readAssistantMessageId,
  useAssistantChatHost,
} from "@ghcloud/cube-ai-application-app";
import { CubeMfRootGlobalState } from "@ghcloud/cube-mf-root";
import type { CubeAuth } from "@ghcloud/cube-protocol";
import { SecurityAnalysisReport } from "@ghcloud/cube-safety-supervision-app/src/views/security-analysis/security-analysis-report/security-analysis-report.tsx";
import { CubeSpeechAI } from "@ghcloud/cube-speech-assistant";
import { DragBox } from "@ghcloud/desktop-client-ui/src/components/calling-interface-for-web/drag-box";

import { executeCommandDetailed } from "./ai-command";
import robotLottie from "./assets/robot-lottie.json";

import "./chat-assistant.less";

const iAmHere = "/resource/v1/audio/i-am-here.mp3";
const okAudio = "/resource/v1/audio/ok.mp3";
const iCannotUnderstand = "/resource/v1/audio/i-cannot-understand.mp3";
const audioMap = {
  "i-am-here": new Audio(iAmHere),
  ok: new Audio(okAudio),
  iCannotUnderstand: new Audio(iCannotUnderstand),
};

const AssistantChatDrawer = defineAsyncComponent(async () => {
  const module = await import("@ghcloud/cube-ai-application-app");
  return module.AssistantChatDrawer;
});

const speechAI = CubeSpeechAI.getInstance();

export const ChatAssistant = defineComponent({
  name: "ChatAssistant",
  setup() {
    const openStatus = ref(false);
    const assistantRef = ref<AssistantChatHostExpose | null>(null);
    const loadStatus = ref(false);
    const fullScreen = ref(false);
    const iconDrag = ref(false);
    const iconPosition = {
      x: document.body.clientWidth - 170,
      y: document.body.clientHeight - 170,
    };
    const replyLoading = ref(false);
    const awakenStatus = ref(false);
    const speechText = ref("");
    const markdownText = ref("");
    const visible = ref(false);
    const voiceSessionActive = ref(false);
    const aiIconRef = ref<HTMLElement | null>(null);
    let cleanTextTimer: ReturnType<typeof setTimeout> | null = null;
    const handledCommandMessageIds = new Set<string>();

    const {
      authInfo,
      initialDraft,
      chatContext,
      openDrawer: openDrawerRaw,
      closeDrawer,
      submitMessage,
      handleReady,
      handleResponse: publishResponse,
      handleThinking: publishThinking,
      handleSessionChange: publishSessionChange,
      handleStateChange,
    } = useAssistantChatHost({
      resolveAuth: () => CubeMfRootGlobalState.getInstance().mfRootState.authInfo as CubeAuth | null,
      assistantRef,
      isOpen: openStatus,
      onResponse(payload) {
        replyLoading.value = false;
        const fromVoice = voiceSessionActive.value;
        voiceSessionActive.value = false;
        awakenStatus.value = false;

        const content = readAssistantMessageContent(payload);
        const command = parseAssistantCommandFromContent(content);
        if (command) {
          const messageId = readAssistantMessageId(payload);
          if (!messageId || handledCommandMessageIds.has(messageId)) {
            return;
          }
          handledCommandMessageIds.add(messageId);
          void executeCommandDetailed(command).then((result) => {
            const ack = formatModelCommandAck(result.ok, command.action);
            const text = result.ok || !result.reason ? ack : `${ack}：${result.reason}`;
            assistantRef.value?.setCommandAckForMessage(messageId, text);
            if (fromVoice) {
              void (result.ok ? audioMap.ok : audioMap.iCannotUnderstand).play();
              speechText.value = "";
              openStatus.value = false;
            }
          });
          return;
        }

        if (fromVoice && content.trim()) {
          speechText.value = "";
          markdownText.value = content;
          openStatus.value = true;
        }
      },
      onThinking() {
        if (voiceSessionActive.value) {
          speechText.value = "";
          markdownText.value = "";
          openStatus.value = true;
          awakenStatus.value = false;
        }
      },
    });

    async function openDrawer(
      payload: {
        draft?: string;
        message?: string;
        context?: Record<string, unknown>;
      } = {},
    ): Promise<void> {
      await openDrawerRaw({
        ...payload,
        context: {
          source: "ue5",
          ...payload.context,
        },
      });
    }

    function handleSessionChange(payload: Parameters<typeof publishSessionChange>[0]): void {
      handledCommandMessageIds.clear();
      publishSessionChange(payload);
    }

    function handelClickChat(): void {
      if (iconDrag.value) {
        return;
      }
      if (!openStatus.value) {
        void openDrawer();
        return;
      }
      closeDrawer();
    }

    function onMaximize(): void {
      fullScreen.value = true;
    }

    function onMinimize(): void {
      if (fullScreen.value) {
        fullScreen.value = false;
        return;
      }
      openStatus.value = false;
    }

    function onClose(): void {
      closeDrawer();
    }

    function dragEnd(): void {
      setTimeout(() => {
        iconDrag.value = false;
      }, 0);
    }

    function handleResponse(payload: Parameters<typeof publishResponse>[0]): void {
      publishResponse(payload);
    }

    function handleThinking(payload: Parameters<typeof publishThinking>[0]): void {
      publishThinking(payload);
    }

    function handelClickAnalysis(): void {
      visible.value = !visible.value;
    }

    function createClearTextTimer(): void {
      cleanTextTimer = setTimeout(() => {
        speechText.value = "";
        awakenStatus.value = false;
      }, 8000);
    }

    speechAI.statesCallBack = () => {};

    speechAI.onSpeakingCallBack = (textValue: string) => {
      if (!awakenStatus.value || replyLoading.value) {
        return;
      }
      speechText.value = textValue;
      if (cleanTextTimer) {
        clearTimeout(cleanTextTimer);
      }
      createClearTextTimer();
    };

    speechAI.onSpeakEndCallBack = (textValue: string) => {
      if (cleanTextTimer) {
        clearTimeout(cleanTextTimer);
      }
      if (textValue.includes("小安") && !awakenStatus.value) {
        awakenStatus.value = true;
        speechText.value = "";
        markdownText.value = "";
        void audioMap["i-am-here"].play();
        createClearTextTimer();
        return;
      }
      if (awakenStatus.value && !replyLoading.value && textValue.length > 2) {
        replyLoading.value = true;
        speechText.value = textValue;
        voiceSessionActive.value = true;
        void submitMessage({
          message: textValue,
          context: { source: "ue5-voice" },
        });
      }
    };

    onMounted(() => {
      speechAI.connectService();
      loadStatus.value = true;
      void nextTick(() => {
        if (aiIconRef.value) {
          lottie.loadAnimation({
            container: aiIconRef.value,
            animationData: robotLottie,
            renderer: "svg",
            loop: true,
            autoplay: true,
          });
        }
      });
    });

    onBeforeUnmount(() => {
      if (cleanTextTimer) {
        clearTimeout(cleanTextTimer);
      }
    });

    return (): JSX.Element => (
      <div class="chat-assistant-root">
        {loadStatus.value && (
          <div
            class="speech-safety-analysis"
            onClick={(e) => {
              e.stopPropagation();
              handelClickAnalysis();
            }}
          >
            安全分析
          </div>
        )}
        <Teleport to="body">
          {visible.value && (
            <div class="speech-safety-analysis-modal-body" onClick={handelClickAnalysis}>
              <div
                class="speech-safety-analysis-modal-main"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <div class="speech-safety-analysis-modal-close" onClick={handelClickAnalysis}>
                  <CloseOutlined />
                </div>
                <SecurityAnalysisReport otherHeight={52} />
              </div>
            </div>
          )}
          {loadStatus.value && (
            <DragBox
              initPosition={iconPosition}
              onDrag={() => {
                iconDrag.value = true;
              }}
              onDragEnd={dragEnd}
            >
              <div class="ai-icon" ref={aiIconRef} onClick={handelClickChat} />
            </DragBox>
          )}
          {/* 关闭时勿挂白底壳：Teleport + z-index:-1 会从半透明侧栏透出浅色块 */}
          {openStatus.value && !awakenStatus.value && (
            <div class={["ai-widget-holder", "ai-elements--right", fullScreen.value ? "ai-fullscreen" : ""].filter(Boolean).join(" ")}>
              <div class="window-action">
                <div
                  class="item item-green"
                  onClick={() => {
                    fullScreen.value ? onMinimize() : onMaximize();
                  }}
                >
                  {fullScreen.value ? <ShrinkOutlined /> : <ArrowsAltOutlined />}
                </div>
                <div class="item item-yellow" onClick={onMinimize}>
                  <MinusOutlined />
                </div>
                <div class="item item-red" onClick={onClose}>
                  <CloseOutlined />
                </div>
              </div>
              <div class="ai-chat-panel">
                {authInfo.value?.token && (
                  <AssistantChatDrawer
                    ref={assistantRef}
                    auth={authInfo.value}
                    visible={openStatus.value}
                    initialDraft={initialDraft.value}
                    context={{ source: "ue5", ...chatContext.value }}
                    fullscreen={fullScreen.value}
                    onClose={closeDrawer}
                    onReady={handleReady}
                    onResponse={handleResponse}
                    onThinking={handleThinking}
                    onSessionChange={handleSessionChange}
                    onStateChange={handleStateChange}
                  />
                )}
              </div>
            </div>
          )}
          <div
            class="speech-drawer"
            style={{
              transform: `translateY(${awakenStatus.value || speechText.value || markdownText.value ? "0" : "200%"})`,
            }}
          >
            <div class="robot" />
            {speechText.value && (
              <div class="text">
                {speechText.value}
                {replyLoading.value && <LoadingOutlined style={{ marginLeft: "20px" }} />}
              </div>
            )}
            {markdownText.value && <div v-html={markdownText.value} class="markdown-text" />}
            {!markdownText.value && <div class="cube-speech-wave-view" />}
          </div>
        </Teleport>
      </div>
    );
  },
});
