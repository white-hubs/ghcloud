
import { Button, CheckOutlined, DeleteOutlined, EditOutlined, Input, InputNumber, PopConfirm, PopOver, TabPane, Table, Tabs, message } from '@ghcloud/cube-ui'
import { computed, defineComponent, ref } from 'vue'
import './target-set-table.less'
import type { StandardLeveTab, StandardItem } from '@/types/test-standard-type'
import { useRuleValidate } from '@/hook/use-rule-validate'
import type { AllTenantPropertVO } from '@ghcloud/cube-operating-room-service'
import { StandardLeveModal } from './components/standard-leve-modal'
import { AddPropertModal } from './components/add-propert-modal'

interface Props {
  value: StandardLeveTab[];
  readonly: boolean;
  scrollY: number;
}

/** 指标设置 */
export const TargetSetTable = defineComponent({
  props: ['value', 'readonly', 'scrollY'],
  emits: ['update:value'],
  setup: (props: Props, { emit, expose }) => {
    const { isValid, lowerLimitChange, upperLimitChange, validate } = useRuleValidate()
    const tabValues = ref<StandardLeveTab[]>(props.value)
    const tabActive = ref('')
    if (tabValues.value.length){
      tabActive.value = tabValues.value[0].tabIndex
    }

    const columns = [
      {
        title: '检测项目',
        align: 'center',
        dataIndex: 'propertyName',
        width: 150,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '产品名称',
        align: 'center',
        dataIndex: 'productName',
        width: 180,
        fixed: 'left',
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '下限',
        align: 'center',
        dataIndex: 'minVal',
        width: 180,
        customRender: ({ record }: { record: StandardItem; }): JSX.Element => {
          return (
            <div class='input-wrap'>
              {!record.isEdit && <>{record.minVal}</>}
              {record.isEdit &&
              <>
                <InputNumber v-model:value={record.minVal} min={-9999999999.99999} max={9999999999.99999} precision={8} status={record.minValError ? 'error' : ''} onChange={(e: number) => {
                  lowerLimitChange(e, record)
                }} />
                {
                  record.minValError && <span class='error-msg'>{record.minValErrorMsg}</span>
                }
              </>}
            </div>
          )
        }
      },
      {
        title: '上限',
        align: 'center',
        dataIndex: 'maxVal',
        width: 180,
        customRender: ({ record }: { record: StandardItem; }): JSX.Element => {
          return (
            <div class='input-wrap'>
              {!record.isEdit && <>{record.maxVal}</>}
              {record.isEdit &&
              <>
                <InputNumber v-model:value={record.maxVal} min={-9999999999.99999} max={9999999999.99999} precision={8} status='error' onChange={(e: number) => {
                  upperLimitChange(e, record)
                }} />
                {
                  record.maxValError && <span class='error-msg'>{record.maxValErrorMsg}</span>
                }
              </>}
            </div>
          )
        }
      },

    ]
    const tableColumns = computed(() => {
      const action = props.readonly
        ? []
        : [{
          title: '操作',
          dataIndex: 'action',
          align: 'center',
          width: 180,
          customRender: ({ record }: { record: StandardItem; }): JSX.Element => {
            return (
              <>
                {!record.isEdit &&
                <>
                  <Button type='link' onClick={() => {
                    handleEditRow(record)
                  }}>编辑 </Button>
                  <PopConfirm title='确认移除该项？' onConfirm={() => {
                    handleDeleteRow(record)
                  }}>
                    <Button type='link' size='small' danger>移除</Button>
                  </PopConfirm>
                </>}
                {record.isEdit &&
                <>
                  <Button type='link' onClick={() => {
                    handleSaveRow(record)
                  }}>保存</Button>
                  <Button type='link' onClick={() => {
                    handleCancelRow(record)
                  }}>取消</Button>
                </>}
              </>
            )
          }
        }]
      return [...columns, ...action]
    })

    const handleEditRow = (record: StandardItem): void => {
      record.isEdit = true
    }
    const handleDeleteRow = (record: StandardItem): void => {
      const currentTab = tabValues.value.find((e) => e.tabIndex === tabActive.value);
      if (!currentTab) return;
      currentTab.properties = currentTab.properties.filter((e) => e !== record);
      emit('update:value', tabValues.value);
    }
    const handleCancelRow = (record: StandardItem): void => {
      record.minVal = record.minValOrigin
      record.maxVal = record.maxValOrigin
      record.isEdit = false
    }
    const handleSaveRow = async (record: StandardItem): Promise<void> => {
      if (record.minValError || record.maxValError) {
        record.isEdit = true
      } else {
        record.maxValOrigin = record.maxVal
        record.minValOrigin = record.minVal
        record.isEdit = false
        emit('update:value', tabValues.value)
      }
    }

    const validateForm = async (): Promise<void> => {
      try {
        if (tabValues.value.length === 0){
          message.warning('检测指标不能为空')
          isValid.value = false
          return
        }
        for (let i = 0; i < tabValues.value.length; i++) {
          const item = tabValues.value[i]
          if (item.name.length === 0) {
            message.warning('标准级别名称不能为空')
            isValid.value = false
            tabActive.value = item.tabIndex
            return
          }
          if (item.properties.length === 0) {
            message.warning('标准级别下检测项目不能为空')
            isValid.value = false
            tabActive.value = item.tabIndex
            return
          }
          if (!validate(item.properties)){
            tabActive.value = item.tabIndex
            return
          }
        }
        emit('update:value', tabValues.value)
        isValid.value = true
      } catch {
        isValid.value = false
      }
    }


    const featureModalRef = ref<{ openModal: () => void; }>()

    const showModal = (): void => {
      featureModalRef.value?.openModal()
    }

    const handleAddStandard = (value: {
      name: string;
      propertCodes: string[];
      propertList: AllTenantPropertVO[];
    }): void => {
      const newTab = {
        name: value.name,
        tabIndex: Math.random().toString(36).substring(2, 9),
        isEditName: false,
        properties: value.propertList.map(item => {
          return {
            ...item,
            maxVal: 0,
            minVal: 0,
            minValOrigin: 0,
            maxValOrigin: 0,
            isEdit: false,
          }
        }),
      }
      tabValues.value.push(newTab)
      tabActive.value = newTab.tabIndex
      emit('update:value', tabValues.value)
    }

    const addModalRef = ref<{ openModal: (selectCodes: string[]) => void; }>()

    const showAddItemModal = (): void => {
      const selectCodes = currentTabData.value?.properties.map((e: StandardItem) => `${e.tenantId}-${e.productId}-${e.propertyCode}`) ?? []
      addModalRef.value?.openModal(selectCodes)
    }

    const handleAddStandardItem = (value: {
      propertCodes: string[];
      propertList: AllTenantPropertVO[];
    }): void => {
      const currentTab = tabValues.value.find((e) => e.tabIndex === tabActive.value);
      if (!currentTab) return;
      currentTab.properties = currentTab.properties.concat(value.propertList.map(item => {
        return {
          ...item,
          maxVal: 0,
          minVal: 0,
          minValOrigin: 0,
          maxValOrigin: 0,
          isEdit: false,
        }
      }))
      emit('update:value', tabValues.value)
    }

    const handleSaveCell = (item: StandardLeveTab): void => {
      if (item.name.length === 0) {
        message.warning('标准级别名称不能为空')
      } else {
        item.isEditName = false
        emit('update:value', tabValues.value)
      }
    }
    const handleEditCell = (item: StandardLeveTab): void => {
      item.isEditName = true
    }
    const handleDeleteCell = (item: StandardLeveTab): void => {
      tabValues.value = tabValues.value.filter((e: StandardLeveTab) => e !== item)
      if (item.tabIndex === tabActive.value){
        if (tabValues.value.length){
          tabActive.value = tabValues.value[0].tabIndex
        }
      }
      emit('update:value', tabValues.value)
    }

    expose({
      validateForm,
      isValid,
      showModal,
    })

    const currentTabData = computed(() => {
      return tabValues.value.find((e) => e.tabIndex === tabActive.value)
    })

    return (): JSX.Element => {
      return (
        <div style={{ position: 'relative' }}>
          <Tabs style='width: 90%;'v-model:activeKey={tabActive.value}>
            {
              tabValues.value.map((item) => {
                return (
                  <TabPane
                    key={item.tabIndex}
                    tab={() => {
                      return (
                        <>
                          {item.isEditName &&
                          <div class='input-wrapper'>
                            <Input
                              v-model:value={item.name}
                              placeholder='输入标准级别名称'
                              maxlength={50}
                              onPressEnter={() => handleSaveCell(item)}
                            />
                            <CheckOutlined class='editable-cell-icon-check' onClick={async () => handleSaveCell(item)} />
                          </div>}
                          {!item.isEditName &&
                          <div class='text-wrapper'>
                            {item.name}
                            {!props.readonly && <>
                              <EditOutlined class='editable-cell-icon' onClick={() => {
                                handleEditCell(item)
                              }} />
                              <PopConfirm title='确认移除该项？' onConfirm={() => {
                                handleDeleteCell(item)
                              }}>
                                <DeleteOutlined class='editable-cell-icon-delete' />
                              </PopConfirm>
                            </>}
                          </div>}
                        </>
                      )
                    }}
                  >
                  </TabPane>
                )
              })
            }
          </Tabs>
          { currentTabData.value &&
          <>
            <div style='position: absolute; right: 10px; top: 10px;'>
              <Button type='primary' onClick={showAddItemModal}>新增检测项目</Button>
            </div>
            <Table
              columns={tableColumns.value}
              dataSource={currentTabData.value.properties}
              pagination={false}
              size='small'
            />
          </>
          }
          <StandardLeveModal ref={featureModalRef} title={'标准级别'} onEnter={handleAddStandard} />
          <AddPropertModal ref={addModalRef} title={'新增检测项目'} onEnter={handleAddStandardItem} />
        </div>
      )
    }
  }
})
