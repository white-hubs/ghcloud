import { defineComponent } from "vue";
import styles from "./title-bar.module.less";
import { useClientUIState, WindowAction } from '../../hook/use-client'
const titleIcon = "/resource/v1/desktop-client-ui/icon.png"
import { CloseButton, MaximizeButton, MinimizeButton } from './components/action-button/action-button'

interface Props {
  title: string;
  logo: string;
}

/** 顶部标题栏 */
export const TitleBar = defineComponent({
  props: ['title', 'logo'],
  emits: ['windowSet'],
  setup (props: Props, { emit }) {
    const { inDeskTopClient } = useClientUIState()
    const handleWindowSet = (action: WindowAction): void => {
      emit('windowSet', action)
    }
    return (): JSX.Element => {
      return <div class={`${styles['title-bar']} ${inDeskTopClient ? styles['can-be-drag'] : ''}`}>
        <div class={styles['title']}>
          <img src={props.logo ?? titleIcon} alt="" />
          <span class={styles['text']}>{props.title}</span>
        </div>
        <div class={styles['window-set']}>
          <MinimizeButton
            v-show={inDeskTopClient}
            onClick={()=>{
              handleWindowSet(WindowAction.MINIMIZE)
            }} />
          <MaximizeButton onClick={()=>{
            handleWindowSet(WindowAction.MAXIMIZE)
          }} />
          <CloseButton onClick={()=>{
            handleWindowSet(WindowAction.CLOSE)
          }} />
        </div>
      </div>
    }
  }
})