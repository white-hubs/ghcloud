
import { defineComponent, reactive, ref } from 'vue'
import { GLayout } from '@/components/common/layout'
import type { PanelConfigType } from './panel-config-i'
import styles from './panel-config.module.less'
import {
  Empty,
  RadioGroup,
  Space
} from '@ghcloud/cube-ui'
import { MenuTree } from './components/menu-tree/menu-tree'
import { PanelSelect } from './components/panel-select/panel-select'
import type { ReturnAreaScenePanelConfig } from '@/api/models/mdata'
import { BatchSave } from './components/batch-save/batch-save'

export const PanelConfig = defineComponent({
  setup: () => {
    const panelConfig = reactive<PanelConfigType>({
      areaId: '1',
      sceneType: '',
      panelConfigModifyParams: [],
    })
    const panelSelectRef = ref<{ validate: () => Promise<boolean>;getConfig: () => ReturnAreaScenePanelConfig[]; }>()
    const BatchSaveRef = ref<{ showModal: () => void; }>()
    const treeSelect = (select: string): void => {
      panelConfig.sceneType = select
    }
    const gLayoutSlots = {
      'content-left': (): JSX.Element => {
        return (
          <div class={styles['content-left']}>
            <MenuTree onSelect={(select) => {
              treeSelect(select)
            }} />
          </div>
        )
      },
      'header-btn': (): JSX.Element => {
        return (
          <Space v-show={panelConfig.sceneType}>
            <RadioGroup
              v-model:value={panelConfig.areaId}
              button-style='solid'
              options={[{ label: '一级区域', value: '1' }, { label: '二级区域', value: '2' }, { label: '三级区域', value: '3' }, { label: '四级区域', value: '4' }]}
            />
            <BatchSave sceneType={panelConfig.sceneType} areaId={panelConfig.areaId} panelSelectRef={panelSelectRef.value} ref={BatchSaveRef} />
          </Space>
        )
      },
      'content-table': (): JSX.Element => {
        return panelConfig.sceneType ? <PanelSelect areaId={panelConfig.areaId} sceneType={panelConfig.sceneType} ref={panelSelectRef} /> : <Empty description='请选择左侧菜单' />
      }
    }
    return (): JSX.Element => <GLayout title='面板配置' showFooter v-slots={gLayoutSlots} />
  }
})
