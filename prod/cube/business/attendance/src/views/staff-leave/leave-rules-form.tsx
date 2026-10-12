import { computed, defineComponent, onMounted, ref, type VNode } from 'vue'
import { Layout } from '@/components/layout/layout'
import { Button, DatePicker, InputNumber, message } from '@ghcloud/cube-ui'
import { useRoute } from 'vue-router'
import { DynamicFormRender } from '@ghcloud/dynamic-form-render'
import type { DynamicFormRenderOptionProps } from '@ghcloud/dynamic-form-render/src/dynamic-form-render-props'
import type { FormExpose, RuleObject } from '@ghcloud/cube-ui/src/components/form/form'
import style from '@/assets/style.module.less'
import { LeaveQuotaConfig } from '@/components/business/leave-quota-config/leave-quota-config'
import { LeaveExpiryDate } from '@/components/business/leave-expiry-date/leave-expiry-date'
import { leaveRulesDetail, type LeaveRules, type Quota, leaveRulesInsert, leaveRulesUpdate, getHolidayList } from '@/api/staff-leave'
import { logger } from '@/logger'

export const LeaveRulesForm = defineComponent({
  setup: () => {
    const { action, id } = useRoute().query
    const goBack = (): void => {
      history.back()
    }

    /** 标题 */
    const title = computed(() => {
      let res = '假期规则'
      if (action === 'add') {
        res += ' / 新增'
      } else if (action === 'edit') {
        res += ' / 编辑'
      } else {
        res += ' / 详情'
      }
      return res
    })

    const grantWayOptions = [
      { label: '每年自动发放一次', value: 'EVERY_YEAR' },
      { label: '加班时长自动计入余额', value: 'OVERTIME_APPEND' }
    ]
    const convertWayOptions = [
      { label: '按工作日计算时长', value: 'WORKING_DAY' },
      { label: '按自然日计算时长', value: 'CALENDAR_DAY' },
    ]
    const trueOrFalse = [
      { label: '是', value: true },
      { label: '否', value: false },
    ]
    const holidayTypeOptions = ref<{ label: string;value: string; }[]>([])

    /** 最小请假单位组件 */
    const leaveMiniUnit = (): JSX.Element => {
      return (
        <div style='display:flex;align-items:center'>
          按
          <div style='width:120px;margin:0 15px'>
            <InputNumber min={0} max={99} v-model:value={formData.value.minAskUnit} />
          </div>
          小时请假
          <span style='font-size:12px;margin-left:20px;color:rgba(0, 0, 0, 0.25)'>以x小时为最小单位计算，请假时长或假期余额不足x小时的不能请假</span>
        </div>
      )
    }

    /** 日折算时长 */
    const dayTranslateTime = (): JSX.Element => {
      return (
        <div style='display:flex;align-items:center'>
          <div style='width:120px;margin-right:15px'>
            <InputNumber min={0} max={99} v-model:value={formData.value.dayOfHour} />
          </div>
          小时=1天
        </div>
      )
    }

    /** 发放日期 */
    const grantTimeComp = (): JSX.Element => {
      return (
        <div style='display:flex;align-items:center'>
          <DatePicker
            v-model:value={formData.value.grantDate}
            dropdownClassName='month-day-picker'
            format='MM-DD'
            valueFormat='MM-DD'
            getPopupContainer={() => document.querySelector('.attendance-layout-content')}
          />
        </div>
      )
    }

    /** 表单实例 */
    const dynamicFormRenderRef = ref<{ formRef: FormExpose; }>()
    const options = computed(() => {
      const res: DynamicFormRenderOptionProps[] = [
        { title: '假期名称', key: 'name', componentName: 'TextInput', required: true, width: 30 },
        { title: '假期类型', key: 'holidayType', componentName: 'SelectInput', componentProps: { options: holidayTypeOptions.value }, required: true, width: 30 },
        { title: '是否计入缺勤', key: 'intoAbsence', componentName: 'RadioGroup', componentProps: { options: trueOrFalse }, required: true, width: 30, customClass: style.block },
        { title: '最小请假单位', key: 'minAskUnit', customComponent: leaveMiniUnit, required: true, width: 100, customClass: style.block },
        { title: '日折算时长', key: 'dayOfHour', customComponent: dayTranslateTime },
        { title: '请假时长核算', key: 'calculationWay', componentName: 'SelectInput', componentProps: { options: convertWayOptions }, required: true, width: 30 },
        { title: '假期额度', key: 'notLimit', componentName: 'RadioGroup', componentProps: { options: [{ label: '限制', value: false }, { label: '不限制', value: true }] } },
        { title: '发放方式', key: 'grantWay', componentName: 'SelectInput', componentProps: { options: grantWayOptions }, required: !formData.value.notLimit, width: 30, customClass: !formData.value.notLimit ? style.block : style.hide },
        { title: '发放日期', key: 'grantDate', customComponent: grantTimeComp, required: requiredQuota.value, width: 30, customClass: requiredQuota.value ? style.block : style.hide },
        { title: '额度配置', key: 'quota', customComponent: LeaveQuotaConfig, componentProps: { action }, required: requiredQuota.value, width: 100, customClass: requiredQuota.value ? style.block : style.hide },
        { title: '额度有效期', key: 'validity', customComponent: LeaveExpiryDate, required: !formData.value.notLimit, width: 100, customClass: !formData.value.notLimit ? style.block : style.hide },
      ]
      res.forEach(e => {
        if (e.componentName === 'SelectInput' && e.componentProps) {
          (e.componentProps as { getPopupContainer: unknown; }).getPopupContainer = (): Element | null => document.querySelector('.attendance-layout-content')
        }
      })
      if (action === 'detail') {
        res.forEach(e => {
          e.readonly = true
        })
      }
      return res
    })

    const formData = ref<LeaveRules>({
      name: '',
      notLimit: true,
      calculationWay: undefined,
      dayOfHour: null,
      grantDate: '',
      grantWay: 'EVERY_YEAR',
      minAskUnit: null,
      quota: '',
      validity: '',
      intoAbsence: false,
      holidayType: undefined,
    })

    /** 是否需要发放日期和配置额度 */
    const requiredQuota = computed(() => {
      return !formData.value.notLimit && formData.value.grantWay !== 'OVERTIME_APPEND'
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
    const checkQuota = async (): Promise<void> => {
      if (!requiredQuota.value) {
        return Promise.resolve()
      }
      if (!formData.value.quota) {
        return Promise.reject(new Error('请完善额度配置'))
      }
      const quota = formData.value.quota as Quota
      if (quota.quotaType === 'FIXED' && !quota.fixedNumber) {
        return Promise.reject(new Error('请完善额度配置'))
      }

      if (['SOCIETY_AGE', 'COMPANY_AGE'].includes(quota.quotaType)) {
        if (quota.quotaLevelList.length === 0) {
          return Promise.reject(new Error('请完善额度配置'))
        }
        if (quota.quotaLevelList.find(e => !e.ageYear || !e.holidayNumber)) {
          return Promise.reject(new Error('请完善额度配置'))
        }
      }

      return Promise.resolve()
    }
    const customValidatesRules = {
      name: { required: true, trigger: 'change', validator: checkName } satisfies RuleObject,
      quota: { required: requiredQuota.value, trigger: 'change', validator: checkQuota } satisfies RuleObject,
    }

    // 保存
    const saveLoading = ref(false)
    const save = async (): Promise<void> => {
      dynamicFormRenderRef.value?.formRef.clearValidate()
      await dynamicFormRenderRef.value?.formRef.validate()
      try {
        saveLoading.value = true
        const params: LeaveRules = {
          name: formData.value.name,
          minAskUnit: formData.value.minAskUnit,
          notLimit: formData.value.notLimit,
          calculationWay: formData.value.calculationWay,
          dayOfHour: formData.value.dayOfHour,
          grantDate: !formData.value.notLimit ? formData.value.grantDate : '',
          grantWay: !formData.value.notLimit ? formData.value.grantWay : '',
          quota: !formData.value.notLimit ? JSON.stringify(formData.value.quota) : '',
          validity: !formData.value.notLimit ? JSON.stringify(formData.value.validity) : '',
          intoAbsence: formData.value.intoAbsence,
          holidayType: formData.value.holidayType,
        }
        if (action === 'add') {
          await leaveRulesInsert(params)
        } else {
          await leaveRulesUpdate({ ...params, id: id as string })
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
      await getHolidayList().then(res => {
        holidayTypeOptions.value = (res.data as { name: string; value: string; }[]).map(e => {
          return {
            label: e.value,
            value: e.name
          }
        })
      })
      if (action !== 'add') {
        if (id) {
          const res = await leaveRulesDetail({ id: id as string })
          if (res.data) {
            formData.value = res.data
            !formData.value.grantWay && (formData.value.grantWay = undefined)
            formData.value.quota && (formData.value.quota = JSON.parse(formData.value.quota as string))
            formData.value.validity && (formData.value.validity = JSON.parse(formData.value.validity as string))
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
      'footer-page': (): VNode => {
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
