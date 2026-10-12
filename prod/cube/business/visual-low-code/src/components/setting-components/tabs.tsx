import { defineComponent } from 'vue'
import { Tabs, TabPane } from '@ghcloud/visual-view-ui'
export default defineComponent({
  name: 'Tabs',
  setup: (props, { slots }) => {
    return () => (
      <Tabs type='segment'>
        <TabPane name='style' tab='样式'>
          {slots.style?.()}
        </TabPane>
        <TabPane name='interactive' tab='交互'> {slots.interactive?.()}</TabPane>
      </Tabs>
    )
  },
})
