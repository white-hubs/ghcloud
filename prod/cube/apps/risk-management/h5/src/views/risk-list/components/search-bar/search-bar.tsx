import { defineComponent, onMounted, reactive, ref } from 'vue'
import { Button, DatePicker, Popup, Radio, RadioGroup, Search } from 'vant'
import './search-bar.less'
import { DeptPopupCascader } from '@ghcloud/cube-app-generic-component'
import { useRoute } from 'vue-router'
import { RiskPopupCascader } from '../risk-popup-cascader/risk-popup-cascader'

interface NormalRouteQuery {
  keyword: string;
  startTime: string;
  endTime: string;
  typeCode: string;
  typeCodeName: string;
}
export const SearchBar = defineComponent({
  emits: ['confirm'],
  setup (props, { expose, emit }) {
    const route = useRoute()
    const formState = reactive<Record<string, string>>({
      keyword: '',
      usageDate: '',
      purchasingDate: ''
    })
    const showPop = ref(false)
    const riskRef = ref<{ openPopup: () => void; }>()
    const deptRef = ref<{ openPopup: () => void; }>()
    const receiveDeptRef = ref<{ openPopup: () => void; }>()
    const riskOption = ref<{ code?: string; name?: string; }>()
    const riskSelect = ref('')
    const deptData = ref<{ id?: string; name?: string; }>()
    const deptSelect = ref('')
    const receiveDeptData = ref<{ id?: string; name?: string; }>()
    const receiveDeptSelect = ref('')
    const selectTime = ref(false)
    const dateType = ref('')
    const receiveUserTypeList = [
      { name: 'MERCHANT', title: '商户' },
      { name: 'MARKET', title: '市场' },
    ]
    // 选择人员类型查询
    const changeType = (value: string): void => {
      formState.receiveUserType = value
    }
    const reset = (): void => {
      for (const key in formState) {
        formState[key] = ''
      }
      riskOption.value = {}
      deptData.value = {}
      receiveDeptData.value = {}
      riskSelect.value = ''
    }
    const confirm = (): void => {
      showPop.value = false
      emit('confirm')
    }
    const handleQueryParams = (): void => {
      const queryParams = route.query as unknown as NormalRouteQuery
      formState.keyword = queryParams.keyword ?? ''
      riskOption.value = { name: queryParams.typeCodeName, code: queryParams.typeCode }
      riskSelect.value = queryParams.typeCode
    }
    const handleSelectTime = (type: string): void => {
      dateType.value = type
      selectTime.value = true
    }

    onMounted(async () => {
      handleQueryParams()
    })
    const getFormState = (): Record<string, string> => {
      return {
        keyword: formState.keyword,
        typeCode: riskOption.value?.code || '',
        typeName: riskOption.value?.name || '',
        maintenanceDepId: deptData.value?.id || '',
        receiveDepId: receiveDeptData.value?.id || '',
        receiveUserType: formState.receiveUserType,
        purchasingDate: formState.purchasingDate,
        usageDate: formState.usageDate,
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
          placeholder='根据风险源名称、车牌号字段进行搜索'
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
              <div class='label'>使用人类型</div>
              <RadioGroup v-model={formState.receiveUserType} direction='horizontal' icon-size='14px' onChange={changeType}>
                {
                  receiveUserTypeList.map(item =>
                    <Radio
                      key={item.name}
                      class='checkbox'
                      name={item.name}
                      style={{
                        color: `${formState.receiveUserType === item.name ? '#1D66FF' : '#1F3140'}`,
                        backgroundColor: `${formState.receiveUserType === item.name ? '#E6EFFF' : '#F8F9F9'}`
                      }}
                      v-slots={{ icon: () => <div style={{ width: '90px' }}>{item.title}</div> }}
                    />
                  )
                }
              </RadioGroup>
            </div>
            <div class='form-item'>
              <div class='label'>购买日期</div>
              <div
                class='value'
                style={{ color: `${formState.purchasingDate ? '#323233' : '#969799'}` }}
                onClick={() => { handleSelectTime('purchasingDate') }}
              >{formState.purchasingDate || '请选择购买日期'}
              </div>
            </div>
            <div class='form-item'>
              <div class='label'>到期日期</div>
              <div
                class='value'
                onClick={() => { handleSelectTime('usageDate') }}
                style={{ color: `${formState.usageDate ? '#323233' : '#969799'}` }}
              >{formState.usageDate || '请选择到期日期'}
              </div>
            </div>
            <Popup teleport='#app' round v-model:show={selectTime.value} position='bottom'>
              <DatePicker
                onConfirm={({ selectedValues }: { selectedValues: string[]; }) => {
                  if (dateType.value === 'usageDate') {
                    formState.usageDate = selectedValues.join('-')
                  } else {
                    formState.purchasingDate = selectedValues.join('-')
                  }
                  selectTime.value = false
                }}
              />
            </Popup>
            <div class='form-item'>
              <div class='label'>风险源分类</div>
              <input class='value-input' placeholder='请选择风险源分类' onClick={() => { riskRef.value?.openPopup() }} readonly value={riskOption.value?.name} />
            </div>
            <div class='form-item'>
              <div class='label'>维护部门</div>
              <input class='value-input' placeholder='请选择部门' onClick={() => { deptRef.value?.openPopup() }} readonly value={deptData.value?.name} />
            </div>
            <div class='form-item'>
              <div class='label'>使用部门</div>
              <input class='value-input' placeholder='请选择部门' onClick={() => { receiveDeptRef.value?.openPopup() }} readonly value={receiveDeptData.value?.name} />
            </div>
          </div>
          <div class='pop-footer'>
            <span class='reset' onClick={reset}>重置</span>
            <Button type='primary' onClick={confirm}>确定</Button>
          </div>
        </Popup>
        <RiskPopupCascader
          ref={riskRef}
          v-model:value={riskSelect.value}
          onSelectedOption={(values: { code?: string; name?: string; }) => {
            riskOption.value = values
          }}
          onOk={(values: { code?: string; name?: string; }) => {
            riskOption.value = values
          }}
        />
        <DeptPopupCascader
          ref={deptRef}
          v-model:value={deptSelect.value}
          onOk={(values: { id?: string; name?: string; }) => {
            deptData.value = values
          }}
        />
        <DeptPopupCascader
          ref={receiveDeptRef}
          v-model:value={receiveDeptSelect.value}
          onOk={(values: { id?: string; name?: string; }) => {
            receiveDeptData.value = values
          }}
        />
      </>
  }
})
