import { defineComponent } from 'vue'
import { TabPane as ATabPane, type TabPaneProps } from 'ant-design-vue/es/'

export const TabPane = defineComponent({
  props: ['tab'],
  setup (props: TabPaneProps, { slots }) {
    return (): JSX.Element=> {
      return <ATabPane {...props}>{slots}</ATabPane>
    }
  }
})
