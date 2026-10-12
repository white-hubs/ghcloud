import { DatePicker, Field, PickerGroup, Popup, TimePicker } from "vant";
import { defineComponent, ref } from "vue";

import { formatDateTimeMinute, toDateTimeParts } from "@/utils/format-datetime";

export const DateTimeField = defineComponent({
  name: "DateTimeField",
  props: {
    label: { type: String, required: true },
    value: { type: String, default: "" },
    placeholder: { type: String, default: "请选择时间" },
    required: { type: Boolean, default: false },
    title: { type: String, default: "选择时间" },
    labelWidth: { type: [Number, String], default: 96 },
  },
  emits: ["change"],
  setup: (props, { emit }) => {
    const visible = ref(false);
    const pickerValue = ref(toDateTimeParts(props.value));

    const displayValue = (): string => formatDateTimeMinute(props.value);

    const open = (): void => {
      pickerValue.value = toDateTimeParts(props.value);
      visible.value = true;
    };

    const confirm = (): void => {
      visible.value = false;
      const next = `${pickerValue.value.date.join("-")} ${pickerValue.value.time.join(":")}`;
      if (next !== props.value) emit("change", next);
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
          <PickerGroup
            title={props.title}
            tabs={["选择日期", "选择时间"]}
            next-step-text="下一步"
            onConfirm={confirm}
            onCancel={() => {
              visible.value = false;
            }}
          >
            <DatePicker v-model={pickerValue.value.date} />
            <TimePicker v-model={pickerValue.value.time} />
          </PickerGroup>
        </Popup>
      </>
    );
  },
});
