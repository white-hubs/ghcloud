import { logger } from '@/logger'
import { Button, CheckOutlined, EditOutlined, Form, FormItem, Input, InputNumber, Modal, PopConfirm, PopOver, Select, Switch, TabPane, Table, Tabs, message, type FormExpose } from '@ghcloud/cube-ui'
import { computed, defineComponent, reactive, ref, watch } from 'vue'
import './target-set-table.less'
import type { SelectValue } from '@/types/monitor-type'
import { useRuleValidate } from '@/hook/use-rule-validate'
import { NormSelect } from '../norm-select/norm-select'
import type { PropNorm } from '@/types/special-norm-type'
import { authStore } from '@/api/auth-store'

interface Props {
  value: SelectValue[];
  readonly: boolean;
  scrollY: number;
  prodId: string | string[];
  areaList: { label: string;value: string; }[];
}

/** 指标设置 */
export const TargetSetTable = defineComponent({
  props: ['value', 'readonly', 'scrollY', 'prodId', 'areaList'],
  emits: ['update:value', 'customArea'],
  setup: (props: Props, { emit, expose }) => {
    const { isValid, selectValue, lowerLimitChange, upperLimitChange, sortChange, validate } = useRuleValidate()
    watch(() => props.value, (newValue) => {
      selectValue.value = newValue
      if (props.value?.length) {
        selectValue.value = props.value.map(e => {
          if (typeof e.display === 'number') e.display = !!e.display
          if (e.normCode.includes('cleanlinessLevel')) e.showArea = '4'
          return e
        })
      }
    }, { deep: true, immediate: true })
    const area1 = computed(() => selectValue.value.filter(e => e.showArea === '1' && !e.normCode.includes('cleanlinessLevel')))
    const area2 = computed(() => selectValue.value.filter(e => e.showArea === '2' && !e.normCode.includes('cleanlinessLevel')))
    const area3 = computed(() => selectValue.value.filter(e => e.showArea === '3' && !e.normCode.includes('cleanlinessLevel')))
    const area4 = computed(() => selectValue.value.filter(e => e.showArea === '4'))
    const areaOptions = computed(() => {
      return [
        { label: '标准参数', value: '1', data: area1.value },
        { label: '健安参数', value: '2', data: area2.value },
        { label: '运管参数', value: '3', data: area3.value },
        { label: '洁净等级', value: '4', data: area4.value },
      ]
    })
    const areaInit = [
      { label: '标准参数', value: '1' },
      { label: '健安参数', value: '2' },
      { label: '运管参数', value: '3' },
      { label: '洁净等级', value: '4' }
    ]
    const areaData = ref(props.areaList.length > 0 ? props.areaList : areaInit)
    const editableData = reactive<Record<string, unknown>>({})
    const columns = [
      {
        title: '指标名称',
        align: 'center',
        dataIndex: 'normName',
        width: 180,
        fixed: 'left',
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '单位',
        align: 'center',
        dataIndex: 'unit',
        width: 150,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '是否展示',
        align: 'center',
        dataIndex: 'display',
        width: 150,
        customRender: ({ record }: { record: { display: number; }; }): JSX.Element => {
          return <Switch v-model:checked={record.display} checked-children='开' un-checked-children='关' onChange={async () => changeStatus(record)} />
        }
      },
      {
        title: '展示排序',
        align: 'center',
        dataIndex: 'sort',
        width: 150,
        customRender: ({ record }: { record: SelectValue; }): JSX.Element => {
          return (
            <div class='input-wrap'>
              {
                !record.normCode.includes('cleanlinessLevel')
                  ? <>
                    {!record.isEdit && <>{record.sort}</>}
                    {record.isEdit &&
                      <>
                        <InputNumber v-model:value={record.sort} min={0} status='error' onChange={(e: number) => {
                          sortChange(e, record)
                        }} />
                        {
                          record.sortError && <span class='error-msg'>{record.sortErrorMsg}</span>
                        }
                      </>}
                  </>
                  : <span>固定</span>
              }
            </div>
          )
        }
      },
      {
        title: '下限',
        align: 'center',
        dataIndex: 'lowerLimit',
        width: 180,
        customRender: ({ record }: { record: SelectValue; }): JSX.Element => {
          return (
            <div class='input-wrap'>
              {
                !record.normCode.includes('cleanlinessLevel') &&
                   <>
                     {!record.isEdit && <>{record.lowerLimit}</>}
                     {record.isEdit && record.normCode !== 'airconditioner' &&
                      <>
                        <InputNumber v-model:value={record.lowerLimit} min={-9999999999.99999} max={9999999999.99999} precision={8} status={record.lowerLimitError ? 'error' : ''} onChange={(e: number) => {
                          lowerLimitChange(e, record)
                        }} />
                        {
                          record.lowerLimitError && <span class='error-msg'>{record.lowerLimitErrorMsg}</span>
                        }
                      </>}
                   </>
              }
            </div>
          )
        }
      },
      {
        title: '上限',
        align: 'center',
        dataIndex: 'upperLimit',
        width: 180,
        customRender: ({ record }: { record: SelectValue; }): JSX.Element => {
          return (
            <div class='input-wrap'>
              {
                !record.normCode.includes('cleanlinessLevel') &&
                  <>
                    {!record.isEdit && <>{record.upperLimit}</>}
                    {record.isEdit && record.normCode !== 'airconditioner' &&
                      <>
                        <InputNumber v-model:value={record.upperLimit} min={-9999999999.99999} max={9999999999.99999} precision={8} status='error' onChange={(e: number) => {
                          upperLimitChange(e, record)
                        }} />
                        {
                          record.upperLimitError && <span class='error-msg'>{record.upperLimitErrorMsg}</span>
                        }
                      </>}
                  </>
              }
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
          customRender: ({ record }: { record: SelectValue; }): JSX.Element => {
            return (
              <>
                {
                  !record.normCode.includes('cleanlinessLevel') && <>
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
                }
              </>
            )
          }
        }]
      return [...columns, ...action]
    })
    const handleEditRow = (record: { isEdit: boolean; }): void => {
      record.isEdit = !record.isEdit
    }
    const handleDeleteRow = (record: SelectValue): void => {
      selectValue.value = selectValue.value.map(e => {
        if (e.normCode === record.normCode) {
          e.showArea = undefined
        }
        return e
      })
    }
    const handleCancelRow = (record: SelectValue): void => {
      record.isEdit = !record.isEdit
    }
    const handleSaveRow = async (record: SelectValue): Promise<void> => {
      if (record.lowerLimitError || record.upperLimitError || record.unitError) {
        record.isEdit = true
      } else {
        record.isEdit = !record.isEdit
        emit('update:value', selectValue.value)
      }
    }
    const changeStatus = async (record: unknown): Promise<void> => {
      logger.debug(record)
      emit('update:value', selectValue.value)
    }
    const tabActive = ref('1')
    const showTabError = (): void => {
      if (!isValid.value) {
        const result = selectValue.value.sort((a, b) => Number(a.showArea ?? 0) - Number(b.showArea ?? 0))
        const first = result.find(item => item.showAreaError || item.sortError || item.lowerLimitError || item.upperLimitError)
        tabActive.value = `${first?.showArea}` || '1'
      }
    }
    const validateForm = async (): Promise<void> => {
      try {
        await validate()
        if (!isValid.value) showTabError()
        const areaEmpty = areaData.value.some((a: { label: string; }) => !a.label)
        if (areaEmpty) {
          message.warning('展示区域名称不能不为空')
          isValid.value = false
        } else {
          isValid.value = true
        }
      } catch {
        isValid.value = false
      }
    }
    const filterSpecial = computed(() => {
      return {
        tenant: authStore.tenant,
        productId: props.prodId
      }
    })
    const selectNormList = ref<PropNorm[]>([])
    const handleNormChange = (norms: PropNorm[]): void => {
      selectNormList.value = norms
    }
    const modalVisible = ref<boolean>(false)
    const formRef = ref<FormExpose>()
    const formState = reactive<{
      showArea: string | undefined;
      normCodes: string[] | undefined;
    }>({
      showArea: undefined,
      normCodes: undefined,
    })
    const modalRules = {
      showArea: [{ required: true, message: '请选择展示区域', trigger: 'blur' }],
      normCodes: [{ required: true, message: '请选择指标', trigger: 'blur' }],
    }
    const showNormModal = (): void => {
      modalVisible.value = true
      formState.showArea = tabActive.value
      changeArea()
    }
    const handleAreaData = (): void => {
      const beforeArea = selectValue.value.filter(e => e.showArea === formState.showArea)
      selectValue.value.map(e => {
        if (formState.normCodes?.includes(e.normCode)) {
          e.showArea = formState.showArea
        } else if (beforeArea.findIndex(o => o.normCode === e.normCode) !== -1) {
          e.showArea = undefined
        }
        if (e.normCode.includes('cleanlinessLevel')) e.showArea = '4'
        return e
      })
    }
    const handleModalOk = async (): Promise<void> => {
      await formRef.value?.validate()
      modalVisible.value = false
      handleAreaData()
      emit('update:value', selectValue.value)
      emit('customArea', areaData.value)
    }
    const cancelModal = (): void => {
      modalVisible.value = false
      formState.normCodes = undefined
      formState.showArea = undefined
    }
    const changeArea = (): void => {
      formState.normCodes = areaOptions.value.find(a => a.value === formState.showArea)?.data.map(d => d.normCode) ?? []
    }
    const handleSaveCell = async (item: { label: string; value: string; }): Promise<void> => {
      if (item.label.length === 0) {
        message.warning('展示区域名称不能不为空')
        areaData.value.map(a => {
          if (a.value === item.value) {
            a.label = areaInit.find(n => n.value === item.value)?.label ?? ''
          }
          return a
        })
      }
      emit('customArea', areaData.value)
      editableData[item.value] = null
    }
    const handleEditCell = (key: string): void => {
      editableData[key] = true
      emit('customArea', areaData.value)
    }
    expose({
      validateForm,
      isValid,
      showNormModal
    })
    return (): JSX.Element => {
      return (
        <>
          <Tabs v-model:activeKey={tabActive.value}>
            {
              areaData.value.map((item) => {
                return (
                  <TabPane
                    key={item.value} tab={() => {
                      return (
                        <>
                          {editableData[item.value] &&
                          <div class='input-wrapper'>
                            <Input
                              key={item.value}
                              v-model:value={item.label} placeholder='输入展示区域名称' onPressEnter={async () => handleSaveCell(item)}
                            />
                            <CheckOutlined class='editable-cell-icon-check' onClick={async () => handleSaveCell(item)} />
                          </div>}
                          {!editableData[item.value] &&
                          <div class='text-wrapper'>
                            {item.label}
                            {item.value !== '4' && <EditOutlined class='editable-cell-icon' onClick={() => {
                              handleEditCell(item.value)
                            }} />}
                          </div>}
                        </>
                      )
                    }}
                  >
                    <Table
                      columns={tableColumns.value}
                      dataSource={areaOptions.value.find(a => a.value === item.value)?.data}
                      pagination={false}
                      size='small'
                      scrollY={props.scrollY}
                    />
                  </TabPane>
                )
              })
            }
          </Tabs>
          <Modal
            visible={modalVisible.value}
            title='添加指标'
            onOk={handleModalOk}
            onCancel={cancelModal}
            width='600px'
          >
            <Form model={formState} ref={formRef} rules={modalRules} label-col={{ style: { width: '80px' } }}>
              <FormItem label='展示区域' name='showArea'>
                <Select v-model:value={formState.showArea} options={areaData.value} onChange={changeArea} style={{ width: '360px' }} />
              </FormItem>
              <FormItem label='选择指标' name='normCodes'>
                <NormSelect mode='multiple' v-model:value={formState.normCodes} maxTagCount={3} prodId={props.prodId} filterSpecial={filterSpecial.value} onChange={handleNormChange} width='360px' />
              </FormItem>
            </Form>
          </Modal>
        </>
      )
    }
  }
})
