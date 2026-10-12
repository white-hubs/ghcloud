import { defineComponent, reactive, type PropType, onMounted, computed } from 'vue'
import { FormItem, Button, PlusOutlined, Switch, TimePicker, PlusCircleOutlined, DeleteOutlined, Cascader, Input, Table } from '@ghcloud/cube-ui'
import styles from './index.module.less'
import { RulesItem } from './components/rules-item'
import { ModalTable } from '@ghcloud/generic-component'
import { getAreaOption } from '@/api/device-center'

import type { AlarmRuleConfigState, RuleConditionCommand, RuleConditionDeviceCommand } from '../../index.i'
import { cloneDeep, without } from 'lodash'
import { getDeviceTypeList, getSecurityDevicePage } from '@/api/alarm'
import { getCurrentApplication } from '@/utils/auth'
export const AlarmRuleConfig = defineComponent({
  props: {
    value: {
      type: Object as PropType<AlarmRuleConfigState>,
      default: () => {
        return {
          rulePeriodTimed: false,
          emergencyRuleTimeCommands: [],
          emergencyRuleConditionCommands: [
            {
              emergencyRuleConditionExpCommands: [{
                propCode: null,
                propName: null,
                propUnit: null,
                op: null,
                oprand: null,
                delayTime: null,
              }]
            }
          ],
          emergencyRuleConditionDeviceCommands: []
        }
      }
    }
  },
  emits: ['update:value'],
  setup: (props, { emit }) => {
    const state = reactive({
      deviceTypeOptions: [],
      selectOption: [],
      modalVisible: false,
      selectRowValue: []
    })
    const deviceColumns = [
      {
        dataIndex: 'name',
        title: '序号',
        slots: {
          customRender: 'name',
        },
        customRender: ({ index }: { index: number; }): number => {
          return index + 1
        },
      },
      {
        dataIndex: 'deviceName',
        title: '设备名称',
      },
      {
        dataIndex: 'genreName',
        title: '设备类型',
      },
      {
        dataIndex: 'modelName',
        title: '设备型号',
      },
      {
        dataIndex: 'area',
        title: '所属区域',
      },
    ]
    const getSelectOption = async (): Promise<void> => {
      const { data } = await getAreaOption()
      state.selectOption = data
    }
    // <Cascader options={state.selectOption} placeholder='所属区域' fieldNames={{ label: 'name', value: 'id' }} v-model:value={state.searchParams.areaIds} />

    const tableSearchComponent = computed(() => {
      return [
        { label: '部门', key: 'organizationId', component: Cascader, componentProps: { placeholder: '请选择', options: state.selectOption, fieldNames: { label: 'name', value: 'id', children: 'children' }, style: { width: '180px' } } },
        { label: '', key: 'keyword', component: Input, componentProps: { placeholder: '设备名称' } }
      ]
    })
    onMounted(() => {
      getSelectOption()
    })
    // 新增规则
    const handleAddFactor = (): void => {
      // 新增的某项
      const addItem = {
        conditionType: '',
        deviceEventCode: '',
        deviceEventName: '',
        deviceEventType: '',
        deviceGenreId: null,
        deviceGenreName: '',
        deviceModelId: '',
        deviceModelName: '',
        emergencyRuleConditionExpCommands: [
          {
            propCode: null,
            propName: null,
            propUnit: null,
            op: null,
            oprand: null,
            delayTime: null,
          }
        ]
      }
      const emergencyRuleConditionCommands = [...props.value.emergencyRuleConditionCommands, addItem]
      emit('update:value', { ...props.value, emergencyRuleConditionCommands })
    }
    onMounted(() => {
      getDeviceTypeOptions()
    })
    // 获取设备类型配置
    const getDeviceTypeOptions = async (): Promise<void> => {
      const { data } = await getDeviceTypeList()
      state.deviceTypeOptions = data
    }
    // 删除规则
    const handleDeleteRuleCondition = (item: RuleConditionCommand): void => {
      const emergencyRuleConditionCommands = without(props.value.emergencyRuleConditionCommands, item)
      emit('update:value', { ...props.value, emergencyRuleConditionCommands })
    }
    // 规则某一项更行
    const handleRuleItemUpdateValue = (value: RuleConditionCommand, ruleItemIndex: number): void => {
      const emergencyRuleConditionCommands = cloneDeep(props.value.emergencyRuleConditionCommands)
      emergencyRuleConditionCommands[ruleItemIndex] = value
      emit('update:value', { ...props.value, emergencyRuleConditionCommands })
    }
    /**
     * 新增某一行
     */
    const handaddTimeCommand = (): void => {
      const addTimeCommand = {
        startTime: '',
        endTime: ''
      }
      const emergencyRuleTimeCommands = [...props.value.emergencyRuleTimeCommands, addTimeCommand]
      emit('update:value', { ...props.value, emergencyRuleTimeCommands })
    }
    /**
     * 删除某项时间生效时段
     * @param item
     */
    const handleDeleteTimeCommand = (item: { startTime: string;endTime: string;id?: string; }): void => {
      const emergencyRuleTimeCommands = without(props.value.emergencyRuleTimeCommands, item)
      emit('update:value', { ...props.value, emergencyRuleTimeCommands })
    }
    const handleAddDevice = (): void => {
      state.modalVisible = true
    }
    const selectRowKeys = computed(() => {
      return props.value.emergencyRuleConditionDeviceCommands.map(item => item.id)
    })
    const handleSelectDevicesOk = (value: RuleConditionDeviceCommand[]): void => {
      const emergencyRuleConditionDeviceCommands = value
      emit('update:value', { ...props.value, emergencyRuleConditionDeviceCommands })
      state.modalVisible = false
    }
    return (): JSX.Element => (
      <>
        <FormItem label='触发条件'>
          <Button type='primary' onClick={handleAddFactor}>
            添加
            <PlusOutlined />
          </Button>
        </FormItem>
        {props.value.emergencyRuleConditionCommands.length !== 0 &&
          <FormItem label='报警规则'>
            {
              props.value.emergencyRuleConditionCommands.map((item, index) => {
                return (
                  <div class={styles['alarm-rule']} key={index}>
                    <RulesItem v-model:value={item} ruleItemIndex={index} deviceTypeOptions={state.deviceTypeOptions} onUpdateValue={handleRuleItemUpdateValue} />
                    <Button type='link' danger onClick={() => {
                      handleDeleteRuleCondition(item)
                    }}>删除</Button>
                  </div>
                )
              })
            }
          </FormItem>}

        <FormItem label='配置生效时段'>
          <Switch v-model:checked={props.value.rulePeriodTimed} />
          {
            props.value.emergencyRuleTimeCommands.map((item, index) => {
              return (
                <div style={{ marginTop: '10px' }} key={index}>
                  <TimePicker format='HH:mm' v-model:value={item.startTime} />
                  <span style={{ margin: '0 5px' }}>-</span>
                  <TimePicker format='HH:mm' v-model:value={item.endTime} />
                  {index === 0 && <PlusCircleOutlined style={{ color: '#ccc', marginLeft: '10px', cursor: 'pointer' }} onClick={handaddTimeCommand} />}
                  {index !== 0 && <DeleteOutlined style={{ color: 'red', marginLeft: '10px', cursor: 'pointer' }} onClick={() => {
                    handleDeleteTimeCommand(item)
                  }} />}
                </div>
              )
            })
          }

        </FormItem>
        <FormItem label='报警设备'>
          <Button type='primary' onClick={handleAddDevice}>
            添加
            <PlusOutlined />
          </Button>
        </FormItem>
        <Table columns={deviceColumns} dataSource={props.value.emergencyRuleConditionDeviceCommands} pagination={false} />
        <ModalTable apiFunction={getSecurityDevicePage} selectRowKeysValue={selectRowKeys.value} selectRowValue={state.selectRowValue} multiple searchParams={{ applicationCode: getCurrentApplication().code ?? 'ELECTRICMANAGE' }} onOk={handleSelectDevicesOk} search={tableSearchComponent.value} title='选择设备' columns={deviceColumns} v-model:show={state.modalVisible} />
      </>
    )
  }
})
