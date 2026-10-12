import { InputPassword as AInputPassword, type InputProps } from "ant-design-vue/es";
import type { ChangeEvent } from "ant-design-vue/es/_util/EventInterface";
import { defineComponent } from "vue";

export default defineComponent({
  emits: ["inputFocus", "input", "update:value", "pressEnter"],
  props: {
    placeholder: {
      type: String,
      default: "请输入",
    },
    maxlength: {
      type: Number,
      default: 20,
    },
    showCount: {
      type: Boolean,
      default: true,
    },
    allowClear: {
      type: Boolean,
      default: true,
    },
    readonly: {
      type: Boolean,
      default: false,
    },
    value: {
      type: String,
      default: "",
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  setup(props: InputProps, { attrs, emit }) {
    const onFocus = (): void => {
      emit("inputFocus");
    };
    const onInput = (event: ChangeEvent): void => {
      emit("input", event);
    };
    const onUpdateValue = (value: string): void => {
      emit("update:value", value);
    };
    const onPressEnter = (): void => {
      emit("pressEnter");
    };
    return (): JSX.Element => (
      <AInputPassword
        {...attrs}
        {...props}
        value={props.value}
        onFocus={onFocus}
        onInput={onInput}
        onUpdate:value={onUpdateValue}
        onPressEnter={onPressEnter}
      />
    );
  },
});
