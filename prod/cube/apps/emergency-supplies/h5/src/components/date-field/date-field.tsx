import { DatePicker, Field, Popup } from "vant";
import { defineComponent, ref } from "vue";

import { formatDate, toDateParts } from "@/utils/format-datetime";

export const DateField = defineComponent({
  name: "DateField",
  props: {
    label: { type: String, required: true },
    value: { type: String, default: "" },
    placeholder: { type: String, default: "请选择日期" },
    required: { type: Boolean, default: false },
    title: { type: String, default: "选择日期" },
    labelWidth: { type: [Number, String], default: 96 },
  },
  emits: ["change"],
  setup: (props, { emit }) => {
    const visible = ref(false);
    const pickerValue = ref<string[]>(toDateParts(props.value));

    const displayValue = (): string => formatDate(props.value);

    const open = (): void => {
      pickerValue.value = toDateParts(props.value);
      visible.value = true;
    };

    const confirm = ({ selectedValues }: { selectedValues: string[] }): void => {
      visible.value = false;
      const next = selectedValues.join("-");
      if (next !== displayValue()) emit("change", next);
    };

    return () => (
      <>
        <Field
          label={props.label}
          label-width={props.labelWidth}
          required={props.required}
          modelValue={displayValue()}
          readonly
          isLink
          placeholder={props.placeholder}
          onClick={open}
        />
        <Popup v-model:show={visible.value} position="bottom" round safeAreaInsetBottom>
          <DatePicker
            title={props.title}
            v-model={pickerValue.value}
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
