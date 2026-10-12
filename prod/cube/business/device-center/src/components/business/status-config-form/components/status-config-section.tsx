import { defineComponent, type PropType } from 'vue'
import { Button, PlusOutlined } from '@ghcloud/cube-ui'
import type { StatusConfig } from '../types'
import styles from '../status-config-form.module.less'

export const StatusConfigSection = defineComponent({
  name: 'StatusConfigSection',
  props: {
    statusConfig: {
      type: Object as PropType<StatusConfig>,
      required: true
    },
    onAddRule: {
      type: Function as PropType<() => void>,
      required: true
    }
  },
  setup (props, { slots }) {
    return (): JSX.Element => (
      <div class={styles.statusConfigSection}>
        <div class={styles.sectionHeader}>
          <div class={styles.title}>{props.statusConfig.status === 'on_line' ? '在线规则' : '离线规则'}：</div>
          <Button type="primary" size="small" class={styles.addButton} onClick={props.onAddRule}>
            <PlusOutlined />添加
          </Button>
        </div>
        {slots.default?.()}
      </div>
    )
  }
})