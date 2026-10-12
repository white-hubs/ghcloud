import { defineComponent, onMounted, reactive, ref, type PropType, watch } from 'vue'
import { Button, Form, type FormExpose, FormItem, MinusCircleOutlined, PlusOutlined, Input, Checkbox } from '@ghcloud/cube-ui'
import styles from './index.module.less'

export interface ResultItem {
  key: string;
  itemValue: string | undefined;
  itemName: string | undefined;
  errorFlag: boolean | undefined;
}

/** 添加巡检结果组件 */
export const CreateResultItem = defineComponent({
  props: {
    value: {
      type: Array as PropType<ResultItem[]>,
      default: () => []
    }
  },
  emits: ['update:value'],
  setup: (props, { emit, expose }) => {
    const resultList = ref<ResultItem[]>(props.value || [])
    const formRenderRef = ref<FormExpose>()
    const formState = reactive<{
      resultList: ResultItem[] | undefined;
    }>({
      resultList: props.value || [],
    })
    watch(() => props.value, (newValue) => {
      resultList.value = newValue || []
      formState.resultList = newValue || []
    }, { deep: true, immediate: true })
    const resetFields = (): void => {
      formRenderRef.value?.resetFields()
      resultList.value = []
      formState.resultList = []
    }
    const addItem = (): void => {
      resultList.value.push({
        key: `${Date.now()}`,
        itemName: undefined,
        errorFlag: undefined,
        itemValue: `${resultList.value.length + 1}`
      })
      formState.resultList = [...resultList.value]
    }
    const removeItem = (index: number): void => {
      resultList.value?.splice(index, 1)
      formState.resultList = [...resultList.value].map((e, i) => {
        return {
          ...e,
          itemValue: `${i}`
        }
      })
    }
    const isValid = ref(false)
    const checkResultList = async (): Promise<unknown> => {
      try {
        if (!formState.resultList?.length) {
          isValid.value = false
          return Promise.reject(new Error('请添加结果项'))
        }
        const hasEmptyName = formState.resultList.every(item => item.itemName)
        if (!hasEmptyName) {
          isValid.value = false
          return Promise.reject(new Error('请输入结果项描述'))
        }
        const hasError = formState.resultList.some(item => item.errorFlag)
        if (!hasError) {
          isValid.value = false
          return Promise.reject(new Error('请至少选择一项异常项'))
        }
        isValid.value = true
        emit('update:value', formState.resultList)
        return Promise.resolve()
      } catch (error) {
        isValid.value = false
        return Promise.reject(error)
      }
    }
    expose({
      resetFields,
      checkResultList,
      resultList,
      isValid
    })
    onMounted(() => {
      resetFields()
    })
    return (): JSX.Element => (
      <>
        <Button type='dashed' onClick={addItem} class={[styles.add]}>
          <PlusOutlined class={styles.del} />
          添加
        </Button>
        <Form model={formState} ref={formRenderRef}>
          {
            formState.resultList?.map((e, i) => {
              return (
                <div key={i} class={styles['mt-10']}>
                  <FormItem class={styles['result-item']}>
                    <Input v-model:value={e.itemName} placeholder='请输入结果项描述' maxlength={16} class={styles['result-input']} style={{ width: '280px' }} />
                    <Checkbox v-model:checked={e.errorFlag}>异常点</Checkbox>
                    <Button type='link' danger onClick={() => {
                      removeItem(i)
                    }} size='small'><MinusCircleOutlined title='删除' /></Button>
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
