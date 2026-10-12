import { defineComponent, watch, ref, onMounted } from 'vue'
import { GLayout } from '@/components/common/layout'
import type { TabsListType } from './model-config-i'
import ImportModel from './components/import-model/import-model'
import styles from './model-config.module.less'
import {
  Tabs, TabPane, Select
} from '@ghcloud/cube-ui'
import GlobalPerspective from './components/global-perspective/global-perspective'
import BuildPerspective from './components/build-perspective/build-perspective'
import ApplicationPerspective from './components/build-perspective/application-perspective'
import RoamingRoute from './components/roaming-route/roaming-route'
import BackgroundImg from './components/background-img/background-img'
import TdLink from './components/2d-link/td-link'
import { getModelConfig } from '@/api/model'
import { type ModelConfig as ModelConfigItf, modelConfigInit } from './model-config-init'

export const ModelConfig = defineComponent({
  setup: () => {
    // 选中获取左/右面板内容===============================================================================================
    const activeKey = ref()
    const typeOption = ref<{ label: string; value: string; }[]>([])
    const modelType = ref<'views' | 'views-2d' | 'views-three' | 'views-2d-old-area' | 'views-old-area'>('views')
    const tabsList = ref<TabsListType[]>([])
    const modelConfig = ref<ModelConfigItf>(modelConfigInit())
    const operateType = ref('add')
    const initModelData = async (): Promise<void> => {
      const res = await getModelConfig()
      if (res) {
        const modelConfigObj = JSON.parse(res.modelConfiguration)
        operateType.value = 'edit'
        if (Object.keys(modelConfigObj).length > 0) {
          modelConfig.value = modelConfigObj
          // @ts-ignore
          modelConfig.value.three = modelConfig.value.ue5
        }
      }
      if (modelType.value === 'views' || modelType.value === 'views-old-area') {
        tabsList.value = [
          { label: '导入模型', key: 1, dom: <ImportModel modelType={modelType.value} data={modelConfig.value} operateType={operateType.value} /> },
          { label: '全局视角', key: 2, dom: <GlobalPerspective data={modelConfig.value} /> },
          { label: '建筑视角', key: 3, dom: <BuildPerspective data={modelConfig.value} modelType={modelType.value} /> },
          { label: '漫游路线', key: 4, dom: <RoamingRoute data={modelConfig.value} /> },
          { label: '应用视角', key: 5, dom: <ApplicationPerspective data={modelConfig.value} /> }
        ]
      } else if (modelType.value === 'views-2d' || modelType.value === 'views-2d-old-area') {
        tabsList.value = [
          { label: '导入模型', key: 1, dom: <ImportModel modelType={modelType.value} data={modelConfig.value} operateType={operateType.value} /> },
          { label: '背景图片', key: 2, dom: <BackgroundImg data={modelConfig.value} /> },
          { label: '组态链接', key: 3, dom: <TdLink data={modelConfig.value} modelType={modelType.value} /> },
        ]
      } else {
        tabsList.value = [
          { label: '导入模型', key: 1, dom: <ImportModel modelType='views-three' data={modelConfig.value} operateType={operateType.value} /> },
          { label: '全局视角', key: 2, dom: <GlobalPerspective modelType='views-three' data={modelConfig.value} /> },
          { label: '建筑视角', key: 3, dom: <BuildPerspective modelType='views-three' data={modelConfig.value} /> },
        ]
      }
    }
    onMounted(async () => {
      const res = await getModelConfig()
      const modelConfigObj = res?.modelConfiguration ? JSON.parse(res.modelConfiguration) : {}
      modelType.value = modelConfigObj.entry
      typeOption.value = [{ value: 'views', label: '三维UE5' }, { value: 'views-2d', label: '二维组态' }, { value: 'views-three', label: 'WEBGL' }, { value: 'views-2d-old-area', label: '二维组态(旧版区域)' }, { value: 'views-old-area', label: '三维UE5(旧版区域)' }]
    })
    watch(() => modelType.value, () => {
      initModelData()
    }, { immediate: true })
    // 布局插槽=========================================================================================================
    const gLayoutSlots = {
      'content-data': (): JSX.Element => {
        return (
          <div class={styles.wrapper}>
            <div class={styles.header}>
              <div class={styles.label}>模型类型:</div>
              <Select
                v-model:value={modelType.value}
                options={typeOption.value}
                allow-clear placeholder='请选择模型'
              />
            </div>
            <Tabs v-model:activeKey={activeKey.value} tab-position='left' animated>
              {tabsList.value.map(item =>
                <TabPane key={item.key} tab={item.label} style={{ marginTop: '5px' }}>
                  {item.dom}
                </TabPane>)}
            </Tabs>
          </div>
        )
      },
    }
    return (): JSX.Element =>
      <GLayout title='模型配置' showFooter v-slots={gLayoutSlots} />
  }

})
