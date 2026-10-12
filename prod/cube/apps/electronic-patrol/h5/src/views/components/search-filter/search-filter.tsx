import { defineComponent, reactive } from 'vue'
import { Button, Popup, Search, DatePicker, showNotify } from 'vant'
import './search-bar.less'
import dayjs from 'dayjs'
interface SearchBarState {
  showPop: boolean;
  showDeptSelect: boolean;

  selectTime: boolean;
  periodDate: {
    startDate: string;
    endDate: string;
  };
  selectedKey: 'startDate' | 'endDate';
  currentDate: string[];
  formState: {
    keyword: string;
    period: string;
  };
}
/** 报警记录搜索组件 */
export const SearchFilter = defineComponent({
  props: {
    placeholder: {
      type: String,
      default: '输入名称搜索'
    }
  },
  emits: ['confirm'],
  setup (props, { emit }) {
    const state = reactive<SearchBarState>({
      showPop: false,
      showDeptSelect: false,
      selectTime: false,
      selectedKey: 'startDate',
      currentDate: dayjs().format('YYYY-MM-DD').split('-'),
      periodDate: {
        startDate: '',
        endDate: ''
      },
      formState: {
        keyword: '',
        period: ''
      }
    })

    // 点击确定
    const confirm = (): void => {
      if (state.periodDate.startDate && state.periodDate.endDate) {
        state.formState.period = state.periodDate.startDate + ',' + state.periodDate.endDate
      }
      emit('confirm', state.formState)
      state.showPop = false
    }
    // 重置
    const handleReset = (): void => {
      state.formState.period = ''
      state.periodDate.startDate = ''
      state.periodDate.endDate = ''
    }
    const handleSelectTime = (type: 'startDate' | 'endDate'): void => {
      state.selectTime = true
      state.selectedKey = type
    }
    const confirmDate = ({ selectedValues }: { selectedValues: string[]; }): void => {
      if (state.selectedKey === 'endDate' && state.periodDate.startDate) {
        const endDate = new Date(selectedValues.join('-') + ' 23:59:59').getTime()
        const startTime = new Date(state.periodDate.startDate).getTime()
        if (startTime > endDate) {
          showNotify({
            type: 'warning',
            message: '结束时间不能小于开始时间'
          })
          return
        }
      }
      if (state.selectedKey === 'startDate' && state.periodDate.endDate) {
        const startTime = new Date(selectedValues.join('-') + ' 00:00:00').getTime()
        const endDate = new Date(state.periodDate.endDate).getTime()
        if (startTime > endDate) {
          showNotify({
            type: 'warning',
            message: '开始时间不能大于结束时间'
          })
          return
        }
      }
      state.selectTime = false
      if (state.selectedKey === 'endDate') {
        state.periodDate.endDate = selectedValues.join('-') + ' 23:59:59'
      } else {
        state.periodDate.startDate = selectedValues.join('-') + ' 00:00:00'
      }
    }
    return (): JSX.Element =>
      <>
        <Search
          v-model={state.formState.keyword}
          show-action
          placeholder={props.placeholder}
          onSearch={confirm}
          v-slots={{
            action: () => {
              return (
                <div style='display:flex'>
                  <div onClick={() => {
                    state.showPop = true
                  }}>筛选</div>
                </div>
              )
            }
          }}
        />
        <Popup
          v-model:show={state.showPop}
          position='right'
          style={{ width: '90%', height: '100%', paddingTop: '30px' }}
        >
          <div class='pop-form'>
            <div class='form-item'>
              <div class='label'>时间范围</div>
              <div class='time-select'>
                <div class={['item-select', state.periodDate.startDate && 'checked']} onClick={() => {
                  handleSelectTime('startDate')
                }}>{state.periodDate.startDate || '开始时间'}</div>
                <div class={['item-select', state.periodDate.endDate && 'checked']} onClick={() => {
                  handleSelectTime('endDate')
                }}>{state.periodDate.endDate || '开始时间'}</div>
              </div>
            </div>
          </div>
          <div class='pop-footer'>
            <span class='reset' onClick={handleReset}>重置</span>
            <Button type='primary' onClick={confirm}>确定</Button>
          </div>
        </Popup>
        <Popup round v-model:show={state.selectTime} position='bottom'>
          <DatePicker
            v-model={state.currentDate}
            onConfirm={confirmDate} onCancel={() => {
              state.selectTime = false
            }}
          />
        </Popup>
      </>
  }
})
