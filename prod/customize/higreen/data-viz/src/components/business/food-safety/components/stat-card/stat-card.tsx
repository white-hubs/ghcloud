import { defineComponent, onMounted, reactive } from 'vue'
import styles from './index.module.less'
import { CountTo } from 'vue3-count-to'
import { cubeFoodSafetyService } from '@/api/service'
import dayjs from 'dayjs'
import { useApiTimer } from '@/hook/use-utils'

export const StatCard = defineComponent({
  setup: () => {
    // const state = reactive({
    //   loading: true,
    // })
    const dataList = reactive([
      {
        name: '昨日检测批次',
        iconUrl: '/apps/@ghcloud/higreen-data-viz/icons/food-safety/check.png',
        value: 0,
        unit: ''
      },
      {
        name: '昨日合格批次',
        iconUrl: '/apps/@ghcloud/higreen-data-viz/icons/food-safety/qualified.png',
        value: 0,
        unit: ''
      },
      {
        name: '昨日合格率',
        iconUrl: '/apps/@ghcloud/higreen-data-viz/icons/food-safety/qualified-ratio.png',
        value: 0,
        unit: '%'
      }
    ])

    const getData = async (): Promise<void> => {
      cubeFoodSafetyService.getFoodSafetyStat({ day: dayjs().subtract(1, 'day').format('YYYY-MM-DD') }).then((response) => {
        // 找到对应项并赋值
        dataList.forEach(item => {
          if (item.name === '昨日检测批次') {
            item.value = response.testCount ?? 0
          } else if (item.name === '昨日合格批次') {
            item.value = response.passCount ?? 0
          } else if (item.name === '昨日合格率') {
            const numberStr = response.passPercent ? response.passPercent?.replace('%', '') : '0'
            item.value = parseFloat(numberStr)
          }
        })
      })
    }

    onMounted(() => {
      useApiTimer(getData)
    })

    return (): JSX.Element=> (
      <div class={styles.container}>
        {dataList.map((item, index) => {
          return (
            <div class={styles.statItem} key={index}>
              <div>
                <div class={styles.statTitle}>
                  <img src={item.iconUrl} alt='' srcset='' /> <span>{item.name}</span>
                </div>
                <div class={styles.statValue}>
                  <CountTo startVal={0} endVal={item.value} duration={2000} />
                  <span class={styles.unit}>{item.unit}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    )
  }
})
