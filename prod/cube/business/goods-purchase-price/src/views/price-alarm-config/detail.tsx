import { computed, defineComponent, onMounted, ref } from 'vue'
import { Layout } from '@/components/layout/layout'
import { Alert, Button, message } from '@ghcloud/cube-ui'
import { useRoute } from 'vue-router'
import { DynamicFormRender } from '@ghcloud/dynamic-form-render'
import type { DynamicFormRenderOptionProps } from '@ghcloud/dynamic-form-render/src/dynamic-form-render-props'
import type { FormExpose } from '@ghcloud/cube-ui/src/components/form/form'
import type { InsertState, RuleState } from './index.i'
import { getCategoryTree, getAlarmDetail, insertAlarm, updateAlarm } from '@/api/price-alarm-config'
import { PriceRule } from '@/components/business/price-rule'
import { VerticalLine } from '@ghcloud/generic-component'
import '@/styles/common.less'

export const Detail = defineComponent({
  setup: () => {
    const { action, id } = useRoute().query
    const goBack = (): void => {
      history.back()
    }

    const title = computed(() => {
      let res = ''
      if (action === 'add') {
        res = '新增采价预警配置'
      } else if (action === 'edit') {
        res = '编辑采价预警配置'
      } else {
        res = '采价预警配置详情'
      }
      return res
    })

    const priceRuleRef = ref()
    const dynamicFormRenderRef = ref<{ formRef: FormExpose; }>()
    const options = computed(() => {
      const res: DynamicFormRenderOptionProps[] = [
        { title: '采价预警名称', key: 'groupName', width: 40, componentName: 'TextInput', required: true },
        {
          title: '预警通知人',
          key: action === 'detail' ? 'userNames' : 'userList',
          width: 40,
          componentName: 'UserPickerInput',
          required: true,
          componentProps: { multiple: true, placeholder: '请选择采价人' }
        },
        { title: '说明', key: 'remark', width: 40, componentName: 'TextareaInput', required: false },
      ]
      if (action === 'detail') {
        res.forEach(e => {
          e.readonly = true
        })
      }
      return res
    })
    const formData = ref<InsertState>({
      enabled: true,
      remark: '',
      categoryIds: null,
      userIds: null,
      userList: null,
      userNames: '',
      categoryNames: '',
      rules: []
    })

    // 保存
    const saveLoading = ref(false)
    const save = async (): Promise<void> => {
      dynamicFormRenderRef.value?.formRef.clearValidate()
      await dynamicFormRenderRef.value?.formRef.validate()

      const ruleData = await priceRuleRef.value.validateForm()
      try {
        saveLoading.value = true
        const params: InsertState = {
          groupName: formData.value.groupName,
          remark: formData.value.remark,
        }
        if (formData.value.userList) {
          params.userIds = formData.value.userList.map((item: { id: string; }) => {
            return item.id
          })
        }
        delete params.userList
        if (ruleData.ruleList.length > 0) {

          params.rules = ruleData.ruleList.map((item: { goodsCategoryIds: { value: string; }[]; }) => {
            const ids = item.goodsCategoryIds.map((item2: { value: string; }) => {
              return item2.value ?? item2
            })
            return {
              ...item,
              goodsCategoryIds: ids,
            }
          })
        }

        if (action === 'add' || action === 'copy') {
          await insertAlarm(params)
        } else {
          await updateAlarm({
            ...params,
            id: id as string
          })
        }
        message.success('操作成功')
        history.back()
      } catch {
        // (function(){})(error)
      } finally {
        saveLoading.value = false
      }
    }
    const categoryOptions = ref([])
    const getCategoryOption = async (): Promise<void> => {
      const { data } = await getCategoryTree({})
      categoryOptions.value = data
    }
    const getVal = (val: unknown, defaultVal: unknown = ''): unknown => {
      return val || (action === 'detail' ? '--' : defaultVal)
    }
    const init = ref(false)
    const rulesData = ref()
    onMounted(async () => {
      getCategoryOption()
      if (action !== 'add') {
        if (id) {
          const res = await getAlarmDetail({ id: id as string })
          if (res.data) {
            rulesData.value = {
              goodsCategoryIds: getVal(res.data.categoryIds, []),
              priceType: getVal(res.data.priceType),
              compareCondition: getVal(res.data.compareCondition),
              compareValue: getVal(res.data.compareValue),
            }
            if (res.data.users) {

              res.data.users = res.data.users.map((item: { userId: string; userName: string; }) => {
                return {
                  id: item.userId,
                  name: item.userName,
                  gender: ''
                }
              })
              res.data.userList = res.data.users

              const names = res.data.users.map((item: { name: string; }) => {
                return item.name
              })

              res.data.userNames = names.length > 0 ? names.toString(',') : '--'
            }
            formData.value = res.data as InsertState
          }
        }
      }
      init.value = true
    })

    const layoutSlots = {
      'layout-content': (): JSX.Element => {
        if (!init) {
          return <></>
        }
        return (
          <>
            <DynamicFormRender
              formOptions={options.value}
              labelWidth='150px'
              v-model:formData={formData.value}
              ref={dynamicFormRenderRef}
              style={{ margin: '20px' }}
            />
            <VerticalLine title='采价价格设置' />
            <Alert message='设置采价价格波动范围限制，超过立即提醒' type='warning' style=' margin: 10px 0;width:380px;' />
            <PriceRule ref={priceRuleRef} ruleArr={formData.value.rules as RuleState[]} isDetail={action === 'detail'} />
          </>
        )
      },
      'footer-page': (): JSX.Element => {
        return (
          <>
            <Button onClick={goBack}>返回</Button>
            {action !== 'detail' && <Button type='primary' style={{ marginLeft: '10px' }} loading={saveLoading.value} onClick={async () => save()}>保存</Button>}
          </>
        )
      }
    }
    return (): JSX.Element => <Layout title={title.value} v-slots={layoutSlots} />
  }
})
