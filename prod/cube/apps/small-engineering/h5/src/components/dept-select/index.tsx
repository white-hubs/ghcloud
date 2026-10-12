import { defineComponent, onMounted, reactive, watch } from 'vue'
import { Popup, CheckboxGroup, Checkbox, Button } from 'vant'
import { cubeOuaaService } from '../../api/server'
import './index.less'

export const DeptSelect = defineComponent({
  props: {
    show: {
      type: Boolean,
      default: false
    },
    multiple: {
      type: Boolean,
      default: false
    },
    value: {
      type: Array,
      default: () => []
    }
  },
  emits: ['update:show', 'confirm', 'close'],
  setup: (props, { emit }) => {
    const state = reactive<{
      columns: { text: string; value: string; }[];
      selectedValues: string[];
    }>({
      columns: [],
      selectedValues: props.value.map((item) => item.value) || []
    })

    // 添加 watch 监听 props.value 的变化
    watch(() => props.value, (newValue) => {
      state.selectedValues = newValue.map((item) => item.value) || []
    })

    const getData = async (): Promise<void> => {
      const result = await cubeOuaaService.getDeptList({ enabled: true })
      state.columns = result.map(item => {
        return {
          value: item.id,
          text: item.name
        }
      })
    }

    onMounted(() => {
      getData()
    })

    const handleCancel = (): void => {
      emit('update:show', false)
      emit('close')
    }

    const handleConfirm = (): void => {
      const selectedOptions = state.columns.filter(item =>
        state.selectedValues.includes(item.value))
      emit('confirm', selectedOptions)
      emit('update:show', false)
    }

    const toggleSelect = (value: string): void => {
      if (!props.multiple) {
        // 单选模式
        state.selectedValues = [value]
        handleConfirm()
        return
      }

      // 多选模式
      const index = state.selectedValues.indexOf(value)
      if (index > -1) {
        state.selectedValues.splice(index, 1)
      } else {
        state.selectedValues.push(value)
      }
    }

    return (): JSX.Element => (
      <>
        <Popup onClose={handleCancel} v-model:show={props.show} round position='bottom'>
          <div class="dept-select-container">
            <div class="dept-select-header">
              <div class="dept-select-title">选择部门</div>
              <div class="dept-select-close" onClick={handleCancel}>取消</div>
            </div>

            <div class="dept-select-content">
              <CheckboxGroup v-model={state.selectedValues}>
                {state.columns.map(item => (
                  <div class="dept-select-item" key={item.value} onClick={() => toggleSelect(item.value)}>
                    <div class="dept-select-item-name">{item.text}</div>
                    {props.multiple ? (
                      <div onClick={(e) => e.stopPropagation()}>
                        <Checkbox name={item.value} shape="square" />
                      </div>
                    ) : (
                      <div class={`dept-select-item-radio ${state.selectedValues.includes(item.value) ? 'active' : ''}`}></div>
                    )}
                  </div>
                ))}
              </CheckboxGroup>
            </div>

            {props.multiple && (
              <div class="dept-select-footer">
                <Button type="primary" block onClick={handleConfirm}>确定</Button>
              </div>
            )}
          </div>
        </Popup>
      </>
    )
  }
})
