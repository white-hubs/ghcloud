import { defineComponent, ref, onMounted, onUnmounted } from 'vue'
import { RTCCore } from '../../core/rtc-core'
import { Constants } from '../../data/constants'
import styles from './call-timer.module.less'

export const CallTimer = defineComponent({
  setup () {
    const timeText = ref('00:00')

    const formatTime = (timeCount: number): string => {
      const hour = Math.floor(timeCount / 3600);
      const hourShow = hour <= 9 ? `0${hour}` : `${hour}`;
      const minute = Math.floor((timeCount % 3600) / 60);
      const minuteShow = minute <= 9 ? `0${minute}` : `${minute}`;
      const second = timeCount % 60;
      const secondShow = second <= 9 ? `0${second}` : `${second}`;
      return hour > 0
        ? `${hourShow}:${minuteShow}:${secondShow}`
        : `${minuteShow}:${secondShow}`;
    }

    const updateTime = (): void => {
      const seconds = 0 // CallState.getInstance().getTimeCount()
      timeText.value = formatTime(seconds)
    }

    onMounted(() => {
      RTCCore.getInstance().registerEvent(Constants.STATE_EVENT.REFRESH_TIMING, updateTime)
    })

    onUnmounted(() => {
      RTCCore.getInstance().unregisterEvent(Constants.STATE_EVENT.REFRESH_TIMING, updateTime)
    })

    return (): JSX.Element => (
      <div class={styles["call-timer"]}>{timeText.value}</div>
    )
  }
})