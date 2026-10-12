import { defineComponent, onMounted, reactive, ref } from 'vue'
import { GLayout } from '@/components/common/layout'
import styles from './index.module.less'
import { Form, FormItem, Input, Row, Col, RadioGroup, Button, Table, DateRangePicker, TimePicker, CheckboxGroup, PopConfirm, type FormInstance, message, Modal } from '@ghcloud/cube-ui'
import { SelectDeviceModal } from './select-device-modal'
import { useRoute } from 'vue-router'
import { type DeviceLogVo, ExecuteEnum, saveDefiniteTimeSwitch, getDefiniteTimeSwitchDetail, deleteSwitchDevice, getDeviceLog } from '@/apis'
import dayjs from 'dayjs'
import { GPagination } from '@/components/common/pagination'

export const EditSwitch = defineComponent({
  setup: () => {
    const radioOptions = [
      {
        label: '启用',
        value: 1,
      }, {
        label: '禁用',
        value: 0,
      },
    ]
    const formRef = ref<FormInstance>()
    const route = useRoute()
    const typeForTitleObj = {
      add: '新增',
      edit: '编辑',
      info: '详情'
    }
    interface DeviceVo {
      deviceName: string;
      deviceId: string;
      id: string;
      thirdPartyId: string;
    }
    const state = reactive<{
      visible: boolean;
      saveLoading: boolean;
      logVisible: boolean;
      logDataSource: DeviceLogVo[];
      modalLoading: boolean;
      logPage: {
        pageNumber: number;
        pageSize: number;
        total: number;
      };
      formState: {
        planName: string;
        planStartTime: string;
        planEndTime: string;
        planValidTime: string[];
        openTime: string;
        closeTime: string;
        isEnable: number;
        executionCycle: string[];
        securityDevices: DeviceVo[]; // 设备列表
      };
    }>({
      visible: false,
      saveLoading: false,
      logVisible: false,
      logDataSource: [],
      logPage: {
        pageNumber: 1,
        pageSize: 10,
        total: 0,
      },
      modalLoading: false,
      formState: {
        planName: '',
        planStartTime: '',
        planEndTime: '',
        planValidTime: [],
        openTime: '',
        closeTime: '',
        isEnable: 1,
        executionCycle: [],
        securityDevices: []
      }
    })
    const rules = {
      planName: [{ required: true, message: '请输入计划名称' }],
      planStartTime: [{ required: true, message: '请选择计划开始时间' }],
      planEndTime: [{ required: true, message: '请选择计划结束时间' }],
      planValidTime: [{ required: true, message: '请选择计划有效期' }],
      executionCycle: [{ required: true, message: '请选择执行周期' }],
      openTime: [{ required: true, message: '请选择开屏时间' }],
      closeTime: [{ required: true, message: '请选择关屏时间' }],
      isEnable: [{ required: true, message: '请选择是否启用' }],
    }
    const columns = [
      {
        title: '设备名称',
        dataIndex: 'deviceName',
        key: 'deviceName',
      },
      {
        title: '设备编码',
        dataIndex: 'code',
        key: 'code',
      },
      {
        title: '产品分类',
        dataIndex: 'deviceProdCategoryName',
        key: 'deviceProdCategoryName',
      },
      {
        title: '设备型号',
        dataIndex: 'deviceProdName',
        key: 'deviceProdName',
      },
      {
        title: '设备区域',
        dataIndex: 'areaName',
        key: 'areaName',
      },
      {
        title: '操作',
        dataIndex: 'operation',
        key: 'operation',
        customRender: ({ record }: { record: DeviceVo; }) => {
          return (
            <>
              <Button
                type='link' size='small' onClick={() => { handleLog(record) }}
              >日志
              </Button>
              <PopConfirm title='确认删除该项？' onConfirm={() => { delRow(record) }}>
                <Button disabled={route.query.type === 'info'} type='link' size='small' danger>删除</Button>
              </PopConfirm>
            </>
          )
        }
      },
    ]
    const modalColumns = [
      {
        title: '设备名称',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: '设备编码',
        dataIndex: 'code',
        key: 'code',
      },
      {
        title: '开关控制',
        dataIndex: 'expectedValue',
        key: 'expectedValue',
        customRender: ({ record }: { record: DeviceLogVo; }) => {
          return record.expectedValue ? record.expectedValue.value : '--'
        }
      },
      {
        title: '执行时间',
        dataIndex: 'createTime',
        key: 'createTime',
        customRender: ({ record }: { record: DeviceLogVo; }) => {
          return dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss')
        }
      },
      {
        title: '执行结果',
        dataIndex: 'executeResult',
        key: 'executeResult',
        customRender: ({ record }: { record: DeviceLogVo; }) => {
          return record.executeResult ? ExecuteEnum[record.executeResult] : '--'
        }
      },
    ]
    const changePage = (pageNumber: number, pageSize: number): void => {
      state.logPage.pageNumber = pageNumber
      state.logPage.pageSize = pageSize
      getLogList()
    }
    let checkedDevice = ''
    const handleLog = async (record: DeviceVo): Promise<void> => {
      state.logPage.pageNumber = 1
      state.logPage.pageSize = 10
      checkedDevice = record.deviceId
      await getLogList()
      state.logVisible = true
    }
    const getLogList = async (): Promise<void> => {
      try {
        state.modalLoading = true
        const { data } = await getDeviceLog(
          {
            ...state.logPage,
            deviceId: checkedDevice
          }
        )
        state.logPage.total = data.total
        state.logDataSource = data.records
      } finally {
        state.modalLoading = false
      }
    }
    const delRow = async (record: DeviceVo): Promise<void> => {
      await deleteSwitchDevice({
        deviceId: record.deviceId
      })
      const rowIndex = state.formState.securityDevices.findIndex(item => item.id === record.id)
      state.formState.securityDevices.splice(rowIndex, 1)
    }
    const getSwitchInfo = async (): Promise<void> => {
      const { data } = await getDefiniteTimeSwitchDetail({
        id: route.query.id as string
      })
      state.formState = { ...data, planStartTime: dayjs(data.planStartTime).format('YYYY-MM-DD'), planEndTime: dayjs(data.planEndTime).format('YYYY-MM-DD'), planValidTime: [dayjs(data.planStartTime).format('YYYY-MM-DD'), dayjs(data.planEndTime).format('YYYY-MM-DD')] }
    }

    onMounted(() => {
      route.query.id && getSwitchInfo()
    })
    const handleSubmit = async (): Promise<void> => {
      await formRef.value?.validate()
      if (!state.formState.securityDevices) {
        message.warning('请选择设备')
        return
      }
      try {
        state.saveLoading = true
        const payload = {
          ...state.formState,
          planStartTime: state.formState.planValidTime[0],
          planEndTime: state.formState.planValidTime[1],
        }
        await saveDefiniteTimeSwitch(payload)
        message.success('保存成功')
        history.back()
      } finally {
        state.saveLoading = false
      }
    }
    const weekOptions = ['一', '二', '三', '四', '五', '六', '日'].map(item => {
      return {
        label: `周${item}`,
        value: item
      }
    })
    const layoutSlots = {
      'content-table': () => {
        return (
          <div class={styles.container}>
            <Form ref={formRef} model={state.formState} rules={rules}>
              <Row>
                <Col xs={24} sm={24} md={12} lg={7} xl={7} xxl={7}>
                  <FormItem label='计划名称' name='planName'>
                    <Input disabled={route.query.type === 'info'} placeholder='请输入计划名称' v-model:value={state.formState.planName} />
                  </FormItem>
                </Col>
                <Col xs={24} sm={24} md={12} lg={7} xl={7} xxl={7}>
                  <FormItem label='有效期' name='planValidTime'>
                    <DateRangePicker disabled={route.query.type === 'info'} v-model:value={state.formState.planValidTime} />
                  </FormItem>
                </Col>
                <Col xs={24} sm={24} md={12} lg={10} xl={10} xxl={10}>
                  <FormItem label='执行周期' name='executionCycle'>
                    <CheckboxGroup disabled={route.query.type === 'info'} v-model:value={state.formState.executionCycle} options={weekOptions} />
                  </FormItem>
                </Col>
              </Row>
              <Row>
                <Col xs={24} sm={24} md={12} lg={8} xl={7} xxl={6}>
                  <FormItem label='屏幕开屏设置' name='openTime'>
                    <TimePicker disabled={route.query.type === 'info'} v-model:value={state.formState.openTime} placeholder='设置开屏时间' />
                  </FormItem>
                </Col>
                <Col xs={24} sm={24} md={12} lg={8} xl={7} xxl={6}>
                  <FormItem label='屏幕关屏设置' name='closeTime'>
                    <TimePicker disabled={route.query.type === 'info'} v-model:value={state.formState.closeTime} placeholder='设置关屏时间' />
                  </FormItem>
                </Col>
              </Row>
              <Row>
                <Col xs={24} sm={24} md={12} lg={12} xl={12} xxl={12}>
                  <FormItem label='是否启用' name='isEnable'>
                    <RadioGroup disabled={route.query.type === 'info'} v-model:value={state.formState.isEnable} options={radioOptions} />
                  </FormItem>
                </Col>
              </Row>
              <div class={styles.content}>
                <div class={styles.header}>
                  <label>关联设备</label>
                  <Button
                    disabled={route.query.type === 'info'}
                    type='primary' onClick={() => {
                      state.visible = true
                    }}
                  >添加
                  </Button>
                </div>
                <div class={styles.table}>
                  <Table columns={columns} dataSource={state.formState.securityDevices} size='small' />
                </div>
              </div>
            </Form>
          </div>
        )
      },
      'footer-page': () => {
        return (
          <>
            <Button
              onClick={() => {
                history.back()
              }}

            >返回
            </Button>
            {route.query.type !== 'info' && <Button style={{ marginLeft: '10px' }} type='primary' loading={state.saveLoading} onClick={handleSubmit}>保存</Button>}

          </>
        )
      }
    }
    const handleSelectDeviceOk = (rows: DeviceVo[]): void => {
      state.formState.securityDevices = [...rows]
    }
    return () => (
      <GLayout title={`定时设置-${typeForTitleObj[route.query.type as unknown as keyof typeof typeForTitleObj]}`} v-slots={layoutSlots}>
        <Modal footer={null} v-model:visible={state.logVisible} title='操作日志'>
          <div class={styles.modalTable}>
            <Table loading={state.modalLoading} pagination={false} columns={modalColumns} dataSource={state.logDataSource} size='small' />
          </div>
          <div class={styles.modalFooter}>
            <GPagination onChange={changePage} pageSize={state.logPage.pageSize} current={state.logPage.pageNumber} total={state.logPage.total} />
          </div>
        </Modal>
        <SelectDeviceModal selectedRowKeys={state.formState.securityDevices.map(item => item.id)} selectedRow={state.formState.securityDevices.map(item => item)} v-model:visible={state.visible} onOk={handleSelectDeviceOk} />
      </GLayout>
    )
  }
})
