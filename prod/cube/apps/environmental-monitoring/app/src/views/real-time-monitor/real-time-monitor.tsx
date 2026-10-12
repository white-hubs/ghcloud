import { computed, defineComponent, onMounted, reactive, ref } from 'vue'
import { Button, Form, FormItem, Page, PopOver, Select, Table, message } from '@ghcloud/cube-ui'
import { Layout } from '@/components/layout/layout'
import { usePageName } from '@/hook/use-page-name'
import { AreaTreeSelect, DeviceModalTable } from '@ghcloud/generic-component'
import { cubeDeviceMonitorService, cubeSecurityManagementService } from '@/api/service'
import { useTableScroll } from '@/hook/use-table-scroll'
import type { NormDataVO, SecurityDeviceMonitorVo } from '@ghcloud/cube-iot-center-service'
import lodash from 'lodash'

/** 实时监测 */
export const RealTimeMonitor = defineComponent({
  setup: () => {
    const { title: pageTitle } = usePageName()
    const formState = reactive<{
      deviceIds: string[] | undefined;
      areaId: string | undefined;
    }>({
      deviceIds: undefined,
      areaId: undefined,
    })
    const columns = [
      {
        title: '序号',
        width: 70,
        align: 'center',
        customRender: ({ index }: { index: number; }) => `${index + 1}`
      },
      {
        title: '设备名称',
        dataIndex: 'deviceName',
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string; }) => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '所在区域',
        dataIndex: 'areaName',
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string; }) => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
    ]
    const loading = ref(false)
    const dataSource = ref<unknown[]>([])
    const pagination = ref({
      pageSize: 10,
      pageNumber: 1,
      total: 0
    })
    const propVoSelectList = ref<{
      name: string;
      code: string;
      unit: string;
    }[]>([])
    const getTableData = async (): Promise<void> => {
      try {
        loading.value = true
        const params = {
          applicationCode: __ENV__.applicationCode,
          ids: formState.deviceIds ?? [],
          areaId: formState.areaId ?? '',
          keyword: '',
          pageSize: pagination.value.pageSize,
          pageNumber: pagination.value.pageNumber
        }
        const res = await cubeDeviceMonitorService.getTimePage(params)
        if (res) {
          const { records, total } = res
          // 获取指标
          let normList = records.map(item => item.details).reduce((acc, cur) => acc.concat(cur), []) as NormDataVO[]
          normList = lodash.uniqWith(normList, (a, b) => a.normCode === b.normCode)
          propVoSelectList.value = normList.map(e => {
            return {
              name: e.normName ?? '',
              code: e.normCode ?? '',
              unit: e.unit ?? ''
            }
          })
          dataSource.value = records
          pagination.value.total = total
        }
      } catch (error) {
        message.error((error as { errorMessage: string; })?.errorMessage ?? '网络异常')
      } finally {
        loading.value = false
      }
    }
    const pageChange = (pageNumber: number, pageSize: number): void => {
      pagination.value.pageNumber = pageNumber || 1
      pagination.value.pageSize = pageSize
      getTableData()
    }

    const queryForm = (): void => {
      pagination.value.pageNumber = 1
      getTableData()
    }
    const reset = (): void => {
      formState.deviceIds = undefined
      formState.areaId = undefined
      propVoSelectList.value = []
      dataSource.value = []
      deviceList.value = []
      queryForm()
    }
    onMounted(() => {
      getDefaultDevice()
    })
    // 默认选中第一个设备
    const getDefaultDevice = async (): Promise<void> => {
      const params = {
        pageNumber: 1,
        pageSize: 10,
        applicationCode: __ENV__.applicationCode,
        filterTagCodes: `builtin.app::${__ENV__.applicationCode}`
      }
      const { records } = await cubeSecurityManagementService.getSecurityDevicePage(params)
      deviceList.value = records.map(e => {
        return { name: e.deviceName, id: e.id, deviceId: e.deviceId }
      })
      formState.deviceIds = deviceList.value.map(i => i.deviceId)
      getTableData()
    }
    // 动态列
    const tableColumns = computed(() => {
      const columnList = [...propVoSelectList.value.map((item) => {
        return {
          title: `${item.name}`,
          dataIndex: `${item.code}`,
          ellipsis: true,
          width: 180,
          customRender: ({ record }: { record: SecurityDeviceMonitorVo; }) => {
            let value = ''
            if (record.details) {
              const realValue = record.details.find(i => i.normCode === item.code)?.value
              value = (realValue ?? '') as string
              value && (value += item.unit)
            }
            return <PopOver content={value ?? '--'}>{value ?? '--'}</PopOver>
          }
        }
      })]
      return [...columns, ...columnList]
    })
    const deviceModalTableRef = ref<{ openModal: () => void; }>()
    const deviceList = ref<{ name: string; id: string; deviceId: string; }[]>([])
    const { scrollY } = useTableScroll()
    const layoutSlots = {
      'layout-content': () => {
        return (
          <>
            <Form layout='inline' style={{ margin: '10px 0 0 0' }}>
              <FormItem label='所在区域' style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }}>
                <AreaTreeSelect v-model:value={formState.areaId} placeholder='请选择所在区域' style={{ minWidth: '160px' }} />
              </FormItem>
              <FormItem style={{ display: 'flex', paddingRight: 0, marginBottom: '10px' }} label='选择设备'>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <Select
                    style={{ minWidth: '160px' }}
                    open={false}
                    showArrow={false}
                    allowClear={false}
                    mode='multiple'
                    options={deviceList.value}
                    v-model:value={formState.deviceIds}
                    placeholder='请选择设备'
                    maxTagCount={3}
                    fieldNames={{ value: 'deviceId', label: 'name' }}
                    onChange={() => {
                      deviceList.value = deviceList.value.filter(i => formState.deviceIds?.includes(i.deviceId))
                    }}
                  />
                  <Button type='primary' onClick={() => deviceModalTableRef.value?.openModal()}>选择设备</Button>
                </div>
              </FormItem>
              <FormItem style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }}>
                <Button type='primary' onClick={queryForm}>查询</Button>
                <Button style={{ marginLeft: '10px' }} onClick={reset}>重置</Button>
              </FormItem>
            </Form>
            <Table
              columns={tableColumns.value}
              data-source={dataSource.value}
              loading={loading.value}
              rowKey='id'
              pagination={false}
              scrollY={scrollY.value}
            />
          </>
        )
      },
      'footer-page': () => {
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
    return () =>
      <>
        <Layout title={pageTitle ?? '实时监测'} v-slots={layoutSlots} />
        <DeviceModalTable
          ref={deviceModalTableRef}
          v-model:value={deviceList.value}
          multiple
          applicationCode={__ENV__.applicationCode}
          filterTagCodes={[`builtin.app::${__ENV__.applicationCode}`]}
          securityDevice
          onOk={async (values: { deviceName: string; id: string; deviceId: string; }[]) => {
            deviceList.value = values.map(e => {
              return { name: e.deviceName, id: e.id, deviceId: e.deviceId }
            })
            formState.deviceIds = deviceList.value.map(i => i.deviceId)
          }}
        />
      </>
  }
})
