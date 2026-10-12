import { defineComponent } from 'vue'
import styles from './index.module.less'
import dayjs from 'dayjs'
import { SettingPopover } from '../setting-popover/setting-popover'
import { getImageThree } from '@/hook/use-utils'
import { LeftCircleOutlined } from '@ghcloud/cube-ui'
import { useServiceTime } from '@/hook/use-service-time'

/** 门口屏头部 */
export const EntranceScreenHeader = defineComponent({
  emits: ['change'],
  setup (props, { emit }) {
    const { currentTime } = useServiceTime()
    const goBack = (): void => {
      try {
        localStorage.removeItem('auto-entrance-screen')
      } catch {
      }
      history.go(-1)
    }

    return (): JSX.Element =>
      <div class={styles['entrance-screen-header']}>
        <div class={styles['left-bar']}>
          <div class={styles.setting}>
            <div class={styles['setting-icon']} onClick={goBack}>
              <LeftCircleOutlined class={styles.icon} />
              <span class={styles.text}>返回</span>
            </div>
          </div>
          <div class={styles['time-area']}>
            <div class={styles.m2}>
              <span class={styles.label}>{dayjs(currentTime.value).format('HH:mm:ss')}</span>
            </div>
            <div class={styles.m1}>
              <span class={styles.label}>{dayjs(currentTime.value).format('dddd')}</span>
              <span class={styles['label mt-5']}>{dayjs(currentTime.value).format('YYYY年MM月DD日')}</span>
            </div>
          </div>
          <div class={styles.title}>
            <span>{window.businessData?.title ?? '医疗洁净实时在线监控'}</span>
          </div>

        </div>
        <div class={styles['right-bar']}>
          <div class={styles.legend}>
            <div class={styles.item} style='margin-left:0'>
              <img class={styles.dot} src={getImageThree('dot-norm.png')} />
              <span class={styles.text}>正常</span>
            </div>
            <div class={styles.item}>
              <img class={styles.dot} src={getImageThree('dot-low.png')} />
              <span class={styles.text}>低于下限</span>
            </div>
            <div class={styles.item}>
              <img class={styles.dot} src={getImageThree('dot-high.png')} />
              <span class={styles.text}>超过上限</span>
            </div>
          </div>
          <SettingPopover
            showText
            onChange={(room) => {
              emit('change', room)
            }}
          />
        </div>
      </div>
  }
})
