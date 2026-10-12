import { defineComponent, type VNode } from 'vue'
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
    }
  },
  setup: (props, { slots }) => {
    return (): VNode =>
      <div class={styles['layout-container']}>
        <div class={styles['layout-header']}>
          <VerticalLine title={props.title} />
          {slots['layout-header']?.()}
        </div>
        <div class={styles['layout-content'] + ' attendance-layout-content'}>
          {slots['layout-content']?.()}
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
