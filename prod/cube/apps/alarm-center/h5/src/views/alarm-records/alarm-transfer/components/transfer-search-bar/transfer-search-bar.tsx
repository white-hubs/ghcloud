import { defineComponent, reactive } from 'vue'
import { Button, Popup, Search } from 'vant'
import './search-bar.less'
import { DeptSelect } from '../../../../../components/dept-select'
interface SelectedDeptOption {
  text: string;value: string;
}
interface SearchBarState {
  showPop: boolean;
  showDeptSelect: boolean;
  formState: {
    keyword: string;
    selectedDeptOption: SelectedDeptOption;
  };
}
/** 报警记录搜索组件 */
export const TransferSearchBar = defineComponent({
  emits: ['confirm'],
  setup (props, { emit }) {
    const state = reactive<SearchBarState>({
      showPop: false,
      showDeptSelect: false,
      formState: {
        keyword: '',
        selectedDeptOption: {
          text: '',
          value: ''
        },
      }
    })

    const handleConfirmSelectDept = (value: SelectedDeptOption[]): void => {
      state.formState.selectedDeptOption = value[0]
    }
    // 点击确定
    const confirm = (): void => {
      emit('confirm', state.formState)
      state.showPop = false
    }
    // 重置
    const handleReset = (): void => {
      state.formState.selectedDeptOption.text = ''
      state.formState.selectedDeptOption.value = ''
    }
    return (): JSX.Element=>
      <>
        <Search
          v-model={state.formState.keyword}
          show-action
          placeholder='根据名称进行搜索'
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
          style={{ width: '80%', height: '100%' }}
        >
          <div class='pop-form'>
            <div class='form-item'>
              <div class='label'>人员部门</div>
              <input class='value-input' placeholder='请选择部门' onClick={() => {
                state.showDeptSelect = true
              }} readonly v-model:value={state.formState.selectedDeptOption.text} />
            </div>
          </div>
          <div class='pop-footer'>
            <span class='reset' onClick={handleReset}>重置</span>
            <Button type='primary' onClick={confirm}>确定</Button>
          </div>
        </Popup>
        <DeptSelect v-model:show={state.showDeptSelect} onConfirm={handleConfirmSelectDept} />
      </>
  }
})
