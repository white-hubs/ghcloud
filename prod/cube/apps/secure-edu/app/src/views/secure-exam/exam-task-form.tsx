import { computed, defineComponent, onMounted, ref, watch } from 'vue'
import { Layout } from '@/components/layout/layout'
import { Button, Space, Textarea, message } from '@ghcloud/cube-ui'
import { useRoute } from 'vue-router'
import { DynamicFormRender } from '@ghcloud/dynamic-form-render'
import type { DynamicFormRenderOptionProps } from '@ghcloud/dynamic-form-render/src/dynamic-form-render-props'
import type { FormExpose, RuleObject } from '@ghcloud/cube-ui/src/components/form/form'
import ThemeSelectInput from '@/components/business/theme-select-input/theme-select-input'
import { ExamPaperType, ExamPaperTypeOptions, ExamTaskType, ExamTaskTypeOptions, type ExamUser, type InsertExamTask } from '@/types/exam-task'
import { examTaskDetail, examTaskInsert, examTaskUpdate } from '@/api/exam-test'
import dayjs from 'dayjs'
import { TestPaperSelectModal } from '@/components/business/test-paper-select-modal/test-paper-select-modal'
import { RandomQuestionRuleSelect } from '@/components/business/random-question-rule-select/random-question-rule-select'
import { UserPickerTable } from '@/components/business/user-picker-table/user-picker-table'
import { logger } from '@/logger'
import { useHeadMode } from '@/hook/use-head-mode'
import { MarketSelectTable } from '@/components/business/market-select-table/market-select-table'
import { cubeSecureEduHeadQuartersService, cubeSecureEduPublicService } from '@/api/server'
import { useAntDTheme } from '@/hook/use-antd-theme'

interface ExamPaperFormItem {
  id?: string | undefined;
  name?: string | undefined;
  ruleId?: string | undefined;
  ruleName?: string | undefined;
}

const normalizeExamPaperId = (value: string | undefined): string | undefined => {
  return value ? String(value) : undefined
}

export const ExamTaskForm = defineComponent({
  setup: () => {
    const { themeInject } = useAntDTheme()
    const { action, id, isHeadTask, isOutSideLink } = useRoute().query
    const goBack = (): void => {
      history.back()
    }
    const { isHeadMode, basePath } = useHeadMode()

    /** 标题 */
    const title = computed(() => {
      let res = '考试任务'
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
      const testPaperButton = (
        <Space direction='vertical'>
          {
            formData.value.examPapers.map((e, index) => {
              return (
                <Button
                  key={e.id || e.name || `exam-paper-${index}`}
                  type='link'
                  size='small'
                  onClick={() => {
                    if (isHeadTask) {
                      // @ts-expect-error
                      sessionStorage.setItem('secure-edu-examPaperContent', e)
                      history.pushState({ current: location.pathname + location.search }, '', `${basePath}/test-paper-manage-form?action=detail&cache=true`)
                      return
                    }
                    history.pushState({ current: location.pathname + location.search }, '', `${basePath}/test-paper-manage-form?id=${e.id}&action=detail`)
                  }}
                >
                  {e.name || '--'}
                </Button>
              )
            })
          }
        </Space>
      )
      const randomRuleButton = (
        <Space direction='vertical'>
          {
            formData.value.examPapers.map((e, index) => {
              return (
                <Button
                  key={e.ruleId || e.id || e.ruleName || `paper-rule-${index}`}
                  type='link'
                  size='small'
                  onClick={() => {
                    history.pushState({ current: location.pathname + location.search }, '', `${basePath}/paper-question-rule-form?id=${e.ruleId || e.id}&action=detail`)
                  }}
                >
                  {e.ruleName || e.name || '--'}
                </Button>
              )
            })
          }
        </Space>
      )
      const chargeUser = { title: '负责人', key: action === 'detail' || isHeadTask ? 'chargeUserName' : 'chargeUserId', width: 46, componentName: 'UserPickerInput', required: true, componentProps: { title: '选择负责人' } }
      const examPaper = {
        title: formData.value.examPaperMode === ExamPaperType.RANDOM ? '随机考题规则' : '试卷',
        key: 'examPapers',
        width: 46,
        customComponent: action === 'detail' || isHeadTask
          ? (formData.value.examPaperMode === ExamPaperType.RANDOM ? randomRuleButton : testPaperButton)
          : (formData.value.examPaperMode === ExamPaperType.RANDOM ? RandomQuestionRuleSelect : TestPaperSelectModal),
        required: true
      }
      const usersOrMarket = isHeadMode.value
        ? { title: '考试市场', key: 'examTaskMarkets', width: 100, customComponent: MarketSelectTable, removeLabel: true, componentProps: { title: '培训市场' } }
        : { title: '考试人员', key: 'examUsers', width: 100, customComponent: UserPickerTable, removeLabel: true, componentProps: { title: '考试人员' } }
      const res: DynamicFormRenderOptionProps[] = [
        { title: '任务名称', key: 'name', width: 46, componentName: 'TextInput', required: true },
        { title: '考试主题', key: 'themeId', width: 46, customComponent: ThemeSelectInput, required: true, componentProps: { options: action === 'detail' || isHeadTask ? [{ label: formData.value.themeName, value: formData.value.themeId }] : undefined } },
        { title: '考试开始时间', key: 'examStartTime', width: 46, componentName: 'DateTime', required: true, componentProps: { showTime: { format: 'HH:mm' }, valueFormat: 'YYYY-MM-DD HH:mm', format: 'YYYY-MM-DD HH:mm' } },
        { title: '考试结束时间', key: 'examEndTime', width: 46, componentName: 'DateTime', required: true, componentProps: { showTime: { format: 'HH:mm' }, valueFormat: 'YYYY-MM-DD HH:mm', format: 'YYYY-MM-DD HH:mm' } },
        {
          title: '试卷形式',
          key: 'examPaperMode',
          width: 46,
          componentName: 'RadioGroup',
          componentProps: {
            options: ExamPaperTypeOptions,
            onChange: () => {
              if (action !== 'detail') {
                formData.value.examPapers = []
                formData.value.examPaperIds = []
              }
            }
          },
          required: true
        },
        examPaper,
        chargeUser,
        { title: '是否限时', key: 'timed', width: 46, componentName: 'Switch', required: true },
        { title: '考试时长(分钟)', key: 'examDuration', width: 46, componentName: 'NumberInput', componentProps: { min: 0, placeholder: '请输入考试时长', maxLength: 3, max: 999 } },
        { title: '是否支持复考', key: 'retake', width: 46, componentName: 'Switch', required: true },
        { title: '复考次数', key: 'retakeNumber', width: 46, componentName: 'NumberInput', componentProps: { min: 0, placeholder: '请输入复考次数', maxLength: 3, max: 999 } },
        { title: '考试类型', key: 'examTaskType', width: 46, componentName: 'RadioGroup', componentProps: { options: ExamTaskTypeOptions }, required: true },
        { title: '参加考试人数', key: 'examUserNumber', width: 46, componentName: 'TextInput', required: true, componentProps: { placeholder: !isHeadMode.value && formData.value.examTaskType === ExamTaskType.STAFF_EXAM ? '选择人员后自动计算' : '请输入人数', disabled: !isHeadMode.value && formData.value.examTaskType === ExamTaskType.STAFF_EXAM, showCount: false } },
        { title: '考试说明', key: 'remark', width: 46, customComponent: action === 'detail' ? <span>{formData.value.remark || '--'}</span> : <Textarea /> },
        usersOrMarket
      ]
      if (action === 'detail') {
        res.forEach(e => {
          e.readonly = true
        })
      }

      // 总部下发的任务市场只可以编辑人员
      if (action === 'edit' && isHeadTask) {
        res.forEach((e) => {
          e.title !== '考试人员' && (e.readonly = true)
        })
      }

      if (isOutSideLink) {
        res.splice(res.length - 1, 1)
      }
      return res
    })
    const formData = ref<InsertExamTask & { themeName?: string;examPapers: ExamPaperFormItem[]; }>({
      name: '',
      themeId: undefined,
      examStartTime: '',
      examEndTime: '',
      chargeUserId: undefined,
      examPaperIds: [],
      examUsers: [],
      examUserNumber: undefined,
      retake: false,
      retakeNumber: undefined,
      timed: false,
      examTaskType: ExamTaskType.STAFF_EXAM,
      examTaskMarkets: [],
      examPapers: [],
      examPaperMode: ExamPaperType.UNIFIED
    })

    const validateExamUsers = async (): Promise<void> => {
      if (formData.value.examUsers.length === 0) {
        return Promise.reject(new Error('请添加考试人员'))
      }
      return Promise.resolve()
    }
    const validateExamTaskMarkets = async (): Promise<void> => {
      if (formData.value.examTaskMarkets.length === 0) {
        return Promise.reject(new Error('请添加考试市场'))
      }
      return Promise.resolve()
    }
    const validateExamStartTime = async (): Promise<void> => {
      if (!formData.value.examStartTime) {
        return Promise.reject(new Error('请选择考试开始时间'))
      }
      if (formData.value.examStartTime && formData.value.examEndTime) {
        if (!dayjs(formData.value.examStartTime).isBefore(dayjs(formData.value.examEndTime))) {
          return Promise.reject(new Error('考试开始时间须小于考试结束时间'))
        }
      }
      return Promise.resolve()
    }
    const validateExamEndTime = async (): Promise<void> => {
      if (!formData.value.examEndTime) {
        return Promise.reject(new Error('请选择考试结束时间'))
      }
      if (formData.value.examStartTime && formData.value.examEndTime) {
        if (!dayjs(formData.value.examStartTime).isBefore(dayjs(formData.value.examEndTime))) {
          return Promise.reject(new Error('考试开始时间须小于考试结束时间'))
        }
      }
      return Promise.resolve()
    }
    const customValidatesRules = computed(() => {
      const res: Record<string, RuleObject> = {
        examStartTime: { required: true, trigger: 'blur', validator: validateExamStartTime } satisfies RuleObject,
        examEndTime: { required: true, trigger: 'blur', validator: validateExamEndTime } satisfies RuleObject,
        chargeUserId: { required: true, trigger: 'change', message: '请选择负责人' } satisfies RuleObject,
        examPapers: { required: true, trigger: 'change', message: formData.value.examPaperMode === ExamPaperType.RANDOM ? '请选择随机考题规则' : '请选择试卷' } satisfies RuleObject,
      }
      if (formData.value.examTaskType === ExamTaskType.STAFF_EXAM && !isHeadMode.value) {
        res.examUsers = { required: true, trigger: 'change', validator: validateExamUsers } satisfies RuleObject
      }
      if (formData.value.retake) {
        res.retakeNumber = { required: true, trigger: 'blur', message: '请输入复考次数' } satisfies RuleObject
      }
      if (formData.value.timed) {
        res.examDuration = { required: true, trigger: 'blur', message: '考试时长(分钟)' } satisfies RuleObject
      }
      if (isHeadMode.value) {
        res.examTaskMarkets = { required: true, trigger: 'blur', validator: validateExamTaskMarkets } satisfies RuleObject
      }

      return res
    })
    watch(() => formData.value.examTaskType, () => {
      if (formData.value.examTaskType === ExamTaskType.STAFF_EXAM && !isHeadMode.value && action !== 'detail') {
        formData.value.examUserNumber = formData.value.examUsers.length > 0 ? formData.value.examUsers.length : undefined
      }
    })

    watch(() => formData.value.examUsers && formData.value.examUsers.length, () => {
      if (!isHeadMode.value && action !== 'detail') {
        formData.value.examUserNumber = formData.value.examUsers.length > 0 ? formData.value.examUsers.length : undefined
        dynamicFormRenderRef.value?.formRef.clearValidate('chargeUserId')
      }
    })
    // 监听负责人值变化
    watch(() => formData.value.chargeUserId, () => {
      if (action !== 'detail') {
        dynamicFormRenderRef.value?.formRef.clearValidate('chargeUserId')
      }
    })
    // 监听选择试卷/规则
    watch(() => formData.value.examPapers, () => {
      if (action !== 'detail') {
        dynamicFormRenderRef.value?.formRef.clearValidate('examPapers')
      }
    }, { deep: true })
    // 保存
    const saveLoading = ref(false)
    const save = async (): Promise<void> => {
      dynamicFormRenderRef.value?.formRef.clearValidate()
      await dynamicFormRenderRef.value?.formRef.validate()
      try {
        saveLoading.value = true
        const params = {
          ...formData.value,
          chargeUserId: (formData.value.chargeUserId as unknown as [{ id: string; }])[0].id,
          examUsers: formData.value.examUsers.map(e => {
            const user = e as unknown as { id: string; name: string; mobile: string; organizations: { id: string; name: string; }[]; positions: { id: string; name: string; }[]; }
            return {
              departmentId: user.organizations.length ? user.organizations[0].id : '',
              departmentName: user.organizations.length ? user.organizations[0].name : '',
              id: user.id,
              name: user.name,
              phone: user.mobile,
              postId: user.positions.length ? user.positions[0].id : '',
              postName: user.positions.length ? user.positions[0].name : ''
            }
          }),
          examPaperIds: formData.value.examPapers.map((e) => e.ruleId || e.id || ''),
          examPaperMode: formData.value.examPaperMode!,
          examTaskType: formData.value.examTaskType!,
          examUserNumber: formData.value.examUserNumber!,
          retakeNumber: formData.value.retakeNumber!,
          themeId: formData.value.themeId!,
        }
        if (formData.value.examDuration) {
          params.examDurationUnit = 'MINUTE'
        }
        if (action === 'add') {
          if (isHeadMode.value) {
            await cubeSecureEduHeadQuartersService.addExamTask({
              ...params,
              examTaskMarkets: formData.value.examTaskMarkets.map(market => {
                return {
                  marketCode: market.marketCode,
                  marketName: market.marketName,
                  marketTenantCode: (market as unknown as { marketTenant: number; }).marketTenant
                }
              })
            })
          } else {
            await examTaskInsert(params)
          }
        } else {
          if (isHeadMode.value) {
            await cubeSecureEduHeadQuartersService.updateExamTask({
              id: id as string,
              ...params,
              examTaskMarkets: formData.value.examTaskMarkets.map(market => {
                return {
                  marketCode: market.marketCode,
                  marketName: market.marketName,
                  marketTenantCode: (market as unknown as { marketTenant: number; }).marketTenant
                }
              })
            })
          } else {
            await examTaskUpdate({ ...params, id: id as string })
          }
        }
        message.success('操作成功')
        history.back()
      } catch (error) {
        message.error('操作失败')
        logger.error(error)
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
            res = await cubeSecureEduHeadQuartersService.getExamTask(id as string)
          } else if (isHeadTask && isOutSideLink) {
            res = await cubeSecureEduPublicService.getExamTask(id as string)
          } else {
            res = await examTaskDetail({ id: id as string })
          }
          if (res.data) {
            if (!isHeadMode.value) {
              // 考试人员处理回显处理
              const examUsers = (res.data as InsertExamTask).examUsers.map(e => {
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
              res.data.examUsers = examUsers as unknown as ExamUser[]
              // @ts-expect-error
              res.data.examTaskMarkets = []
            } else {
              // @ts-expect-error
              res.data.examUsers = []
              // @ts-expect-error
              res.data.examTaskMarkets = res.data.examTaskMarkets.map(e => {
                return {
                  ...e,
                  marketTenant: e.marketTenantCode
                }
              })
            }

            const examTaskDetailData = res.data as InsertExamTask & {
              examPaperMode?: ExamPaperType;
              examPapers: ExamPaperFormItem[];
            }
            if (!examTaskDetailData.examPaperMode) {
              examTaskDetailData.examPaperMode = ExamPaperType.UNIFIED
            }
            if (examTaskDetailData.examPaperMode === ExamPaperType.RANDOM && examTaskDetailData.examPapers?.length) {
              examTaskDetailData.examPapers = examTaskDetailData.examPapers.map((p) => {
                const ruleId = normalizeExamPaperId(p.ruleId ?? p.id)
                return {
                  ruleId,
                  ruleName: p.ruleName ?? p.name
                }
              })
              examTaskDetailData.examPaperIds = examTaskDetailData.examPapers.map((p) => p.ruleId || '')
            }

            // 负责人数据回显处理
            const chargeUser = { id: res.data.chargeUserId, name: res.data.chargeUserName }
            res.data.chargeUserId = [chargeUser] as unknown as string
            // @ts-expect-error
            formData.value = res.data
          }
        }
      }
      init.value = true
    })

    const layoutSlots = {
      'layout-content': (): JSX.Element | undefined => {
        if (!init.value) {
          return
        }
        return (
          <DynamicFormRender
            formOptions={options.value}
            customValidatesRules={customValidatesRules.value}
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
