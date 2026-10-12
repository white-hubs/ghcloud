import { Field, Picker, Popup } from "vant";
import { computed, defineComponent, ref, type PropType } from "vue";

import type { Option } from "@/views/supplies-list/supplies-shared";

import styles from "./option-picker.module.less";

export const OptionPicker = defineComponent({
  name: "OptionPicker",
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

    const confirm = ({ selectedValues }: { selectedValues: string[] }): void => {
      visible.value = false;
      const next = selectedValues[0] ?? "";
      if (next !== props.value) emit("change", next);
    };

    return () => (
      <>
        <Field
          class={styles.field}
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
          <Picker
            title={props.title}
            columns={props.options.map((item) => ({
              text: item.label,
              value: item.value,
            }))}
            onConfirm={confirm}
            onCancel={() => {
              visible.value = false;
            }}
          />
        </Popup>
      </>
    );
  },
});
