import { PropType, defineComponent,ref,watch} from 'vue'
import { NDrawer,NDrawerContent } from 'naive-ui'
// import { PathLike, watch } from 'fs'
import { Placement } from 'naive-ui/es/drawer/src/DrawerBodyWrapper'
export const Drawer = defineComponent({
  emits:['on-update:show'],
  props: {
    placement:{
      type: String as PropType<Placement> ,
      default: ''
    },
    width:{
      type: String,
      default: '400'
    },
    show: {
      type: Boolean ,
      default: true
    },
    title:{
      type: String,
      default: ''
    },
    trapFocus :{
      type: Boolean ,
      default: true
    },
    blockScroll:{
      type: Boolean ,
      default: true
    },
    to:{
      type: String,
      default: ''
    },
    zIndex:{
      type: Number,
      default: 1000
    },
  },
  setup (props, { slots }) {
    const show=ref(false)
    watch(() => props.show,()=>{
      show.value=props.show
    },{immediate:true})
    const onAfterLeave=()=>{
      show.value=true
     
    }
    return () => 
      <NDrawer 
      z-index={props.zIndex}
    v-model:show={show.value}  
    width={props.width} 
    placement={props.placement} 
    onMaskClick={onAfterLeave}
    trap-focus={props.trapFocus}
    block-scroll={props.blockScroll}
    to={props.to}
    show-mask={false}
    style={{background:'rgba(0,0,0,0)'}}
    >
      <NDrawerContent title={props.title} >
        {slots.default?.()}
        </NDrawerContent>
        <div style={{
          position: 'absolute',   
          top: 0,
          right: 0,  
          bottom: 0, 
          left: '-100px',
          background:'linear-gradient(to left,rgba(2,16,30,.94),rgba(4,20,39,0))',
          zIndex:'-10'}}></div>
    </NDrawer>
  }
})
