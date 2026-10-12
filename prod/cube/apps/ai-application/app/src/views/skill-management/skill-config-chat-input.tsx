import { computed, defineComponent, nextTick, ref, watch, type PropType } from "vue";

import {
  applyConfigMentionSelection,
  filterConfigMentionOptions,
  findActiveConfigMention,
  type ActiveConfigMention,
  type ConfigMentionOption,
} from "./skill-config-mention";

import styles from "./skill-management.module.less";

export const SkillConfigChatInput = defineComponent({
  name: "SkillConfigChatInput",
  props: {
    value: {
      type: String,
      default: "",
    },
    placeholder: {
      type: String,
      default: "",
    },
    rows: {
      type: Number,
      default: 2,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    class: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
  },
  emits: ["update:value", "send"],
  setup(props, { emit }) {
    const textareaRef = ref<HTMLTextAreaElement | null>(null);
    const activeMention = ref<ActiveConfigMention | null>(null);
    const showMenu = ref(false);
    const highlightIndex = ref(0);

    const filteredOptions = computed(() => filterConfigMentionOptions(activeMention.value?.query ?? ""));

    const syncMentionFromCaret = (): void => {
      const el = textareaRef.value;
      if (!el || props.disabled) {
        activeMention.value = null;
        showMenu.value = false;
        return;
      }
      const mention = findActiveConfigMention(props.value ?? "", el.selectionStart ?? props.value.length);
      activeMention.value = mention;
      showMenu.value = mention != null;
      highlightIndex.value = 0;
    };

    const closeMenu = (): void => {
      showMenu.value = false;
      activeMention.value = null;
    };

    const selectOption = (option: ConfigMentionOption): void => {
      const el = textareaRef.value;
      const mention = activeMention.value;
      if (!el || !mention) {
        return;
      }
      const { text, caret } = applyConfigMentionSelection(props.value ?? "", mention, option.label);
      emit("update:value", text);
      closeMenu();
      void nextTick(() => {
        el.focus();
        el.setSelectionRange(caret, caret);
      });
    };

    watch(
      () => props.disabled,
      (disabled) => {
        if (disabled) {
          closeMenu();
        }
      },
    );

    const handleInput = (event: Event): void => {
      const el = event.target as HTMLTextAreaElement;
      emit("update:value", el.value);
      syncMentionFromCaret();
    };

    const handleKeydown = (event: KeyboardEvent): void => {
      if (showMenu.value && filteredOptions.value.length > 0) {
        if (event.key === "ArrowDown") {
          event.preventDefault();
          highlightIndex.value = (highlightIndex.value + 1) % filteredOptions.value.length;
          return;
        }
        if (event.key === "ArrowUp") {
          event.preventDefault();
          highlightIndex.value = (highlightIndex.value - 1 + filteredOptions.value.length) % filteredOptions.value.length;
          return;
        }
        if (event.key === "Enter" || event.key === "Tab") {
          event.preventDefault();
          selectOption(filteredOptions.value[highlightIndex.value]!);
          return;
        }
        if (event.key === "Escape") {
          event.preventDefault();
          closeMenu();
          return;
        }
      }

      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        closeMenu();
        emit("send");
      }
    };

    return () => (
      <div class={[styles.configMentionWrap, props.class]}>
        {showMenu.value && filteredOptions.value.length > 0 ? (
          <div class={styles.configMentionMenu} role="listbox" aria-label="配置项">
            {filteredOptions.value.map((option, index) => (
              <button
                key={option.key}
                type="button"
                role="option"
                aria-selected={index === highlightIndex.value}
                class={[styles.configMentionItem, index === highlightIndex.value ? styles.configMentionItemActive : undefined]}
                onMousedown={(event: MouseEvent) => {
                  event.preventDefault();
                }}
                onClick={() => {
                  selectOption(option);
                }}
              >
                <span class={styles.configMentionLabel}>@{option.label}</span>
              </button>
            ))}
          </div>
        ) : null}
        <textarea
          ref={textareaRef}
          class={styles.configMentionTextarea}
          value={props.value}
          placeholder={props.placeholder}
          rows={props.rows}
          disabled={props.disabled}
          maxlength={20000}
          onInput={handleInput}
          onClick={syncMentionFromCaret}
          onKeyup={syncMentionFromCaret}
          onKeydown={handleKeydown}
        />
      </div>
    );
  },
});
