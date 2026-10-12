import { defineComponent, ref } from 'vue'
import styles from './switch-model-alarm.module.less'
// import { useStateStore } from '@/pages/state/use-state-store'
// import { eventInstance } from '@/pages/event/event'

/** 切换报警弹窗状态 */
export const SwitchModelAlarm = defineComponent({
  setup () {
    const state = ref(Boolean(localStorage.getItem('modelAlarmStatus')))
    function handleClick (): void {
      if(state.value){
        localStorage.removeItem('modelAlarmStatus')
      }else{
        localStorage.setItem('modelAlarmStatus', '1')
      }
      state.value = !state.value
    }
    return (): JSX.Element => <div class={styles.item} onClick={handleClick}>{state.value ? '关闭' : '开启'}免打扰</div>
  }
})
