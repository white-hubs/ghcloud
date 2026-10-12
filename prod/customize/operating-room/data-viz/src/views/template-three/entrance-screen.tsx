import { setPageWidth } from '@/hook/use-fit'
import { computed, defineComponent, onMounted, ref } from 'vue'
import styles from './index.module.less'
import { EntranceScreenHeader } from './components/header/header'
import { useProps } from '@/hook/use-props'
import { storeCache, type RoomItem } from '@/store/cache'
import { NormDetail } from './components/norm-detail/norm-detail'

/** 门口屏 三期新版UI */
export const EntranceScreen = defineComponent({
  setup: () => {
    localStorage.setItem('auto-entrance-screen', 'true')

    const room = computed(() => {
      return cacheStore.roomList?.find(item => item.deviceId === cacheStore.roomSelect?.deviceId)
    })
    const cacheStore = storeCache()
    const cacheDeviceSelectKey = 'operating-room-select'
    const roomSelect = ref<RoomItem | undefined>(room.value ?? undefined)
    let usePropsRes = useProps(roomSelect.value?.code ?? '', roomSelect.value?.deviceId ?? '')

    const onRoomChange = (e: RoomItem): void => {
      usePropsRes.unSubscribe()
      roomSelect.value = e
      usePropsRes = useProps(roomSelect.value?.code ?? '', roomSelect.value?.deviceId ?? '')
      usePropsRes.subscribe()
      cacheStore.roomSelect = roomSelect.value ?? {}
      localStorage.setItem(cacheDeviceSelectKey, JSON.stringify(roomSelect.value))
    }
    onMounted(() => {
      setPageWidth(1280)
    })
    return (): JSX.Element =>
      <>
        <div class={styles['entrance-screen']}>
          <EntranceScreenHeader onChange={onRoomChange} />
          {
            roomSelect.value &&
            <NormDetail
              deviceInfo={roomSelect.value}
              roomRules={usePropsRes.rule.value}
              deviceProps={usePropsRes.getDeviceProps.value}
              effective={usePropsRes.effective.value}
            />
          }
        </div>
      </>
  }
})
