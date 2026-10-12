import { defineComponent, ref } from 'vue'
import './tab.less'
import { getAllModel, get2dConfigurationByPage } from '@/apis'
import { createUuid } from '@/utils'
import { ComponentCategoryEnum, type UeModel } from '@/store/modules/chart-edit-store/chart-edit-store.d'
import { Collapse, CollapseItem, Spin, Input, Search, Icon, useMessage, Empty } from '@ghcloud/visual-view-ui'
import { useMenuDragger } from '@/packages/use-resource-dragger'
import { ChartGlobalImage } from '../chart-global-image'
enum CollapseItemNamesEnum {
  UEMODEL = 'ueModel',
  TDCONFIGURATION = '2DConfiguration',
}
export const ModelTab = defineComponent({
  setup: () => {
    /**
     * 初始化配置
     */
    const ueOptions = ref<UeModel[]>([])
    const tdConfigurationOptions = ref<UeModel[]>([])
    const message = useMessage()
    let modelData: UeModel[] = []
    let tdConfigurationData: UeModel[] = []
    const loading = ref(false)
    const tdloading = ref(false)
    const openName = ref('')
    const searchValue = ref('')
    const items = {
      id: createUuid(),
      category: ComponentCategoryEnum.CHART,
      categoryName: '图表',
      key: 'alarm-situation',
      title: '报警态势',
      components: null,
      attr: {
        isShareData: false
      },
      styles: {
        x: 0,
        y: 0,
        height: 300,
        width: 500,
        show: true,
        zIndex: 100
      },
    }
    // ue5模型数据
    const getUe5Model = async (): Promise<void> => {
      try {
        loading.value = true
        const ueModel = await getAllModel({ modelType: 'unreal-engine-five' })
        ueOptions.value = ueModel.data
        modelData = ueModel.data
      } catch (error) {
        message.error((error as { code: number;data: { message: string;code: number; }; }).data.message)
        // (function(){})(error)
      } finally {
        loading.value = false
      }
    }
    // 二维组态数据
    const get2dConfiguration = async (): Promise<void> => {
      try {
        tdloading.value = true
        const tdConfiguration = await get2dConfigurationByPage({ modelType: 'two-dimensional-config', pageSize: 10, pageNumber: 1 })
        tdConfigurationOptions.value = tdConfiguration.data.records
        tdConfigurationData = tdConfiguration.data.records
      } catch (error) {
        message.error((error as { code: number;data: { message: string;code: number; }; }).data.message)
        // (function(){})(error)
      } finally {
        tdloading.value = false
      }
    }
    const { dragStartModel, dragend } = useMenuDragger()
    const expandNamesChanges = (expandedNames: CollapseItemNamesEnum[]): void => {
      searchValue.value = ''
      const name = expandedNames[0]
      openName.value = expandedNames[0]
      if (name === CollapseItemNamesEnum.UEMODEL) {
        getUe5Model()
      }
      if (name === CollapseItemNamesEnum.TDCONFIGURATION) {
        get2dConfiguration()
      }
    }
    const searchInputSlot = {
      prefix: () => <Icon><Search /></Icon>
    }
    const handleInputChange = (val: string): void => {
      searchValue.value = val
      if (openName.value === 'ueModel') {
        ueOptions.value = modelData.filter(item => item.name?.includes(val))
      }
      if (openName.value === '2DConfiguration') {
        tdConfigurationOptions.value = tdConfigurationData.filter(item => item.name?.includes(val))
      }
    }
    return () => (
      <>
        <Input v-slots={searchInputSlot} onInput={handleInputChange} v-model:value={searchValue.value} />
        <Collapse accordion onUpdateExpandedNames={expandNamesChanges} style={{ marginTop: '10px' }}>
          <CollapseItem name={CollapseItemNamesEnum.UEMODEL} title='ue5模型'>
            <Spin show={loading.value}>
              {!!ueOptions.value.length &&
                <div class='options_container'>
                  {ueOptions.value.map((item) => {
                    return (
                      <div class='item_container' key={item.id} draggable onDragstart={($event) => { dragStartModel($event, item) }} onDragend={() => { dragend() }}>
                        {item.file ? <img src={item.file.path} alt='' srcset='' class='model-img' /> : <ChartGlobalImage chartConfig={items} />}
                        <div class='text_center'>{item.name}</div>
                      </div>
                    )
                  })}
                </div>}
              {!ueOptions.value.length && <Empty description='暂无数据' />}
            </Spin>
          </CollapseItem>
          <CollapseItem name={CollapseItemNamesEnum.TDCONFIGURATION} title='二维组态'>
            <Spin show={tdloading.value}>
              {!!tdConfigurationOptions.value.length &&
                <div class='options_container'>
                  {tdConfigurationOptions.value.map((item) => {
                    return (
                      <div class='item_container' key={item.id} draggable onDragstart={($event) => { dragStartModel($event, item) }} onDragend={() => { dragend() }}>
                        {item.file ? <img src={item.file.path} alt='' srcset='' class='model-img' /> : <ChartGlobalImage chartConfig={items} />}
                        <div class='text_center'>{item.name}</div>
                      </div>
                    )
                  })}
                </div>}
              {!tdConfigurationOptions.value.length && <Empty description='暂无数据' />}
            </Spin>
          </CollapseItem>
        </Collapse>

      </>
    )
  },
})
