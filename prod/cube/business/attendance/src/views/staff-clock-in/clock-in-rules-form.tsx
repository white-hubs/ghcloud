import { computed, defineComponent, onMounted, ref, type VNode } from 'vue'
import { Layout } from '@/components/layout/layout'
import { Button, message } from '@ghcloud/cube-ui'
import { useRoute } from 'vue-router'
import { DynamicFormRender } from '@ghcloud/dynamic-form-render'
import type { DynamicFormRenderOptionProps } from '@ghcloud/dynamic-form-render/src/dynamic-form-render-props'
import type { FormExpose, RuleObject } from '@ghcloud/cube-ui'
import { VerticalLine } from '@ghcloud/generic-component'
import style from '@/assets/style.module.less'
import { clockInRulesInsert, type ClockInRules, type DeviceParam, type LocationParam, clockInRulesDetail, clockInRulesUpdate } from '@/api/staff-clock-in'
import { ClockInRuleSettingMachineSelectTable } from '@/components/business/clock-in-rule-setting-machine-select-table/clock-in-rule-setting-machine-select-table'
import { ClockInRuleSettingGPSPickerTable } from '@/components/business/clock-in-rule-setting-gps-pick-table/clock-in-rule-setting-gps-pick-table'
import { logger } from '@/logger'

export const ClockInRulesForm = defineComponent({
  setup: () => {
    const { action, id } = useRoute().query
    const goBack = (): void => {
      history.back()
    }

    /** 标题 */
    const title = computed(() => {
      let res = '打卡规则'
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
      const res: DynamicFormRenderOptionProps[] = [
        // 基本信息
        { title: '基本信息', key: 'layoutTitle', customComponent: VerticalLine, componentProps: { title: '基本信息' }, removeLabel: true },
        { title: '打卡规则名称', key: 'name', componentName: 'TextInput', required: true, customClass: style['w-50'], componentProps: { maxlength: 30 } },
        // 打卡规则
        { title: '打卡规则', key: 'layoutTitle', customComponent: VerticalLine, componentProps: { title: '打卡规则' }, removeLabel: true },
        { title: '打卡方式', key: 'ways', componentName: 'CheckboxGroup', componentProps: { options: [{ label: '考勤机打卡', value: 'DEVICE' }, { label: 'GPS地点打卡', value: 'GPS' }] }, required: true, customClass: style['w-50'] },
        { title: '考勤机', key: 'deviceList', customComponent: ClockInRuleSettingMachineSelectTable, hiddenLabel: true, hidden: !(formData.value.ways as string[]).includes('DEVICE') },
        { title: '考勤地点', key: 'gpsSetting', customComponent: ClockInRuleSettingGPSPickerTable, hiddenLabel: true, hidden: !(formData.value.ways as string[]).includes('GPS') },
      ]

      if (action === 'detail') {
        res.forEach(e => {
          e.readonly = true
        })
      }
      return res
    })

    const formData = ref({
      name: '',
      ways: [],
      deviceList: [],
      gpsSetting: {
        locationList: [],
        faceRecognition: true,
        outClock: false,
      }
    })

    const checkDeviceList = async (rule: unknown, value: unknown[]): Promise<void> => {
      if ((formData.value.ways as string[]).includes('DEVICE') && !value.length) {
        return Promise.reject(new Error('请添加考勤机'))
      }
      return Promise.resolve()
    }

    const checkGpsSetting = async (rule: unknown, value: { locationList: unknown[]; }): Promise<void> => {
      if ((formData.value.ways as string[]).includes('GPS') && !value.locationList.length) {
        return Promise.reject(new Error('请添加考勤地点'))
      }
      return Promise.resolve()
    }

    const customValidatesRules = {
      deviceList: { trigger: 'change', validator: checkDeviceList } satisfies RuleObject,
      gpsSetting: { trigger: 'change', validator: checkGpsSetting } satisfies RuleObject,
    }

    // 保存
    const saveLoading = ref(false)
    const save = async (): Promise<void> => {
      dynamicFormRenderRef.value?.formRef.clearValidate()
      await dynamicFormRenderRef.value?.formRef.validate()
      try {
        saveLoading.value = true
        const params: ClockInRules = {
          name: formData.value.name,
          ways: formData.value.ways.join(','),
          deviceList: formData.value.deviceList.map((item) => {
            return {
              id: (item as DeviceParam).id,
              code: (item as DeviceParam).code,
              modelName: (item as DeviceParam).modelName,
              name: (item as DeviceParam).name,
              genreName: (item as DeviceParam).genreName,
            }
          }),
          locationList: formData.value.gpsSetting.locationList.map((item) => {
            return {
              address: (item as LocationParam).address,
              latitude: (item as LocationParam).latitude,
              longitude: (item as LocationParam).longitude,
              ranges: (item as LocationParam).ranges,
            }
          }),
          faceRecognition: formData.value.gpsSetting.faceRecognition,
          outClock: formData.value.gpsSetting.outClock,
        }
        if (action === 'add') {
          await clockInRulesInsert(params)
        } else {
          await clockInRulesUpdate({ ...params, id: id as string })
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
          const res = await clockInRulesDetail({ id: id as string })
          if (res.data) {
            formData.value.name = res.data.name
            formData.value.ways = res.data.ways.split(',') as never[]
            formData.value.gpsSetting.faceRecognition = res.data.faceRecognition
            formData.value.gpsSetting.outClock = res.data.outClock
            formData.value.gpsSetting.locationList = res.data.locationList as never[]
            formData.value.deviceList = res.data.deviceList as never[]
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
      'footer-page': (): VNode => {
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
