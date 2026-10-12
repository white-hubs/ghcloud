import { defineComponent, onMounted, onUnmounted, reactive, ref } from 'vue'
import styles from './entry.module.less'
import { Cell, CellGroup, Skeleton, showNotify } from 'vant'
import { getAssetsFile } from '@/utils'
import dayjs from 'dayjs'
import { CubeNavBar, EntryMenu } from '@ghcloud/cube-app-generic-component'
import { cubeSecureEduService } from '@/api/server'
import { routes } from '@/router'
import { CubeAppService } from '@ghcloud/cube-app-js-sdk'
/** 安全教育内嵌APP-入口页面 */
export const Entry = defineComponent({
  setup: () => {
    // const router = useRouter()
    const isApp = sessionStorage.getItem('isApp')
    const loading = ref(false)
    const statData = reactive({
      cultivateNum: 0,
      examNum: 0,
      missExamUserNumber: 0,
      noPassedUserNumber: 0,
      unsignedNum: 0
    })
    // const menu = ref([
    //   { icon: getAssetsFile('menu-train.png'), title: '培训学习', path: '/train-list' },
    //   { icon: getAssetsFile('menu-exam.png'), title: '培训考试', path: '/secure-exam' },
    // ])
    const timeOptions = [
      { label: '今日', value: 'TODAY' },
      { label: '本周', value: 'THIS_WEEK' },
      { label: '本月', value: 'THIS_MONTH' },
      { label: '今年', value: 'THIS_YEAR' },
    ]
    const timeSelect = ref('TODAY')
    const getData = async (): Promise<void> => {
      let period = ''
      switch (timeSelect.value) {
        case 'TODAY':
          period = `${dayjs().format('YYYY-MM-DD 00:00:00') ?? ''},${dayjs().format('YYYY-MM-DD 23:59:59') ?? ''}`
          break
        case 'THIS_WEEK' :
          period = `${dayjs().startOf('week').format('YYYY-MM-DD HH:mm:ss')},${dayjs().endOf('week').format('YYYY-MM-DD HH:mm:ss')}`
          break
        case 'THIS_MONTH' :
          period = `${dayjs().startOf('month').format('YYYY-MM-DD HH:mm:ss')},${dayjs().endOf('month').format('YYYY-MM-DD HH:mm:ss')}`
          break
        case 'THIS_YEAR' :
          period = `${dayjs().startOf('years').format('YYYY-MM-DD HH:mm:ss')},${dayjs().format('YYYY-MM-DD 23:59:59')}`
          break
      }
      const params = {
        period
      }
      try {
        loading.value = true
        await Promise.all([
          cubeSecureEduService.getCultivateTaskStat(params).then(res => {
            statData.cultivateNum = res.cultivateNum
          }),
          cubeSecureEduService.getCultivateTaskTrainUserStat(params).then(res => {
            statData.unsignedNum = res.unsignedNum
          }),
          cubeSecureEduService.getExamTaskStat(params).then(res => {
            statData.examNum = res.totalNum
            statData.missExamUserNumber = res.missExamUserNumber
            statData.noPassedUserNumber = res.noPassedUserNumber
          })
        ])
      } catch {
        showNotify({ message: '获取数据失败', type: 'danger' })
      } finally {
        setTimeout(() => {
          loading.value = false
        }, 300)
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
      document.title = '安全教育'
      if (isApp) {
        history.pushState(null, '', location.href)
        window.addEventListener('popstate', handlePopState, false)
      }
    })
    onUnmounted(() => {
      window.removeEventListener('popstate', handlePopState, false)
    })

    return (): JSX.Element=>
      <>
        <CubeNavBar title='安全教育' showBack />
        <div class={styles.container}>
          <EntryMenu title='业务操作' applicationCode='SECURE_EDU' routes={routes} />
          <CellGroup inset class={styles['app-group']}>
            <Cell
              title='安全教育'
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
              <div class={styles['stat-top']}>
                <div class={styles['stat-top-item']} style='background: #FFF9F5;'>
                  <Skeleton row={2} animated v-show={loading.value} />
                  <div class={styles['stat-top-item-title']} v-show={!loading.value}>
                    <img src={getAssetsFile('menu-train.png')} />
                    <span>培训专题数</span>
                  </div>
                  <div style='text-align: center;' v-show={!loading.value}>
                    <div class={styles['stat-top-item-value']}>{statData.cultivateNum}</div>
                  </div>
                </div>
              </div>
              <div class={styles['stat-top']}>
                <div class={styles['stat-top-item']} style='background: #F9FBFF;'>
                  <Skeleton row={2} animated v-show={loading.value} />
                  <div class={styles['stat-top-item-title']} v-show={!loading.value}>
                    <img src={getAssetsFile('menu-exam.png')} />
                    <span>考试专题数</span>
                  </div>
                  <div style='text-align: center;' v-show={!loading.value}>
                    <div class={styles['stat-top-item-value']}>{statData.examNum}</div>
                  </div>
                </div>
              </div>
              <div class={styles['stat-bottom']} v-show={!loading.value}>
                <div class={styles['stat-bottom-item']}>
                  <div class={styles['stat-bottom-item-title']}>不及格人次</div>
                  <div class={styles['stat-bottom-item-value']}>{statData.noPassedUserNumber}</div>
                </div>
                <div class={styles['stat-bottom-item']}>
                  <div class={styles['stat-bottom-item-title']}>缺考人次</div>
                  <div class={styles['stat-bottom-item-value']}>{statData.missExamUserNumber}</div>
                </div>
                <div class={styles['stat-bottom-item']}>
                  <div class={styles['stat-bottom-item-title']}>缺勤人次</div>
                  <div class={styles['stat-bottom-item-value']}>{statData.unsignedNum}</div>
                </div>
              </div>
              <Skeleton row={3} animated v-show={loading.value} />
            </Cell>
          </CellGroup>
        </div>
      </>
  }
})
