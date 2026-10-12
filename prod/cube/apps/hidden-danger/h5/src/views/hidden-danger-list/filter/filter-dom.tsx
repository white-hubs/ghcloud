import { defineComponent, ref, watch, type VNode } from 'vue'
import styles from '../hidden-danger-list.module.less'
import { DatePicker, Field, Form, Popup, Radio, RadioGroup, showNotify } from 'vant'
import dayjs from 'dayjs'
export const FilterDom = defineComponent({
  emits: ['searchForm'],
  props: {
    searchForm: {
      type: Object,
      default: () => {
        return {
          pageNumber: 0,
          total: 1,
          pageSize: 10,
          status: '',
          submitTime: '',
          startTime: '',
          endTime: ''
        }
      }
    }
  },
  setup: (props, { emit }) => {
    const search = ref<Record<string, string | number>>({
      pageNumber: 0,
      total: 1,
      pageSize: 10,
      status: '',
      submitTime: '',
      startTime: '',
      endTime: ''
    })
    const showStartPicker = ref(false)
    const showEndPicker = ref(false)
    // 状态
    const statusList = [
      { title: '处理中', name: 'ACTIVE' },
      { title: '已完成', name: 'FINISHED' },
      { title: '已撤销', name: 'UNDO' },
      { title: '已驳回', name: 'REJECT' }
    ]
    // 选择状态查询
    const changeStatus = (value: string): void => {
      search.value.status = value
    }
    // 开始时间
    const handleStartPicker = ({ selectedOptions }: { selectedOptions: { text: string; }[]; }): void => {
      showStartPicker.value = false
      const time = selectedOptions.map((item) => item.text).join('/') + ' 00:00:00'
      const endTime = dayjs(search.value.endTime).valueOf()
      const startTime = dayjs(time).valueOf()
      if (search.value.endTime && endTime < startTime) {
        showNotify({ type: 'warning', message: '开始时间不能大于结束时间' })
        search.value.startTime = ''
        return
      }
      search.value.startTime = time
    }
    // 结束时间
    const handleEndPicker = ({ selectedOptions }: { selectedOptions: { text: string; }[]; }): void => {
      showEndPicker.value = false
      const time = selectedOptions.map((item) => item.text).join('/') + ' 23:59:59'
      const endTime = dayjs(time).valueOf()
      const startTime = dayjs(search.value.startTime).valueOf()
      if (search.value.startTime && endTime < startTime) {
        showNotify({ type: 'warning', message: '开始时间不能大于结束时间' })
        search.value.endTime = ''
        return
      }
      search.value.endTime = time
    }
    const statusDom = (): VNode =>
      <RadioGroup v-model={search.value.status} direction='horizontal' icon-size='14px' onChange={changeStatus}>
        {
          statusList.map(item =>
            <Radio key={item.name} class={styles.checkbox} name={item.name} style={{ color: `${search.value.status === item.name ? '#1D66FF' : '#1F3140'}`, backgroundColor: `${search.value.status === item.name ? '#E6EFFF' : '#F8F9F9'}` }} v-slots={{ icon: () => <div style={{ width: '90px' }}>{item.title}</div> }} />)
        }
      </RadioGroup>
    watch(() => props.searchForm, () => {
      search.value = props.searchForm
    }, { immediate: true, deep: true })
    watch(() => search.value, () => {
      emit('searchForm', search.value)
    }, { immediate: true, deep: true })
    return (): JSX.Element =>
      <div class={styles.filter}>
        <Form>
          <p>处理状态</p>
          <div>
            <Field style={{ padding: '0px' }} name='status' v-slots={{ input: statusDom() }} />
          </div>
          <p>提交时间</p>
          <div style={{ display: 'flex' }}>
            <Field
              v-model={search.value.startTime}
              is-link
              readonly
              name='startTime'
              placeholder='开始时间'
              onClick={() => {
                showStartPicker.value = true
              }}
            />
            <Field
              v-model={search.value.endTime}
              is-link
              readonly
              name='startTime'
              placeholder='结束时间'
              onClick={() => {
                showEndPicker.value = true
              }}
            />
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
        </Form>
      </div>
  }
})
