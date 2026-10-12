import { defineComponent } from 'vue'
import styles from './switch-model-tour-around.module.less'
import { useStateStore } from '@/pages/state/use-state-store'
import { eventInstance } from '@/pages/event/event'

/** 切换环游状态 */
export const SwitchModelTourAround = defineComponent({
  props: ['defaultCameraView'],
  setup () {
    const { globalState } = useStateStore()
    function handleClick (): void {
      eventInstance.emitEvent('changeModelTourAroundStatus')
    }
    return (): JSX.Element => <div class={styles.item} onClick={handleClick}>{globalState.tourAround ? '关闭' : '开启'}环游</div>
  }
})
