import { defineComponent, onMounted, reactive, ref } from 'vue'
import { Button, Popup, Search } from 'vant'
import './search-bar.less'
import { cubeWorkCenterService } from '@/api/server'
import type { TodoTaskType } from '@ghcloud/cube-work-center-service'

export const SearchBar = defineComponent({
  emits: ['confirm'],
  setup (props, { expose, emit }) {
    const formState = reactive<Record<string, string>>({
      keyword: '',
      businessType: '',
    })
    const showPop = ref(false)
    const businessTypeOptions = ref<TodoTaskType[]>([
      {
          "code": "ALARM_TASK",
          "name": "报警任务"
      },
      {
          "code": "APPROVE_TASK",
          "name": "审批任务"
      },
      {
          "code": "INSPECT_TASK",
          "name": "巡检任务"
      },
      {
          "code": "MAINTENACE_TASK",
          "name": "维保作业"
      },
      {
          "code": "CULTIVATE_TASK",
          "name": "培训任务"
      },
      {
          "code": "ELECTRONIC_PATROL",
          "name": "电子巡更"
      },
      {
          "code": "PROPERTY_MANAGEMENT",
          "name": "资产管理"
      },
      {
          "code": "DAILY_TASK",
          "name": "日常任务"
      },
    ])
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
      const typeList = await cubeWorkCenterService.getDoneTaskType()
      businessTypeOptions.value = Array.from(
        new Map(typeList.map(item => [item.code, item])).values()
      );
    })
    const getFormState = (): Record<string, string> => {
      return {
        keyword: formState.keyword,
        businessType: formState.businessType,
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
          placeholder='根据名称进行搜索'
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
          position='right'
          style={{ width: '80%', height: '100%' }}
        >
          <div class='pop-form'>
            <div class='form-item'>
              <div class='label'>业务来源</div>
              <div class='radio-select'>
                {
                  businessTypeOptions.value.map(item => {
                    return (
                      <Button
                        size='mini'
                        plain
                        key={item.code}
                        class={formState.businessType === item.code ? 'active' : ''}
                        onClick={() => {
                          if (formState.businessType === item.code) {
                            formState.businessType = ''
                            return
                          }
                          formState.businessType = item.code
                        }}
                      >
                        {item.name}
                      </Button>
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
      </>
  }
})
