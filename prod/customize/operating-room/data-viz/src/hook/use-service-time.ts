import { onMounted, onUnmounted, ref, type Ref } from 'vue'
import dayjs, { type Dayjs } from 'dayjs'

interface UseServiceTime {
  currentTime: Ref<Dayjs>;
  currentTimeStr: Ref<string>;
}

export const useServiceTime = (): UseServiceTime => {
  const format = 'YYYY年MM月DD日 HH:mm:ss'
  const timeDifference = ref(0) // 服务器与客户端时间差（毫秒）

  const serviceTime = ref('')
  const currentTime = ref<Dayjs>(dayjs())
  const currentTimeStr = ref('')

  let syncTimer: string | number | NodeJS.Timeout | undefined
  let updateTimer: string | number | NodeJS.Timeout | undefined

  const calculateTimeDifference = (): void => {
    const clientTime = dayjs()
    const serverTimeDayjs = dayjs(serviceTime.value)
    timeDifference.value = serverTimeDayjs.diff(clientTime)
  }

  // 更新显示的时间
  const updateShowTime = (): void => {
    const currentClientTime = dayjs()
    const currentServiceTime = currentClientTime.add(timeDifference.value, 'millisecond')
    currentTime.value = currentServiceTime
    currentTimeStr.value = currentServiceTime.format(format)
  }

  const getServiceTime = async (): Promise<void> => {
    try {
      const resp = await fetch('/api/serviceTime', { method: 'GET' })
      const res = await resp.text()
      serviceTime.value = res
      calculateTimeDifference()
    } catch (error) {
    }
  }

  const init = (): void => {
    getServiceTime()
    updateShowTime()

    updateTimer = setInterval(updateShowTime, 1000)

    syncTimer = setInterval(getServiceTime, 30 * 1000)
  }

  onMounted(() => {
    init()
  })

  onUnmounted(() => {
    clearInterval(updateTimer)
    clearInterval(syncTimer)
  })

  return {
    currentTime,
    currentTimeStr
  }
}