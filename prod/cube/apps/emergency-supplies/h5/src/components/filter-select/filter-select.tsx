import { Popup } from "vant";
import { defineComponent, type PropType, ref } from "vue";

import styles from "./filter-select.module.less";

export type FilterOption = { text: string; value: string };

export const FilterSelect = defineComponent({
  name: "FilterSelect",
  props: {
    value: { type: String, default: "" },
    options: { type: Array as PropType<FilterOption[]>, default: () => [] },
    placeholder: { type: String, default: "请选择" },
    title: { type: String, default: "请选择" },
  },
  emits: ["change"],
  setup: (props, { emit }) => {
    const visible = ref(false);

    const currentText = (): string => props.options.find((item) => item.value === props.value)?.text ?? props.placeholder;

    const choose = (value: string): void => {
      visible.value = false;
      if (value !== props.value) emit("change", value);
    };

    return () => (
      <>
        <button
          type="button"
          class={styles.trigger}
          onClick={() => {
            visible.value = true;
          }}
        >
          <span class={styles.triggerText}>{currentText()}</span>
          <span class={styles.caret} />
        </button>
        <Popup v-model:show={visible.value} position="bottom" round safeAreaInsetBottom>
          <div class={styles.sheet}>
            <div class={styles.sheetTitle}>{props.title}</div>
            {props.options.map((item) => (
              <button
                type="button"
                key={item.value}
                class={[styles.option, item.value === props.value ? styles.active : ""]}
                onClick={() => choose(item.value)}
              >
                {item.text}
              </button>
            ))}
          </div>
        </Popup>
      </>
    );
  },
});
