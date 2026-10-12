import { AntModal, Form, FormItem, InputNumber, message, Cascader, Select } from '@ghcloud/cube-ui'
import { defineComponent, onMounted, reactive } from 'vue'
import { getAreaOption } from '@/api/device-center'
import { getGearOptionsByArea } from '@/api/business-config'
interface OptionState {
  area: string;
  areaName: string;
  builtUpArea: string;
  code: string;
  id: string;
  name: string;
}
interface FormState {
  unitPrice: string;
  emplaceTemperature: string;
  unitTraffic: string;
  gearPositionId: string | null;
}
interface SelectOptionState {
  id: string;
  code: string;
  parentId: null | string;
  isLeaf?: boolean;
  disabled?: boolean;
  isAreaEnd?: boolean;
  loading?: boolean;
  children: SelectOptionState[];
}
export const RelateModal = defineComponent({
  props: {
    visible: {
      type: Boolean,
      default: false
    },
  },
  emits: ['update:visible', 'ok'],
  setup: (props, { emit, expose }) => {
    const state = reactive<{ loading: boolean; selectOptions: SelectOptionState[];selectGearOptions: OptionState[] ;areaGearValue: string[] | null; formState: FormState; }>({
      selectOptions: [],
      selectGearOptions: [],
      loading: false,
      areaGearValue: null,
      formState: {
        unitPrice: '',
        emplaceTemperature: '',
        unitTraffic: '',
        gearPositionId: null
      },
    })
    const handleModalOk = async (): Promise< void> => {
      if (!state.formState.gearPositionId) {
        message.error('请选择档位')
        return
      }
      if (!state.formState.unitPrice) {
        message.error('请输入单价')
        return
      }
      if (state.formState.emplaceTemperature === '') {
        message.error('请输入钛泡低温保护设置')
        return
      }
      if (!state.formState.unitTraffic) {
        message.error('请输入钛冷媒单位流量')
        return
      }
      emit('ok', { ...state.formState })
      state.loading = true
    }
    const handleCancel = (): void => {
      emit('update:visible', false)
      state.formState = {
        unitPrice: '',
        emplaceTemperature: '',
        unitTraffic: '',
        gearPositionId: null
      }
      state.areaGearValue = null
    }
    const closeLoading = (): void => {
      state.loading = false
    }
    expose({
      handleCancel,
      closeLoading
    })
    onMounted(() => {
      getAreaSelectOption()
    })
    const getAreaSelectOption = async (): Promise<void> => {
      const { data } = await getAreaOption()
      state.selectOptions = data
    }
    const getGearOptions = async (): Promise<void> => {
      const params = {
        area: state.areaGearValue?.join(',') ?? ''
      }
      const { data } = await getGearOptionsByArea(params)
      state.selectGearOptions = data
    }
    // const loadCascader = async (selectedOptions: SelectOptionState[]): Promise< void> => {
    //   const targetOption = selectedOptions[selectedOptions.length - 1]
    //   if (!targetOption.isAreaEnd) return
    //   targetOption.loading = true

    //   targetOption.children = data
    // }
    const handleCascaderChange = (value: string[]): void => {
      state.areaGearValue = value
      getGearOptions()
    }
    return (): JSX.Element => (
      <>
        <AntModal
          v-model:visible={props.visible}
          title='关联档位'
          width={800}
          maskClosable={false}
          confirmLoading={state.loading}
          onOk={handleModalOk}
          onCancel={handleCancel}
        >
          <Form>
            <FormItem label='档位区域:'>
              <Cascader options={state.selectOptions} placeholder='请选择档位区域' fieldNames={{ label: 'name', value: 'id' }} onChange={handleCascaderChange} v-model:value={state.areaGearValue} style={{ width: '400px' }} />
              {/* <Select v-model:value={state.formState.gearPositionId} placeholder='请选择档位' options={state.selectOptions} showArrow fieldNames={{ label: 'name', value: 'id' }} style={{ width: '400px' }} /> */}
            </FormItem>
            <FormItem label='选择档位:'>
              {/* <Cascader options={state.selectOptions} loadData={loadCascader} placeholder='请选择档位' fieldNames={{ label: 'name', value: 'id' }} v-model:value={state.areaGearValue} /> */}
              <Select v-model:value={state.formState.gearPositionId} placeholder='请选择档位' options={state.selectGearOptions} showArrow fieldNames={{ label: 'name', value: 'id' }} style={{ width: '400px' }} />
            </FormItem>
            <FormItem label='设备配置:'>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ flexShrink: 0 }}> 钛泡低温保护设置 </span>
                <InputNumber v-model:value={state.formState.emplaceTemperature} min={-99} max={99} precision={2} style={{ width: '200px' }} />
                <span style={{ flexShrink: 0 }}>℃</span>
                <span style={{ flexShrink: 0 }}>钛泡温度范围值在-99℃~99℃</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '20px' }}>
                <span style={{ flexShrink: 0 }}>冷媒单位流量</span>
                <InputNumber v-model:value={state.formState.unitTraffic} precision={2} style={{ width: '200px' }} />
                <span style={{ flexShrink: 0 }}>m³/h</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '20px' }}>
                <span style={{ flexShrink: 0 }}>单价</span>
                <InputNumber v-model:value={state.formState.unitPrice} precision={2} style={{ width: '200px' }} />
                <span style={{ flexShrink: 0 }}>元</span>
              </div>
            </FormItem>
          </Form>
        </AntModal>
      </>
    )
  }
})
