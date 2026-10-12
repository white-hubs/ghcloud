import { defineComponent } from 'vue'

import { GVerticalLine } from './vertical-line.tsx'
import styles from './layout.module.less'
interface Props {
  title: string;
  showFooter: boolean;
  showSearch: boolean;
}
export const GLayout = defineComponent({
  props: {
    title: {
      type: String,
      default: ''
    },
    showSearch: {
      type: Boolean,
      default: true
    },
    showFooter: {
      type: Boolean,
      default: true
    },

  },
  setup: (props: Props, { slots }) => {
    return (): JSX.Element =>
      <>
        <div class={styles['layout-container']}>
          <div class={styles['layout-header']}>
            <div class={styles['header-name']}>
              <GVerticalLine title={props.title} />
            </div>
            <div class={styles['header-btn']}>
              {slots['header-btn']?.()}
            </div>
          </div>
          <div class={styles['layout-content']}>
            <div class={styles['content-left']}>
              {slots['content-left']?.()}
            </div>
            <div class={styles['content-right']}>
              <div class={styles['content-data']}>
                {slots['content-data']?.()}
              </div>
              {props.showSearch &&
                <div class={styles['content-search']}>
                  {slots['content-search']?.()}
                </div>}

              <div class={styles['statistic-data']}>
                {slots['statistic-data']?.()}
              </div>
              <div class={[styles['content-table'], 'layout-table']}>
                {slots['content-table']?.()}
              </div>
            </div>
          </div>
          <>
            {props.showFooter &&
              <div class={styles['layout-footer']} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px' }}>
                <div class='footer-btn'>
                  {slots['footer-btn']?.()}
                </div>
                <div class='footer-page'>
                  {slots['footer-page']?.()}
                </div>
              </div>}
          </>
          {slots.default?.()}
        </div>
      </>
  }

})
