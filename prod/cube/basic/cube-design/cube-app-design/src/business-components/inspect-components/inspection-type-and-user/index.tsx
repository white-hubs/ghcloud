import { defineComponent, onMounted, reactive, ref, type PropType } from 'vue'
import { Form, type FormExpose, FormItem, PlusCircleOutlined, MinusCircleOutlined } from '@ghcloud/cube-ui'
import { UserSelect } from '../../ouaa-components/user-select'
import { InspectTypeSelect } from '../inspect-type-select'
import styles from './index.module.less'
import { cubeDailyInspectionService } from '../../../api/service'

export interface InspectTypeAndUserItem {
  key: string;
  inspectionType?: string | undefined | null;
  inspectionUsers?: unknown[] | undefined;
}

/** 巡检类型和人员编辑组件 */
export const InspectTypeAndUser = defineComponent({
  props: {
    value: {
      type: Array as PropType<InspectTypeAndUserItem[]>,
      default: () => []
    },
    businessType: {
      type: String,
      default: 'SMALL_ENGINEERING'
    }
  },
  emits: ['update:value'],
  setup: (props, { emit, expose }) => {
    const formData = ref<InspectTypeAndUserItem[]>(props.value || [])
    const formRenderRef = ref<FormExpose>()
    const formState = reactive<{
      formData: InspectTypeAndUserItem[] | undefined;
    }>({
      formData: props.value || [],
    })

    const resetFields = (): void => {
      formRenderRef.value?.resetFields()
      formData.value = []
      formState.formData = []
    }

    const addItem = (): void => {
      formData.value.push({
        key: `${Date.now()}`,
        inspectionType: null,
        inspectionUsers: []
      })
      formState.formData = [...formData.value]
    }

    const removeItem = (index: number): void => {
      formData.value?.splice(index, 1)
      formState.formData = [...formData.value]
    }

    const isValid = ref(false)
    const checkFormData = async (): Promise<unknown> => {
      try {
        if (!formState.formData?.length) {
          isValid.value = false
          return Promise.reject(new Error('请添加人员'))
        }

        // 检查每一项是否都选择了巡检类型
        const hasEmptyType = formState.formData.some(item => !item.inspectionType)
        if (hasEmptyType) {
          isValid.value = false
          return Promise.reject(new Error('请选择巡检类型'))
        }

        // 检查每一项是否都选择了人员
        const hasEmptyUsers = formState.formData.some(item => !(item.inspectionUsers?.length))
        if (hasEmptyUsers) {
          isValid.value = false
          return Promise.reject(new Error('请选择人员'))
        }

        isValid.value = true
        emit('update:value', formState.formData)
        return Promise.resolve()
      } catch (error) {
        isValid.value = false
        return Promise.reject(error)
      }
    }

    expose({
      resetFields,
      checkFormData,
      noticeList: formData,
      isValid
    })

    onMounted(() => {
      // 如果没有初始数据，添加一个空项
      if (!formData.value.length) {
        addItem()
      }
    })

    return (): JSX.Element => (
      <>
        <Form model={formState} ref={formRenderRef}>
          {
            formState.formData?.map((item, index) => {
              return (
                <div key={item.key} class={styles['item-container']}>
                  <FormItem name='formDataItem'>
                    <div class={styles['view-item']}>
                      <div class={styles['inspect-type']}>
                        <InspectTypeSelect
                          v-model:value={item.inspectionType}
                          optionsFetchApi={async () => {
                            return cubeDailyInspectionService.getInspectTypeList({
                              businessType: props.businessType
                            })
                          }}
                        />
                      </div>
                      <div class={styles['user-select']}>
                        <UserSelect
                          v-model:value={item.inspectionUsers}
                          multiple
                        />
                      </div>
                      {
                        index === 0
                          ? <PlusCircleOutlined title='添加' onClick={() => {
                            addItem()
                          }} style={{ color: '#00ba8b', fontSize: '20px' }} />
                          : <MinusCircleOutlined title='移除' onClick={() => {
                            removeItem(index)
                          }} style={{ color: '#f5222d', fontSize: '20px' }} />
                      }
                    </div>
                  </FormItem>
                </div>
              )
            })
          }
        </Form>
      </>
    )
  }
})
