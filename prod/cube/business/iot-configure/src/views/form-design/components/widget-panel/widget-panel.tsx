import { Card } from '@ghcloud/cube-ui'
import { defineComponent, onMounted } from 'vue'
import styles from './widget-panel.module.less'
import { widgetDefine } from '../../core/widget'
import Sortable from 'sortablejs'
import { useFormDesignStore } from '@/pinia-store/form-design'

/** 控件面板 */
export const WidgetPanel = defineComponent({
  setup () {
    onMounted(() => {
      const { formDesign } = useFormDesignStore()
      const widgetPanelDom = document.querySelector('.widget-panel .iot-configure-card-body')
      if (!widgetPanelDom) return
      new Sortable(widgetPanelDom as HTMLElement, {
        group: {
          name: 'formDesign',
          pull: 'clone'
        },
        sort: false,
        animation: 150,
        onStart: (): void => {
          formDesign.onDrag = true
        },
        onEnd: (): void => {
          formDesign.onDrag = false
        },
      })
    })

    return (): JSX.Element =>
      <Card title='控件' class={`${styles['widget-panel']} widget-panel`}>
        {
          widgetDefine.map(item =>
            <div key={item.name} class={`${styles['widget-item']} widget-item`}>{item.label}</div>)
        }
      </Card>
  }
})
