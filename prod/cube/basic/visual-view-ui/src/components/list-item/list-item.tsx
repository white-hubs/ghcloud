import { defineComponent ,PropType,type VNode} from "vue";
import { NListItem} from "naive-ui";
export const ListItem = defineComponent({
  props:{
    prefix:{
      type:Object as PropType<VNode>,
      default:()=>{}
    },
    suffix:{
      type:Object as PropType<VNode>,
      default:()=>{}
    },
  },
    setup(props, { slots }) {
      const listItemSlots = {
        prefix: ()=>props.prefix,
        suffix:()=>props.suffix
      }
      return () => {
        return (
          <>
             <NListItem  v-slots={listItemSlots}>{slots.default?.()}</NListItem>
          </>
        );
      };
    },
  });
   