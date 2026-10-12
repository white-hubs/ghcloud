import { defineComponent, watch, ref, type PropType } from 'vue'
import styles from './index.module.less'
import { Icon, Skeleton } from 'vant'
import { useRouter } from 'vue-router'
import { cubeAlarmSafetyAnalysisService } from '@/api/server'
import { getAssetsFile } from '@/utils'
import dayjs from 'dayjs'

/** 安全分析 菜单导航 */
const navList = [
  {
    title: '消防安全',
    path: '/market-fire-safety',
    icon: 'xfaq',
    code: 'FIRECONTROL',
    stasis: [
      {
        label: '消防报警占比',
        value: 0,
        unit: '%',
      },
      {
        label: '消防报警数',
        value: 0,
        unit: ''
      },
    ]
  },
  {
    title: '安防监控',
    path: '/market-security-monitoring',
    icon: 'afgl',
    code: 'SECURITY_MONITORING',
    stasis: [
      {
        label: '安防报警占比',
        value: 0,
        unit: '%',
      },
      {
        label: '安防报警数',
        value: 0,
        unit: ''
      },
    ]
  },
  {
    title: '电气安全',
    path: '/market-electrical-safety',
    icon: 'dqaq',
    code: 'ELECTRICMANAGE',
    stasis: [
      {
        label: '电气报警占比',
        value: 0,
        unit: '%',
      },
      {
        label: '电气报警数',
        value: 0,
        unit: ''
      },
    ]
  },
  {
    title: '用气安全',
    path: '/market-use-gas-safety',
    icon: 'yqaq',
    code: 'GAS_MANAGEMENT',
    stasis: [
      {
        label: '用气报警占比',
        value: 0,
        unit: '%',
      },
      {
        label: '用气报警数',
        value: 0,
        unit: ''
      },
    ]
  },
  {
    title: '机房动环',
    path: '/market-rotating',
    icon: 'yqaq',
    code: 'ROTATINGMANAGE',
    stasis: [
      {
        label: '动环报警占比',
        value: 0,
        unit: '%',
      },
      {
        label: '动环报警数',
        value: 0,
        unit: ''
      },
    ]
  },
  {
    title: '安全管理',
    path: '/market-safe-manage',
    icon: 'aqgl',
    stasis: [
      {
        label: '安全任务数',
        value: 0,
        unit: ''
      },
      {
        label: '小散工程数',
        value: 0,
        unit: ''
      },
      {
        label: '风险源建档数',
        value: 0,
        unit: ''
      },
    ]
  },
]
export const SafetyNav = defineComponent({
  props: {
    period: {
      type: Array as PropType<string[]>,
      default: () => [dayjs().format('YYYY-MM-DD 00:00:00'), dayjs().format('YYYY-MM-DD HH:mm:ss')]
    },
    timeType: {
      type: String,
      default: ''
    }
  },
  emits: ['change', 'success'],
  setup (props, { emit, expose }) {
    const router = useRouter()
    const dataSource = ref([...navList])
    const loading = ref(false)

    const getAlarmStatistics = async (): Promise<void> => {
      const prams = {
        period: props.period.join(','),
        type: props.timeType,
      }
      const res = await cubeAlarmSafetyAnalysisService.safetyAnalysisAlarmMain(prams)
      dataSource.value.forEach((item) => {
        if (res.applicationAlarmDataList?.length) {
          const exists = res.applicationAlarmDataList.some(s => s.typeCode === item.code)
          if (!exists) {
            item.stasis[0].value = 0
            item.stasis[1].value = 0
          }
          res.applicationAlarmDataList.forEach(s => {
            if (item.code === s.typeCode) {
              item.stasis[0].value = s.ratio ?? 0
              item.stasis[1].value = s.alarmNum ?? 0
            }
          })
        } else {
          item.stasis[0].value = 0
          item.stasis[1].value = 0
        }
      })
      dataSource.value[5].stasis[0].value = res.safetyAlarmNum ?? 0
      dataSource.value[5].stasis[1].value = res.looseWorkNum ?? 0
      dataSource.value[5].stasis[2].value = res.riskSourceNum ?? 0

      emit('success')
    }

    const getData = async (): Promise<void> => {
      try {
        loading.value = true
        getAlarmStatistics()
      } catch {
        loading.value = false
      } finally {
        loading.value = false
      }
    }
    watch(() => props.period, () => {
      getData()
    })
    expose({
      getData: () => {
        getData()
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
                      period: props.period,
                      timeType: props.timeType
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
                            <div class={styles.unit}>{s?.unit ?? ''}</div>
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
