import { defineComponent, ref } from 'vue'
import styles from './security-analysis.module.less'
import { timeOptions } from '@/utils/timer-picker'
import { BasicInformation } from './components/basic-information/basic-information'
import { PatrolAbnormality } from './components/patrol-abnormality/patrol-abnormality'
import { AlarmHandleAnalysis } from './components/alarm-handle-analysis/alarm-handle-analysis'
import { CubeNavBar } from '@ghcloud/cube-app-generic-component'

/** 安防监控——安全分析 */
export const SecurityAnalysis = defineComponent({
  setup: () => {
    const timeSelect = ref('TODAY')
    const timeChange = (value: string): void => {
      timeSelect.value = value
    }
    document.title = '安全分析'
    return (): JSX.Element=>
      <>
        <CubeNavBar showBack title='安全分析' />
        <div class={styles['security-analysis']}>
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
          <BasicInformation type={timeSelect.value} />
          <PatrolAbnormality type={timeSelect.value} />
          {/* <AlarmAnalysis /> */}
          <AlarmHandleAnalysis type={timeSelect.value} />
        </div>
      </>
  }
})
