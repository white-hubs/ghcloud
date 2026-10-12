import { computed, defineComponent, onMounted, ref, watch, type VNode } from 'vue'
import { Layout } from '@/components/layout/layout'
import { AntModal, Button, message } from '@ghcloud/cube-ui'
import { useRoute } from 'vue-router'
import { DynamicFormRender } from '@ghcloud/dynamic-form-render'
import type { DynamicFormRenderOptionProps } from '@ghcloud/dynamic-form-render/src/dynamic-form-render-props'
import type { FormExpose } from '@ghcloud/cube-ui'
import { VerticalLine } from '@ghcloud/generic-component'
import style from '@/assets/style.module.less'
import { UserPickerTable } from '@/components/business/user-picker-table/user-picker-table'
import { attendanceGroupInsert, type AttendanceGroup, type StaffList, attendanceGroupUpdate, attendanceGroupDetail, attendanceGroupPreChecked } from '@/api/attendance-group'
import { SchedulingRuleSelect } from '@/components/business/scheduling-rules-select/scheduling-rules-select'
import { ClockInRuleSelect } from '@/components/business/clock-in-rule-select/clock-in-rule-select'
import { schedulingRuleDetail, type RulesClassesList, type Limit } from '@/api/scheduling-manage'
import { SchedulingRulesClassesSelectTable } from '@/components/business/scheduling-rules-classes-select-table/scheduling-rules-classes-select-table'
import { clockInRulesDetail } from '@/api/staff-clock-in'
import { ClockInRuleSettingMachineSelectTable } from '@/components/business/clock-in-rule-setting-machine-select-table/clock-in-rule-setting-machine-select-table'
import { ClockInRuleSettingGPSPickerTable } from '@/components/business/clock-in-rule-setting-gps-pick-table/clock-in-rule-setting-gps-pick-table'
import { SchedulingRulesLimit } from '@/components/business/scheduling-rules-limit/scheduling-rules-limit'
import { SupplementRulesSelect } from '@/components/business/supplement-rules-select/supplement-rules-select'
import { logger } from '@/logger'
import { LeaveRulesSelect } from '@/components/business/leave-rules-select/leave-rules-select'
import { OffDutyRulesSelect } from '@/components/business/off-duty-rules-select/off-duty-rules-select'
import { ClassesSelectTable } from '@/components/business/classes-select-table/classes-select-table'
import { BusinessTripRulesSelect } from '@/components/business/business-trip-rules-select/business-trip-rules-select'
import { functionDictionaryStore } from '@/store/function-dictionary'
import { OverTimeRulesSelect } from '@/components/business/overtime-rules-select/overtime-rules-select'

export const AttendanceGroupForm = defineComponent({
  setup: () => {
    const { action, id } = useRoute().query
    const goBack = (): void => {
      history.back()
    }

    /** 标题 */
    const title = computed(() => {
      let res = '考勤组'
      if (action === 'add') {
        res += ' / 新增'
      } else if (action === 'edit') {
        res += ' / 编辑'
      } else {
        res += ' / 详情'
      }
      return res
    })

    const showLimit = computed(() => {
      if (formData.value.schedulingWays === 'SHIFTS' && formData.value.limit) {
        let limit = false
        for (const key in formData.value.limit) {
          (formData.value.limit as Record<string, unknown>)[key] && (limit = true)
        }
        return limit
      }
      return false
    })

    /** 表单实例 */
    const dynamicFormRenderRef = ref<{ formRef: FormExpose; }>()
    const options = computed(() => {
      const clockInWaysSetting = []
      if (formData.value.clockInWays?.includes('DEVICE')) {
        clockInWaysSetting.push(
          { title: '打卡规则', key: 'deviceList', customComponent: ClockInRuleSettingMachineSelectTable, readonly: true, hiddenLabel: true },
        )
      }
      if (formData.value.clockInWays?.includes('GPS')) {
        clockInWaysSetting.push(
          { title: '打卡规则', key: 'gpsSetting', customComponent: ClockInRuleSettingGPSPickerTable, readonly: true, hiddenLabel: true },
        )
      }

      const res: DynamicFormRenderOptionProps[] = [
        // 基本信息
        { title: '基本信息', key: 'layoutTitle', customComponent: VerticalLine, componentProps: { title: '基本信息' }, removeLabel: true },
        { title: '考勤组名称', key: 'name', componentName: 'TextInput', required: true, customClass: style['w-50'] },
        { title: '适用范围', key: 'ranges', componentName: 'SelectInput', componentProps: { disabled: action !== 'add', getPopupContainer: () => document.querySelector('.attendance-layout-content'), options: [{ label: '所有人', value: 'ALL' }, { label: '部分人', value: 'PART' }] }, required: true, customClass: style['w-50'] },
        { title: '适用人员', key: 'staffList', customComponent: UserPickerTable, required: formData.value.ranges === 'PART', customClass: formData.value.ranges === 'PART' ? '' : style.hide },
        { title: '考勤班次', key: 'groupClassList', customComponent: ClassesSelectTable, required: true },
      ]

      if (functionDictionaryStore.find(e => e.code === 'ARRANGE')) {
        res.push(
          // 排班规则
          { title: '排班规则', key: 'layoutTitle', customComponent: VerticalLine, componentProps: { title: '排班规则' }, removeLabel: true },
          { title: '排班规则', key: 'schedulingRuleId', customComponent: SchedulingRuleSelect, required: true, customClass: `${style['w-50']} ${style.block}` },
          { title: '排班方式', key: 'schedulingWays', componentName: 'SelectInput', componentProps: { options: [{ label: '固定班制', value: 'FIXED' }, { label: '倒班制', value: 'SHIFTS' }] }, readonly: true, customClass: formData.value.schedulingRuleId ? style['w-50'] : style.hide },
          { title: '班次选择', key: 'classesSelect', customComponent: SchedulingRulesClassesSelectTable, readonly: true, componentProps: { schedulingWay: formData.value.schedulingWays }, hiddenLabel: true, customClass: formData.value.schedulingWays === 'FIXED' ? '' : style.hide },
          { title: '限制条件', key: 'limit', customComponent: SchedulingRulesLimit, hiddenLabel: true, readonly: true, customClass: showLimit.value ? '' : style.hide },
        )
      }
      if (functionDictionaryStore.find(e => e.code === 'CLOCK_IN')) {
        res.push(
          // 打卡规则
          { title: '打卡规则', key: 'layoutTitle', customComponent: VerticalLine, componentProps: { title: '打卡规则' }, removeLabel: true },
          { title: '打卡规则', key: 'clockRuleId', customComponent: ClockInRuleSelect, required: true, customClass: `${style['w-50']} ${style.block}` },
          { title: '打卡方式', key: 'clockInWays', componentName: 'CheckboxGroup', componentProps: { options: [{ label: '考勤机打卡', value: 'DEVICE' }, { label: 'GPS地点打卡', value: 'GPS' }] }, readonly: true, customClass: formData.value.clockRuleId ? style['w-50'] : style.hide },
          ...clockInWaysSetting,
        )
      }
      if (functionDictionaryStore.find(e => e.code === 'LEAVE')) {
        res.push(
          // 请假规则
          { title: '请假规则', key: 'layoutTitle', customComponent: VerticalLine, componentProps: { title: '请假规则' }, removeLabel: true },
          { title: '请假规则', key: 'holidayRuleList', customComponent: LeaveRulesSelect, required: true },
        )
      }
      if (functionDictionaryStore.find(e => e.code === 'REPAIR_CLOCK')) {
        res.push(
          // 补卡规则
          { title: '补卡规则', key: 'layoutTitle', customComponent: VerticalLine, componentProps: { title: '补卡规则' }, removeLabel: true },
          { title: '补卡规则', key: 'cardRuleList', customComponent: SupplementRulesSelect, required: true },
        )
      }
      if (functionDictionaryStore.find(e => e.code === 'OVERTIME')) {
        res.push(
          // 加班规则
          { title: '加班规则', key: 'layoutTitle', customComponent: VerticalLine, componentProps: { title: '加班规则' }, removeLabel: true },
          { title: '加班规则', key: 'overtimeRuleList', customComponent: OverTimeRulesSelect, required: true },
        )
      }
      if (functionDictionaryStore.find(e => e.code === 'POST')) {
        res.push(
          // 离岗规则
          { title: '离岗规则', key: 'layoutTitle', customComponent: VerticalLine, componentProps: { title: '离岗规则' }, removeLabel: true },
          { title: '离岗规则', key: 'leavePostRuleList', customComponent: OffDutyRulesSelect, required: true },
        )
      }
      if (functionDictionaryStore.find(e => e.code === 'AWAY')) {
        res.push(
          // 出差规则
          { title: '出差规则', key: 'layoutTitle', customComponent: VerticalLine, componentProps: { title: '出差规则' }, removeLabel: true },
          { title: '出差规则', key: 'awayBusinessRuleList', customComponent: BusinessTripRulesSelect, required: true },
        )
      }

      if (action === 'detail') {
        res.forEach(e => {
          e.readonly = true
        })
      }
      return res
    })

    const formData = ref<AttendanceGroup & {
      staffList: StaffList[];
      schedulingWays?: string;
      clockInWays?: string;
      classesSelect?: { legalHolidaysRest: boolean;rulesClassesList: RulesClassesList[]; };
      deviceList: unknown[];
      gpsSetting: Record<string, unknown>;
      limit?: Limit;
      groupClassList: { id: string; }[];
      cardRuleList: { id: string; }[];
      overtimeRuleList: { id: string; }[];
      holidayRuleList: { id: string; }[];
      leavePostRuleList: { id: string; }[];
      awayBusinessRuleList: { id: string; }[];
    }>({
      name: '',
      ranges: undefined,
      groupStaffList: [],
      staffList: [],
      schedulingRuleId: undefined,
      clockRuleId: undefined,
      classesSelect: {
        legalHolidaysRest: false,
        rulesClassesList: []
      },
      deviceList: [],
      gpsSetting: {
        locationList: [],
        faceRecognition: false,
        outClock: false,
      },
      groupClassIds: undefined,
      groupClassList: [],
      cardRuleIds: undefined,
      cardRuleList: [],
      overtimeRuleId: undefined,
      overtimeRuleList: [],
      holidayRuleIds: undefined,
      holidayRuleList: [],
      leavePostRuleId: undefined,
      leavePostRuleList: [],
      awayBusinessRuleId: undefined,
      awayBusinessRuleList: []
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
        const params: AttendanceGroup = {
          name: formData.value.name,
          ranges: formData.value.ranges,
          groupStaffList: formData.value.ranges === 'PART'
            ? formData.value.staffList.map(e => {
              return {
                deptId: e.organizations.length ? e.organizations[e.organizations.length - 1].id : '',
                deptName: e.organizations.length ? e.organizations[e.organizations.length - 1].name : '',
                id: e.id,
                mobile: e.mobile,
                name: e.name,
                organizations: JSON.stringify(e.organizations)
              }
            })
            : [],
          schedulingRuleId: formData.value.schedulingRuleId,
          clockRuleId: formData.value.clockRuleId,
          groupClassIds: formData.value.groupClassList.map(e => e.id).join(','),
          cardRuleIds: formData.value.cardRuleList.map(e => e.id).join(','),
          holidayRuleIds: formData.value.holidayRuleList.map(e => e.id).join(','),
          overtimeRuleId: formData.value.overtimeRuleList.map(e => e.id).join(','),
          leavePostRuleId: formData.value.leavePostRuleList.map(e => e.id).join(','),
          awayBusinessRuleId: formData.value.awayBusinessRuleList.map(e => e.id).join(','),
        }
        const handelSubmit = async (): Promise<void> => {
          if (action === 'add') {
            await attendanceGroupInsert(params)
          } else {
            await attendanceGroupUpdate({ ...params, id: id as string })
          }
          message.success('操作成功')
          history.back()
        }
        const preCheck = await attendanceGroupPreChecked({ ...params, id: action === 'add' ? undefined : id as string })
        if (preCheck.data) {
          AntModal.confirm({
            centered: true,
            title: preCheck.data as string + '，是否保存',
            onOk: handelSubmit
          })
          return
        }
        handelSubmit()
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
          const res = await attendanceGroupDetail({ id: id as string }, action !== 'edit')
          if (res.data) {
            formData.value.name = res.data.name
            formData.value.ranges = res.data.ranges
            formData.value.staffList = res.data.groupStaffList
              ? res.data.groupStaffList.map(e => {
                return {
                  organizations: e.organizations ? JSON.parse(e.organizations) : [],
                  id: e.id,
                  name: e.name,
                  mobile: e.mobile
                }
              })
              : []
            if (res.data.ranges === 'ALL') {
              formData.value.staffList = []
            }
            formData.value.schedulingRuleId = res.data.schedulingRuleId
            formData.value.clockRuleId = res.data.clockRuleId
            formData.value.groupClassList = res.data.groupClassList
            formData.value.cardRuleList = res.data.cardRuleList
            formData.value.holidayRuleList = res.data.holidayRuleList
            formData.value.leavePostRuleList = res.data.leavePostRuleId ? [res.data.leavePostRule] : []
            formData.value.overtimeRuleList = res.data.overtimeRuleId ? [res.data.overtimeRule] : []
            formData.value.awayBusinessRuleList = res.data.awayBusinessRuleId ? [res.data.awayBusinessRule] : []
            setTimeout(() => {
              dynamicFormRenderRef.value?.formRef.clearValidate()
            }, 1000)
          }
        }
      }
      setTimeout(() => {
        init.value = true
      }, 0)
    })

    // 回显打卡规则与排班规则详情
    watch(() => formData.value.schedulingRuleId, () => {
      if (formData.value.schedulingRuleId) {
        schedulingRuleDetail({ id: formData.value.schedulingRuleId.toString() }).then(res => {
          formData.value.schedulingWays = res.data.ways
          formData.value.classesSelect = {
            legalHolidaysRest: res.data.legalHolidaysRest,
            rulesClassesList: res.data.rulesClassesList
          }
          formData.value.limit = {
            continuousDays: (res.data.continuousDays as unknown as number) || null,
            intervalHour: (res.data.intervalHour as unknown as number) || null,
            sameShift: res.data.sameShift ? JSON.parse(res.data.sameShift as string) : [{ sameShiftNumber: null, sameShiftType: null }]
          }
        })
      }
    })

    watch(() => formData.value.clockRuleId, () => {
      if (formData.value.clockRuleId) {
        clockInRulesDetail({ id: formData.value.clockRuleId.toString() }).then(res => {
          formData.value.clockInWays = res.data.ways
          formData.value.deviceList = res.data.deviceList as never[]
          formData.value.gpsSetting.faceRecognition = res.data.faceRecognition
          formData.value.gpsSetting.outClock = res.data.outClock
          formData.value.gpsSetting.locationList = res.data.locationList
        })
      }
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
    return (): VNode => <Layout title={title.value} v-slots={layoutSlots} />
  }
})
