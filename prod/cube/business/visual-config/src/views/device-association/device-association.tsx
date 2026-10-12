import { defineComponent, onMounted, reactive, ref } from 'vue'
import { GLayout } from '@/components/common/layout'
import { Button, Empty, Page, Tree, message } from '@ghcloud/cube-ui'
import type { AreaTree, GetSceneMenu } from '@ghcloud/cube-mdata-service'
import { deletePropertySceneConfig, deleteRiskSceneConfig, deleteStallSceneConfig, getScenePage } from '@/api/mdata'
import styles from './device-association.module.less'
import { cubeDeviceCenterService, cubeMdataService } from '@ghcloud/generic-component/src/api/service'
import { DeviceContent } from './components/device-content'
import { StallContent } from './components/stall-content'
import { PropertyContent } from './components/property-content'
import { RiskContent } from './components/risk-content'
import { useUtils } from '@/hooks/use-utils'
export const DeviceAssociation = defineComponent({
  setup: () => {
    const { getProjectId } = useUtils()
    const projectId = getProjectId()
    const menuList = ref<GetSceneMenu[]>([])
    const areaOptions = ref<AreaTree[]>([])
    const menuSelectedValue = ref('')
    const emptyArea = ref(0)
    const deviceRef = ref<{ exposeData: () => { rowKeysData: string[]; };requestDevicePage: () => void; getAreaEmptyDeviceTotal: () => void; }>()
    const stallRef = ref<{ exposeData: () => { rowKeysData: string[]; };requestDevicePage: () => void; }>()
    const propertyRef = ref<{ exposeData: () => { rowKeysData: string[]; };requestDevicePage: () => void; }>()
    const riskRef = ref<{ exposeData: () => { rowKeysData: string[]; };requestDevicePage: () => void; }>()
    const dataTypeList = [
      { key: 'DEVICE', name: '设备', applicationCode: 'DEVICECENTER' },
      { key: 'STALL', name: '档位', applicationCode: 'DWGL' },
      { key: 'PROPERTY', name: '资产', applicationCode: 'PROPERTY_MANAGEMENT' },
      { key: 'RISK_SOURCE', name: '风险源', applicationCode: 'RISK_SOURCE' },
    ]
    const search = reactive({
      dataType: 'DEVICE',
      pageNumber: 1,
      pageSize: 10,
      total: 0
    })
    const deleteAllLoading = ref(false)
    const deviceTableData = reactive<{ tableData: unknown[]; deviceTableLoading: boolean;removeDisabled: boolean; }>({
      tableData: [],
      deviceTableLoading: false,
      removeDisabled: true
    })
    // 获取业务菜单
    const getSceneList = async (): Promise<void> => {
      const params = {
        projectId,
      }
      const res = await getScenePage(params)
      menuList.value = res
    }

    // 选择产品分类
    const changeProducMenu = (selectedValue: string[]): void => {
      menuSelectedValue.value = selectedValue[0]
      getAreaEmptyDeviceTotal()
    }
    const getAreaData = async (): Promise<void> => {
      const res = await cubeMdataService.getAreaTree()
      areaOptions.value = res
    }
    const getAreaEmptyDeviceTotal = async (): Promise<void> => {
      const res = await cubeDeviceCenterService.areaEmptyDeviceTotal({ tagCodes: [`custom.app::visual.${menuSelectedValue.value}`] })
      emptyArea.value = res.totalNum
    }
    const changePage = (page: number, pageSize: number): void => {
      search.pageNumber = page
      search.pageSize = pageSize
    }
    const isRemoveDisabled = (data: boolean): void => {
      deviceTableData.removeDisabled = data
    }
    const deleteDevice = async (): Promise<void> => {
      try {
        const data = deviceRef.value?.exposeData()
        await cubeDeviceCenterService.delDeviceConfig(menuSelectedValue.value, { businessIds: data?.rowKeysData ? data?.rowKeysData : [] })
        message.success('移除成功')
        search.pageNumber = 1
        deviceRef.value?.requestDevicePage()
        deviceRef.value?.getAreaEmptyDeviceTotal()
      } catch {
      }
    }
    const stallDevice = async (): Promise<void> => {
      try {
        const data = stallRef.value?.exposeData()
        await deleteStallSceneConfig({ sceneType: menuSelectedValue.value }, { businessIds: data?.rowKeysData ? data?.rowKeysData : [] })
        message.success('移除成功')
        search.pageNumber = 1
        stallRef.value?.requestDevicePage()
      } catch {
      }
    }
    const propertyDevice = async (): Promise<void> => {
      try {
        const data = propertyRef.value?.exposeData()
        await deletePropertySceneConfig({ ids: data?.rowKeysData ? data?.rowKeysData : [] })
        message.success('移除成功')
        search.pageNumber = 1
        propertyRef.value?.requestDevicePage()
      } catch {
      }
    }
    const riskDevice = async (): Promise<void> => {
      try {
        const data = riskRef.value?.exposeData()
        await deleteRiskSceneConfig({ ids: data?.rowKeysData ? data?.rowKeysData : [] })
        message.success('移除成功')
        search.pageNumber = 1
        riskRef.value?.requestDevicePage()
      } catch {
      }
    }
    const deleteDeviceAll = async (): Promise<void> => {
      deleteAllLoading.value = true
      const dataTypeMap = new Map<string, any>([
        ['DEVICE', deleteDevice],
        ['STALL', stallDevice],
        ['PROPERTY', propertyDevice],
        ['RISK_SOURCE', riskDevice],
      ])

      await dataTypeMap.get(search.dataType)()
      deleteAllLoading.value = false
    }
    onMounted(() => {
      getSceneList()
      getAreaData()
    })
    const gLayoutSlots = {
      'content-left': (): JSX.Element => {
        return (
          <>
            <div class={styles['content-left']}>
              {menuList.value.length
                ? <Tree
                  tree-data={menuList.value}
                  fieldNames={{ title: 'name', key: 'id', children: 'children' }}
                  onSelect={changeProducMenu}
                />
                : <Empty />}
            </div>
          </>
        )
      },
      'content-table': (): JSX.Element => {
        return (
          <>
            {
              search.dataType === 'DEVICE' && <DeviceContent dataTypeList={dataTypeList} ref={deviceRef} pageSearch={search} onSetDataType={(data) => {
                search.dataType = data
              }} onSetPageNum={(data) => {
                search.total = data.total; search.pageNumber = data.pageNumber
              }} onIsRemoveDisabled={isRemoveDisabled} menuSelectedValue={menuSelectedValue.value} areaOptions={areaOptions.value} />
            }
            {
              search.dataType === 'STALL' && <StallContent dataTypeList={dataTypeList} ref={stallRef} pageSearch={search} onSetDataType={(data) => {
                search.dataType = data
              }} onSetStallPageNum={(data) => {
                search.total = data.total; search.pageNumber = data.pageNumber
              }} onIsRemoveDisabled={isRemoveDisabled} menuSelectedValue={menuSelectedValue.value} areaOptions={areaOptions.value} />
            }
            {
              search.dataType === 'PROPERTY' && <PropertyContent dataTypeList={dataTypeList} ref={propertyRef} pageSearch={search} onSetDataType={(data) => {
                search.dataType = data
              }} onSetPropertyPageNum={(data) => {
                search.total = data.total; search.pageNumber = data.pageNumber
              }} onIsRemoveDisabled={isRemoveDisabled} menuSelectedValue={menuSelectedValue.value} areaOptions={areaOptions.value} />
            }
            {
              search.dataType === 'RISK_SOURCE' && <RiskContent dataTypeList={dataTypeList} ref={riskRef} pageSearch={search} onSetDataType={(data) => {
                search.dataType = data
              }} onSetRiskPageNum={(data) => {
                search.total = data.total; search.pageNumber = data.pageNumber
              }} onIsRemoveDisabled={isRemoveDisabled} menuSelectedValue={menuSelectedValue.value} areaOptions={areaOptions.value} />
            }
          </>
        )
      },
      'footer-page': (): JSX.Element => {
        return (
          <div class={styles.flex}>
            <Button type='primary' danger disabled={deviceTableData.removeDisabled} loading={deleteAllLoading.value} onClick={deleteDeviceAll}>批量移除</Button>
            <div>
              <Page
                style='margin-bottom:20px;text-align: right;'
                v-model:current={search.pageNumber}
                v-model:pageSize={search.pageSize}
                v-model:total={search.total}
                onPageChange={changePage}
              />
            </div>
          </div>
        )
      }
    }
    return (): JSX.Element =>
      <>
        <GLayout title='数据关联' v-slots={gLayoutSlots} />
      </>
  }
})
