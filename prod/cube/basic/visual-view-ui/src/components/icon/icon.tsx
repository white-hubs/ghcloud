import {type PropType, defineComponent,type Component } from "vue";
import { NIcon,} from "naive-ui";
import{type Depth} from 'naive-ui/es/icon/src/Icon'
export const Icon = defineComponent({
    props: {
        color: {
        type: String ,
        default: undefined,
      },
      depth: {
        type: Number as PropType<Depth>,
        default: 1,
      },
      size: {
        type: [Number,String],
        default: undefined,
      },
      component: {
        type: String as PropType<Component>,
        default: undefined,
      },
    },
    setup(props, { slots }) {
      return () => {
        return (
          <>
             <NIcon  {...props }>{slots}</NIcon>
          </>
        );
      };
    },
  });
  