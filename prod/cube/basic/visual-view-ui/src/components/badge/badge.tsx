import {type PropType, defineComponent } from "vue";
import { NBadge} from "naive-ui";
 type badgeType= 'default' | 'success' | 'error' | 'warning' | 'info'
export const Badge = defineComponent({
  props: {
    color: {
      type: String 
    },
    value:{
      type:Number,
    },
    dot: {
      type: Boolean,
      default: false,
    },
    max:{
      type: Number,
    },
    showZero:{
      type: Boolean,
      default: false,
    },
    show:{
      type: Boolean,
      default: true,
    },
    type:{
      type:String as PropType<badgeType>,
      default: 'default'
    }
  },
  emits: ['click'],
  setup(props, { slots }) {
    return () => {
      return (
        <>
           <NBadge  {...props } >{slots.default?.()}</NBadge>
        </>
      );
    };
  },
});
