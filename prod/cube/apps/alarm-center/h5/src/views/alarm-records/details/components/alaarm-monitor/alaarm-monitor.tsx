import { defineComponent, onMounted, ref, type PropType } from 'vue'
import { Empty, showNotify } from 'vant'
import { linkageService } from '../../../../../api/server'
import type { EventVideo } from '@ghcloud/cube-linkage-service'
import type { AlarmDetails } from '@ghcloud/cube-alarm-center-service'
import { CubePlayer } from '@ghcloud/cube-player'
import styles from './alaarm-monitor.module.less'

export const AlaarmMonitor = defineComponent({
  props: {
    details: {
      type: Object as PropType<AlarmDetails>,
      default: () => {}
    }
  },
  setup: (props) => {
    const dataSource = ref<EventVideo[]>([])
    const loading = ref(false)
    const finished = ref(false)

    const getDataSource = async (): Promise<void> => {
      try {
        loading.value = true
        finished.value = false
        const response = await linkageService.getVideoListByEventId(props.details.businessKey)
        dataSource.value = response ?? []
      } catch {
        showNotify({ type: 'danger', message: '请求失败' })
      } finally {
        loading.value = false
        finished.value = true
      }
    }

    onMounted(() => {
      getDataSource()
    })

    return (): JSX.Element =>
      <>
        {
          (dataSource.value && dataSource.value.length > 0) &&
                    dataSource.value.map((item: EventVideo) => {
                      return (
                        <div class={styles['cell-item']} key={item.id}>
                          <CubePlayer
                            deviceId={item.deviceId?.toString() ?? ''}
                            control={true}
                          />
                        </div>
                      )
                    })
        }
        {(dataSource.value.length === 0 && finished.value) && <Empty description='暂无数据' />}
      </>
  }
})