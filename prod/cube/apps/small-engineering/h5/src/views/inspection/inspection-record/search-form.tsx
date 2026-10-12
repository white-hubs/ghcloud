import { defineComponent, reactive, ref, watch, type PropType, type VNode } from 'vue'
import type { InspectionParams } from '../type'
import styles from './inspection-record.module.less'
import { Button, DatePicker, Field, Form, Popup, Radio, RadioGroup, showNotify } from 'vant'

export const SearchForm = defineComponent({
  emits: ['onUpdate:search', 'onUpdate:show', 'reset', 'submit'],
  props: {
    search: {
      type: Object as PropType<InspectionParams>,
      default: () => {
        return {}
      }
    },
    show: {
      type: Boolean,
      default: false
    }
  },
  setup: (props, { emit }) => {
    const showForm = ref(props.show)
    const showStartPicker = ref(false)
    const showEndPicker = ref(false)
    const statusList = [
      { name: 'NORMAL', title: '正常' },
      { name: 'ABNORMAL', title: '异常' },
    ]
    const searchParams = reactive<InspectionParams>(props.search)
    // 开始时间
    const handleStartPicker = ({ selectedOptions }: { selectedOptions: { text: string; }[]; }): void => {
      showStartPicker.value = false
      const startTime = selectedOptions.map((item) => item.text).join('/') + ' 00:00:00'
      if (new Date(startTime).getTime() > new Date(searchParams.endTime as string).getTime()) {
        showNotify({ type: 'warning', message: '开始时间不能大于结束时间' })
        return
      }
      searchParams.startTime = startTime
    }
    // 结束时间
    const handleEndPicker = ({ selectedOptions }: { selectedOptions: { text: string; }[]; }): void => {
      showEndPicker.value = false
      const endTime = selectedOptions.map((item) => item.text).join('/') + ' 23:59:59'
      if (new Date(endTime).getTime() < new Date(searchParams.startTime as string).getTime()) {
        showNotify({ type: 'warning', message: '开始时间不能大于结束时间' })
        return
      }
      searchParams.endTime = endTime
    }
    // 选择结果查询
    const changeResult = (value: string): void => {
      searchParams.result = value
    }
    // 选择结果
    const resultDom = (): VNode =>
      <RadioGroup v-model={searchParams.result} direction='horizontal' icon-size='14px' onChange={changeResult}>
        {
          statusList.map(item =>
            <Radio key={item.name} class={styles.checkbox} name={item.name} style={{ color: `${searchParams.result === item.name ? '#1D66FF' : '#1F3140'}`, backgroundColor: `${searchParams.result === item.name ? '#E6EFFF' : '#F8F9F9'}` }} v-slots={{ icon: () => <div style={{ width: '90px' }}>{item.title}</div> }} />)
        }
      </RadioGroup>
    const reset = (): void => {
      emit('reset')
    }
    const submit = (): void => {
      emit('submit')
      emit('onUpdate:show', false)
    }
    watch(() => searchParams, (val) => {
      emit('onUpdate:search', val)
    }, { deep: true, immediate: true })
    watch(() => props.show, () => {
      showForm.value = props.show
    }, { immediate: true })
    return (): JSX.Element =>
      <Popup
        v-model:show={showForm.value} position='right'
        style={{ width: '80%', height: '100%' }}
        onClose={() => {
          showForm.value = false
          emit('onUpdate:show', false)
        }}
      >
        <div class={styles.filter}>
          <Form>
            <p>时间范围</p>
            <div class={styles.screen}>
              <Field
                v-model={searchParams.startTime}
                is-link
                readonly
                name='startTime'
                placeholder='开始时间'
                onClick={() => {
                  showStartPicker.value = true
                }}
              />
              <Field
                v-model={searchParams.endTime}
                is-link
                readonly
                name='startTime'
                placeholder='结束时间'
                onClick={() => {
                  showEndPicker.value = true
                }}
              />
            </div>
            <p>巡检结果</p>
            <div style='margin-bottom:10px'>
              <Field style={{ padding: '0px' }} name='type' v-slots={{ input: resultDom() }} />
            </div>
          </Form>
          <div class={styles.button}>
            <div class={styles.reset} onClick={reset}>重置</div>
            <Button type='primary' block onClick={submit}>确定</Button>
          </div>
          <Popup v-model:show={showStartPicker.value} position='bottom'>
            <DatePicker onConfirm={handleStartPicker} onCancel={() => {
              showStartPicker.value = false
            }} />
          </Popup>
          <Popup v-model:show={showEndPicker.value} position='bottom'>
            <DatePicker onConfirm={handleEndPicker} onCancel={() => {
              showEndPicker.value = false
            }} />
          </Popup>
        </div>
      </Popup>
  }
})
