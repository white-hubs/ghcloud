import { defineComponent, reactive, ref } from 'vue'
import { Layout } from '@/components/layout/layout'
import { Button, Empty, Form, FormItem, Input, Page, PopOver, Spin, TabPane, Table, Tabs, Tag, Tree, message } from '@ghcloud/cube-ui'
import { useTableScroll } from '@/hook/use-table-scroll'
import { TenantSelect } from '@/components/business/tenant-select/tenant-select'
import { cubeDeviceCenterService, cubeMdataService, cubeSecurityManagementService } from '@/api/service'
import { authStore } from '@/api/auth-store'
import { setNowEnterprise, setToken } from '@ghcloud-legacy/bimops-fe-web-migrate-lib/lib/utils/auth.js'
import type { AreaTree } from '@ghcloud/cube-mdata-service'
import type { ProductIotCategoryTree } from '@ghcloud/cube-iot-center-service'

/** 设备列表 */
export const DeviceList = defineComponent({
  setup: () => {
    const formState = reactive({
      status: undefined,
      period: undefined,
      tenant: undefined,
      keyword: '',
      areaId: '',
      deviceProdCategoryCode: ''
    })

    const detailRow = (record: { deviceId: string; }): void => {
      if (!formState.tenant) return
      setNowEnterprise(JSON.stringify({ code: formState.tenant }))
      setToken({ access_token: authStore.token })
      sessionStorage.setItem('GH-currentApplication', JSON.stringify({
        code: 'OPERATING_ROOM'
      }))
      history.pushState({ current: location.pathname + location.search }, '', `/portal/genericEquipmentMonitor/equipmentMoitorDetail?type=detail&deviceId=${record.deviceId}`)
    }

    const columns = [
      {
        title: '设备编号',
        dataIndex: 'deviceCode',
        ellipsis: true,
        width: 180,
        fixed: 'left',
      },
      {
        title: '设备名称',
        dataIndex: 'deviceName',
        ellipsis: true,
        width: 180,
      },
      {
        title: '产品品类',
        dataIndex: 'deviceProdCategoryName',
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '所在区域',
        dataIndex: 'areaName',
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '状态',
        dataIndex: 'deviceStatus',
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: boolean; }): JSX.Element => {
          const valTxt = text ? '在线' : '离线'
          return (
            <>
              <PopOver content={valTxt || '--'}>
                <Tag color={text ? 'success' : 'default'}>{valTxt}</Tag>
              </PopOver>
            </>
          )
        }

      },
      {
        title: '操作',
        dataIndex: 'action',
        width: 180,
        fixed: 'right',
        customRender: ({ record }: { record: { deviceId: string; }; }): JSX.Element => {
          return (
            <>
              <Button type='link' size='small' onClick={() => {
                detailRow(record)
              }}>详情</Button>
            </>
          )
        }
      }
    ]

    const loading = ref(false)
    const dataSource = ref<unknown[]>([])
    const pagination = ref({
      pageSize: 10,
      pageNumber: 1,
      total: 0
    })

    const getTableData = async (): Promise<void> => {
      try {
        loading.value = true
        if (!formState.tenant) return
        const res = await cubeSecurityManagementService.getDeviceMonitoringByTenantPage({
          applicationCode: 'OPERATING_ROOM',
          pageNumber: pagination.value.pageNumber,
          pageSize: pagination.value.pageSize,
          tenant: formState.tenant,
          deviceProdCategoryCodeConcat: formState.deviceProdCategoryCode || undefined,
          areaId: formState.areaId || undefined,
          keyword: formState.keyword
        })
        if (res) {
          const { records, total } = res
          dataSource.value = records
          pagination.value.total = total
        }
      } catch {
      } finally {
        loading.value = false
      }
    }

    const pageChange = async (pageNumber: number, pageSize: number): Promise<void> => {
      pagination.value.pageNumber = pageNumber || 1
      pagination.value.pageSize = pageSize
      await getTableData()
    }

    const queryForm = async (): Promise<void> => {
      pagination.value.pageNumber = 1
      await getTableData()
    }
    const reset = async (): Promise<void> => {
      formState.period = undefined
      formState.status = undefined
      formState.tenant = undefined
      formState.areaId = ''
      formState.keyword = ''
      formState.deviceProdCategoryCode = ''
      await queryForm()
    }
    const tenantChange = async (value: number): Promise<void> => {
      areaOptions.value.length = 0
      propOptions.value.length = 0
      try {
        areaOptions.value = await cubeMdataService.getAreaTreeByTenant(value)
      } catch {

      }
      try {
        propOptions.value = await cubeDeviceCenterService.getIotProductCategoryTree(value + '')
      } catch {

      }
      formState.period = undefined
      formState.status = undefined
      formState.areaId = ''
      formState.keyword = ''
      formState.deviceProdCategoryCode = ''
      await queryForm()
    }
    const { scrollY } = useTableScroll()
    const areaOptions = ref<AreaTree[]>([])
    const propOptions = ref<ProductIotCategoryTree[]>([])

    const layoutSlots = {
      'layout-content': (): JSX.Element => {
        return (
          <>
            <Form layout='inline' style={{ margin: '10px 0 0 0' }}>
              <FormItem label='所属医院' style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }}>
                <TenantSelect
                  style={{ width: '180px' }} v-model:value={formState.tenant} onChange={tenantChange}
                />
              </FormItem>
              <FormItem label='设备名称' style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }}>
                <Input v-model:value={formState.keyword} />
              </FormItem>
              <FormItem style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }}>
                <Button type='primary' onClick={queryForm}>查询</Button>
                <Button style={{ marginLeft: '10px' }} onClick={reset}>重置</Button>
              </FormItem>
            </Form>
            <div style='display:flex;height:calc(100% - 55px)'>
              <div class='page-left' style='width:200px;height:100%;overflow-y:scroll'>
                <Tabs centered style='margin-top:-6px'>
                  <TabPane key='1' tab='所在区域'>
                    <Spin spinning={loading.value}>
                      {
                        areaOptions.value.length > 0 &&
                          <Tree
                            fieldNames={{ title: 'name', key: 'id', children: 'children' }}
                            treeData={areaOptions.value}
                            onSelect={(e: string[]) => {
                              formState.areaId = e[0]; queryForm()
                            }}
                          />
                      }
                      {areaOptions.value.length === 0 && <Empty />}
                    </Spin>
                  </TabPane>
                  <TabPane key='2' tab='产品分类'>
                    <Spin spinning={loading.value}>
                      {
                        propOptions.value.length > 0 &&
                          <Tree
                            fieldNames={{ title: 'categoryName', key: 'categoryCode', children: 'children' }}
                            treeData={propOptions.value}
                            onSelect={(e: string[]) => {
                              formState.deviceProdCategoryCode = e[0]; queryForm()
                            }}
                          />
                      }
                      {propOptions.value.length === 0 && <Empty />}
                    </Spin>
                  </TabPane>
                </Tabs>
              </div>
              <div class='page-right' style='width:calc(100% - 200px)'>
                <Table columns={columns} loading={loading.value} dataSource={dataSource.value} pagination={false} size='small' scrollY={scrollY.value} scrollX={1800} />
              </div>
            </div>
          </>

        )
      },
      'footer-page': (): JSX.Element => {
        return (
          <Page
            v-model:current={pagination.value.pageNumber}
            v-model:pageSize={pagination.value.pageSize}
            v-model:total={pagination.value.total}
            onPageChange={pageChange}
          />
        )
      }
    }
    return (): JSX.Element =>
      <>
        <Layout title='设备列表' v-slots={layoutSlots} />
      </>
  }
})
