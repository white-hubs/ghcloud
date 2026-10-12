import { computed, defineComponent, onMounted, ref } from 'vue'
import { Layout } from '@/components/layout/layout'
import { Button, message } from '@ghcloud/cube-ui'
import { useRoute } from 'vue-router'
import { DynamicFormRender } from '@ghcloud/dynamic-form-render'
import type { DynamicFormRenderOptionProps } from '@ghcloud/dynamic-form-render/src/dynamic-form-render-props'
import type { FormExpose } from '@ghcloud/cube-ui/src/components/form/form'
import type { InsertState } from './index.i'
import { getCategoryTree, getAlarmDetail, insertAlarm, updateAlarm } from '@/api/price-alarm-record'
import { InputRate } from '@/components/business/input-rate'

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
      { label: '中等', value: 'MID' },
      { label: '较低', value: 'MIN' },
    ])

    const dynamicFormRenderRef = ref<{ formRef: FormExpose; }>()
    const options = computed(() => {
      const res: DynamicFormRenderOptionProps[] = [
        { title: '计划名称', key: 'name', width: 46, componentName: 'TextInput', required: true },
        { title: '计划频次', key: 'publish', width: 46, customComponent: InputRate, required: false, componentProps: { rateData: rateData.value, isDetail: action === 'detail' } },
        { title: '计划生效时间', key: 'startTime', width: 46, componentName: 'DateTime', componentProps: { showTime: true, valueFormat: 'YYYY-MM-DD HH:mm:ss' }, required: false },
        { title: '计划失效时间', key: 'endTime', width: 46, componentName: 'DateTime', componentProps: { showTime: true, valueFormat: 'YYYY-MM-DD HH:mm:ss' }, required: false },
        { title: '启用状态', key: 'enabled', width: 46, componentName: 'Switch', required: false },
        { title: '紧急程度', key: 'urgency', width: 46, componentName: 'SelectInput', componentProps: { options: urgencyOptions.value, allowClear: true, placeholder: '请选择紧急程度' }, required: true },
        {
          title: '采价商品品类',
          key: action === 'detail' ? 'categoryNames' : 'categoryIds',
          width: 46,
          componentName: 'TreeSelect',
          componentProps: {
            showSearch: true,
            treeNodeFilterProp: 'name',
            treeData: categoryOptions.value,
            fieldNames: { label: 'name', value: 'id', children: 'children' },
            treeCheckStrictly: true,
            multiple: true,
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
      userList: null,
      userNames: '',
      categoryNames: '',
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
        if (Array.isArray(formData.value?.categoryIds)) {
          params.categoryIds = formData.value?.categoryIds[0] as unknown as string[]
        }
        delete params.publish
        delete params.userList

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
    onMounted(async () => {
      getCategoryOption()
      if (action !== 'add') {
        if (id) {
          const res = await getAlarmDetail({ id: id as string })
          if (res.data) {

            res.data.categoryIds = res.data.goodsCategoryList.map((item: { id: string; }) => {
              return item.id
            })


            const categoryNames = res.data.goodsCategoryList.map((item: { name: string; }) => {
              return item.name
            })

            res.data.categoryNames = categoryNames.length > 0 ? categoryNames.toString(',') : '--'

            rateData.value = {
              publishType: res.data.publishType,
              publishPeriod: res.data.publishPeriod,
              publishTime: res.data.publishTime,
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
          <DynamicFormRender
            formOptions={options.value}
            labelWidth='150px'
            v-model:formData={formData.value}
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
