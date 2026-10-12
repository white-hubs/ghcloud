import { defineComponent } from 'vue'
import { Tabs, TabPane } from '@ghcloud/visual-view-ui'
import style from './index.module.less'
import { ChartTab } from './chart-tab'
import { ModelTab } from './model-tab'
import { CmoponentsTab } from './components-tab'
export default defineComponent({
  name: 'SourceMaterial',
  setup: () => {
    const sourceTabs = [{
      name: 'model',
      tabName: '模型',
      component: <ModelTab />
    },
    {
      name: 'chart',
      tabName: '图表',
      component: <ChartTab />
    },
    {
      name: 'components',
      tabName: '组件',
      component: <CmoponentsTab />
    }]
    return () => (
      <>
        <div class={style.material_library}>
          <div class={style.title}>素材库</div>
          <div class='tabs'>
            <Tabs defaultValue='model' type='segment'>
              {sourceTabs.map((item, index) => {
                return (
                  <TabPane name={item.name} key={index} tab={item.tabName}>
                    <div class={style.tab_content}>
                      {item.component}
                    </div>
                  </TabPane>
                )
              })}
            </Tabs>
          </div>
        </div>
      </>
    )
  },
})
