import { defineComponent, type SlotsType } from 'vue'
import { CubeLayout } from '@ghcloud/cube-app-design'
import styles from './page-shell.module.less'

export const PageShell = defineComponent({
  props: {
    title: { type: String, default: '' },
    showFooter: { type: Boolean, default: true },
  },
  slots: Object as SlotsType<{
    'layout-header'?: () => unknown;
    'layout-content'?: () => unknown;
    'footer-page'?: () => unknown;
    default?: () => unknown;
  }>,
  setup (props, { slots }) {
    return (): JSX.Element => (
      <div class={styles.shell}>
        <CubeLayout
          title={props.title}
          showFooter={props.showFooter}
          v-slots={{
            'layout-header': slots['layout-header'],
            'layout-content': slots['layout-content']
              ? (): JSX.Element => (
                <div class={styles.contentBody}>
                  {slots['layout-content']?.()}
                </div>
              )
              : undefined,
            'footer-page': slots['footer-page'],
            default: slots.default,
          }}
        />
      </div>
    )
  },
})
