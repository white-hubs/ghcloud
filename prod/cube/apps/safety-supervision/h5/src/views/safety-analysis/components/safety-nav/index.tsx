import { defineComponent, watch, type PropType, ref } from 'vue'
import styles from './index.module.less'
import { Icon, Skeleton } from 'vant'
import { useRouter } from 'vue-router'
import { storeMarket } from '@/store/market'
import { cubeSafetySupervisionService } from '@/api/server'
import type { SafetyAlarmEventTypeRatioVO, SafetyMarketStatisticsCardVO } from '@ghcloud/cube-safety-supervision-service'
import { getAssetsFile } from '@/utils'

/** 安全分析 菜单导航 */
interface ItemProps {
  title: string;
  path: string;
  icon: string;
  stasis: {
    label: string;
    value: number;
    unit?: string;
  }[];
}
interface Times {
  timeType: string;
  period: string[];
}
const navList = [
  {
    title: '消防安全',
    path: '/fire-safety',
    icon: 'xfaq',
    stasis: [
      {
        label: '消防报警占比',
        value: 0,
        unit: '%',
      },
      {
        label: '消防报警数',
        value: 0
      },
    ]
  },
  {
    title: '安防管理',
    path: '/security-monitoring',
    icon: 'afgl',
    stasis: [
      {
        label: '安防报警占比',
        value: 0,
        unit: '%',
      },
      {
        label: '安防报警数',
        value: 0
      },
    ]
  },
  {
    title: '电气安全',
    path: '/electrical-safety',
    icon: 'dqaq',
    stasis: [
      {
        label: '电气报警占比',
        value: 0,
        unit: '%',
      },
      {
        label: '电气报警数',
        value: 0
      },
    ]
  },
  {
    title: '用气安全',
    path: '/use-gas-safety',
    icon: 'yqaq',
    stasis: [
      {
        label: '用气报警占比',
        value: 0,
        unit: '%',
      },
      {
        label: '用气报警数',
        value: 0
      },
    ]
  },
  {
    title: '安全管理',
    path: '/safe-manage',
    icon: 'aqgl',
    stasis: [
      {
        label: '安全任务数',
        value: 0
      },
      {
        label: '小散工程数',
        value: 0
      },
      {
        label: '风险源建档数',
        value: 0
      },
    ]
  },
]
export const SafetyNav = defineComponent({
  props: {
    times: {
      type: Object as PropType<Times>,
      default: () => {}
    },
  },
  emits: ['success'],
  setup (props, { emit, expose }) {
    const router = useRouter()
    const piniaStoreMarket = storeMarket()
    const dataSource = ref<ItemProps[]>([...navList])
    const loading = ref(false)

    const getAlarmStatistics = async (applicationCode?: string): Promise<SafetyAlarmEventTypeRatioVO[]> => {
      const prams = {
        period: props.times.period.join(','),
        type: props.times.timeType,
        marketTenant: piniaStoreMarket.currentMarket,
        marketTenants: !piniaStoreMarket.currentMarket ? [] : [piniaStoreMarket.currentMarket],
        applicationCode
      }
      return cubeSafetySupervisionService.safetyAlarmEventTypeRatio(prams)
    }
    const getSafetyCard = async (): Promise<void> => {
      try {
        const prams = {
          period: props.times.period.join(','),
          type: props.times.timeType,
          marketTenant: piniaStoreMarket.currentMarket,
          marketTenants: !piniaStoreMarket.currentMarket ? [] : [piniaStoreMarket.currentMarket],
        }
        const res: SafetyMarketStatisticsCardVO = await cubeSafetySupervisionService.safetyMarketSafetyCard(prams)
        emit('success')
        dataSource.value[4].stasis[0].value = res.safetyTaskNum ? Number(res.safetyTaskNum) : 0
        dataSource.value[4].stasis[1].value = res.projectNum ? Number(res.projectNum) : 0

        const filingData = await cubeSafetySupervisionService.getRiskFilingStatistics({
          marketTenant: piniaStoreMarket.currentMarket,
          marketTenants: !piniaStoreMarket.currentMarket ? [] : [piniaStoreMarket.currentMarket],
        })
        const filingNumList: number[] = filingData ? filingData.map(item => {
          return item.num ? Number(item.num) : 0
        }) : []
        const filingTotal = filingNumList.reduce((accumulator, currentValue) => accumulator + currentValue, 0)
        dataSource.value[4].stasis[2].value = filingTotal ?? 0
      } catch {
        loading.value = false
      }
    }

    const getData = async (): Promise<void> => {
      try {
        loading.value = true
        const res: SafetyAlarmEventTypeRatioVO[] = await getAlarmStatistics()
        dataSource.value = [...navList]
        const fireData = res.filter(item => item.name && item.name.includes('消防')) ?? []
        const securityData = res.filter(item => item.name && item.name.includes('安防')) ?? []
        const electricalData = res.filter(item => item.name && item.name.includes('电气')) ?? []
        const gasData = res.filter(item => item.name && item.name.includes('用气')) ?? []
        if (fireData.length > 0) {
          dataSource.value[0].stasis[0].value = fireData[0].ratio ? Number(fireData[0].ratio).toFixed(2) as unknown as number : 0
          dataSource.value[0].stasis[1].value = fireData[0].totalNum ? Number(fireData[0].totalNum) : 0
        } else {
          dataSource.value[0].stasis[0].value = 0
          dataSource.value[0].stasis[1].value = 0
        }
        if (securityData.length > 0) {
          dataSource.value[1].stasis[0].value = securityData[0].ratio ? Number(securityData[0].ratio).toFixed(2) as unknown as number : 0
          dataSource.value[1].stasis[1].value = securityData[0].totalNum ? Number(securityData[0].totalNum) : 0
        } else {
          dataSource.value[1].stasis[0].value = 0
          dataSource.value[1].stasis[1].value = 0
        }
        if (electricalData.length > 0) {
          dataSource.value[2].stasis[0].value = electricalData[0].ratio ? Number(electricalData[0].ratio).toFixed(2) as unknown as number : 0
          dataSource.value[2].stasis[1].value = electricalData[0].totalNum ? Number(electricalData[0].totalNum) : 0
        } else {
          dataSource.value[2].stasis[0].value = 0
          dataSource.value[2].stasis[1].value = 0
        }
        if (gasData.length > 0) {
          dataSource.value[3].stasis[0].value = gasData[0].ratio ? Number(gasData[0].ratio).toFixed(2) as unknown as number : 0
          dataSource.value[3].stasis[1].value = gasData[0].totalNum ? Number(gasData[0].totalNum) : 0
        } else {
          dataSource.value[3].stasis[0].value = 0
          dataSource.value[3].stasis[1].value = 0
        }
      } catch {
        loading.value = false
      } finally {
        loading.value = false
      }
    }

    watch([props.times, piniaStoreMarket.currentMarket], () => {
      getData()
      getSafetyCard()
    }, { deep: true, immediate: true })
    watch(() => props.times, () => {
      getData()
      getSafetyCard()
    })
    expose({
      getData: () => {
        getData()
        getSafetyCard()
      }
    })

    return (): JSX.Element =>
      <div class={styles.container}>
        <div class={styles.nav}>
          {dataSource.value.map((item) => {
            const itemClass = styles[item.icon]
            return (
              <div
                class={[styles.item, itemClass]} key={item.title} onClick={() => {
                  router.push({
                    path: item.path,
                    query: {
                      period: props.times.period.join(','),
                      timeType: props.times.timeType
                    }
                  })
                }}
                style={{ position: 'relative' }}
              >
                <Skeleton title row={3} loading={loading.value} title-width={['30%', '40%', '40%']} />
                <div class={styles.wrap} v-show={!loading.value}>
                  <div class={styles.title}>{item.title}
                    <Icon name='arrow' class={styles.arrow} />
                  </div>
                  <div class={styles.info}>
                    {item.stasis.map((s) => {
                      return (
                        <div
                          key={s.label}
                          class={styles.value}
                        >
                          <div class={styles.label}>{s.label}</div>
                          <div class={styles.count}>
                            {s.value}
                            <div class={styles.unit}>{s.unit}</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <img class={styles.icon} src={getAssetsFile('icon/' + item.icon + '.png')} />
                </div>
              </div>
            )
          })}
        </div>
      </div>
  }
})
