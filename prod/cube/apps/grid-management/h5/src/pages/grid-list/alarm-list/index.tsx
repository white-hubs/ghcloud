import { defineComponent, onMounted } from 'vue'
import { CubeNavBar } from '@ghcloud/cube-app-generic-component'
import styles from './index.module.less'

export const AlarmList = defineComponent({
  setup: () => {
    onMounted(async () => {
    })
    return (): JSX.Element => (
      <>
        <CubeNavBar title='任务列表' />
        <div class={styles['container']}>
          内容
        </div></>
    )
  }
})
