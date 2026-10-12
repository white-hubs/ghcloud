import { defineComponent, onMounted, reactive, ref } from 'vue'
import { Button, Popup, Search } from 'vant'
import './search-bar.less'
import 'vue3-hash-calendar/es/index.css'
import { useRoute } from 'vue-router'

/** 报警记录搜索组件 */
export const SearchBar = defineComponent({
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
    })
    const showPop = ref(false)
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
    })
    interface NormalRouteQuery {
      sourceApp: string;
      startTime: string;
      endTime: string;
      status: string;
    }
    const handleCacheParams = (): void => {
      const cache = sessionStorage.getItem('searchParams')
      const searchParams = cache ? JSON.parse(cache) : cache
      if (!searchParams) return
      formState.keyword = searchParams.keyword
      formState.status = searchParams.status ?? ''
      sessionStorage.removeItem('searchParams')
    }
    const handleQueryParams = (): void => {
      const queryParams = route.query as unknown as NormalRouteQuery
      if (queryParams.sourceApp !== 'qrCodeTransfer') {
        formState.status = queryParams.status ?? ''
      }
    }
    const handleStatusChange = (value: string): void => {
      formState.status = value
    }
    const getFormState = (): Record<string, string> => {
      return {
        keyword: formState.keyword,
        status: formState.status,
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
                  <div onClick={() => {
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
      </>
  }
})
