import { defineComponent, onMounted, onUnmounted, reactive, ref } from 'vue'
import styles from './entry.module.less'
import { Cell, CellGroup, Icon, Skeleton, showNotify } from 'vant'
import { CubeAppService } from '@ghcloud/cube-app-js-sdk'
import { useMetaTitle } from '@/hooks/use-meta-title-hook'
import { cubeMeetRoomService } from '@/api/server'
import { EntryMenu } from '@ghcloud/cube-app-generic-component'
import { routes } from '@/router'
import { getEnvironment } from '@ghcloud/cube-app-js-sdk/src/js/cube-h5-config'
import { cubeAppService } from '@ghcloud/cube-app-js-sdk'

/** 入口页面 */
export const Entry = defineComponent({
  setup: () => {
    cubeAppService.onVisibilityNativeAppBar(true)
    const isApp = getEnvironment() === 'cubeApp'
    const loading = ref(false)
    const statData = reactive({
      appointmentCount: 0,
      reservationCount: 0,
    })
    const timeOptions = [
      { label: '今日', value: 'TODAY' },
      { label: '本周', value: 'THIS_WEEK' },
      { label: '本月', value: 'THIS_MONTH' },
      { label: '今年', value: 'THIS_YEAR' },
    ]
    const timeSelect = ref('TODAY')
    const getData = async (): Promise<void> => {
      try {
        loading.value = true
        const data = await cubeMeetRoomService.getAppointmentStatistics({ format: timeSelect.value })
        statData.appointmentCount = data.appointmentCount
        statData.reservationCount = data.reservationCount
      } catch {
      } finally {
        setTimeout(() => {
          loading.value = false
        }, 0)
      }
    }
    const timeChange = (value: string): void => {
      timeSelect.value = value
      getData()
    }
    const handlePopState = (): void => {
      const cubeAppService = CubeAppService.getInstance()
      history.pushState(null, '', location.href)
      cubeAppService.closePage()
    }
    onMounted(() => {
      getData()
      useMetaTitle()
      if (isApp) {
        history.pushState(null, '', location.href)
        window.addEventListener('popstate', handlePopState, false)
      }
    })
    onUnmounted(() => {
      window.removeEventListener('popstate', handlePopState, false)
    })

    return (): JSX.Element =>
      <div class={styles.container}>
        <EntryMenu title='业务操作' applicationCode={__ENV__.applicationCode} routes={routes} />
        <CellGroup inset class={styles['app-group']}>
          <Cell
            title='数据看板'
            v-slots={{
              value: () => {
                return (
                  <div class={styles['time-picker']}>
                    {
                      timeOptions.map(e =>
                        <div
                          key={e.label}
                          class={`${e.value === timeSelect.value ? styles['time-picker-selected'] : ''}`}
                          onClick={() => {
                            timeChange(e.value)
                          }}
                        >
                          {e.label}
                        </div>)
                    }
                  </div>
                )
              }
            }}
          />
          <Cell>
            <div class={styles['stat-bottom']} v-show={!loading.value}>
              <div class={styles['stat-bottom-item']}>
                <div class={styles['stat-bottom-item-title']}>预约<Icon name='arrow' /></div>
                <div class={styles['stat-bottom-item-value']}>{statData.appointmentCount}</div>
              </div>
              <div class={styles['stat-bottom-item']}>
                <div class={styles['stat-bottom-item-title']}>取消<Icon name='arrow' /></div>
                <div class={styles['stat-bottom-item-value']}>{statData.reservationCount}</div>
              </div>
            </div>
            <Skeleton row={3} animated v-show={loading.value} />
          </Cell>
        </CellGroup>
      </div>
  }
})
