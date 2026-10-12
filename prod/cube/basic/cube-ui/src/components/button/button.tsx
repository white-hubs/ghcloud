import AButton, { type ButtonShape, type ButtonSize, type ButtonType } from "ant-design-vue/es/button";
import { type PropType, VNode, defineComponent, ref } from "vue";
export interface ButtonProps {
  onClick: () => void;
}

export const Button = defineComponent({
  props: {
    type: {
      type: String as PropType<ButtonType>,
      default: "default",
    },
    icon: {
      type: Object as PropType<VNode | undefined>,
      default: undefined,
    },
    danger: {
      type: Boolean,
      default: false,
    },
    block: {
      type: Boolean,
      default: false,
    },
    size: {
      type: String as PropType<ButtonSize>,
      default: "middle",
    },
    shape: {
      type: String as PropType<ButtonShape>,
      default: "default",
    },
    loading: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    ghost: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["click"],
  setup(props, { slots, emit, expose }) {
    const onclick = (event: MouseEvent): void => {
      emit("click", event);
    };
    const btnRef = ref();
    expose({
      focus: (): void => {
        btnRef.value?.focus();
      },
      blur: (): void => {
        btnRef.value?.blur();
      },
    });
    return (): JSX.Element => {
      return <AButton {...props} onClick={onclick} ref={btnRef} v-slots={slots} />;
    };
  },
});
