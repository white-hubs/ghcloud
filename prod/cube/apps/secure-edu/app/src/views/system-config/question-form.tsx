
import { computed, defineComponent, onMounted, ref } from 'vue'
import { Layout } from '@/components/layout/layout'
import { Button, message } from '@ghcloud/cube-ui'
import { useRoute } from 'vue-router'
import { DynamicFormRender } from '@ghcloud/dynamic-form-render'
import type { DynamicFormRenderOptionProps } from '@ghcloud/dynamic-form-render/src/dynamic-form-render-props'
import { Question } from './components/question/question'
import type { FormExpose, RuleObject } from '@ghcloud/cube-ui/src/components/form/form'
import ThemeSelectInput from '@/components/business/theme-select-input/theme-select-input'
import { questionDetail, questionInsert, questionUpdate } from '@/api/question'
import { QuestionTypeEnum, type QuestionRow } from '@/types/question'
import { logger } from '@/logger'

export const QuestionForm = defineComponent({
  setup: () => {
    const { action, id } = useRoute().query

    /** 标题 */
    const title = computed(() => {
      let res = '考题库'
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
      { title: '题目主题', key: 'themeId', width: 46, customComponent: ThemeSelectInput, required: true },
      {
        title: '题目类型',
        key: 'questionType',
        width: 46,
        componentName: 'SelectInput',
        required: true,
        componentProps: {
          options: [
            { label: '单选题', value: 'SINGLE_CHOICE' },
            { label: '多选题', value: 'MULTIPLE_CHOICE' },
            { label: '判断题', value: 'JUDGE' }
          ]
        },
      },
      { title: '题目名称', key: 'name', width: 92, componentName: 'TextareaInput', componentProps: { maxlength: 1000 }, required: true },
      {
        title: '题目',
        key: 'questionContent',
        width: 92,
        customComponent: Question,
        componentProps: {
          action
        },
        required: true,
        hiddenLabel: true,
        dependentParams: ['questionType']
      },
      { title: '解析', key: 'answerAnalysis', width: 46, componentName: 'TextareaInput' },
      { title: '分数', key: 'score', width: 46, componentName: 'NumberInput', componentProps: { max: 999 }, required: true },
    ]
    if (action === 'detail') {
      options.forEach(e => {
        e.readonly = true
      })
    }

    const formData = ref<QuestionRow>({
      themeId: undefined,
      questionType: QuestionTypeEnum.SINGLE_CHOICE,
      name: '',
      questionContent: '',
      answerAnalysis: '',
      score: ''
    })

    const validateQustion = async (): Promise<void> => {
      if (!formData.value.questionContent) {
        return Promise.reject(new Error('题目数据为空'))
      }
      const data = formData.value.questionContent as unknown as { optionTitle: string;['optionID']: string;isRight: boolean; }[]
      for (const item of data) {
        if (!item.optionTitle) {
          return Promise.reject(new Error(`选项${item.optionID}不能为空`))
        }
      }
      const arr = [...new Set(data.map(e => e.optionTitle.trim()))]
      if (arr.length < data.length) {
        return Promise.reject(new Error('选项中有重复项'))
      }
      if (data.findIndex(e => e.isRight) === -1) {
        return Promise.reject(new Error('当前无正确选项'))
      }
      return Promise.resolve()
    }
    const customValidatesRules = {
      questionContent: {
        required: true,
        trigger: 'blur',
        validator: validateQustion
      } satisfies RuleObject
    }

    // 保存
    const saveLoading = ref(false)
    const save = async (): Promise<void> => {
      await dynamicFormRenderRef.value?.formRef.validate()
      try {
        saveLoading.value = true
        if (action === 'add') {
          const params = {
            ...formData.value
          }
          params.questionContent = JSON.stringify(params.questionContent)
          await questionInsert(params)
        } else {
          const params = {
            ...formData.value
          }
          params.questionContent = JSON.stringify(params.questionContent)
          await questionUpdate(params)
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
          const res = await questionDetail({ id: id as string })
          if (res.data) {
            res.data.questionContent = JSON.parse(res.data.questionContent)
            formData.value = res.data
          }
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
