import { defineComponent } from 'vue'
import './layout.less'
import { VerticalLine } from '../vertical-line/vertical-line'
export const Layout = defineComponent({
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
        <div class='layout-top'>
          {slots['layout-top']?.()}
        </div>
        <div class='layout-header'>
          <VerticalLine title={props.title} />
          {slots['layout-header']?.()}
        </div>
        {
          props.showSearch &&
            <div class='layout-search'>
              {slots['layout-search']?.()}
            </div>
        }
        <div class='layout-content'>
          {slots['layout-content']?.()}
        </div>

        {
          props.showFooter &&
          <div class='layout-footer'>
            <div class='footer-page'>
              {slots['footer-page']?.()}
            </div>
            <div class='footer-btn'>
              {slots['footer-btn']?.()}
            </div>
          </div>
        }

        {slots.default?.()}
      </div>
  }
})
