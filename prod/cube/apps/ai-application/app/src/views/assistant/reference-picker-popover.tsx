import { defineComponent, type PropType } from "vue";

import { SearchOutlined } from "@ghcloud/cube-ui";

import { referenceMenuHeadLabel, referenceMenuSearchPlaceholder } from "./assistant-chat-strings";
import { composerReferenceKey, type AssistantComposerReference, type AssistantReferenceMenuType } from "./assistant-chat-ui";

import styles from "./assistant-chat.module.less";

export const ReferencePickerPopover = defineComponent({
  name: "ReferencePickerPopover",
  props: {
    menuType: {
      type: String as PropType<AssistantReferenceMenuType>,
      required: true,
    },
    query: {
      type: String,
      required: true,
    },
    items: {
      type: Array as PropType<AssistantComposerReference[]>,
      required: true,
    },
    selectedKeys: {
      type: Object as PropType<ReadonlySet<string>>,
      required: true,
    },
  },
  emits: {
    close: () => true,
    "update:query": (_query: string) => true,
    toggle: (_ref: AssistantComposerReference) => true,
  },
  setup(props, { emit }) {
    return () => (
      <>
        <div class={styles.referenceOverlay} onClick={() => emit("close")} />
        <div class={styles.referencePopover} onClick={(event: MouseEvent) => event.stopPropagation()}>
          <div class={styles.referencePopoverSearch}>
            <div class={styles.referenceSearchWrap}>
              <SearchOutlined class={styles.referenceSearchIcon} />
              <input
                class={styles.referenceSearchInput}
                placeholder={referenceMenuSearchPlaceholder(props.menuType)}
                value={props.query}
                onInput={(event: Event) => {
                  emit("update:query", (event.target as HTMLInputElement).value);
                }}
              />
            </div>
          </div>
          <div class={styles.referencePopoverHead}>{referenceMenuHeadLabel(props.menuType)}</div>
          <div class={styles.referencePopoverList}>
            {props.items.map((ref) => {
              const selected = props.selectedKeys.has(composerReferenceKey(ref));
              return (
                <button
                  type="button"
                  key={composerReferenceKey(ref)}
                  class={[styles.referencePopoverItem, selected && styles.referencePopoverItemSelected]}
                  onClick={() => emit("toggle", ref)}
                >
                  <span class={[styles.referenceItemIcon, ref.type === "skill" && styles.skillItemIcon]}>
                    {ref.type === "kb" ? "KB" : "S"}
                  </span>
                  <span class={styles.referenceItemBody}>
                    <span class={styles.referenceItemTitle}>{ref.label}</span>
                    <span class={styles.referenceItemDesc}>{ref.description}</span>
                  </span>
                  {selected && <span class={styles.referenceItemSelectedMark}>已选</span>}
                </button>
              );
            })}
            {props.items.length === 0 && <div class={styles.referencePopoverEmpty}>没有匹配的引用</div>}
          </div>
        </div>
      </>
    );
  },
});
