import { Field, Popup } from "vant";
import { computed, defineComponent, ref, type PropType } from "vue";

import type { Option } from "@/views/supplies-list/supplies-shared";

import styles from "./list-option-picker.module.less";

export const ListOptionPicker = defineComponent({
  name: "ListOptionPicker",
  props: {
    label: { type: String, required: true },
    value: { type: String, default: "" },
    options: { type: Array as PropType<Option[]>, default: () => [] },
    placeholder: { type: String, default: "请选择" },
    required: { type: Boolean, default: false },
    title: { type: String, default: "请选择" },
    labelWidth: { type: [Number, String], default: 96 },
  },
  emits: ["change"],
  setup: (props, { emit }) => {
    const visible = ref(false);

    const displayText = computed(() => props.options.find((item) => item.value === props.value)?.label ?? props.placeholder);

    const choose = (value: string): void => {
      visible.value = false;
      if (value !== props.value) emit("change", value);
    };

    return () => (
      <>
        <Field
          label={props.label}
          label-width={props.labelWidth}
          required={props.required}
          modelValue={props.value ? displayText.value : ""}
          readonly
          isLink
          placeholder={props.placeholder}
          onClick={() => {
            visible.value = true;
          }}
        />
        <Popup v-model:show={visible.value} position="bottom" round safeAreaInsetBottom>
          <div class={styles.sheet}>
            <div class={styles.sheetTitle}>{props.title}</div>
            <div class={styles.optionList}>
              {props.options.map((item) => (
                <button
                  type="button"
                  key={item.value}
                  class={[styles.option, item.value === props.value ? styles.active : ""]}
                  onClick={() => choose(item.value)}
                >
                  {item.label}
                </button>
              ))}
              {props.options.length === 0 ? <div class={styles.empty}>暂无可选物资</div> : null}
            </div>
          </div>
        </Popup>
      </>
    );
  },
});
