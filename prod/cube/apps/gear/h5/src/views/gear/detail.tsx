import { defineComponent, onMounted, ref } from 'vue'
import { Tab, Tabs } from 'vant'
import './detail.less'
import { TabBusiness } from './tab-business/tab-business'
import { TabGear } from './tab-gear/tab-gear'

export const Detail = defineComponent({
  setup () {
    const tabActive = ref(0)
    onMounted(() => {
      document.title = '档位详情'
    })
    return (): JSX.Element =>
      <div class='detail-wrap'>
        <Tabs v-model:active={tabActive.value} sticky swipeable>
          <Tab key='0' title='档位信息'>
            <TabGear />
          </Tab>
          <Tab key='1' title='关联商户信息'>
            <TabBusiness />
          </Tab>
        </Tabs>
      </div>
  }
})
