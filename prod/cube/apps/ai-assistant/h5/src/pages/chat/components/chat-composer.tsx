import { Icon } from "vant";
import { computed, defineComponent, nextTick, onBeforeUnmount, onMounted, ref, watch, type PropType, type VNode } from "vue";

import type { ComposerPendingAttachment } from "../types";

import styles from "../chat.module.less";

interface ComposerAction {
  id: string;
  label: string;
}

interface SelectedReferenceChip {
  id: string;
  type: "knowledge" | "skill";
  label: string;
}

export type ComposerInputMode = "text" | "voice";
type VoiceInputStatus = "idle" | "starting" | "recording" | "transcribing";
const TOUCH_POINTER_ID = -1;

export const ChatComposer = defineComponent({
  name: "ChatComposer",
  props: {
    modelValue: {
      type: String,
      required: true,
    },
    keyboardOffset: {
      type: Number,
      required: true,
    },
    onHeightChange: {
      type: Function as PropType<(height: number) => void>,
      default: undefined,
    },
    actions: {
      type: Array as PropType<ComposerAction[]>,
      required: true,
    },
    selectedModelLabel: {
      type: String,
      required: true,
    },
    modelDisabled: {
      type: Boolean,
      default: false,
    },
    activeActionIds: {
      type: Array as PropType<string[]>,
      required: true,
    },
    selectedReferences: {
      type: Array as PropType<SelectedReferenceChip[]>,
      required: true,
    },
    pendingAttachments: {
      type: Array as PropType<ComposerPendingAttachment[]>,
      required: true,
    },
    inputMode: {
      type: String as PropType<ComposerInputMode>,
      required: true,
    },
    voiceStatus: {
      type: String as PropType<VoiceInputStatus>,
      required: true,
    },
    sending: {
      type: Boolean,
      default: false,
    },
    canSend: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    onUpdateValue: {
      type: Function as PropType<(value: string) => void>,
      required: true,
    },
    onClickAction: {
      type: Function as PropType<(id: string) => void>,
      required: true,
    },
    onClickModel: {
      type: Function as PropType<() => void>,
      required: true,
    },
    onToggleInputMode: {
      type: Function as PropType<() => void>,
      required: true,
    },
    onVoicePressStart: {
      type: Function as PropType<(pointerId: number) => void>,
      required: true,
    },
    onVoicePressEnd: {
      type: Function as PropType<(pointerId: number) => void>,
      required: true,
    },
    onVoicePressCancel: {
      type: Function as PropType<(pointerId: number) => void>,
      required: true,
    },
    onTakePhoto: {
      type: Function as PropType<() => void>,
      required: true,
    },
    onRemoveAttachment: {
      type: Function as PropType<(attachmentId: string) => void>,
      required: true,
    },
    onRemoveReference: {
      type: Function as PropType<(type: SelectedReferenceChip["type"], id: string) => void>,
      required: true,
    },
    handleUploadFile: {
      type: Function as PropType<() => void>,
      required: true,
    },
    onSend: {
      type: Function as PropType<() => void>,
      required: true,
    },
    onCancel: {
      type: Function as PropType<() => void>,
      required: true,
    },
  },
  setup: (props): (() => VNode) => {
    const composerRef = ref<HTMLElement | null>(null);
    const textareaRef = ref<HTMLTextAreaElement | null>(null);
    const maxHeight = 120;
    let resizeObserver: ResizeObserver | null = null;

    const notifyHeightChange = (): void => {
      const height = Math.ceil(composerRef.value?.offsetHeight ?? 0);
      if (height > 0) {
        props.onHeightChange?.(height);
      }
    };

    const scheduleHeightChange = (): void => {
      void nextTick(() => {
        notifyHeightChange();
      });
    };

    const adjustHeight = (): void => {
      if (!textareaRef.value) {
        return;
      }
      textareaRef.value.style.height = "auto";
      const nextHeight = Math.min(textareaRef.value.scrollHeight, maxHeight);
      textareaRef.value.style.height = `${nextHeight}px`;
    };

    watch(
      () => props.modelValue,
      () => {
        adjustHeight();
        scheduleHeightChange();
      },
      { immediate: true },
    );

    /** DOM 类型的 TextareaAttributes 暂未包含 enterkeyhint；用运行时属性保证输入法显示「发送」 */
    watch(
      () => props.inputMode,
      async () => {
        if (props.inputMode !== "text") {
          return;
        }
        await nextTick();
        const el = textareaRef.value;
        if (!el) {
          return;
        }
        el.setAttribute("enterkeyhint", "send");
        el.setAttribute("autocomplete", "off");
        el.setAttribute("autocorrect", "off");
        notifyHeightChange();
      },
      { immediate: true },
    );

    watch(
      () => [props.pendingAttachments.length, props.selectedReferences.length, props.inputMode, props.voiceStatus] as const,
      () => {
        scheduleHeightChange();
      },
      { immediate: true },
    );

    onMounted(() => {
      scheduleHeightChange();
      if (typeof ResizeObserver === "undefined" || !composerRef.value) {
        return;
      }
      resizeObserver = new ResizeObserver(() => {
        notifyHeightChange();
      });
      resizeObserver.observe(composerRef.value);
    });

    onBeforeUnmount(() => {
      resizeObserver?.disconnect();
      resizeObserver = null;
    });

    const containerStyle = computed<Record<string, string>>(() => ({
      "--keyboard-offset": `${props.keyboardOffset}px`,
    }));
    const supportsPointerEvent = (): boolean => "PointerEvent" in window;

    const voiceInputText = computed(() => {
      switch (props.voiceStatus) {
        case "starting":
          return "准备录音...";
        case "recording":
          return "松开结束说话";
        case "transcribing":
          return "正在识别...";
        case "idle":
          return "按住说话";
        default:
          return "按住说话";
      }
    });

    const handleTextareaKeydown = (event: KeyboardEvent): void => {
      if (props.disabled) {
        event.preventDefault();
        return;
      }
      if (event.key !== "Enter") {
        return;
      }
      if (event.shiftKey) {
        return;
      }
      if (event.isComposing) {
        return;
      }
      event.preventDefault();
      if (props.canSend) {
        props.onSend();
      }
      textareaRef.value?.blur();
    };

    return (): VNode => (
      <footer ref={composerRef} class={styles.composer} style={containerStyle.value}>
        <div class={styles.actionTools}>
          <button
            class={[styles.actionBtn, styles.modelActionBtn]}
            type="button"
            disabled={props.disabled || props.modelDisabled}
            onClick={props.onClickModel}
          >
            <span class={styles.modelActionLabel}>模型</span>
            <span class={styles.modelActionName}>{props.selectedModelLabel}</span>
          </button>
          {props.actions.map((item) => (
            <button
              key={item.id}
              class={[styles.actionBtn, props.activeActionIds.includes(item.id) ? styles.actionBtnActive : ""]}
              type="button"
              disabled={props.disabled}
              onClick={() => {
                props.onClickAction(item.id);
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
        {props.pendingAttachments.length > 0 ? (
          <div class={styles.pendingAttachmentList}>
            {props.pendingAttachments.map((attachment) => (
              <div key={attachment.attachmentId} class={styles.pendingAttachmentItem}>
                <img src={attachment.localPreviewUrl ?? attachment.previewUrl} alt={attachment.name} />
                <button
                  type="button"
                  class={styles.pendingAttachmentRemove}
                  aria-label="移除附件"
                  onClick={() => {
                    props.onRemoveAttachment(attachment.attachmentId);
                  }}
                >
                  <Icon name="cross" size="12" />
                </button>
              </div>
            ))}
          </div>
        ) : null}
        {props.selectedReferences.length > 0 ? (
          <div class={styles.selectedReferenceList}>
            {props.selectedReferences.map((item) => (
              <span
                key={`${item.type}-${item.id}`}
                class={[styles.selectedReferenceChip, item.type === "skill" ? styles.skillReferenceChip : ""]}
              >
                <span class={styles.selectedReferenceType}>{item.type === "knowledge" ? "知识库" : "技能"}</span>
                <span class={styles.selectedReferenceName}>{item.label}</span>
                <button
                  type="button"
                  class={styles.selectedReferenceRemove}
                  aria-label={`移除${item.label}`}
                  onClick={() => {
                    props.onRemoveReference(item.type, item.id);
                  }}
                >
                  <Icon name="cross" size="12" />
                </button>
              </span>
            ))}
          </div>
        ) : null}
        <div class={styles.inputRow}>
          <button class={styles.iconBtn} type="button" aria-label="拍照" disabled={props.disabled} onClick={props.onTakePhoto}>
            <Icon name="photograph" size="24" />
          </button>
          {props.inputMode === "text" ? (
            <textarea
              ref={textareaRef}
              class={styles.textarea}
              rows={1}
              value={props.modelValue}
              placeholder="发消息或按住说话..."
              disabled={props.disabled}
              readonly={props.disabled}
              onInput={(event) => {
                if (props.disabled) {
                  return;
                }
                props.onUpdateValue((event.target as HTMLTextAreaElement).value);
              }}
              onKeydown={handleTextareaKeydown}
            />
          ) : (
            <button
              class={[styles.voiceInputBtn, props.voiceStatus === "recording" ? styles.voiceInputBtnActive : ""]}
              type="button"
              disabled={props.voiceStatus === "transcribing" || (props.disabled && props.voiceStatus !== "recording")}
              onContextmenu={(event) => {
                event.preventDefault();
              }}
              onPointerdown={(event) => {
                event.preventDefault();
                if (props.disabled) {
                  return;
                }
                (event.currentTarget as HTMLButtonElement).setPointerCapture(event.pointerId);
                props.onVoicePressStart(event.pointerId);
              }}
              onPointerup={(event) => {
                event.preventDefault();
                props.onVoicePressEnd(event.pointerId);
              }}
              onPointercancel={(event) => {
                props.onVoicePressCancel(event.pointerId);
              }}
              onTouchstart={(event) => {
                if (supportsPointerEvent()) {
                  return;
                }
                event.preventDefault();
                if (props.disabled) {
                  return;
                }
                props.onVoicePressStart(TOUCH_POINTER_ID);
              }}
              onTouchend={(event) => {
                if (supportsPointerEvent()) {
                  return;
                }
                event.preventDefault();
                props.onVoicePressEnd(TOUCH_POINTER_ID);
              }}
              onTouchcancel={() => {
                if (supportsPointerEvent()) {
                  return;
                }
                props.onVoicePressCancel(TOUCH_POINTER_ID);
              }}
            >
              {voiceInputText.value}
            </button>
          )}
          <button
            class={styles.iconBtn}
            type="button"
            aria-label={props.inputMode === "text" ? "切换语音输入" : "切换文字输入"}
            disabled={props.disabled}
            onClick={props.onToggleInputMode}
          >
            {props.inputMode === "text" ? (
              <svg class={styles.microphoneIcon} viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 4a3 3 0 0 0-3 3v5a3 3 0 0 0 6 0V7a3 3 0 0 0-3-3Z" />
                <path d="M6 11.5a6 6 0 0 0 12 0" />
                <path d="M12 17.5V21" />
                <path d="M9 21h6" />
              </svg>
            ) : (
              <span class={styles.keyboardIcon} />
            )}
          </button>
          <button class={styles.iconBtn} type="button" aria-label="上传图片" disabled={props.disabled} onClick={props.handleUploadFile}>
            <Icon name="plus" size="24" />
          </button>
          <button
            class={[styles.sendBtn, props.sending ? styles.stopBtn : ""]}
            type="button"
            aria-label={props.sending ? "停止生成" : "发送"}
            disabled={!props.sending && !props.canSend}
            onClick={() => {
              if (props.sending) {
                props.onCancel();
                return;
              }
              props.onSend();
            }}
          >
            <Icon name={props.sending ? "pause-circle-o" : "guide-o"} size="20" />
          </button>
        </div>
      </footer>
    );
  },
});
