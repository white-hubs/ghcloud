import { defineComponent, type PropType } from 'vue'
import './style/sub-panel-template.less'
export default defineComponent({
  name: 'SubPanelTemplate',
  props: {
    title: {
      type: String as PropType<string | undefined>,
      default: ''
    },
    showDate: {
      type: Boolean,
      default: true
    },
  },
  setup: (props, { slots }) => {
    return () => (
      <div class='sub-panel flex-column'>
        <div style='border-bottom: none' class='sub-panel-header flex-between'>
          <div class='title flex-between'>
            <div class='mark'>
              <div class='box' />
            </div>
            <span>{props.title}</span>
          </div>
          <div style={{ width: '30%' }} v-show={props.showDate}>
            {slots.extra?.()}
          </div>
        </div>
        <div class='lineBox'>
          <div />
          <div />
          <div />
        </div>
        <div class='sub-panel-content'>
          {slots.default?.()}
        </div>
      </div>
    )
  }
})
