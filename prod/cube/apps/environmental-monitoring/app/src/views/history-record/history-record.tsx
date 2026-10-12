import { computed, defineComponent, onMounted, reactive, ref, watch } from 'vue'
import { Button, DateRangePicker, Form, FormItem, Page, PopOver, Select, Table, message } from '@ghcloud/cube-ui'
import { Layout } from '@/components/layout/layout'
import { usePageName } from '@/hook/use-page-name'
import { DeviceModalTable } from '@ghcloud/generic-component'
import { cubeDeviceCenterService, cubeSecurityManagementService } from '@/api/service'
import type { DeviceSamplingHistoryResult } from '@ghcloud/cube-iot-center-service/src/types'
import dayjs from 'dayjs'
import { useTableScroll } from '@/hook/use-table-scroll'

/** 历史监测记录 */
export const HistoryRecord = defineComponent({
  setup: () => {
    const { title: pageTitle } = usePageName()
    const formState = reactive<{
      deviceId: string | undefined;
      norm: string[] | undefined;
      period: number[] | undefined;
    }>({
      norm: undefined,
      deviceId: undefined,
      period: []
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
        customRender: () => {
          const name = deviceList.value.length > 0 ? deviceList.value[0].name : '--'
          return <PopOver content={name || '--'}>{name || '--'}</PopOver>
        }
      },
      {
        title: '监测时间',
        dataIndex: 'ts',
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string; }) => {
          const time = text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : ''
          return <PopOver content={time || '--'}>{time || '--'}</PopOver>
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
    const propVoList = ref<{
      name: string;
      code: string;
      unit: string;
    }[]>([])
    const propVoSelectList = ref<{
      name: string;
      code: string;
      unit: string;
    }[]>([])
    const getTableData = async (): Promise<void> => {
      if (!formState.deviceId?.length) {
        message.warn('请选择设备')
        dataSource.value = []
        deviceList.value = []
        propVoSelectList.value = []
        formState.norm = undefined
        return
      }
      try {
        loading.value = true
        const params = {
          pageNumber: pagination.value.pageNumber,
          pageSize: pagination.value.pageSize,
          deviceId: formState.deviceId,
          propCodes: propVoSelectList.value.map(p => p.code),
          startTs: formState.period?.length ? new Date(formState.period[0]).getTime() : undefined,
          endTs: formState.period?.length ? new Date(formState.period[1]).getTime() + 86400000 : undefined,
        }
        const res = await cubeDeviceCenterService.getDeviceHistoryPage(params)
        if (res) {
          const { records, total } = res
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
      formState.norm = undefined
      formState.deviceId = undefined
      formState.period = []
      propVoSelectList.value = []
      dataSource.value = []
      deviceList.value = []
      getDefaultDevice()
    }
    onMounted(() => {
      getDefaultDevice()
    })
    // 默认选中第一个设备
    const getDefaultDevice = async (): Promise<void> => {
      const params = {
        pageNumber: 1,
        pageSize: 1,
        applicationCode: __ENV__.applicationCode,
        filterTagCodes: `builtin.app::${__ENV__.applicationCode}`
      }
      const { records } = await cubeSecurityManagementService.getSecurityDevicePage(params)
      deviceList.value = records.map(e => {
        return { name: e.deviceName, id: e.id, deviceId: e.deviceId }
      })
      formState.deviceId = deviceList.value[0]?.deviceId
      await getNormInfo()
    }
    // 获取指标
    const getNormInfo = async (): Promise<void> => {
      const { productPropVoList } = await cubeDeviceCenterService.getNorthDeviceDetail({
        deviceId: formState.deviceId ?? '',
        withPropertySpec: true
      })
      propVoList.value = productPropVoList.map(e => {
        return {
          name: e.propName ?? '',
          code: e.propCode ?? '',
          unit: e.unitName ?? ''
        }
      })
      // 指标默认选中全部
      formState.norm = propVoList.value.map(e => e.code)
      propVoSelectList.value = [...propVoList.value]
    }
    // 动态列
    const tableColumns = computed(() => {
      const columnList = [...columns, ...propVoSelectList.value.map((item) => {
        return {
          title: `${item.name}`,
          dataIndex: `${item.code}`,
          ellipsis: true,
          width: 180,
          customRender: ({ record }: { record: DeviceSamplingHistoryResult; }) => {
            let value = ''
            if (record.propValues) {
              value = (record.propValues[item.code]?.value ?? '') as string
              value && (value += item.unit)
            }
            return <PopOver content={value ?? '--'}>{value ?? '--'}</PopOver>
          }
        }
      })]
      return columnList
    })
    watch(() => formState.deviceId, (val) => {
      if (val) {
        getTableData()
      }
    }, { deep: true, immediate: true })
    const handleNormChange = (): void => {
      propVoSelectList.value = propVoList.value.filter(e => formState.norm?.includes(e.code))
    }
    const deviceModalTableRef = ref<{ openModal: () => void; }>()
    const deviceList = ref<{ name: string; id: string; deviceId: string; }[]>([])
    const { scrollY } = useTableScroll()

    const layoutSlots = {
      'layout-content': () => {
        return (
          <>
            <Form layout='inline' style={{ margin: '10px 0 0 0' }}>
              <FormItem style={{ display: 'flex', paddingRight: 0, marginRight: '20px', marginBottom: '10px' }} label='选择设备'>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <Select
                    style={{ minWidth: '160px' }}
                    open={false}
                    showArrow={false}
                    allowClear={false}
                    mode='multiple'
                    options={deviceList.value}
                    v-model:value={formState.deviceId}
                    placeholder='请选择设备'
                    maxTagCount={6}
                    fieldNames={{ value: 'deviceId', label: 'name' }}
                  />
                  <Button type='primary' onClick={() => deviceModalTableRef.value?.openModal()}>选择设备</Button>
                </div>
              </FormItem>
              <FormItem label='选择指标' style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }}>
                <Select
                  v-model:value={formState.norm}
                  fieldNames={{ value: 'code', label: 'name' }}
                  options={propVoList.value}
                  mode='multiple'
                  maxTagCount={3}
                  placeholder='请选择指标'
                  style={{ minWidth: '150px' }}
                  onChange={handleNormChange}
                />
              </FormItem>
              <FormItem label='选择日期' style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }}>
                <DateRangePicker v-model:value={formState.period} />
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
        <Layout title={pageTitle ?? '历史监测记录'} v-slots={layoutSlots} />
        <DeviceModalTable
          ref={deviceModalTableRef}
          v-model:value={deviceList.value}
          multiple={false}
          applicationCode={__ENV__.applicationCode}
          filterTagCodes={[`builtin.app::${__ENV__.applicationCode}`]}
          securityDevice
          onOk={async (values: { deviceName: string; id: string; deviceId: string; }[]) => {
            deviceList.value = values.map(e => {
              return { name: e.deviceName, id: e.id, deviceId: e.deviceId }
            })
            formState.deviceId = deviceList.value[0].deviceId
            await getNormInfo()
          }}
        />
      </>
  }
})
