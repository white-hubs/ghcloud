import { computed, defineComponent, onMounted, ref, type VNode } from 'vue'
import { Layout } from '@/components/layout/layout'
import { Button, InputNumber, message } from '@ghcloud/cube-ui'
import { useRoute } from 'vue-router'
import { DynamicFormRender } from '@ghcloud/dynamic-form-render'
import type { DynamicFormRenderOptionProps } from '@ghcloud/dynamic-form-render/src/dynamic-form-render-props'
import type { FormExpose } from '@ghcloud/cube-ui/src/components/form/form'
import { VerticalLine } from '@ghcloud/generic-component'
import { supplementRulesDetail, supplementRulesPost } from '@/api/staff-supplement'
import { logger } from '@/logger'

/** 补卡规则表单 */
export const SupplementRulesForm = defineComponent({
  setup: () => {
    const { action, id } = useRoute().query
    const goBack = (): void => {
      history.back()
    }

    /** 标题 */
    const title = computed(() => {
      let res = '补卡规则'
      if (action === 'add') {
        res += ' / 新增'
      } else if (action === 'edit') {
        res += ' / 编辑'
      } else {
        res += ' / 详情'
      }
      return res
    })

    const typeOptions = [
      { label: '缺卡', value: 'LACK_CHECKED' },
      { label: '迟到', value: 'LATE_CHECKED' },
      { label: '早退', value: 'EARLY_CHECKED' },
    ]
    const supplementNumComp = (): JSX.Element => {
      return (
        <div style='display:flex;align-items:center'>
          每月允许补卡
          <div style='width:120px;margin:0 15px'>
            <InputNumber min={0} max={99} v-model:value={formData.value.times} />
          </div>
          次
        </div>
      )
    }
    const supplementDaysComp = (): JSX.Element => {
      return (
        <div style='display:flex;align-items:center'>
          <div style='width:120px;margin-right:15px'>
            <InputNumber min={0} max={99} v-model:value={formData.value.days} />
          </div>
          日内允许补卡
        </div>
      )
    }

    /** 表单实例 */
    const dynamicFormRenderRef = ref<{ formRef: FormExpose; }>()
    const options = computed(() => {
      const res: DynamicFormRenderOptionProps[] = [
        { title: '基本信息', key: 'layoutTitle', customComponent: VerticalLine, componentProps: { title: '基本信息' }, removeLabel: true },
        { title: '规则名称', key: 'name', componentName: 'TextInput', required: true, width: 40 },

        { title: '补卡规则', key: 'layoutTitle', customComponent: VerticalLine, componentProps: { title: '补卡规则' }, removeLabel: true },
        { title: '允许补卡类型', key: 'types', componentName: 'CheckboxGroup', componentProps: { options: typeOptions }, required: true },
        { title: '允许补卡次数', key: 'times', customComponent: supplementNumComp, required: true },
        { title: '允许补卡时限', key: 'days', customComponent: supplementDaysComp, required: true },

      ]
      res.forEach(e => {
        if (e.componentName === 'SelectInput' && e.componentProps) {
          (e.componentProps as { getPopupContainer: unknown; }).getPopupContainer = (): Element | null=> document.querySelector('.attendance-layout-content')
        }
      })
      if (action === 'detail') {
        res.forEach(e => {
          e.readonly = true
        })
      }
      return res
    })

    const formData = ref({
      name: '',
      times: null,
      days: null,
      types: []
    })

    const customValidatesRules = {

    }

    // 保存
    const saveLoading = ref(false)
    const save = async (): Promise<void> => {
      dynamicFormRenderRef.value?.formRef.clearValidate()
      await dynamicFormRenderRef.value?.formRef.validate()
      try {
        saveLoading.value = true
        const params = {
          ...formData.value,
          id
        }
        await supplementRulesPost({ ...params })
        message.success('操作成功')
        history.back()
      } catch (error) {
        logger.error(error)
      } finally {
        setTimeout(() => {
          saveLoading.value = false
        }, 1000)
      }
    }

    const init = ref(false)
    onMounted(async () => {
      if (action !== 'add') {
        if (id) {
          const res = await supplementRulesDetail({ id: id as string })
          if (res.data) {
            formData.value.name = res.data.name
            formData.value.times = res.data.times as never
            formData.value.days = res.data.days as never
            formData.value.types = res.data.types as never[]
          }
        }
      }
      setTimeout(() => {
        init.value = true
      }, 0)
    })

    const layoutSlots = {
      'layout-content': (): VNode | undefined => {
        if (!init.value) {
          return
        }
        return (
          <>
            <DynamicFormRender
              formOptions={options.value}
              customValidatesRules={customValidatesRules}
              labelWidth='150px'
              v-model:formData={formData.value}
              ref={dynamicFormRenderRef}
              style={{ margin: '20px' }}
            />
          </>
        )
      },
      'footer-page': (): VNode=> {
        return (
          <>
            <Button onClick={goBack}>返回</Button>
            {action !== 'detail' && <Button type='primary' style={{ marginLeft: '10px' }} loading={saveLoading.value} onClick={save}>保存</Button>}
          </>
        )
      }
    }
    return (): VNode=> <Layout title={title.value} v-slots={layoutSlots} />
  }
})
