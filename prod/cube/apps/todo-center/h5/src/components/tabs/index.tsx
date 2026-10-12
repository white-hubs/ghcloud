import { defineComponent, type PropType } from 'vue'
import styles from './index.module.less'
interface OptionsState {
  name: string;
  code: string;
}
export const CubeTabs = defineComponent({
  props: {
    active: {
      type: String,
      default: 'ALL'
    },
    tabsOptions: {
      type: Array as PropType<OptionsState[]>,
      default: () => [
        { name: '全部', code: 'ALL' },
      ]
    },
  },
  emits: ['update:active', 'change'],
  setup: (props, { emit }) => {
    const handleChange = (item: OptionsState): void => {
      emit('update:active', item.code)
      emit('change', item.code, item)
    }
    return (): JSX.Element => (
      <div class={styles.cubeTabs}>
        <div class={styles.cubeTabWarp}>
          {props.tabsOptions.map(item => {
            return <div key={item.code} class={[styles.cubeTab, props.active === item.code ? styles.activeTab : '']} onClick={() => {
              handleChange(item)
            }}>{item.name}</div>
          })}
        </div>
        {/* <div class={[styles.cubeTab, styles.activeTab]}>全部</div>
        <div class={styles.cubeTab}>报警任务</div>
        <div class={styles.cubeTab}>审批任务</div> */}
      </div>
    )
  }
})
