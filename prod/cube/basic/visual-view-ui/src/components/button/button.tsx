import {type PropType, defineComponent } from "vue";
import { NButton} from "naive-ui/es/button";
import type { Type, Size } from 'naive-ui/es/button/src/interface';

export const Button = defineComponent({
  props: {
    type: {
      type: String as PropType<Type>,
      default: "default",
    },
    text: {
      type: Boolean,
      default: false,
    },
    size: {
      type: String as PropType<Size>,
      default: "medium",
    },
    color: {
      type: String,
      default: undefined,
    },
    ghost: {
      type: Boolean,
      default: false,
    },
    dashed: {
      type: Boolean,
      default: false,
    },
    disabled:{
      type: Boolean,
      default: false,
    },
    block:{
      type: Boolean,
      default: false,
    },
    quaternary:{
      type: Boolean,
      default: false,
    },
    circle:{
      type: Boolean,
      default: false,
    },
  },
  emits: ['click'],
  setup(props, { slots, emit }) {
    const onclick = (): void => {
      // emit 子组件向父组件传值
      emit('click')
    }
    return () => {
      return (
        <>
           <NButton  {...props } onClick={onclick}>{slots}</NButton>
        </>
      );
    };
  },
});
