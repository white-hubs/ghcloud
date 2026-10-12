import { defineComponent, onMounted, reactive, ref, watch } from 'vue'
import { cubeSmallEngineeringService } from '@/api/server'
import type { ProjectScheduleListRecord } from '@ghcloud/cube-small-engineering-service'
import { Button, Checkbox, CheckboxGroup, Empty, List, Popup, Search } from 'vant'
import './index.less'

export const ProjectSelect = defineComponent({
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
      columns: ProjectScheduleListRecord[];
      selectedValues: string[];
    }>({
      columns: [],
      selectedValues: props.value.map((item) => item.id) || []
    })
    const loadingSate = reactive({
      loading: false,
      finished: false
    })
    const pageData = reactive({
      pageNumber: 0,
      pageSize: 10,
    })
    const keyword = ref('')

    // 添加 watch 监听 props.value 的变化
    watch(() => props.value, (newValue) => {
      state.selectedValues = newValue.map((item) => item.id) || []
    })

    const onRefresh = (): void => {
      pageData.pageNumber = 0
      state.columns = []
      loadingSate.finished = false
      onLoad()
    }

    const onLoad = async (): Promise<void> => {
      loadingSate.loading = true
      pageData.pageNumber++
      const params = {
        keyword: keyword.value,
        pageNumber: pageData.pageNumber,
        pageSize: pageData.pageSize
      }
      try {
        const response = await cubeSmallEngineeringService.projectScheduleList(params)
        state.columns = state.columns.concat(response.records)
        if (pageData.pageNumber >= response.pages) {
          loadingSate.finished = true
        }
      } finally {
        loadingSate.loading = false
      }
    }


    onMounted(() => {
      onRefresh()
    })

    const handleCancel = (): void => {
      emit('update:show', false)
      emit('close')
    }

    const handleConfirm = (): void => {
      const selectedOptions = state.columns.filter(item =>
        state.selectedValues.includes(item.id))
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
          <div class="select-container">
            <div class="select-header">
              <div class="select-title">选择工程</div>
              <div class="select-close" onClick={handleCancel}>取消</div>
            </div>
            <div>
              <Search
                v-model={keyword.value}
                placeholder="请输入项目名称"
                showAction={true}
                onSearch={onRefresh}
                v-slots={{
                  action: () =>
                    <div onClick={onRefresh}>搜索</div>
                }} />
            </div>
            <div class="select-content">
              <List
                finished={loadingSate.finished}
                finished-text={state.columns.length === 0 ? '' : '暂无更多数据'}
                onLoad={onLoad}
              >
                <CheckboxGroup v-model={state.selectedValues}>
                  {state.columns.map(item => (
                    <div class="select-item" key={item.id} onClick={() => toggleSelect(item.id)}>
                      <div class="select-item-name">{item.projectName}</div>
                      {props.multiple ? (
                        <div onClick={(e) => e.stopPropagation()}>
                          <Checkbox name={item.id} shape="square" />
                        </div>
                      ) : (
                        <div class={`select-item-radio ${state.selectedValues.includes(item.id) ? 'active' : ''}`}></div>
                      )}
                    </div>
                  ))}
                </CheckboxGroup>
                {
                  (loadingSate.finished && state.columns.length === 0) && <Empty description='暂无数据' />
                }
              </List>
            </div>
            {props.multiple && (
              <div class="select-footer">
                <Button type="primary" block onClick={handleConfirm}>确定</Button>
              </div>
            )}
          </div>
        </Popup>
      </>
    )
  }
})