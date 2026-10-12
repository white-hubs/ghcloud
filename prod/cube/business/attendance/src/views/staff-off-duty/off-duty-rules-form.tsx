import { computed, defineComponent, onMounted, ref, type VNode } from 'vue'
import { Layout } from '@/components/layout/layout'
import { Button, InputNumber, message } from '@ghcloud/cube-ui'
import { useRoute } from 'vue-router'
import { DynamicFormRender } from '@ghcloud/dynamic-form-render'
import type { DynamicFormRenderOptionProps } from '@ghcloud/dynamic-form-render/src/dynamic-form-render-props'
import type { FormExpose } from '@ghcloud/cube-ui/src/components/form/form'
import { VerticalLine } from '@ghcloud/generic-component'
import { logger } from '@/logger'
import { offDutyRulesDetail, offDutyRulesInsert, offDutyRulesUpdate } from '@/api/staff-off-duty'

/** 离岗规则表单 */
export const OffDutyRulesForm = defineComponent({
  setup: () => {
    const { action, id } = useRoute().query
    const goBack = (): void => {
      history.back()
    }

    /** 标题 */
    const title = computed(() => {
      let res = '离岗规则'
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
      { label: '离岗前发起审批', value: true },
      { label: '无限制', value: false },
    ]
    const typeOptions1 = [
      { label: '按工作日计算离岗时长', value: 'WORKING_DAY' },
      { label: '按自然日计算离岗时长', value: 'CALENDAR_DAY' },
    ]
    const supplementNumComp = (): JSX.Element => {
      return (
        <div style='display:flex;align-items:center'>
          按
          <div style='width:120px;margin:0 15px'>
            <InputNumber min={0} max={99} v-model:value={formData.value.minAskUnit} />
          </div>
          小时离岗
          <span style='margin-left:20px;color:#00000073'>以x小时为最小单位计算，不足x小时的不能离岗</span>
        </div>
      )
    }

    /** 表单实例 */
    const dynamicFormRenderRef = ref<{ formRef: FormExpose; }>()
    const options = computed(() => {
      const res: DynamicFormRenderOptionProps[] = [
        { title: '基本信息', key: 'layoutTitle', customComponent: VerticalLine, componentProps: { title: '基本信息' }, removeLabel: true },
        { title: '规则名称', key: 'name', componentName: 'TextInput', required: true, width: 40 },

        { title: '离岗规则', key: 'layoutTitle', customComponent: VerticalLine, componentProps: { title: '离岗规则' }, removeLabel: true },
        { title: '离岗审批条件', key: 'beforeApply', componentName: 'RadioGroup', componentProps: { options: typeOptions }, required: true },
        { title: '最小离岗单位', key: 'minAskUnit', customComponent: supplementNumComp, required: true },
        { title: '离岗时长核算', key: 'calculationWay', componentName: 'RadioGroup', componentProps: { options: typeOptions1 }, required: true },
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
      minAskUnit: 1,
      calculationWay: 'WORKING_DAY',
      beforeApply: true
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
        }
        if (action === 'add') {
          await offDutyRulesInsert(params)
        } else {
          await offDutyRulesUpdate({ ...params, id: id as string })
        }
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
          const res = await offDutyRulesDetail({ id: id as string })
          if (res.data) {
            formData.value.name = res.data.name
            formData.value.minAskUnit = res.data.minAskUnit
            formData.value.calculationWay = res.data.calculationWay
            formData.value.beforeApply = res.data.beforeApply
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
    return (): VNode=> <Layout title={title.value} v-slots={layoutSlots} />
  }
})
