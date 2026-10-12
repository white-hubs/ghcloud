import { computed, defineComponent, h, onMounted, ref, type VNode } from 'vue'
import { Layout } from '@/components/layout/layout'
import { Button, message } from '@ghcloud/cube-ui'
import { useRoute } from 'vue-router'
import { DynamicFormRender } from '@ghcloud/dynamic-form-render'
import type { DynamicFormRenderOptionProps } from '@ghcloud/dynamic-form-render/src/dynamic-form-render-props'
import type { FormExpose, RuleObject } from '@ghcloud/cube-ui'
import { VerticalLine } from '@ghcloud/generic-component'
import style from '@/assets/style.module.less'
import { SchedulingRulesClassesSelectTable } from '@/components/business/scheduling-rules-classes-select-table/scheduling-rules-classes-select-table'
import { SchedulingRulesLimit } from '@/components/business/scheduling-rules-limit/scheduling-rules-limit'
import { schedulingRuleInsert, type RulesClassesList, type SchedulingRule, schedulingRuleUpdate, schedulingRuleDetail, type Limit } from '@/api/scheduling-manage'
import { logger } from '@/logger'
import { KEYWORD_ALIAS } from '@ghcloud/cube-business-alias-manage-plugin'

export const SchedulingRulesForm = defineComponent({
  setup: () => {
    const { action, id } = useRoute().query
    const goBack = (): void => {
      history.back()
    }

    /** 标题 */
    const title = computed(() => {
      let res = '排班规则'
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
    const options = computed(() => {
      const classesSelect: DynamicFormRenderOptionProps[] = [
        { title: '排班规则', key: 'layoutTitle', customComponent: VerticalLine, componentProps: { title: '排班规则' }, removeLabel: true },
        { title: '排班方式', key: 'ways', componentName: 'SelectInput', componentProps: { getPopupContainer: () => document.querySelector('.attendance-layout-content'), options: [{ label: '固定班制', value: 'FIXED' }, { label: '倒班制', value: 'SHIFTS' }] }, required: true, customClass: style['w-50'] }
      ]
      if (formData.value.ways) {
        if (formData.value.ways === 'FIXED') {
          classesSelect.push(
            { title: '班次选择', key: 'classesSelect', customComponent: SchedulingRulesClassesSelectTable, required: true, componentProps: { schedulingWay: formData.value.ways }, hiddenLabel: true },
          )
        }
        if (formData.value.ways === 'SHIFTS') {
          classesSelect.push(
            { title: '提示', key: 'tips', customComponent: h('span', `前往${KEYWORD_ALIAS.staff}排班页，选择可用班次自定义排班`), hiddenLabel: true }
          )
          classesSelect.push(
            { title: '限制条件', key: 'limit', customComponent: SchedulingRulesLimit }
          )
        }
      }

      const res: DynamicFormRenderOptionProps[] = [
        // 基本信息
        { title: '基本信息', key: 'layoutTitle', customComponent: VerticalLine, componentProps: { title: '基本信息' }, removeLabel: true },
        { title: '排班规则名称', key: 'name', componentName: 'TextInput', required: true, customClass: style['w-50'], componentProps: { maxlength: 30 } },
        // 排班规则
        ...classesSelect,
      ]

      if (action === 'detail') {
        res.forEach(e => {
          e.readonly = true
        })
      }
      return res
    })

    const formData = ref<SchedulingRule & { limit: Limit; classesSelect: { legalHolidaysRest: boolean;rulesClassesList: RulesClassesList[]; }; }>({
      name: '',
      continuousDays: '',
      intervalHour: '',
      legalHolidaysRest: false,
      rulesClassesList: [],
      sameShift: [],
      ways: 'FIXED',
      classesSelect: {
        legalHolidaysRest: false,
        rulesClassesList: []
      },
      limit: {
        continuousDays: null,
        intervalHour: null,
        sameShift: [
          { sameShiftNumber: null, sameShiftType: null }
        ]
      }
    })

    const validateLimit = async (): Promise<void> => {
      let error = ''
      const classes: string[] = []
      logger.debug(formData.value.limit)
      formData.value.limit.sameShift.forEach(async e => {
        if (e.sameShiftNumber && e.sameShiftType?.length === 0) {
          error = '请选择限制条件中的班次'
        }
        if (!e.sameShiftNumber && e.sameShiftType?.length) {
          error = `请完善限制条件不允许一个月同一个${KEYWORD_ALIAS.staff}有超过....`
        }
        e.sameShiftType?.forEach(ele => {
          if (classes.includes(ele)) {
            error = '当前排班限制条件不允许班次重复'
          } else {
            classes.push(ele)
          }
        })
      })
      if (error) {
        return Promise.reject(new Error(error))
      }
      return Promise.resolve()
    }

    const customValidatesRules = {
      limit: { required: false, trigger: 'blur', validator: validateLimit } satisfies RuleObject,
    }

    // 保存
    const saveLoading = ref(false)
    const save = async (): Promise<void> => {
      dynamicFormRenderRef.value?.formRef.clearValidate()
      await dynamicFormRenderRef.value?.formRef.validate()
      try {
        saveLoading.value = true
        const params: SchedulingRule = {
          name: formData.value.name,
          ways: formData.value.ways,
          continuousDays: formData.value.limit.continuousDays ? formData.value.limit.continuousDays.toString() : '',
          intervalHour: formData.value.limit.intervalHour ? formData.value.limit.intervalHour.toString() : '',
          sameShift: JSON.stringify(formData.value.limit.sameShift),
          legalHolidaysRest: formData.value.classesSelect.legalHolidaysRest,
          rulesClassesList: formData.value.classesSelect.rulesClassesList.map(e => {
            return { id: e.id, name: e.name, week: e.week }
          }).filter(e => e.id),
        }

        if (formData.value.ways === 'FIXED') { // 固定班制不存在限制条件
          params.continuousDays = undefined
          params.intervalHour = undefined
          params.sameShift = ''
        } else {
          params.rulesClassesList = []
        }
        if (action === 'add') {
          await schedulingRuleInsert(params)
        } else {
          await schedulingRuleUpdate({ ...params, id: id as string })
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
          const res = await schedulingRuleDetail({ id: id as string })
          if (res.data) {
            formData.value.name = res.data.name
            formData.value.ways = res.data.ways
            formData.value.classesSelect = {
              legalHolidaysRest: res.data.legalHolidaysRest,
              rulesClassesList: res.data.rulesClassesList
            }
            formData.value.limit = {
              continuousDays: res.data.continuousDays as unknown as number || null,
              intervalHour: res.data.intervalHour as unknown as number || null,
              sameShift: res.data.sameShift ? JSON.parse(res.data.sameShift as string) : [{ sameShiftNumber: null, sameShiftType: null }]
            }
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
            <div class={style['attendance-group-form']}>
              <DynamicFormRender
                formOptions={options.value}
                customValidatesRules={customValidatesRules}
                labelWidth='150px'
                v-model:formData={formData.value}
                ref={dynamicFormRenderRef}
                style={{ margin: '20px' }}
              />
            </div>
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
