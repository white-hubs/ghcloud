import { computed, defineComponent, onMounted, ref, type VNode } from 'vue'
import { Layout } from '@/components/layout/layout'
import { Button, message } from '@ghcloud/cube-ui'
import { useRoute } from 'vue-router'
import { DynamicFormRender } from '@ghcloud/dynamic-form-render'
import type { DynamicFormRenderOptionProps } from '@ghcloud/dynamic-form-render/src/dynamic-form-render-props'
import type { FormExpose, RuleObject } from '@ghcloud/cube-ui/src/components/form/form'
import { VerticalLine } from '@ghcloud/generic-component'
import { logger } from '@/logger'
import { OvertimeConfig } from '@/components/business/overtime-config/overtime-config'
import { OvertimeConfigOther } from '@/components/business/overtime-config/overtime-config-other'
import { overtimeRulesDetail, overtimeRulesPost, type OvertimeRule } from '@/api/staff-overtime'

/** 加班规则表单 */
export const OverTimeRulesForm = defineComponent({
  setup: () => {
    const { action, id } = useRoute().query
    const goBack = (): void => {
      history.back()
    }

    /** 标题 */
    const title = computed(() => {
      let res = '加班规则'
      if (action === 'add') {
        res += ' / 新增'
      } else if (action === 'edit') {
        res += ' / 编辑'
      } else {
        res += ' / 详情'
      }
      return res
    })

    /** 表单实例 */
    const dynamicFormRenderRef = ref<{ formRef: FormExpose; }>()
    const workRuleRef = ref<{ formRef: FormExpose; }>()
    const restRuleRef = ref<{ formRef: FormExpose; }>()
    const festivalRuleRef = ref<{ formRef: FormExpose; }>()

    const options = computed(() => {
      const res: DynamicFormRenderOptionProps[] = [
        { title: '基本信息', key: 'layoutTitle', customComponent: VerticalLine, componentProps: { title: '基本信息' }, removeLabel: true },
        { title: '规则名称', key: 'name', componentName: 'TextInput', required: true, width: 40 },
        { title: '加班规则', key: 'layoutTitle', customComponent: VerticalLine, componentProps: { title: '加班规则' }, removeLabel: true },
        { title: '工作日加班', key: 'workRule', customComponent: OvertimeConfig, componentProps: { title: '工作日加班', type: 'WORK', ref: workRuleRef }, removeLabel: true, width: 60 },
        { title: '休息日加班', key: 'restRule', customComponent: OvertimeConfig, componentProps: { title: '休息日加班', type: 'REST', ref: restRuleRef }, removeLabel: true, width: 60 },
        { title: '节假日加班', key: 'festivalRule', customComponent: OvertimeConfig, componentProps: { title: '节假日加班', type: 'FESTIVAL', ref: festivalRuleRef }, removeLabel: true, width: 60 },
        { title: '其他设置', key: 'upperLimit', customComponent: OvertimeConfigOther, componentProps: { title: '其他设置' }, removeLabel: true, width: 70 },
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
      upperLimitCycle: '',
      upperLimitDuration: '',
      upperLimit: {
        upperLimitCycle: undefined,
        upperLimitDuration: undefined,
      },
      workRule: {
        type: 'WORK',
        workCondition: 'ADVANCE',
        units: 'HOUR',
        method: 'APPROVAL',
        afterTime: null,
        compensate: '',
        compensationMethod: 'ARTIFICAL',
        proportion: 1
      },
      restRule: {
        type: 'REST',
        workCondition: 'ADVANCE',
        units: 'HOUR',
        method: 'APPROVAL',
        afterTime: null,
        compensate: '',
        compensationMethod: 'ARTIFICAL',
        proportion: 1
      },
      festivalRule: {
        type: 'FESTIVAL',
        workCondition: 'ADVANCE',
        units: 'HOUR',
        method: 'APPROVAL',
        afterTime: null,
        compensate: '',
        compensationMethod: 'ARTIFICAL',
        proportion: 1
      },
    })

    const checkName = async (): Promise<void> => {
      if (!formData.value.name.trim()) {
        return Promise.reject(new Error('请填写规则名称'))
      }
      if (!/^[\u4e00-\u9fa5\w\d]+$/.test(formData.value.name)) {
        return Promise.reject(new Error('仅支持包含中英文字符及数字'))
      }
      return Promise.resolve()
    }

    const customValidatesRules = {
      name: { required: true, trigger: 'change', validator: checkName } satisfies RuleObject,
    }

    // 保存
    const saveLoading = ref(false)
    const save = async (): Promise<void> => {
      dynamicFormRenderRef.value?.formRef.clearValidate()
      await Promise.all([
        dynamicFormRenderRef.value?.formRef.validate(),
        workRuleRef.value?.formRef.validate(),
        restRuleRef.value?.formRef.validate(),
        festivalRuleRef.value?.formRef.validate()
      ])
      try {
        saveLoading.value = true
        const params = {
          name: formData.value.name,
          upperLimitCycle: formData.value.upperLimit.upperLimitCycle,
          upperLimitDuration: formData.value.upperLimit.upperLimitDuration,
          ruleDetails: [
            { ...formData.value.workRule },
            { ...formData.value.restRule },
            { ...formData.value.festivalRule }
          ],
          id: id as string
        }
        await overtimeRulesPost({ ...params } as unknown as OvertimeRule)
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
          const res = await overtimeRulesDetail({ id: id as string })
          if (res.data) {
            formData.value.name = res.data.name
            formData.value.upperLimit = {
              upperLimitCycle: (res.data.upperLimitCycle || undefined) as unknown as undefined,
              upperLimitDuration: res.data.upperLimitDuration as unknown as undefined,
            }
            res.data.ruleDetails.forEach(element => {
              element.type === 'WORK' && (formData.value.workRule = element)
              element.type === 'REST' && (formData.value.restRule = element)
              element.type === 'FESTIVAL' && (formData.value.festivalRule = element)
            })
          }
        }
      }
      setTimeout(() => {
        init.value = true
      }, 0)
    })

    const layoutSlots = {
      'layout-content': (): VNode | undefined=> {
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
    return (): VNode => <Layout title={title.value} v-slots={layoutSlots} />
  }
})
