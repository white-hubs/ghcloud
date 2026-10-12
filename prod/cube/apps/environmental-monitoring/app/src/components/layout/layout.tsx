import { defineComponent } from 'vue'
import styles from './layout.module.less'
import { VerticalLine } from '../vertical-line/vertical-line'
export const Layout = defineComponent({
  props: {
    title: {
      type: String,
      default: ''
    },
    showFooter: {
      type: Boolean,
      default: true
    },
    showSider: {
      type: Boolean,
      default: false
    },
    siderWidth: {
      type: Number,
      default: 200
    },
  },
  setup: (props, { slots }) => {
    return () =>
      <div class={styles['layout-container']}>
        <div class={styles['layout-header']}>
          <VerticalLine title={props.title} />
          {slots['layout-header']?.()}
        </div>
        <div class={styles['layout-content'] + ' environment-monitor-layout-content'}>
          {
            props.showSider &&
              <div class={styles['layout-sider-content']}>
                <div class={styles['layout-sider']} style={{ width: props.siderWidth + 'px' }}>
                  {slots['layout-sider']?.()}
                </div>
                <div class={styles['layout-right']} style='padding: 0 24px 24px'>
                  {slots['layout-right']?.()}
                </div>
              </div>
          }
          {!props.showSider && slots['layout-content']?.()}
        </div>

        {
      props.showFooter &&
        <div class={styles['layout-footer']}>
          <div class={styles['footer-btn']}>
            {slots['footer-btn']?.()}
          </div>
          <div class={styles['footer-page']}>
            {slots['footer-page']?.()}
          </div>
        </div>
      }

        {slots.default?.()}
      </div>
  }
})
