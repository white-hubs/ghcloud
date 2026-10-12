import { defineComponent } from 'vue'
import { VerticalLine } from '../vertical-line/vertical-line'
import './clayout.less'

export const CLayout = defineComponent({
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
    }
  },
  setup: (props, { slots }) => {
    return (): JSX.Element =>
      <div class='layout-container'>
        <div class='layout-header'>
          <VerticalLine title={props.title} />
          {slots['layout-header']?.()}
        </div>
        <div class='layout-content'>
          <div class='layout-left'>
            {slots['layout-left']?.()}
          </div>

          <div class='layout-right'>
            {slots['layout-right']?.()}
          </div>
        </div>

        {slots.default?.()}
      </div>
  }
})
