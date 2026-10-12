import { debounce } from 'lodash'
import { DateRangePicker, Form, FormItem, InputNumber, MinusCircleOutlined, Modal, PlusOutlined, Select, TimePicker, type FormExpose } from '@ghcloud/cube-ui'
import { defineComponent, ref, reactive, onUnmounted } from 'vue'
import { Button } from 'ant-design-vue'
import '@/assets/style.less'
import type { Dayjs } from 'dayjs'
import { useRuleValidate } from '@/hook/use-rule-validate'
import { timeListSort } from '@/utils/tool'
import styles from './area-period-modal.module.less'

interface Props {
  labelWidth: string;
}
interface FormState {
  timeList: TimeListState[] | undefined;
  period: [Dayjs, Dayjs] | undefined;
}
export const AreaPeriodModal = defineComponent({
  props: {
    labelWidth: {
      type: String,
      default: '100px'
    },
  },
  emits: ['update:value', 'ok'],
  setup (props: Props, { emit, expose }) {
    const modalVisible = ref<boolean>(false)
    const loading = ref<boolean>(false)
    const formRenderRef = ref<FormExpose>()
    const formState = reactive<FormState>({
      timeList: undefined,
      period: undefined
    })
    const dateRange = ref<[Dayjs, Dayjs]>()
    const timeRangeList = ref<{
      value?: [Dayjs, Dayjs] | undefined;
      totalNumber?: number | undefined;
      key: string;
      nextKey?: string;
      nextDayBool?: number;
      startTime?: Dayjs;
      endTime?: Dayjs;
    }[]>([])
    const nextDayBoolOptions = [
      {
        value: 0,
        label: '当日'
      },
      {
        value: 1,
        label: '次日'
      }
    ]
    const { checkTimeList } = useRuleValidate()
    const modalRules = {
      period: [{ required: true, message: '请选择访问日期', trigger: 'blur' }],
      timeList: [{ validator: async (): Promise<unknown> => checkTimeList(formState.timeList) }]
    }
    const timer = ref()
    const handleOk = debounce(async () => {
      loading.value = true
      timer.value = setTimeout(() => {
        loading.value = false
      }, 200)
      try {
        const sortTimeList = formState.timeList?.length && timeListSort(formState.timeList)
        if (sortTimeList) {
          formState.timeList = sortTimeList
        }
        await formRenderRef.value?.validate()
        emit('update:value', { ...formState })
        emit('ok', { ...formState })
        modalVisible.value = false
      } catch (error) {
      }
    }, 500)
    const cancel = (): void => {
      emit('update:value')
      emit('ok')
      resetFields()
      modalVisible.value = false
    }

    const openModal = (): void => {
      modalVisible.value = true
      resetFields()
    }
    const resetFields = (): void => {
      formRenderRef.value?.resetFields()
      Object.assign(formState, {
        period: [],
        time: [],
      })
      timeRangeList.value = []
      dateRange.value = undefined
      formState.timeList = undefined
      formState.period = undefined
    }
    const addTime = (): void => {
      timeRangeList.value.push({
        key: `${Date.now()}`,
        value: undefined,
        nextDayBool: 0
      })
      formState.timeList = [...timeRangeList.value]
    }
    const removeTime = (index: number): void => {
      timeRangeList.value?.splice(index, 1)
      formState.timeList = [...timeRangeList.value]
    }
    const dateChange = (val: [Dayjs, Dayjs]): void => {
      formState.period = val ?? []
    }
    onUnmounted(() => {
      timer.value && clearTimeout(timer.value)
    })
    expose({
      openModal
    })
    return (): JSX.Element =>
      <>
        <Modal
          visible={modalVisible.value}
          title='访问时间设置'
          onOk={handleOk}
          onCancel={cancel}
          confirmLoading={loading.value}
        >
          <Form model={formState} rules={modalRules} ref={formRenderRef} label-col={{ style: { width: props.labelWidth } }}>
            <FormItem label='访问日期' name='period'>
              <DateRangePicker v-model:value={dateRange.value} allowClear style={{ width: '300px' }} onChangePicker={dateChange} onCalendarChange={dateChange} />
            </FormItem>
            <FormItem label='访问时间段' name='timeList'>
              <Button type='dashed' onClick={addTime} class='pb-10 mb-10'>
                <PlusOutlined class='del' />
                添加
              </Button>
              {
                timeRangeList.value?.map((e, i) => {
                  return (
                    <div class='mt-10'>
                      <FormItem
                        key={i}
                      >
                        <TimePicker
                          placeholder='开始时间'
                          v-model:value={e.startTime}
                          format='HH:mm'
                          allowClear
                          style={{ width: '110px' }}
                        />
                        <span class='ml-10'>~</span>
                        <Select
                          class='ml-10'
                          v-model:value={e.nextDayBool}
                          options={nextDayBoolOptions}
                          placeholder='时段类型'
                          style={{ width: '70px' }}
                        />
                        <TimePicker
                          placeholder='结束时间'
                          v-model:value={e.endTime}
                          format='HH:mm'
                          allowClear
                          style={{ width: '110px' }}
                        />
                        <InputNumber class={[styles['w-150-deep'], styles['ml-10']]} max={999999999} placeholder='可访问数量' v-model:value={e.totalNumber} min={0} />
                        <MinusCircleOutlined class='ml-10 del' onClick={() => {
                          removeTime(i)
                        }} />
                      </FormItem>
                    </div>
                  )
                })
              }
            </FormItem>
          </Form>

        </Modal>
      </>
  }
})
