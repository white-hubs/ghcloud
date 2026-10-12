import { defineComponent } from 'vue'
import { ConfigRuler } from '../config-ruler'
import styles from './index.module.less'
import { useLayout } from '@/hooks/use-layout.hook'
import { CanvasContent } from './canvas-content'
export const ConfigContent = defineComponent({
  setup: () => {
    const rulerContent = {
      canvas: () => <CanvasContent />,
    }
    // 布局处理
    useLayout(async () => {})
    return () => (
      <>
        <div id='go-chart-edit-layout' class={styles.go_chart_edit_layout}>
          <ConfigRuler v-slots={rulerContent} />
        </div>
      </>
    )
  },
})
