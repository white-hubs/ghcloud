import { computed, defineComponent, onMounted, ref, watch } from 'vue'
import { Layout } from '@/components/layout/layout'
import { Button, Textarea, message } from '@ghcloud/cube-ui'
import { useRoute } from 'vue-router'
import { DynamicFormRender } from '@ghcloud/dynamic-form-render'
import type { DynamicFormRenderOptionProps } from '@ghcloud/dynamic-form-render/src/dynamic-form-render-props'
import type { FormExpose, RuleObject } from '@ghcloud/cube-ui/src/components/form/form'
import ThemeSelectInput from '@/components/business/theme-select-input/theme-select-input'
import { type InsertTrainingTask, TrainingType, TrainingMode, TrainingModeOptions, TrainingTypeOptions, type CultivateCourseware, type CultivateUser } from '@/types/training-task'
import { trainingTaskDetail, trainingTaskInsert, trainingTaskUpdate } from '@/api/training-task'
import type { OSSFile } from '@ghcloud/generic-component'
import { CourseWarePickerTable } from '@/components/business/courseware-picker-table/courseware-picker-table'
import { ExamTaskSelectModal } from '@/components/business/exam-task-select-modal/exam-task-select-modal'
import { SpeakerSelectInput } from '@/components/business/speaker-select-input/speaker-select-input'
import { UserPickerTable } from '@/components/business/user-picker-table/user-picker-table'
import { useHeadMode } from '@/hook/use-head-mode'
import { MarketSelectTable } from '@/components/business/market-select-table/market-select-table'
import { cubeSecureEduHeadQuartersService, cubeSecureEduPublicService } from '@/api/server'
import { useAntDTheme } from '@/hook/use-antd-theme'

export const TrainingTaskForm = defineComponent({
  setup: () => {
    const { themeInject } = useAntDTheme()
    const { action, id, isHeadTask, isOutSideLink } = useRoute().query
    const goBack = (): void => {
      history.back()
    }
    const { isHeadMode } = useHeadMode()

    /** 标题 */
    const title = computed(() => {
      let res = '培训任务'
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
      const chargeUser = { title: '负责人', key: action === 'detail' || isHeadTask ? 'chargeUserName' : 'chargeUserId', width: 46, componentName: 'UserPickerInput', required: true, componentProps: { title: '选择负责人' } }
      const examTask = { title: '关联考试', key: action === 'detail' || isHeadTask ? 'examTaskName' : 'examTaskId', width: 46, customComponent: action === 'detail' || isHeadTask ? <span>{formData.value.examTaskName || '--'}</span> : ExamTaskSelectModal }
      const usersOrMarket = isHeadMode.value
        ? { title: '培训市场', key: 'cultivateTaskMarkets', width: 100, customComponent: MarketSelectTable, removeLabel: true, componentProps: { title: '培训市场' } }
        : { title: '培训人员', key: 'cultivateUsers', width: 100, customComponent: UserPickerTable, removeLabel: true, componentProps: { title: '培训人员' } }
      const cultivateUserNumber = { title: '参加培训人数', key: 'cultivateUserNumber', width: 46, componentName: 'NumberInput', required: true, componentProps: { placeholder: formData.value.cultivateTarget === TrainingType.STAFF ? '选择人员后自动计算' : '请输入人数', disabled: formData.value.cultivateTarget === TrainingType.STAFF, showCount: false, min: 0, max: 999 } }
      if (isHeadMode.value) {
        cultivateUserNumber.componentProps.placeholder = '请输入人数'
        cultivateUserNumber.componentProps.disabled = false
      }

      const res: DynamicFormRenderOptionProps[] = [
        { title: '任务名称', key: 'name', width: 46, componentName: 'TextInput', required: true },
        { title: '培训主题', key: 'themeId', width: 46, customComponent: ThemeSelectInput, required: true, componentProps: { options: action === 'detail' ? [{ label: formData.value.themeName, value: formData.value.themeId }] : undefined } },
        { title: '培训开始时间', key: 'cultivateStartTime', width: 46, componentName: 'DateTime', required: true, componentProps: { showTime: { format: 'HH:mm' }, valueFormat: 'YYYY-MM-DD HH:mm', format: 'YYYY-MM-DD HH:mm' } },
        { title: '培训结束时间', key: 'cultivateEndTime', width: 46, componentName: 'DateTime', required: true, componentProps: { showTime: { format: 'HH:mm' }, valueFormat: 'YYYY-MM-DD HH:mm', format: 'YYYY-MM-DD HH:mm' } },
        examTask,
        cultivateUserNumber,
        { title: '培训形式', key: 'cultivateMode', width: 46, componentName: 'RadioGroup', componentProps: { options: TrainingModeOptions, onchange: (): void => {
          dynamicFormRenderRef.value?.formRef.clearValidate('cultivateAddress')
        } } },
        { title: '培训地点', key: 'cultivateAddress', width: 46, componentName: 'TextInput', required: formData.value.cultivateMode === TrainingMode.OFFLINE },
        { title: '主讲人', key: 'speaker', width: 46, customComponent: SpeakerSelectInput },
        chargeUser,
        { title: '培训类型', key: 'cultivateTarget', width: 46, componentName: 'RadioGroup', componentProps: { options: TrainingTypeOptions }, required: true },
        { title: '迟到状态', key: 'lateStatus', width: 46, componentName: 'Switch', componentProps: { checkedChildren: '开启', unCheckedChildren: '关闭' }, required: true },
        { title: '培训内容', key: 'cultivateContent', width: 46, customComponent: action === 'detail' || isHeadTask ? <span>{formData.value.cultivateContent || '--'}</span> : <Textarea /> },
        usersOrMarket,
        { title: '培训课件', key: 'cultivateCoursewares', width: 100, customComponent: CourseWarePickerTable, removeLabel: true, componentProps: { title: '培训课件' } },
      ]
      if (action === 'detail') {
        res.forEach(e => {
          e.readonly = true
        })
      }

      // 总部下发的任务市场只可以编辑人员
      if (action === 'edit' && isHeadTask) {
        res.forEach((e) => {
          e.title !== '培训人员' && (e.readonly = true)
        })
      }

      if (isOutSideLink) {
        res.splice(res.length - 2, 1)
      }
      return res
    })

    const formData = ref<InsertTrainingTask & { themeName?: string; }>({
      name: '',
      themeId: undefined,
      cultivateStartTime: '',
      cultivateEndTime: '',
      examTaskId: '',
      cultivateUserNumber: undefined,
      cultivateMode: TrainingMode.OFFLINE,
      cultivateAddress: '',
      speaker: '',
      chargeUserId: '',
      cultivateTarget: TrainingType.MERCHANT,
      lateStatus: false,
      cultivateContent: '',
      cultivateCoursewares: [],
      cultivateUsers: [],
      cultivateTaskMarkets: [],
      themeName: ''
    })

    const validateTraningUsers = async (): Promise<void> => {
      if (isHeadMode.value) {
        return Promise.resolve()
      }
      if (formData.value.cultivateUsers.length === 0 && formData.value.cultivateTarget === TrainingType.STAFF) {
        return Promise.reject(new Error('请添加培训人员'))
      }
      return Promise.resolve()
    }
    const validateTraningMarket = async (): Promise<void> => {
      if (!isHeadMode.value) {
        return Promise.resolve()
      }
      if (formData.value.cultivateTaskMarkets.length === 0) {
        return Promise.reject(new Error('请添加培训市场'))
      }
      return Promise.resolve()
    }
    const customValidatesRules = {
      cultivateUsers: { required: true, trigger: 'change', validator: validateTraningUsers } satisfies RuleObject,
      cultivateTaskMarkets: { required: true, trigger: 'change', validator: validateTraningMarket } satisfies RuleObject,
      chargeUserId: { required: true, trigger: 'change', message: '请选择负责人' } satisfies RuleObject,
    }

    // 培训类型切换
    watch(() => formData.value.cultivateTarget, () => {
      if (formData.value.cultivateTarget === TrainingType.STAFF && !isHeadMode.value && action !== 'detail') {
        formData.value.cultivateUserNumber = formData.value.cultivateUsers.length > 0 ? formData.value.cultivateUsers.length : undefined
        dynamicFormRenderRef.value?.formRef.clearValidate('cultivateUserNumber')
      }
      if (init.value) {
        formData.value.cultivateUsers = []
      }
    })
    // 计算人数
    watch(() => formData.value.cultivateUsers.length, () => {
      if (action !== 'detail') {
        formData.value.cultivateUserNumber = formData.value.cultivateUsers.length > 0 ? formData.value.cultivateUsers.length : undefined
        dynamicFormRenderRef.value?.formRef.clearValidate('cultivateUserNumber')
        dynamicFormRenderRef.value?.formRef.clearValidate('cultivateUsers')
      }
    })
    watch(() => formData.value.cultivateTaskMarkets.length, () => {
      dynamicFormRenderRef.value?.formRef.clearValidate('cultivateTaskMarkets')
    })

    // 监听负责人值变化
    watch(() => formData.value.chargeUserId, () => {
      if (action !== 'detail') {
        dynamicFormRenderRef.value?.formRef.clearValidate('chargeUserId')
      }
    })

    // 保存
    const saveLoading = ref(false)
    const save = async (): Promise<void> => {
      dynamicFormRenderRef.value?.formRef.clearValidate()
      await dynamicFormRenderRef.value?.formRef.validate()
      try {
        saveLoading.value = true
        const params: InsertTrainingTask = {
          ...formData.value,
          chargeUserName: (formData.value.chargeUserId as unknown as [{ name: string; }])[0].name,
          chargeUserId: (formData.value.chargeUserId as unknown as [{ id: string; }])[0].id,
          cultivateCoursewares: (formData.value.cultivateCoursewares as unknown as { file: OSSFile & { duration: number; }; }[]).map(e => {
            return {
              fileName: e.file.name,
              fileSize: e.file.size as unknown as string,
              fileIds: e.file.id,
              duration: e.file.duration
            }
          }),
          cultivateUsers: !isHeadMode.value
            ? formData.value.cultivateUsers.map(e => {
              const user = e as unknown as { id: string; name: string; mobile: string; organizations: { id: string; name: string; }[]; positions: { id: string; name: string; }[]; }
              return {
                userDepartmentId: user.organizations.length ? user.organizations[0].id : '',
                userDepartmentName: user.organizations.length ? user.organizations[0].name : '',
                userId: user.id,
                userName: user.name,
                userPhone: user.mobile,
                userPostId: user.positions.length ? user.positions[0].id : '',
                userPostName: user.positions.length ? user.positions[0].name : ''
              }
            })
            : [],
          examTaskId: typeof formData.value.examTaskId === 'string' ? formData.value.examTaskId : (formData.value.examTaskId ? (formData.value.examTaskId as unknown as { id: string; }).id : ''),
        }

        if (action === 'add') {
          if (isHeadMode.value) {
            await cubeSecureEduHeadQuartersService.addCultivateTask({
              ...params,
              cultivateMode: formData.value.cultivateMode as unknown as string,
              cultivateTaskMarkets: formData.value.cultivateTaskMarkets.map(market => {
                return {
                  marketCode: market.marketCode,
                  marketName: market.marketName,
                  marketTenantCode: (market as unknown as { marketTenant: number; }).marketTenant
                }
              })
            })
          } else {
            await trainingTaskInsert(params)
          }
        } else {
          if (isHeadMode.value) {
            await cubeSecureEduHeadQuartersService.updateCultivateTask({
              ...params,
              cultivateMode: formData.value.cultivateMode as unknown as string,
              cultivateTaskMarkets: formData.value.cultivateTaskMarkets.map(market => {
                return {
                  marketCode: market.marketCode,
                  marketName: market.marketName,
                  marketTenantCode: (market as unknown as { marketTenant: number; }).marketTenant
                }
              }),
              id: id as string
            })
          } else {
            await trainingTaskUpdate({ ...params, id: id as string })
          }
        }

        message.success('操作成功')
        history.back()
      } catch {
        message.error('操作失败')
      } finally {
        saveLoading.value = false
      }
    }

    const init = ref(false)
    onMounted(async () => {
      isOutSideLink && themeInject()
      if (action !== 'add') {
        if (id) {
          let res
          if (isHeadMode.value) {
            res = await cubeSecureEduHeadQuartersService.getCultivateTask(id as string)
          } else if (isHeadTask && isOutSideLink) {
            res = await cubeSecureEduPublicService.getCultivateTask(id as string)
          } else {
            res = await trainingTaskDetail({ id: id as string })
          }

          if (res.data) {
            if (isHeadMode.value) {

              // @ts-expect-error
              res.data.cultivateTaskMarkets = res.data.cultivateTaskMarkets.map(e => {
                return {
                  ...e,
                  marketTenant: e.marketTenantCode
                }
              })

              // @ts-expect-error
              res.data.cultivateUsers = []
            } else {
              // 培训人员处理回显处理
              const examUsers = (res.data as InsertTrainingTask).cultivateUsers.map(e => {
                const user = e as unknown as { userId: string; userName: string; userPhone: string;userDepartmentId: string; userDepartmentName: string;userPostId: string;userPostName: string; }
                return {
                  id: user.userId,
                  name: user.userName,
                  mobile: user.userPhone,
                  organizations: [{ id: user.userDepartmentId, name: user.userDepartmentName }],
                  positions: [{ id: user.userPostId, name: user.userPostName }]
                }
              })

              // @ts-expect-error
              res.data.cultivateUsers = examUsers as unknown as CultivateUser[]

              // @ts-expect-error
              res.data.cultivateTaskMarkets = []
            }

            // 考试数据回显处理
            if (res.data.examTaskId) {
              const examTask = { id: res.data.examTaskId, name: res.data.examTaskName }
              res.data.examTaskId = examTask as unknown as string
            }

            // 负责人数据回显处理
            const chargeUser = { id: res.data.chargeUserId, name: res.data.chargeUserName }
            res.data.chargeUserId = [chargeUser] as unknown as string

            // 课件回显
            const cultivateCoursewares = res.data.cultivateCoursewares.map(e => {
              return {
                file: {
                  name: e.fileName,
                  size: e.fileSize,
                  id: e.fileIds,
                  path: e.files && e.files.length > 0 ? e.files[0].path : '',
                  duration: e.duration ?? 0
                }
              }
            })
            res.data.cultivateCoursewares = cultivateCoursewares as unknown as CultivateCourseware[]

            // @ts-expect-error
            formData.value = res.data
          }
        }
      }
      setTimeout(() => {
        init.value = true
      }, 0)
    })

    const layoutSlots = {
      'layout-content': (): JSX.Element | undefined => {
        if (!init.value) {
          return
        }
        return (
          <DynamicFormRender
            formOptions={options.value}
            customValidatesRules={customValidatesRules}
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
