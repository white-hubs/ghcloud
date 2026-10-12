import { PropType, VNode, defineComponent } from "vue";
import { NList} from "naive-ui";
export const List = defineComponent({
  props:{
    bordered:{
      type:Boolean,
      default:false
    },
    clickable:{
      type:Boolean,
      default:false
    },
    hoverable:{
      type:Boolean,
      default:true
    },
    showDivider:{
      type:Boolean,
      default:false
    },
    footer:{
      type:Object as PropType<VNode>,
      default:()=>{}
    },
    header:{
      type:Object as PropType<VNode>,
      default:()=>{}
    },
  },
    setup(props, { slots }) {
      const listSlots = {
        footer: ()=>props.footer,
        header:()=>props.header
      }
      return () => {
        return (
          <>
          {
          props.footer??props.header?<NList  {...props } v-slots={listSlots}>{slots.default?.()}</NList>:<NList  {...props } >{slots.default?.()}</NList>}
          </>
        );
      };
    },
  });
   