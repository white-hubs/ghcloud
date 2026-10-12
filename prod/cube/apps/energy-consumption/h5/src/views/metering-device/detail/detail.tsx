import { defineComponent, onMounted, ref, watch } from 'vue'
import { Tab, Tabs } from 'vant'
import { TabInfo } from './tab-info/tab-info'
import { TabHistory } from './tab-history/tab-history'
import { TabRead } from './tab-read/tab-read'
import './detail.less'

export const Detail = defineComponent({
  setup () {
    const tabActive = ref(0)
    const getData = (): void => {
    }
    onMounted(() => {
      getData()
    })

    watch(() => tabActive.value, () => {
      getData()
    })
    onMounted(() => {
      document.title = '设备详情'
    })
    return () =>
      <div class='detail-wrap'>
        <Tabs v-model:active={tabActive.value} sticky swipeable>
          <Tab key='设备详情' title='设备详情'>
            <TabInfo />
          </Tab>
          <Tab key='仪表读数记录' title='仪表读数记录'>
            <TabRead />
          </Tab>
          <Tab key='历史仪表' title='历史仪表'>
            <TabHistory />
          </Tab>
        </Tabs>
      </div>
  }
})
