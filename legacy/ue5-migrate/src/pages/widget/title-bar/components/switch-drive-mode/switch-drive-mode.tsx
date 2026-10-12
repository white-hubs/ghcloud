import { defineComponent } from 'vue'
import styles from './switch-drive-mode.module.less'
import { useStateStore } from '@/pages/state/use-state-store'
import { eventInstance } from '@/pages/event/event'

/** 驾驶模式 */
export const SwitchDriveMode = defineComponent({
  setup () {
    const { globalState } = useStateStore()

    function handleClick (): void {
      globalState.driveMode = !globalState.driveMode
      globalState.panel.visible = !globalState.driveMode
      eventInstance.emitEvent('changeTouchInterface', globalState.driveMode)
      if (!globalState.driveMode) {
        eventInstance.emitEvent('setFirstPerspective')
      }
    }

    return (): JSX.Element => <div class={styles.item} onClick={handleClick}>{globalState.driveMode ? '退出' : '进入'}驾驶模式</div>
  }
})
