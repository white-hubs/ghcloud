import { computed, defineComponent, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { Layout } from '@/components/layout/layout'
import { Button, message } from '@ghcloud/cube-ui'
import { useRoute } from 'vue-router'
import { DynamicFormRender } from '@ghcloud/dynamic-form-render'
import type { DynamicFormRenderOptionProps } from '@ghcloud/dynamic-form-render/src/dynamic-form-render-props'
import type { FormExpose, RuleObject } from '@ghcloud/cube-ui/src/components/form/form'
import { examPaperDetail, examPaperInsert, examPaperUpdate } from '@/api/exam-paper'
import type { InsertExamPapaer } from '@/types/exam-paper'
import TestPageQuestion from '@/components/business/test-page-question/test-page-question'
import { logger } from '@/logger'

export const TestPaperManageForm = defineComponent({
  setup: () => {
    const { action, id, cache } = useRoute().query
    /** 标题 */
    const title = computed(() => {
      let res = '试卷管理'
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
    const options: DynamicFormRenderOptionProps[] = [
      { title: '试卷名称', key: 'name', width: 46, componentName: 'TextInput', required: true },
      { title: '试卷总分', key: 'score', width: 46, componentName: 'TextInput', required: true, componentProps: { placeholder: '系统自动计算总分', disabled: true, showCount: false } },
      { title: '及格分', key: 'passingGradeScore', width: 46, componentName: 'NumberInput', componentProps: { placeholder: '请输入及格分' }, required: true },
      { title: '试卷说明', key: 'remark', width: 46, componentName: 'TextareaInput' },
      { title: '试题', key: 'questionCategories', width: 92, customComponent: TestPageQuestion, hiddenLabel: true },
    ]
    if (action === 'detail') {
      options.forEach(e => {
        e.readonly = true
      })
    }

    const formData = ref<InsertExamPapaer>({
      name: '',
      remark: '',
      passingGradeScore: undefined,
      score: undefined,
      questionCategories: []
    })

    const validateQuestionCategories = async (): Promise<void> => {
      if (formData.value.questionCategories.length === 0) {
        return Promise.reject(new Error('请设置试题'))
      }
      for (let index = 0; index < formData.value.questionCategories.length; index++) {
        const element = formData.value.questionCategories[index]
        if (element.examQuestions.length === 0) {
          return Promise.reject(new Error(`第${index + 1}大题未设置考题`))
        }
      }
      return Promise.resolve()
    }
    const validatePassingGradeScore = async (): Promise<void> => {
      if (!formData.value.passingGradeScore) {
        return Promise.reject(new Error('请设置及格分'))
      }
      if (formData.value.passingGradeScore > (formData.value?.score ?? 0)) {
        return Promise.reject(new Error('及格分数不能大于总分'))
      }
      return Promise.resolve()
    }
    const customValidatesRules = {
      questionCategories: { required: true, trigger: 'change', validator: validateQuestionCategories } satisfies RuleObject,
      passingGradeScore: { required: true, trigger: 'change', validator: validatePassingGradeScore } satisfies RuleObject
    }

    // 计算总分
    watch(() => formData.value.questionCategories, () => {
      const res = formData.value.questionCategories.reduce((prev, cur) => {
        return prev + cur.examQuestions.reduce((p, c) => {
          return p + c.score
        }, 0)
      }, 0)
      formData.value.score = res || undefined
    }, { deep: true })

    // 保存
    const saveLoading = ref(false)
    const save = async (): Promise<void> => {
      await dynamicFormRenderRef.value?.formRef.validate()
      try {
        saveLoading.value = true

        // 考题 排序 sort 从1开始
        formData.value.questionCategories.forEach((item, index) => {
          item.sort = index + 1
          item.examQuestions = item.examQuestions.map((e, i) => {
            e.sort = i + 1
            return e
          })
        })

        if (action === 'add') {
          const params = {
            ...formData.value
          }
          await examPaperInsert(params)
        } else {
          const params = {
            ...formData.value,
            id: id as string
          }
          await examPaperUpdate(params)
        }
        message.success('操作成功')
        history.back()
      } catch (error) {
        logger.error(error)
      } finally {
        saveLoading.value = false
      }
    }

    const init = ref(false)
    onMounted(async () => {
      if (action !== 'add') {
        if (id) {
          const res = await examPaperDetail({ id: id as string })
          if (res.data) {
            formData.value = res.data
          }
        } else if (cache) {
          try {
            formData.value = JSON.parse(sessionStorage.getItem('secure-edu-examPaperContent')!)
          } catch (error) {

          }
        }
      }
      init.value = true
    })
    onBeforeUnmount(() => {
      try {
        sessionStorage.removeItem('secure-edu-examPaperContent')
      } catch {

      }
    })

    const layoutSlots = {
      'layout-content': (): JSX.Element | undefined=> {
        if (!init.value) {
          return
        }
        return (
          <DynamicFormRender
            formOptions={options}
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
            <Button onClick={() => {
              history.back()
            }}>返回</Button>
            {action !== 'detail' && <Button type='primary' style={{ marginLeft: '10px' }} loading={saveLoading.value} onClick={save}>保存</Button>}
          </>
        )
      }
    }
    return (): JSX.Element => <Layout title={title.value} v-slots={layoutSlots} />
  }
})
