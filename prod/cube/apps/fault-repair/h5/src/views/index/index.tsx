import { defineComponent, onMounted, ref } from 'vue'
import styles from './index.module.less'
import { Cell, CellGroup, Skeleton, showNotify } from 'vant'
import { useRouter } from 'vue-router'
import { useMetaTitle } from '../hooks/use-meta-title-hook'
import {
  cubeFaultRepairService,
  cubeMaintainService,
} from '@/api/server'
import { getAssetsFile, timePeriod } from '@/utils'
import { CubeNavBar, EntryMenu } from '@ghcloud/cube-app-generic-component'
import { routes } from '@/router'

interface HiddenData {
  name: string;
  value: number;
}
/** 入口页面 */
export const Entry = defineComponent({
  name: 'Entry',
  setup: () => {
    const router = useRouter()
    const loading = ref(false)
    const caseNumber = ref(0)
    const statistics = [
      { name: '发起数', type: 'SUBMIT', value: 0 },
      { name: '待处理数', type: 'WAITING', value: 0 },
      { name: '处理数', type: 'HANDLED', value: 0 }
    ]
    const timeOptions = [
      { label: '今日', value: timePeriod() },
      { label: '本周', value: timePeriod('WEEK') },
      { label: '本月', value: timePeriod('MONTH') },
      { label: '今年', value: timePeriod('YEAR') },
    ]
    const hiddenLevelList = ref<HiddenData[]>([])
    const hiddenClassifyList = ref<HiddenData[]>([])
    const timeSelect = ref(timePeriod())
    const getData = async (): Promise<void> => {
      try {
        loading.value = true
        const { hiddenClassify, hiddenLevel } = await cubeMaintainService.getHiddenStatistics({ period: timeSelect.value })
        caseNumber.value = await cubeMaintainService.getFaultSummary({ period: timeSelect.value })
        hiddenClassifyList.value = hiddenClassify.map(x => {
          return { name: x.name, value: x.num }
        })
        hiddenLevelList.value = hiddenLevel.map(x => {
          return { name: x.name, value: x.num }
        })
        const { waitingCount, finishedCount, submitCount } = await cubeFaultRepairService.genFlowNumber({ period: timeSelect.value, applicationCode: 'FAULT' })
        statistics[0].value = submitCount
        statistics[1].value = waitingCount
        statistics[2].value = finishedCount
      } catch {
        showNotify({ message: '获取数据失败', type: 'danger' })
      } finally {
        loading.value = false
      }
    }
    const timeChange = (value: string): void => {
      timeSelect.value = value
      getData()
    }
    onMounted(() => {
      getData()
      useMetaTitle()
    })

    return (): JSX.Element =>
      <>
        <CubeNavBar showBack title='故障报修' />
        <div class={styles.container}>
          <EntryMenu title='业务操作' applicationCode='FAULT' routes={routes} />
          <CellGroup inset class={styles['app-group']}>
            <Cell
              title='故障报修'
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
                {statistics.map(item =>
                  <div
                    class={styles['stat-bottom-item']} key={item.name}
                    onClick={() => {
                      if (item.value > 0) {
                        router.push({ path: '/fault-list', query: { type: item.type, period: timeSelect.value } })
                      }
                    }}
                  >
                    <div class={styles['stat-bottom-item-title']}>{item.value}</div>
                    <div class={styles['stat-bottom-item-value']}>{item.name}</div>
                  </div>)}
              </div>
              <Skeleton row={3} animated v-show={loading.value} />
            </Cell>
          </CellGroup>
          <CellGroup inset class={styles['case-group']}>
            <div class={styles['case-item']} onClick={() => {
              router.push('/case-list')
            }}>
              <div style='display:flex'>
                <img src={getAssetsFile('case.png')} />
                <p class={styles.caseTitle}>案例库</p>
              </div>
              <span>{caseNumber.value}</span>
            </div>
          </CellGroup>
        </div>
      </>
  }
})
