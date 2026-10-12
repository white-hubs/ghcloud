import { defineComponent } from 'vue'
import styles from './form-design.module.less'
import { WidgetPanel } from './components/widget-panel/widget-panel'
import { ItemSetting } from './components/item-setting/item-setting'
import { FormPreview } from './components/form-preview/form-preview'

/** 表单设计 */
export const FormDesign = defineComponent({
  setup () {
    return (): JSX.Element =>
      <div class={styles['form-design']}>
        <div class={styles['sider-area']}>
          <WidgetPanel />
        </div>
        <div class={styles['center-area']}>
          <FormPreview />
        </div>
        <div class={styles['sider-area']}>
          <ItemSetting />
        </div>
      </div>
  },
})
