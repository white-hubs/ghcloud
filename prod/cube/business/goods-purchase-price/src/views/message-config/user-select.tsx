import { Form, FormItem, type FormExpose, Select, type RuleObject, Col, Row, PlusCircleOutlined, MinusCircleOutlined } from '@ghcloud/cube-ui'
import { DeptTreeSelect, RolePickerInput, UserPickerInput } from '@ghcloud/generic-component'
import { defineComponent, onMounted, reactive, ref, watch } from 'vue'

export interface ItemDataType {
  departmentId?: string | string[] | undefined;
  id?: string | undefined;
  name?: string | undefined;
  objType?: string | undefined;
  role?: { id: string; name: string; }[] | undefined;
  user?: { id: string; name: string; }[] | undefined;
  targetConfig?: { id: string; name: string; }[] | undefined;
}
export interface NoticeObj {
  objType: string | undefined; targetConfig: { id: string; name: string; }[] | undefined;
}

/** 选择人员 */
export const UserSelect = defineComponent({
  props: {
    itemData: {
      type: Array<ItemDataType>,
      default: () => []
    },
  },
  emits: ['change'],
  setup (props, { expose, emit }) {
    const formRef = ref<FormExpose>()
    const selectForm = reactive<{ itemData: ItemDataType[]; }>({
      itemData: props.itemData ?? []
    })
    watch(() => props.itemData, (newValue) => {
      if (newValue) {
        selectForm.itemData = newValue
        const data = [...newValue]
        data.forEach(d => {
          if (d.objType === 'DEPARTMENT') {
            if (d.targetConfig && Array.isArray(d.targetConfig)) {
              d.departmentId = d.targetConfig.map(i => (i as { id: string; })?.id)
            }
          }
          if (d.objType === 'ROLE') {
            if (d.targetConfig && Array.isArray(d.targetConfig)) {
              d.role = d.targetConfig.map((i) => {
                return {
                  id: i.id,
                  name: i.name,
                }
              })
            }
          }
          if (d.objType === 'USER') {
            if (d.targetConfig && Array.isArray(d.targetConfig)) {
              d.user = d.targetConfig.map((i) => {
                return {
                  id: i.id,
                  name: i.name,
                }
              })
            }
          }
        })
        selectForm.itemData = data
      }
    }, { immediate: true })
    const formRules: Record<string, RuleObject[]> = {
      objType: [{ required: true, message: '请选择通知人员', trigger: 'change' }],
      departmentId: [{ required: true, message: '请选择部门', trigger: 'change' }],
      role: [{ required: true, message: '请选择角色', trigger: 'change' }],
      user: [{ required: true, message: '请输入用户', trigger: 'change' }],
    }
    const delRow = (index: number): void => {
      selectForm.itemData.splice(index, 1)
    }
    const addRow = async (): Promise<void> => {
      selectForm.itemData.push({
        objType: undefined,
        departmentId: undefined,
        role: undefined,
        user: undefined
      })
    }
    onMounted(() => {
      if (selectForm.itemData.length === 0) {
        addRow()
      }
    })
    const validateForm = async (): Promise<{ users: NoticeObj[]; data: ItemDataType[]; } | null> => {
      try {
        await formRef.value?.validate()
        const noticeObjList: NoticeObj[] = []
        if (selectForm.itemData && Array.isArray(selectForm.itemData)) {
          selectForm.itemData.forEach((item) => {
            let targetConfig: { id: string; name: string; }[] = []
            if (item.objType === 'USER' && item?.user) {
              targetConfig = item.user.map(u => {
                return {
                  id: u.id,
                  name: u.name
                }
              })
            } else if (item.objType === 'ROLE' && item?.role) {
              targetConfig = item.role.map(u => {
                return {
                  id: u.id,
                  name: u.name
                }
              })
            } else if (item.objType === 'DEPARTMENT' && item?.departmentId && Array.isArray(item?.departmentId)) {
              targetConfig = item.departmentId.map((u) => {
                return {
                  id: u,
                  name: ''
                }
              })
            }
            noticeObjList.push({
              objType: item.objType,
              targetConfig
            })
          })
        }
        const result = {
          users: noticeObjList,
          data: selectForm.itemData
        }
        emit('change', result)
        return result
      } catch {
        return null
      }
    }
    const resetForm = async (): Promise<void> => {
      try {
        formRef.value?.resetFields()
      } catch {
      }
    }
    expose({
      validateForm,
      resetForm,
      addRow
    })
    return (): JSX.Element =>
      <>
        <Form
          ref={formRef} model={selectForm} labelCol={{ style: { width: '80px' } }}
          style='margin-top: 20px;'
        >
          {
            selectForm.itemData?.map((e: Record<string, unknown>, i: number) => {
              return (
                <Row gutter={16}>
                  <Col span={5}>
                    <FormItem style='margin-right:0; padding-right: 0;' label='通知人员' name={['itemData', i, 'objType']} rules={formRules.objType}>
                      <Select
                        v-model:value={e.objType}
                        options={[
                          { label: '选择部门', value: 'DEPARTMENT' },
                          { label: '选择角色', value: 'ROLE' },
                          { label: '选择用户', value: 'USER' },
                        ]}
                        allowClear
                        placeholder='请选择通知人员'
                        getPopupContainer={(e: { parentNode: unknown; }) => e.parentNode}
                        style='min-width: 150px'
                      />
                    </FormItem>
                  </Col>
                  {
                    e.objType === 'DEPARTMENT' && (
                      <Col>
                        <FormItem style='width:400px;margin-right:0' name={['itemData', i, 'departmentId']} rules={formRules.departmentId}>
                          <DeptTreeSelect v-model:value={e.departmentId} placeholder='请选择部门' multiple />
                        </FormItem>
                      </Col>
                    )
                  }
                  {
                    e.objType === 'ROLE' && (
                      <Col>
                        <FormItem style='width:400px;margin-right:0' name={['itemData', i, 'role']} rules={formRules.role}>
                          <RolePickerInput v-model:value={e.role} multiple />
                        </FormItem>
                      </Col>
                    )
                  }
                  {
                    e.objType === 'USER' && (
                      <Col>
                        <FormItem style='width:400px;margin-right:0' name={['itemData', i, 'user']} rules={formRules.user}>
                          <UserPickerInput v-model:value={e.user} multiple />
                        </FormItem>
                      </Col>
                    )
                  }
                  <Col>
                    {
                      i === 0
                        ? <PlusCircleOutlined title='添加' onClick={() => {
                          addRow()
                        }} style={{ color: '#00ba8b', marginLeft: '10px', marginTop: '5px', fontSize: '20px' }} />
                        : <MinusCircleOutlined title='移除' onClick={() => {
                          delRow(i)
                        }} style={{ color: '#f5222d', marginLeft: '10px', marginTop: '5px', fontSize: '20px' }} />
                    }
                  </Col>
                </Row>
              )
            })
          }
        </Form>
      </>
  }
})
