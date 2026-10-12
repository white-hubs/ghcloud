import { defineComponent, reactive, ref } from 'vue'
import { Button, DatePicker, Popup, showNotify, Field } from 'vant'
import './search-bar.less'

export const SearchBar = defineComponent({
  props: ['visible'],
  emits: ['confirm', 'update:visible'],
  setup (props, { emit }) {
    const formState = reactive<Record<string, string>>({
      keyword: '',
    })
    const time = reactive({
      startTime: '',
      endTime: ''
    })
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    const currentStartDate = ref([year, month, day])
    const currentEndDate = ref([year, month, day])

    const showStartPicker = ref(false)
    const showEndPicker = ref(false)
    const reset = (): void => {
      currentStartDate.value = [year, month, day]
      currentEndDate.value = [year, month, day]
      formState.keyword = ''
      time.startTime = ''
      time.endTime = ''
    }
    const confirm = (): void => {
      emit('update:visible', false)
      emit('confirm', getFormState())
    }
    // 开始时间
    const handleStartPicker = ({ selectedOptions }: { selectedOptions: { text: string; }[]; }): void => {
      showStartPicker.value = false
      const startTime = selectedOptions.map((item) => item.text).join('-')
      if (new Date(startTime).getTime() > new Date(time.endTime).getTime()) {
        showNotify({ type: 'warning', message: '开始时间不能大于结束时间' })
        return
      }
      time.startTime = startTime
    }
    // 结束时间
    const handleEndPicker = ({ selectedOptions }: { selectedOptions: { text: string; }[]; }): void => {
      showEndPicker.value = false
      const endTime = selectedOptions.map((item) => item.text).join('-')
      if (new Date(endTime).getTime() < new Date(time.startTime).getTime()) {
        showNotify({ type: 'warning', message: '开始时间不能大于结束时间' })
        return
      }
      time.endTime = endTime
    }

    const getFormState = (): { period: string | undefined; keyword: string; } => {
      let period: string | undefined = time.startTime + ' 00:00:00' + ',' + time.endTime + ' 23:59:59'
      if (!time.startTime || !time.endTime) {
        period = undefined
      }
      return {
        period,
        keyword: formState.keyword
      }
    }
    return (): JSX.Element =>
      <>
        <Popup
          show={props.visible}
          onClose={() => {
            emit('update:visible', false)
          }}
          position='right'
          style={{ width: '80%', height: '100%' }}
        >
          <div class='pop-form'>
            <div class='form-item'>
              <div class='label'>关键字</div>
              <div class='time-box'>
                <Field v-model={formState.keyword} placeholder='请输入工程名称、负责人、施工方' class='time-box-item' />
              </div>
            </div>
            <div class='form-item'>
              <div class='label'>时间筛选</div>
              <div class='time-box'>
                <div class='time-box-item' onClick={() => {
                  showStartPicker.value = true
                }}>{time.startTime || '开始时间'}</div>
                <div class='time-box-item' onClick={() => {
                  showEndPicker.value = true
                }}>{time.endTime || '结束时间'}</div>
              </div>
            </div>
          </div>
          <div class='pop-footer'>
            <span class='reset' onClick={reset}>重置</span>
            <Button type='primary' onClick={confirm}>确定</Button>
          </div>
          <Popup v-model:show={showStartPicker.value} position='bottom'>
            <DatePicker v-model={currentStartDate.value} onConfirm={handleStartPicker} onCancel={() => {
              showStartPicker.value = false
            }} />
          </Popup>
          <Popup v-model:show={showEndPicker.value} position='bottom'>
            <DatePicker v-model={currentEndDate.value} onConfirm={handleEndPicker} onCancel={() => {
              showEndPicker.value = false
            }} />
          </Popup>
        </Popup>
      </>
  }
})
