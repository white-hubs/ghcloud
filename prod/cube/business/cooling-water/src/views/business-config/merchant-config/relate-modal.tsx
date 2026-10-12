import { getGearOptions, getRelatedGears } from '@/api/business-config'
import { AntModal, Form, FormItem, Table, DatePicker, Select, message } from '@ghcloud/cube-ui'
import { defineComponent, reactive, watch } from 'vue'
interface RecordState {
  gearPositionCode: string;
  billableTime: string;
  gearPositionId: string;
  name: string;
}
interface OptionState {
  area: string;
  areaName: string;
  builtUpArea: string;
  code: string;
  id: string;
  name: string;
  disabled: boolean;
}
export const RelateModal = defineComponent({
  props: {
    visible: {
      type: Boolean,
      default: false
    },
  },
  emits: ['update:visible', 'ok'],
  setup: (props, { emit }) => {
    const state = reactive<{ dataSource: RecordState[];selectOptions: OptionState[];selectValues: string[]; }>({
      dataSource: [],
      selectOptions: [],
      selectValues: []
    })

    const handleModalOk = (): void => {
      if (!state.selectValues.length) {
        message.error('请选择档位')
        return
      }
      let valid = false
      for (const item of state.dataSource) {
        if (!item.billableTime) {
          valid = true
        }
      }
      if (valid) {
        message.error('请选择计费开始日期')
        return
      }
      emit('ok', state.dataSource.map(item => {
        return {
          billableTime: item.billableTime,
          gearPositionId: item.gearPositionId,
        }
      }))
      state.dataSource = []
      state.selectValues = []
    }
    const handleCancel = (): void => {
      emit('update:visible', false)
      state.dataSource = []
      state.selectValues = []
    }
    const columns = [
      {
        title: '档位编号',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: '计费开始日期',
        dataIndex: 'billableTime',
        key: 'billableTime',
        customRender: ({ record }: { record: RecordState; }): JSX.Element => {
          return (
            <>
              <DatePicker v-model:value={record.billableTime} />
            </>
          )
        }
      },
    ]
    const handleTreeSelectChange = (val: string[], label: OptionState[]): void => {
      const dataSource = label.map((item) => {
        return {
          gearPositionCode: item.code,
          billableTime: '',
          gearPositionId: item.id,
          name: item.name
        }
      })
      state.dataSource = dataSource
    }
    watch(() => props.visible, () => {
      if (props.visible) {
        getOptions()
      }
    })
    const getOptions = async (): Promise<void> => {
      const gearOptionsRes = await getGearOptions()
      const gearOptions = gearOptionsRes.data as OptionState[]
      const relatedGearsRes = await getRelatedGears()
      const relatedGears = relatedGearsRes.data as string[]
      state.selectOptions = gearOptions.map(item => {
        return {
          ...item,
          disabled: !!relatedGears.includes(item.id)
        }
      })
    }

    return (): JSX.Element => (
      <>
        <AntModal
          v-model:visible={props.visible}
          title='关联档位'
          width={800}
          onOk={handleModalOk}
          maskClosable={false}
          onCancel={handleCancel}
        >
          <Form>
            <FormItem label='选择档位:' style={{ width: '400px' }}>
              <Select v-model:value={state.selectValues} options={state.selectOptions} showArrow fieldNames={{ label: 'name', value: 'id', disabled: 'disabled' }} mode='multiple' onChange={handleTreeSelectChange} />
            </FormItem>
            <FormItem label='计费配置'>
              <Table columns={columns} dataSource={state.dataSource} pagination={false} size='small' />
            </FormItem>
          </Form>
        </AntModal>
      </>
    )
  }
})
