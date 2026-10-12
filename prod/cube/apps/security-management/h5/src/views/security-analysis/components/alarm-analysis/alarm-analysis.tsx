import { Cell, CellGroup, Skeleton } from 'vant'
import { defineComponent, ref } from 'vue'
import styles from './alarm-analysis.module.less'

/** 报警分析 */
export const AlarmAnalysis = defineComponent({
  setup: () => {
    const loading = ref(true)
    return (): JSX.Element=>
      <CellGroup inset class={styles['alarm-analysis']}>
        <Cell title='报警分析' />
        <Cell>
          <Skeleton row={6} animated v-show={loading.value} />
        </Cell>
      </CellGroup>
  }
})
