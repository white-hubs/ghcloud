import { defineComponent, onMounted, ref } from 'vue'
import { Layout } from '@/components/layout/layout'
import { Button } from '@ghcloud/cube-ui'
import { useRoute } from 'vue-router'
import { DynamicFormRender } from '@ghcloud/dynamic-form-render'
import type { DynamicFormRenderOptionProps } from '@ghcloud/dynamic-form-render/src/dynamic-form-render-props'
import type { FormExpose } from '@ghcloud/cube-ui/src/components/form/form'
import TestPageQuestion from '@/components/business/test-page-question/test-page-question'
import { examTaskPaperDetail } from '@/api/exam-test'
import type { ExamTaskPaperDetail } from '@/types/exam-task'
import { useHeadMode } from '@/hook/use-head-mode'
import { cubeSecureEduHeadQuartersService, errorMsgHandler } from '@/api/server'
import type { PaperState } from '@ghcloud/cube-secure-edu-service'

export const ExamPaperDetail = defineComponent({
  setup: () => {
    const { id, examPaperId } = useRoute().query as { id: string; examPaperId: string; }
    const { isHeadMode } = useHeadMode()

    /** 表单实例 */
    const dynamicFormRenderRef = ref<{ formRef: FormExpose; }>()
    const options: DynamicFormRenderOptionProps[] = [
      { title: '试卷名称', key: 'name', width: 46, componentName: 'TextInput', required: true },
      { title: '试卷总分', key: 'score', width: 46, componentName: 'TextInput', required: true, componentProps: { placeholder: '系统自动计算总分', disabled: true, showCount: false } },
      { title: '及格分', key: 'passingGradeScore', width: 46, componentName: 'NumberInput', componentProps: { placeholder: '请输入及格分' }, required: true },
      { title: '是否限时', key: 'timed', width: 46, componentName: 'Switch', required: true },
      { title: '是否支持复考', key: 'retake', width: 46, componentName: 'Switch', required: true },
      { title: '试卷说明', key: 'remark', width: 46, componentName: 'TextareaInput' },
      { title: '试题', key: 'questionCategories', width: 92, customComponent: TestPageQuestion, hiddenLabel: true },
    ]
    options.forEach(e => {
      e.readonly = true
    })

    const formData = ref<ExamTaskPaperDetail>()

    const init = ref(false)
    onMounted(async () => {
      if (id) {
        const res: { data: ExamTaskPaperDetail | PaperState | undefined; } = {
          data: undefined
        }
        try {
          if (isHeadMode.value) {
            res.data = await cubeSecureEduHeadQuartersService.getExamPaperDetail({ id, examPaperId })
          } else {
            const { data } = await examTaskPaperDetail({ id, examPaperId })
            res.data = data
          }
          if (res.data) {
            formData.value = res.data as ExamTaskPaperDetail
          }
        } catch (error) {
          errorMsgHandler(error)
        }
      }
      init.value = true
    })

    const layoutSlots = {
      'layout-content': (): JSX.Element | undefined=> {
        if (!init.value) {
          return
        }
        return (
          <DynamicFormRender
            formOptions={options}
            labelWidth='150px'
            v-model:formData={formData.value}
            ref={dynamicFormRenderRef}
            style={{ margin: '20px' }}
          />
        )
      },
      'footer-page': (): JSX.Element => {
        return (
          <Button onClick={() => {
            history.back()
          }}>返回</Button>
        )
      }
    }
    return (): JSX.Element => <Layout title='试卷详情' v-slots={layoutSlots} />
  }
})
