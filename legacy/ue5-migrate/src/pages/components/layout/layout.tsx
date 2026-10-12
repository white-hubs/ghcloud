import { defineComponent } from 'vue'
import styles from './layout.module.less'
import { useStateStore } from '@/pages/state/use-state-store'
import { ConfigLoader } from '@/pages/config-loader'

export const Layout = defineComponent({
  setup: (props, { slots }) => {
    const { globalState } = useStateStore()
    return (): JSX.Element =>
      <div class={`${styles['layout-container']} view ${styles[ConfigLoader.config.entry] ?? ''}`}>
        <div class={styles['layout-header']}>
          {slots['layout-header']?.()}
        </div>
        {slots['layout-left-penal']?.()}
        {slots['layout-right-penal']?.()}
        <div class={`${styles['layout-area-tag']} ${ConfigLoader.config.entry !== 'views-gis' ? styles.show : styles.hide}`}>
          {slots['layout-area-tag']?.()}
        </div>
        <div class={`${styles['layout-menu']} ${(globalState.panel.visible && ConfigLoader.config.entry !== 'views-gis') ? styles.show : styles.hide}`}>
          {slots['layout-menu']?.()}
        </div>
        {slots.default?.()}
      </div>
  }
})
