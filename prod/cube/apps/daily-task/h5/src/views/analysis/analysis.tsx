import { Tabs, Tab } from 'vant'
import { defineComponent, reactive, ref, type VNode } from 'vue'
import styles from './analysis.module.less'
import { TimePicker } from '../../components/time-picker/time-picker'
import { Task } from './components/task'
import { Execute } from './components/execute'
import { Target } from './components/target'
import { timePeriod } from '@/utils'
import { Bar } from '@/components/bar/bar'

/** 巡检台账列表页 */
export const Analysis = defineComponent({
  setup: () => {
    const time = reactive({
      name: 'TODAY',
      value: timePeriod('TODAY')
    })
    const tabs = ref([
      { title: '巡检任务分析', status: 'task' },
      { title: '任务执行分析', status: 'execute' },
      { title: '巡检对象分析', status: 'target' },
    ])
    const activeTab = ref('')
    // 切换标签
    const onClickTab = (): void => {
    }
    const changeTime = (item: { value: string; name: string; }): void => {
      time.name = item.name
      time.value = item.value
    }
    return (): VNode =>
      <div>
        <Bar />
        <Tabs v-model:active={activeTab.value} class={styles.tabs} onClickTab={onClickTab}>
          <TimePicker class={styles.time} onChange={changeTime} />
          <div style={{ height: '82vh', overflow: 'scroll' }}>
            {
              tabs.value.map(item =>
                <Tab title={item.title} name={item.status} key={item.title}>
                  {
                    item.status === 'task'
                      ? <Task time={time} activeTab={activeTab.value} />
                      : item.status === 'execute'
                        ? <Execute time={time} activeTab={activeTab.value} />
                        : item.status === 'target'
                          ? <Target time={time} activeTab={activeTab.value} />
                          : null
                  }
                </Tab>)
            }
          </div>
        </Tabs>
      </div>
  }
})
