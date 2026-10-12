import { defineComponent, ref } from 'vue'
import styles from './index.module.less'
import { getAssetsFile, goAlarmRecords } from '@/utils'
import { useRouter } from 'vue-router'

export const ApplicationMenu = defineComponent({
  props: {
    period: {
      type: String,
      default: ''
    },
    timeType: {
      type: String,
      default: ''
    }
  },
  setup (props) {
    const router = useRouter()
    const navList = ref([
      {
        title: '安全分析',
        path: '/market-index',
        icon: 'alarm-task-res-ratio-icon',
        bgColor: '#F8FCFF',
      },
      {
        title: '报警记录',
        path: '/alarm-record',
        icon: 'risk-icon',
        bgColor: '#FFF9F9',
      },
      // {
      //   title: '管理分析',
      //   path: '/',
      //   icon: 'alarm-task-res-ratio-icon',
      //   bgColor: '#F8FCFF',
      // },
    ])
    const handleAppClick = (item: { path: string; }): void => {
      if (item.path === '/alarm-record') {
        goAlarmRecords({})
      } else {
        router.push({
          path: item.path,
          query: {
            period: props.period,
            timeType: props.timeType
          }
        })
      }
    }
    return (): JSX.Element => (
      <div class={styles.card}>
        <div class={styles.title}>应用</div>
        <div class={styles.nav}>
          {
            navList.value.map((item, index) => {
              return (
                <div
                  class={styles.item} key={index} style={{ backgroundColor: item.bgColor }} onClick={() => {
                    handleAppClick(item)
                  }}
                >
                  <img class={styles.icon} src={getAssetsFile(item.icon + '.png')} />
                  <div class={styles.title}>{item.title}</div>
                </div>
              )
            })
          }
        </div>
      </div>
    )
  }
})
