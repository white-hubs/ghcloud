import { defineComponent, reactive, ref } from 'vue'
import { Search, Popup, Button, showNotify, PickerGroup } from 'vant'
import './search-bar.less'
import { useGlobalRouter } from '@/hook/use-global-router'
import VueHashCalendar from 'vue3-hash-calendar'
import 'vue3-hash-calendar/es/index.css'
export const SearchBar = defineComponent({
  name: 'SearchBar',
  emits: ['confirm'],
  setup (_, { emit, expose }) {
    const { route } = useGlobalRouter()
    const formState = reactive<Record<string, string>>({
      keyword: '',
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
    const getFormState = (): Record<string, string> => {
      return {
        keyword: formState.keyword,
        period: formState.period.split(' ~ ').join(','),
      }
    }
    expose({
      getFormState
    })
    const confirm = () => {
      emit('confirm')
    }

    const reset = (): void => {
      for (const key in formState) {
        formState[key] = ''
      }
    }

    return () => (
      <>
        <Search
          v-model={formState.keyword}
          show-action
          placeholder="根据名称进行搜索"
          onClear={reset}
          onSearch={confirm}
          v-slots={{
            action: () => {
              return (
                <div style='display:flex'>
                  <div onClick={() => {
                    showPop.value = true
                  }}>
                    <i class="van-icon van-icon-filter-o" />
                    筛选
                  </div>
                </div>
              )
            }
          }}
        />
        <Popup
          v-model:show={showPop.value}
          position="right"
          style={{ width: '80%', height: '100%' }}
        >
          <div class='pop-form'>
            <div class='form-item' v-show={route.query?.sourceApp !== 'qrCodeTransfer'}>
              <div class='label'>时间范围</div>
              <input class='value-input' placeholder='开始时间 ~ 结束时间' onClick={() => {
                showDatePicker.value = true
              }} readonly value={formState.period} />
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
            <VueHashCalendar disabled-scroll='vertical' format='YY-MM-DD hh:mm' onChange={(e: string) => {
              handleChange(e, 'start')
            }} show-today-button={false} />
            <VueHashCalendar disabled-scroll='vertical' format='YY-MM-DD hh:mm' onChange={(e: string) => {
              handleChange(e, 'end')
            }} show-today-button={false} />
          </PickerGroup>
        </Popup>
      </>
    )
  }
})