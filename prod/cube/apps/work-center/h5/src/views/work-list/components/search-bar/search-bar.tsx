import { computed, defineComponent, onBeforeMount, reactive, ref, watch } from 'vue'
import { Button, PickerGroup, Popup, Search, showNotify } from 'vant'
import './search-bar.less'
import VueHashCalendar from 'vue3-hash-calendar'
import 'vue3-hash-calendar/es/index.css'
import { useGlobalRouter } from '@/hook/use-global-router'
import { cubeWorkCenterService } from '@/api/server'
import { type TodoTaskType } from '@ghcloud/cube-work-center-service'
import { useStatus } from '@/hook/use-status';

export const businessTypes = [
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
]
export const SearchBar = defineComponent({
  emits: ['confirm'],
  setup (props, { expose, emit }) {
    const { route } = useGlobalRouter()
    const formState = reactive({
      keyword: '',
      businessType: '',
      workTagCodes: [] as string[],
      status: '', // 新增状态字段
      period: route.query?.period as string ?? '',
    })
    const { statusOptions } = useStatus(() => formState.workTagCodes);

    watch(statusOptions, (newOptions) => {
      if (!newOptions.some(option => option.value === formState.status)) {
        formState.status = '';
      }
    });

    const datePicker = reactive({
      start: '',
      end: ''
    })
    const showPop = ref(false)
    const showDatePicker = ref(false)
    const businessTypeOptions = ref<TodoTaskType[]>(businessTypes)

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
    const isReset = ref(false)
    const reset = (): void => {
      formState.workTagCodes = []
      formState.businessType = ''
      formState.keyword = ''
      formState.period = ''
      formState.status = ''
      isReset.value = true
    }
    const confirm = (): void => {
      showPop.value = false
      emit('confirm')
    }
    const getTypeNum = () => {
      const typeNum = route.query?.typeNum as string
      if (typeNum) {
        const tasks = businessTypeOptions.value?.filter(e => e.name.includes('任务'))
        const typeMap = new Map([
          ['totalNum', {}],
          ['normalNum', { workTagCodes: tasks?.filter(e => !e.name.includes('报警') && !e.name.includes('审批'))?.map(e => e.code)}],
          ['alarmNum', { workTagCodes: tasks?.filter(e => e.name.includes('报警'))?.map(e => e.code)}],
          ['approveNum', { workTagCodes: tasks?.filter(e => e.name.includes('审批'))?.map(e => e.code)}],
        ])
        formState.workTagCodes = typeMap.get(typeNum)?.workTagCodes ?? []
      }
    }
    const getFormState = computed(() => {
      return async () => {
        const typeList = await cubeWorkCenterService.getTodoTaskType()
        businessTypeOptions.value = typeList?.length > 0 ? Array.from(
          new Map(typeList.map(item => [item.code, item])).values()
        ) : businessTypes;
        if (!isReset.value) {
          getTypeNum()
        } else {
        }
        return {
          keyword: formState.keyword,
          businessType: formState.businessType,
          workTagCodes: formState.workTagCodes,
          status: formState.status,
          period: formState.period.split(' ~ ').join(','),
        }
      }
    })
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
            <div class='form-item' v-show={route.query?.sourceApp !== 'qrCodeTransfer'}>
              <div class='label'>任务时间</div>
              <input class='value-input' placeholder='开始时间 ~ 结束时间' onClick={() => {
                showDatePicker.value = true
              }} readonly value={formState.period} />
            </div>
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
                        class={formState.workTagCodes.includes(item?.code) ? 'active' : ''}
                        onClick={() => {
                          if (formState.workTagCodes.includes(item.code)) {
                            formState.workTagCodes = formState.workTagCodes.filter(e => e !== item.code)
                          } else {
                            formState.workTagCodes.push(item.code)
                          }
                        }}
                      >
                        {item.name}
                      </Button>
                    )
                  })
                }
              </div>
            </div>
            <div class='form-item'>
              <div class='label'>状态</div>
              <div class='radio-select'>
                {
                  statusOptions.value.map(item => {
                    return (
                      <Button
                        size='mini'
                        plain
                        key={item.value}
                        class={formState.status === item.value ? 'active' : ''}
                        onClick={() => {
                          if (formState.status === item.value) {
                            formState.status = ''
                            return
                          }
                          formState.status = item.value
                        }}
                      >
                        {item.label}
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
  }
})
