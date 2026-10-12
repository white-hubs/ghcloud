import { defineComponent } from 'vue'
import { Layout } from '@/components/layout/layout'
import { Tabs, TabPane } from '@ghcloud/cube-ui'
import { TabSystemTag } from './components/tab-system-tag'
import { TabCustomTag } from './components/tab-custom-tag'

import './tag-list.less'

/** 标签管理 */
export const TagList = defineComponent({
  setup: () => {
    const layoutSlots = {
      'layout-content': (): JSX.Element=> {
        return (
          <Tabs destroyInactiveTabPane style={{ height: '100%' }}>
            <TabPane key='1' tab='系统标签'>
              <TabSystemTag />
            </TabPane>
            <TabPane key='2' tab='用户自定义标签'>
              <TabCustomTag />
            </TabPane>
          </Tabs>
        )
      },
    }
    return (): JSX.Element =>
      <>
        <Layout showTitle={false} showFooter={false} v-slots={layoutSlots} />
      </>
  }
})
