import { defineComponent, onMounted, reactive, ref } from 'vue'
import { Button, Popup, Search } from 'vant'
import './search-bar.less'
import 'vue3-hash-calendar/es/index.css'
import { storeEnergy } from '@/store/energy'
import { AreaPopupCascader } from '@ghcloud/cube-app-generic-component'

interface AlarmType {
  id: string;
  code: string;
  name: string;
}
/** 报警记录搜索组件 */
export const SearchBar = defineComponent({
  emits: ['confirm'],
  setup (props, { expose, emit }) {
    const piniaStoreEnergy = storeEnergy()

    const formState = reactive<Record<string, string>>({
      keyword: '',
      typeId: '',
      areaIds: '',
    })
    const showPop = ref(false)
    const areaRef = ref<{ openPopup: () => void; }>()
    const areaData = ref<{ id?: string; name?: string; }>()
    const areaSelect = ref('')
    const alarmTypesOptions = ref<AlarmType[]>([])

    const reset = (): void => {
      for (const key in formState) {
        formState[key] = ''
      }
      areaData.value = {}
    }
    const confirm = (): void => {
      showPop.value = false
      emit('confirm')
    }

    onMounted(async () => {
      alarmTypesOptions.value = piniaStoreEnergy.energyType.map(e => {
        return {
          id: e.value,
          code: e.value,
          name: e.text
        }
      })
    })

    const getFormState = (): Record<string, string> => {
      return {
        keyword: formState.keyword,
        typeId: formState.typeId,
        areaIds: areaData.value?.id || ''
      }
    }
    expose({
      getFormState
    })

    return () =>
      <>
        <Search
          v-model={formState.keyword}
          show-action
          placeholder='根据设备名称或编号进行搜索'
          onSearch={confirm}
          v-slots={{
            action: () => {
              return (
                <div style='display:flex'>
                  <div onClick={() => { showPop.value = true }}>筛选</div>
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
              <div class='label'>仪表类型</div>
              <div class='radio-select'>
                {
                  alarmTypesOptions.value.map(item => {
                    return (
                      <Button
                        size='mini'
                        plain
                        key={item.code}
                        class={formState.typeId === item.id ? 'active' : ''}
                        onClick={() => {
                          if (item.id === formState.typeId) {
                            formState.typeId = ''
                            formState.code = ''
                            return
                          }
                          formState.typeId = item.id
                          formState.code = item.code
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
              <div class='label'>所属区域</div>
              <input class='value-input' placeholder='请选择区域' onClick={() => { areaRef.value?.openPopup() }} readonly value={areaData.value?.name} />
            </div>
          </div>
          <div class='pop-footer'>
            <span class='reset' onClick={reset}>重置</span>
            <Button type='primary' onClick={confirm}>确定</Button>
          </div>
        </Popup>
        <AreaPopupCascader
          ref={areaRef}
          v-model:value={areaSelect.value}
          onOk={(values: { id?: string; name?: string; }) => {
            areaData.value = values
          }}
        />
      </>
  }
})
