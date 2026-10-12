import { defineComponent, onMounted, reactive, ref } from 'vue'
import { Button, PickerGroup, Popup, Search, showNotify } from 'vant'
import './search-bar.less'
import VueHashCalendar from 'vue3-hash-calendar'
import 'vue3-hash-calendar/es/index.css'
import { useRoute } from 'vue-router'
import dayjs from 'dayjs'

/** 报警记录搜索组件 */
export const SearchBar = defineComponent({
  props: {
    isWeek: {
      type: Boolean,
      default: true
    }
  },
  emits: ['confirm'],
  setup (props, { expose, emit }) {
    const route = useRoute()
    const deviceStatusOptions = [
      {
        label: '正常',
        value: 'NORMAL',
      },
      {
        label: '异常',
        value: 'ABNORMAL',
      },
      {
        label: '无效',
        value: 'INVALID',
      }
    ]
    const formState = reactive<Record<string, string>>({
      keyword: '',
      status: '',
      period: route.query?.period as string ?? '',
    })
    const datePicker = reactive({
      start: '',
      end: ''
    })
    const showPop = ref(false)
    const showDatePicker = ref(false)
    const handleChange = (value: string, type: 'start' | 'end'): void => {
      datePicker[type] = value
      if (datePicker.start === datePicker.end) {
        datePicker.end = ''
      }
    }

    const pickerConfirm = (): void => {
      if (datePicker.start === datePicker.end) {
        showNotify('开始时间不能等于结束时间')
      }
      if (datePicker.start === '') {
        showNotify('请选择开始时间')
        return
      }
      if (datePicker.start === '' || datePicker.end === '') {
        showNotify('请选择结束时间')
        return
      }
      if (new Date(datePicker.start).getTime() > new Date(datePicker.end).getTime()) {
        showNotify('开始时间不能大于结束时间')
        return
      }
      showDatePicker.value = false
      formState.period = `${datePicker.start} ~ ${datePicker.end}`
    }

    const reset = (): void => {
      for (const key in formState) {
        formState[key] = ''
      }
    }
    const confirm = (): void => {
      showPop.value = false
      emit('confirm')
    }

    onMounted(async () => {
      handleQueryParams()
      handleCacheParams()
      if (props.isWeek && !formState.period) {
        datePicker.start = dayjs().subtract(6, 'day').startOf('day').format('YYYY-MM-DD 00:00')
        datePicker.end = dayjs().format('YYYY-MM-DD HH:mm')
        formState.period = `${datePicker.start} ~ ${datePicker.end}`
      }
    })
    interface NormalRouteQuery {
      period: string;
      sourceApp: string;
      startTime: string;
      endTime: string;
      status: string;
      keyword: string;
    }
    const handleCacheParams = (): void => {
      const cache = sessionStorage.getItem('searchParams')
      const searchParams = cache ? JSON.parse(cache) : cache
      if (!searchParams) return
      formState.keyword = searchParams.keyword
      formState.period = searchParams.period
      formState.status = searchParams.status ?? ''
      sessionStorage.removeItem('searchParams')
    }
    const handleQueryParams = (): void => {
      const queryParams = route.query as unknown as NormalRouteQuery
      formState.keyword = queryParams.keyword ?? ''
      formState.status = queryParams.status ?? ''
      formState.period = queryParams.period ?? ''
    }
    const handleStatusChange = (value: string): void => {
      formState.status = value
    }
    const getFormState = (): Record<string, string> => {
      return {
        keyword: formState.keyword,
        status: formState.status,
        period: formState.period.split(' ~ ').join(','),
      }
    }
    expose({
      getFormState
    })

    return (): JSX.Element =>
      <>
        <Search
          v-model={formState.keyword}
          show-action
          placeholder='手术室名称'
          onSearch={confirm}
          v-slots={{
            action: () => {
              return (
                <div style='display:flex'>
                  <div onClick={(): void => {
                    showPop.value = true
                  }}>筛选</div>
                </div>
              )
            }
          }}
        />
        <Popup
          v-model:show={showPop.value}
          position='right'
          style={{ width: '80%', height: '100%' }}
        >
          <div class='pop-form'>
            <div class='form-item' v-show={route.query?.sourceApp !== 'qrCodeTransfer'}>
              <div class='label'>时间范围</div>
              <input class='value-input' placeholder='开始时间 ~ 结束时间' onClick={() => {
                showDatePicker.value = true
              }} readonly value={formState.period} />
            </div>
            <div class='form-item'>
              <div class='label'>状态</div>
              <div class='radio-select'>
                {
                  deviceStatusOptions.map(item => {
                    return (
                      <>
                        <Button
                          size='mini'
                          plain
                          class={formState.status === item.value ? 'active' : ''}
                          onClick={() => {
                            handleStatusChange(item.value)
                          }}
                        >
                          {item.label}
                        </Button>
                      </>
                    )
                  })
                }
              </div>
            </div>
          </div>
          <div class='pop-footer'>
            <span class='reset' onClick={reset}>重置</span>
            <Button type='primary' onClick={confirm}>确定</Button>
          </div>
        </Popup>
        <Popup
          v-model:show={showDatePicker.value}
          position='bottom'
          style={{ width: '100%' }}
        >
          <PickerGroup title='时间选择' tabs={['开始时间', '结束时间']} onConfirm={pickerConfirm} key={new Date().getTime()}>
            <VueHashCalendar disabled-scroll='vertical' format='YY-MM-DD hh:mm' onChange={(e) => {
              handleChange(e, 'start')
            }} show-today-button={false} />
            <VueHashCalendar disabled-scroll='vertical' format='YY-MM-DD hh:mm' onChange={(e) => {
              handleChange(e, 'end')
            }} show-today-button={false} />
          </PickerGroup>
        </Popup>
      </>
  }
})
