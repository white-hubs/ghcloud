import { defineComponent, onMounted, reactive, ref, type VNode } from 'vue'
import styles from './entry.module.less'
import { Cell, CellGroup, showNotify, Icon } from 'vant'
import { EntryMenu, CubeNavBar } from '@ghcloud/cube-app-generic-component'
import { routes } from '@/router'
import { useMetaTitle } from '../hooks/use-meta-title-hook'
import { useRoute, useRouter } from 'vue-router'
import { getAssetsFile, timePeriod } from '@/utils'
import { RatioPie } from '../../components/echart/ratio-pie'
import { cubeDailyTaskService, cubeMaintainService } from '@/api/server'
import { CubeAppBusinessBridge } from '@ghcloud/cube-app-js-sdk'
import dayjs from 'dayjs'
/** 入口页面 */
interface EventStatistics {
  name: string; num: number; ratio: number; event: string;type?: string;
}
export const Entry = defineComponent({
  name: 'Entry',
  setup: () => {
    useMetaTitle()
    const router = useRouter()
    const route = useRoute()
    // const handleScanCode = async (): Promise<void> => {
    //   try {
    //     // 扫码
    //     const codeEntity = await CubeAppBusinessBridge.handleBusinessScanCodeToObject()
    //     const targetId = codeEntity?.entityId ?? ''
    //     const targetCategory = codeEntity?.entityType ?? ''
    //     if (targetId?.length > 0) {
    //       router.push({ path: '/inspection-object', query: { targetId, targetCategory } })
    //     } else {
    //       showNotify({ type: 'danger', message: '实体对象数据异常' })
    //     }
    //   } catch (err) {
    //     showNotify({ type: 'danger', message: '未查询到绑定对象' })
    //   }
    // }
    const loading = ref(false)
    const eventStatistics = ref<EventStatistics[]>([
      { name: '日常任务数', num: 0, ratio: 0, event: 'task' },
      // { name: '进行中任务数', num: 0, ratio: 0, event: 'task', type: 'EXECUTING' },
      { name: '未完成任务数', num: 0, ratio: 0, event: 'task', type: 'EXPIRE' },
    ])
    const getData = async (): Promise<void> => {
      try {
        loading.value = true
        const data = await cubeDailyTaskService.getStatistics({ type: timeSelect.value, period: timePeriod(timeSelect.value),dailyType:'DAILY_TASK' })
        // 今年巡检任务数
        eventStatistics.value[0].num = data.dailyTaskNum
        eventStatistics.value[0].ratio = data.dailyTaskNumRate
        // // 进行中任务数
        // eventStatistics.value[1].num = data.processTaskNum
        // eventStatistics.value[1].ratio = data.processTaskNumRate
        // 过期未完成任务数
        eventStatistics.value[1].num = data.uncompletedTaskNum
        eventStatistics.value[1].ratio = data.uncompletedTaskNumRate
      } catch (error) {
        showNotify({ message: '获取数据失败', type: 'danger' })
      } finally {
        setTimeout(() => {
          loading.value = false
        }, 0)
      }
    }
    const toItem = (item: EventStatistics): void => {
      if (item.event === 'inspection') {
        router.push({ path: '/standing-book', query: { type: item.type } })
      } else {
        router.push({ path: '/my-inspection', query: { status: item.type } })
      }
    }
    onMounted(() => {
      const name =  window.location.search
      if(name && name === '?DAILY_INSPECTION'){
        router.replace({ path: '/entry-inspection' })  
      }
      getData()
    })
    const timeOptions = [
      { label: '今日', value: 'TODAY' },
      { label: '本周', value: 'THIS_WEEK' },
      { label: '本月', value: 'THIS_MONTH' },
      { label: '今年', value: 'THIS_YEAR' },
    ]
    const timeSelect = ref('TODAY')
    const timeChange = (value: string): void => {
      timeSelect.value = value
      getData()
    }
    return (): VNode =>
      <>
        <CubeNavBar showBack title='日常任务'  />
        <div class={styles.container}>
          <EntryMenu title='业务操作' applicationCode={__ENV__.applicationCode} routes={routes} />
          <CellGroup inset class={styles['app-group']}>
            <Cell
              title='数据总览'
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
             <Cell border={false}>
              <div class={styles['inspection-num']} v-show={!loading.value}>
                {eventStatistics.value.map(item =>
                  <div class={styles['inspection-num-item']} key={item.name} onClick={() => {
                    toItem(item)
                  }}>
                    <div class={styles['item-title']}>{item.num}</div>
                    <div class={styles['item-radio']}>
                      <span style={{ marginTop: '20px' }}>环比</span>
                      <span style={{ color: `${item.ratio < 0 ? 'green' : 'red'}` }}>
                        {item.ratio}%<img width='10' src={item.ratio < 0 ? getAssetsFile('ic_trend_down.svg') : getAssetsFile('ic_trend_up.svg')} alt='' />
                      </span>
                    </div>
                    <div class={styles['item-name']}>{item.name}</div>
                  </div>)}
              </div>
            </Cell>
          </CellGroup>
        </div>
      </>
  }
})
