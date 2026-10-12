import { AntModal, Form, FormItem, InputNumber, Textarea, Switch, message } from '@ghcloud/cube-ui'
import { defineComponent, reactive, ref } from 'vue'
import { getAlarmDetail, updateAlarm } from '@/api/price-alarm-record'

interface FormState {
  maxPrice?: string | number;
  midPrice?: string | number;
  minPrice?: string | number;
  priceExp?: boolean;
  remark?: string;
}
export const HandleModal = defineComponent({
  emits: ['change'],
  setup: (props, { emit, expose }) => {
    const state = reactive<{ formState: FormState; loading: boolean; }>({
      loading: false,
      formState: {
        maxPrice: '',
        midPrice: '',
        minPrice: '',
        priceExp: true,
        remark: ''
      },
    })
    const modleVisible = ref<boolean>(false)
    const rowId = ref<string>()
    const handleModalOk = async (): Promise< void> => {
      await updateAlarm({
        ...state.formState,
        id: rowId.value!
      })
      message.success('操作成功')
      state.loading = false
      modleVisible.value = false
      emit('change', state.formState)
    }
    const changeState = async (): Promise< void> => {
      await updateAlarm({
        ...state.formState,
        id: rowId.value!
      })
    }
    const handleCancel = (): void => {
      state.formState = {
        maxPrice: '',
        midPrice: '',
        minPrice: '',
        priceExp: true,
        remark: ''
      }
      modleVisible.value = false
      emit('change', state.formState)
    }
    const openTemplat = (id: string): void => {
      modleVisible.value = true
      rowId.value = id
      getAreaSelectOption()
    }
    expose({
      handleCancel,
      openTemplat
    })
    const getAreaSelectOption = async (): Promise<void> => {
      const { data } = await getAlarmDetail({ id: rowId.value! })
      if (data.priceExp === null) data.priceExp = true
      state.formState = data as FormState
    }
    return (): JSX.Element => (
      <>
        <AntModal
          v-model:visible={modleVisible.value}
          title='处理'
          width={500}
          maskClosable={false}
          confirmLoading={state.loading}
          onOk={handleModalOk}
          onCancel={handleCancel}
        >
          <Form labelCol={{ style: { width: '120px' } }}>
            <FormItem label='商品价格是否异常'>
              <Switch v-model:value={state.formState.priceExp} checkedChildren='是' unCheckedChildren='否' onChange={async () => changeState()} />
            </FormItem>
            <FormItem label='最高价:'>
              <InputNumber v-model:value={state.formState.maxPrice} precision={2} />
            </FormItem>
            <FormItem label='中间价:'>
              <InputNumber v-model:value={state.formState.midPrice} precision={2} />
            </FormItem>
            <FormItem label='最低价:'>
              <InputNumber v-model:value={state.formState.minPrice} precision={2} />
            </FormItem>
            <FormItem label='备注:'>
              <Textarea v-model:value={state.formState.remark} />
            </FormItem>
          </Form>
        </AntModal>
      </>
    )
  }
})
