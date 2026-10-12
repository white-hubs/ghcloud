import { computed, defineComponent, onMounted, ref } from 'vue'
import { Layout } from '@/components/layout/layout'
import { Button, message } from '@ghcloud/cube-ui'
import { useRoute } from 'vue-router'
import { DynamicFormRender } from '@ghcloud/dynamic-form-render'
import type { DynamicFormRenderOptionProps } from '@ghcloud/dynamic-form-render/src/dynamic-form-render-props'
import type { FormExpose, RuleObject } from '@ghcloud/cube-ui/src/components/form/form'
import type { InsertState } from './index.i'
import { getCategoryTree, getPlanDetail, insertPlan, updatePlan } from '@/api/price-plan'
import { InputRate, type RateState } from '@/components/business/input-rate'
import '@/styles/common.less'
import { InputTimeLimit, type TimeLimitState } from '@/components/business/input-time-limit'
import dayjs from 'dayjs'

export const Detail = defineComponent({
  setup: () => {
    const { action, id } = useRoute().query
    const goBack = (): void => {
      history.back()
    }

    const title = computed(() => {
      let res = ''
      if (action === 'add') {
        res = '新增采价计划'
      } else if (action === 'edit') {
        res = '编辑采价计划'
      } else {
        res = '采价计划详情'
      }
      return res
    })
    const urgencyOptions = ref([
      { label: '紧急', value: 'MAX' },
      { label: '普通', value: 'MID' },
    ])
    const checkPublish = async (rule: unknown, value: RateState): Promise<void> => {
      if (action === 'detail' || value === undefined) return Promise.resolve()
      if (!value.publishType && !(value.publishPeriod || value.publishTime)) {
        return Promise.reject(new Error('请填写计划频次'))
      }
      if (value.publishType !== 'EVERY_DAY' && !(value.publishPeriod && value.publishTime)) {
        return Promise.reject(new Error('请填写计划频次'))
      }
      return Promise.resolve()
    }
    const customValidatesRules = {
      publish: { required: true, trigger: 'change', validator: checkPublish } satisfies RuleObject,
    }

    const dynamicFormRenderRef = ref<{ formRef: FormExpose; }>()
    const options = computed(() => {
      const res: DynamicFormRenderOptionProps[] = [
        { title: '计划名称', key: 'name', width: 46, componentName: 'TextInput', required: true },
        { title: '计划频次', key: 'publish', width: 46, customComponent: InputRate, required: true, componentProps: { rateData: rateData.value, isDetail: action === 'detail' } },
        { title: '计划生效时间', key: 'startTime', width: 46, componentName: 'DateTime', componentProps: { showTime: true, valueFormat: 'YYYY-MM-DD HH:mm:ss' }, required: true },
        { title: '计划失效时间', key: 'endTime', width: 46, componentName: 'DateTime', componentProps: { showTime: true, valueFormat: 'YYYY-MM-DD HH:mm:ss' }, required: true },
        { title: '任务时限', key: 'taskValidity', width: 46, customComponent: InputTimeLimit, required: false, componentProps: { timeData: timeLimitData.value, isDetail: action === 'detail' } },
        { title: '启用状态', key: 'enabled', width: 46, componentName: 'Switch', required: true },
        { title: '紧急程度', key: 'urgency', width: 46, componentName: 'SelectInput', componentProps: { options: urgencyOptions.value, allowClear: true, placeholder: '请选择紧急程度' }, required: true },
        {
          title: '采价商品品类',
          key: action === 'detail' ? 'categoryNames' : 'categoryList',
          width: 46,
          componentName: 'TreeSelect',
          componentProps: {
            treeData: categoryOptions.value,
            fieldNames: { label: 'name', value: 'id', children: 'children' },
            treeCheckStrictly: true,
            multiple: true,
            showSearch: true,
            treeNodeFilterProp: 'name',
            placeholder: '请选择采价商品品类'
          },
          required: true
        },
        {
          title: '采价人',
          key: action === 'detail' ? 'userNames' : 'userList',
          width: 46,
          componentName: 'UserPickerInput',
          required: true,
          componentProps: { multiple: true, placeholder: '请选择采价人' }
        },
      ]
      if (action === 'detail') {
        res.forEach(e => {
          e.readonly = true
        })
      }
      return res
    })
    const formData = ref<InsertState>({
      name: '',
      urgency: '',
      planDesc: '',
      startTime: '',
      endTime: '',
      publishType: '',
      publishPeriod: '',
      publishTime: '',
      enabled: true,
      remark: '',
      categoryIds: null,
      userIds: null,
      userList: undefined,
      categoryList: undefined,
      userNames: '',
      categoryNames: '',
      taskValidity: '',
      publish: {
        publishType: '',
        publishPeriod: '',
        publishTime: '',
      },
    })
    // 保存
    const saveLoading = ref(false)
    const save = async (): Promise<void> => {
      dynamicFormRenderRef.value?.formRef.clearValidate()
      await dynamicFormRenderRef.value?.formRef.validate()
      try {
        saveLoading.value = true
        const params: InsertState = {
          ...formData.value
        }
        if (formData.value?.publish) {
          params.publishType = formData.value?.publish?.publishType
          params.publishPeriod = formData.value?.publish?.publishPeriod
          params.publishTime = formData.value?.publish?.publishTime
        }
        if (params.userList) {
          params.userIds = params.userList.map((item: { id: string; }) => {
            return item.id
          })
        }
        if (params.categoryList) {
          params.categoryIds = params.categoryList.map((item: { value: string; }) => {
            return item.value
          })
        }
        delete params.publish
        delete params.userList
        delete params.categoryList

        if (action === 'add' || action === 'copy') {
          await insertPlan(params)
        } else {
          await updatePlan({
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
    const init = ref(false)
    const rateData = ref()
    const timeLimitData = ref<TimeLimitState>()
    onMounted(async () => {
      getCategoryOption()
      if (action !== 'add') {
        if (id) {
          const res = await getPlanDetail({ id: id as string })
          if (res.data) {
            rateData.value = {
              publishType: res.data.publishType,
              publishPeriod: res.data.publishPeriod,
              publishTime: res.data.publishTime,
            }

            const timeLimit = res.data.taskValidity ? res.data.taskValidity.split(',') : []
            timeLimitData.value = {
              taskDay: +(timeLimit[0]),
              taskHour: +(timeLimit[1]),
              taskMinute: +(timeLimit[2]),
            }

            res.data.userList = res.data.userList.map((item: { userId: string; userName: string; }) => {
              return {
                id: item.userId,
                name: item.userName,
                gender: ''
              }
            })

            const names = res.data.userList.map((item: { name: string; }) => {
              return item.name
            })

            res.data.userNames = names.length > 0 ? names.toString(',') : '--'


            res.data.categoryList = res.data.goodsCategoryList.map((item: { id: string; name: string; }) => {
              return {
                value: item.id,
                label: item.name,
              }
            })

            const categoryNames = res.data.categoryList.map((item: { label: string; }) => {
              return item.label
            })

            res.data.categoryNames = categoryNames.length > 0 ? categoryNames.toString(',') : '--'

            formData.value = res.data as InsertState
            formData.value.startTime = dayjs(res.data.startTime).format('YYYY-MM-DD HH:mm:ss')
            formData.value.endTime = dayjs(res.data.endTime).format('YYYY-MM-DD HH:mm:ss')
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
          <DynamicFormRender
            formOptions={options.value}
            labelWidth='150px'
            v-model:formData={formData.value}
            customValidatesRules={customValidatesRules}
            ref={dynamicFormRenderRef}
            style={{ margin: '20px' }}
          />
        )
      },
      'footer-page': (): JSX.Element => {
        return (
          <>
            <Button onClick={goBack}>返回</Button>
            {action !== 'detail' && <Button type='primary' style={{ marginLeft: '10px' }} loading={saveLoading.value} onClick={save}>保存</Button>}
          </>
        )
      }
    }
    return (): JSX.Element => <Layout title={title.value} v-slots={layoutSlots} />
  }
})
