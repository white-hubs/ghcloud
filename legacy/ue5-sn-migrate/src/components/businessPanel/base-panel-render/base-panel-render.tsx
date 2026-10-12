import { computed, defineComponent, h, onBeforeUnmount, onMounted, ref } from 'vue'
import { CardDescribe,panelDefinition } from '@ghcloud/cube-visual-sdk'
import { CardCollective } from './card-register'
import { AlarmPanel, BusinessPanel } from '@/components'
import styles from './base-panel-render.module.less'

interface Props {
  panelName:string
  equipmentId:string;
  universalPanelVo:unknown;
  showPanel:boolean;
  showBusinessNav:boolean;
  position:'left'|'right';
}
/** 面板渲染组件 */
export const BasePanelRender = defineComponent({
  props:['panelName','equipmentId','universalPanelVo','showPanel','showBusinessNav','position'],
  setup(props:Props) {
    const panelKey = ref(0)
    const useLegacyPanel = computed(()=>{
      return !Object.keys(panelDefinition).includes(props.panelName)
    })
  
    const panelProps = computed(()=>{
      return {
        equipmentId:props.equipmentId,
        universalPanelVo:props.universalPanelVo
      }
    })

    const cards = computed<CardDescribe[]>(()=>{
      if(useLegacyPanel.value){
        return []
      }
      return panelDefinition[props.panelName].cards
    })

    const panel = computed(()=>{
      const res = BusinessPanel[props.panelName]??AlarmPanel[props.panelName]
      return useLegacyPanel.value ? 
        h(res??<div></div>,{ ...panelProps.value }) : 
        cards.value.map(e=>{
          return h(CardCollective[e.code], {
            key:e.code,
            ...panelProps.value,
            ...e
          })
        })
    })

    let timer = null
    onMounted(()=>{
      // 动态刷新面板数据
      timer=setInterval(() => {
        panelKey.value++
      }, 1000 * 60 * 60);
    })

    onBeforeUnmount(()=>{
      timer!==null && window.clearInterval(timer) 
    })

    return () => 
      <div id={`${props.position}-panel`} class={`${styles[props.position+'-panel']} ${props.showPanel && props.panelName ? styles.show : styles.hide} ${props.showBusinessNav?'':styles.hide}`}  key={props.panelName}> 
        {panel.value}
      </div>
  }
})