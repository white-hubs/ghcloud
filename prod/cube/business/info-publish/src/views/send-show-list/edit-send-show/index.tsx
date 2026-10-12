import { defineComponent, onMounted, reactive, ref } from 'vue'
import { GLayout } from '@/components/common/layout'
import styles from './index.module.less'
import { Form, FormItem, Select, Row, RadioGroup, Button, Table, DateRangePicker, TimeRangePicker, CheckboxGroup, PopConfirm, type FormInstance, message } from '@ghcloud/cube-ui'
import { SelectDeviceModal } from './select-device-modal'
import { useRoute } from 'vue-router'
import { type ShowRecordState, type SecurityDevice, getSendShowById, getShowStoreRecord, sendShowToTerminal } from '@/apis'
export const EditSendShow = defineComponent({
  setup: () => {
    const radioOptions = [
      {
        label: '普通发送',
        value: '0',
      }, {
        label: '插播',
        value: '1',
      },
    ]
    const formRef = ref<FormInstance>()
    const route = useRoute()
    const typeForTitleObj = {
      add: '新增',
      edit: '编辑',
      info: '详情'
    }

    const state = reactive<{
      visible: boolean;
      saveLoading: boolean;
      showRecordOptions: ShowRecordState[];
      formState: {
        programName: string;
        thirdProgramId: string | null;
        beginDate: string;
        endDate: string;
        beginTime: string;
        endTime: string;
        priority: string;
        timeRange: string[];
        executionCycle: string[];
        dateRange: string[];
        terminals: SecurityDevice[]; // 设备列表
      };
    }>({
      visible: false,
      saveLoading: false,
      showRecordOptions: [],
      formState: {
        programName: '',
        thirdProgramId: null,
        beginDate: '',
        endDate: '',
        dateRange: [],
        timeRange: [],
        beginTime: '',
        endTime: '',
        priority: '0',
        executionCycle: [],
        terminals: []
      }
    })
    const rules = {
      thirdProgramId: [{ required: true, message: '请输入计划名称' }],
      dateRange: [{ required: true, message: '请选择日期范围' }],
      executionCycle: [{ required: true, message: '请选择执行周期' }],
      timeRange: [{ required: true, message: '请选择开屏时间' }],
      priority: [{ required: true, message: '请选择是否启用' }],
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
        title: '所在区域',
        dataIndex: 'areaName',
        key: 'areaName',
      },
      {
        title: '操作',
        dataIndex: 'operation',
        key: 'operation',
        customRender: ({ record }: { record: SecurityDevice; }) => {
          return (
            <>
              <PopConfirm title='确认删除该项？' onConfirm={() => { delRow(record) }}>
                <Button disabled={route.query.type === 'info'} type='link' size='small' danger>移除</Button>
              </PopConfirm>
            </>
          )
        }
      },
    ]
    const getShowList = async (): Promise<void> => {
      const result = await getShowStoreRecord({
        pageNumber: 1,
        pageSize: 100
      })
      state.showRecordOptions = result.data.records
    }
    const delRow = async (record: SecurityDevice): Promise<void> => {
      const rowIndex = state.formState.terminals.findIndex(item => item.id === record.id)
      state.formState.terminals.splice(rowIndex, 1)
    }
    const getSwitchInfo = async (): Promise<void> => {
      const result = await getSendShowById({
        id: route.query.id as string
      })
      const data = (result.data as { sendDetailsMap: typeof state.formState; }).sendDetailsMap
      state.formState = {
        ...data,
      }
    }

    onMounted(() => {
      getShowList()
      route.query.id && getSwitchInfo()
    })
    const handleSubmit = async (): Promise<void> => {
      await formRef.value?.validate()
      if (!state.formState.terminals.length) {
        message.warning('请选择设备')
        return
      }
      try {
        state.saveLoading = true
        const payload = {
          ...state.formState,
          beginDate: state.formState.dateRange[0],
          endDate: state.formState.dateRange[1],
          beginTime: state.formState.timeRange[0],
          endTime: state.formState.timeRange[1],
          terminals: state.formState.terminals.map(item => {
            return {
              terminalId: item.deviceId,
              terminalName: item.deviceName,
            }
          })
        }
        await sendShowToTerminal(payload)
        // await saveDefiniteTimeSwitch(payload)
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
    const handleFilterSearch = (input: string, option: ShowRecordState): boolean => {
      return option.programName.includes(input)
    }
    const handleSelectChange = (value: unknown, option: ShowRecordState): void => {
      state.formState.programName = option.programName
    }
    const layoutSlots = {
      'content-table': () => {
        return (
          <div class={styles.container}>
            <Form class={styles.form} ref={formRef} model={state.formState} rules={rules}>
              <Row>
                <FormItem label='选择节目' name='thirdProgramId'>
                  <Select disabled={route.query.type === 'info'} v-model:value={state.formState.thirdProgramId} onChange={handleSelectChange} style={{ width: '260px' }} options={state.showRecordOptions} showSearch filterOption={handleFilterSearch} fieldNames={{ label: 'programName', value: 'id' }} />
                </FormItem>
              </Row>
              <div class={styles.title}>计划播放时间</div>
              <Row>
                <FormItem label='日期范围' name='dateRange'>
                  <DateRangePicker disabled={route.query.type === 'info'} v-model:value={state.formState.dateRange} />
                </FormItem>
              </Row>
              <Row>
                <FormItem label='执行周期' name='executionCycle'>
                  <CheckboxGroup disabled={route.query.type === 'info'} v-model:value={state.formState.executionCycle} options={weekOptions} />
                </FormItem>
              </Row>
              <Row>
                <FormItem label='播放时间' name='timeRange'>
                  <TimeRangePicker format='HH:mm:ss' valueFormat='HH:mm:ss' disabled={route.query.type === 'info'} v-model:value={state.formState.timeRange} />
                </FormItem>
              </Row>
              <Row>
                <FormItem label='优先级' name='priority'>
                  <RadioGroup disabled={route.query.type === 'info'} v-model:value={state.formState.priority} options={radioOptions} />
                </FormItem>
              </Row>
              <div class={styles.content}>
                <div class={styles.header}>
                  <label>播放终端</label>
                  <Button
                    disabled={route.query.type === 'info'}
                    type='primary' onClick={() => {
                      state.visible = true
                    }}
                  >添加
                  </Button>
                </div>
                <div class={styles.table}>
                  <Table columns={columns} dataSource={state.formState.terminals} size='small' />
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
    const handleSelectDeviceOk = (rows: SecurityDevice[]): void => {
      state.formState.terminals = [...rows]
    }
    return () => (
      <GLayout title={`发送节目-${typeForTitleObj[route.query.type as unknown as keyof typeof typeForTitleObj]}`} v-slots={layoutSlots}>
        <SelectDeviceModal selectedRowKeys={state.formState.terminals.map(item => item.id)} selectedRow={state.formState.terminals.map(item => item)} v-model:visible={state.visible} onOk={handleSelectDeviceOk} />
      </GLayout>
    )
  }
})
