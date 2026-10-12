import { Button, CheckOutlined, EditOutlined, Empty, Input, PopConfirm } from '@ghcloud/cube-ui'
import { defineComponent, ref, watch } from 'vue'
import { VerticalLine } from '@/components/vertical-line/vertical-line'
import type { ExamQuestion, QuestionCategory } from '@/types/exam-paper'
import styles from './test-page-question.module.less'
import AddQuestionCategory from './components/add-question-category'
import ChooseQuestion from './components/choose-question'
import QuestionCard from './components/question-card'
import { AddQuestionModal } from './components/add-question'
import { QuestionTypeEnum, type QuestionRow } from '@/types/question'

interface Props {
  readonly: boolean;
  value: QuestionCategory[];
}

export default defineComponent({
  emits: ['update:value'],
  props: ['readonly', 'value'],
  setup (props: Props, { emit }) {
    const value = ref<QuestionCategory[]>(props.value ?? [])
    watch(() => value.value, () => {
      emit('update:value', value.value)
    }, { deep: true })
    watch(() => props.value, () => {
      value.value = props.value
    })
    const nowEidtQuestionCategoryIndex = ref(-1)
    const nowEidtQuestionIndex = ref(-1)

    /** 删除大题 */
    const delQuestionCategory = (index: number): void => {
      value.value.splice(index, 1)
    }
    /** 数字转中文 */
    const toChineseNum = (digit: number): string => {
      const chnNum = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九']
      const chnNumUnit = ['', '十', '百', '千']
      let tmp = ''
      let chnString = ''
      let zero = true
      let unitIndex = 0
      let isTen = false
      if (digit > 9 && digit < 20) {
        isTen = true
      }
      while (digit > 0) {
        const num = digit % 10
        if (num === 0) {
          if (!zero) {
            zero = true
            chnString = chnNum[num] + chnString
          }
        } else {
          zero = false
          if (isTen && unitIndex === 1) {
            tmp = ''
          } else {
            tmp = chnNum[num]
          }
          tmp += chnNumUnit[unitIndex]
          chnString = tmp + chnString
        }
        unitIndex++
        digit = Math.floor(digit / 10)
      }
      return chnString
    }
    /** 添加考题集合 */
    const addExamQuestion = ({ values, questionCategoryIndex }: { values: ExamQuestion[]; questionCategoryIndex: number; }): void => {
      value.value[questionCategoryIndex].examQuestions = value.value[questionCategoryIndex].examQuestions.concat(values)
    }
    /** 删除小题 */
    const delExamQuestion = ({ questionCategoryIndex, index }: { questionCategoryIndex: number; index: number; }): void => {
      value.value[questionCategoryIndex].examQuestions.splice(index, 1)
    }

    // 考题弹窗
    const modalVisible = ref(false)
    const modalTitle = ref('添加考题')
    const modalAction = ref<'add' | 'edit'>('add')
    const modalFormData = ref<QuestionRow>({
      themeId: undefined,
      questionType: QuestionTypeEnum.SINGLE_CHOICE,
      name: '',
      questionContent: '',
      answerAnalysis: '',
      score: ''
    })
    const nowEidtQuestionCategoryIndexForModal = ref(-1)
    const addQuestion = (questionCategoryIndex: number): void => {
      modalVisible.value = true
      modalFormData.value = {
        themeId: undefined,
        questionType: QuestionTypeEnum.SINGLE_CHOICE,
        name: '',
        questionContent: '',
        answerAnalysis: '',
        score: ''
      }
      modalTitle.value = '添加考题'
      modalAction.value = 'add'
      nowEidtQuestionCategoryIndexForModal.value = questionCategoryIndex
    }
    const editQuestionInModal = ({ questionCategoryIndex, index, question }: { questionCategoryIndex: number; index: number;question: ExamQuestion; }): void => {
      const questionData = JSON.parse(JSON.stringify(question))
      questionData.questionContent = JSON.parse(question.questionContent)
      modalFormData.value = {
        themeId: questionData.themeId,
        questionType: questionData.questionType as QuestionTypeEnum,
        name: questionData.name,
        questionContent: questionData.questionContent,
        answerAnalysis: questionData.answerAnalysis ?? '',
        score: questionData.score
      }
      modalTitle.value = '编辑考题'
      modalAction.value = 'edit'
      nowEidtQuestionCategoryIndexForModal.value = questionCategoryIndex
      nowEidtQuestionIndex.value = index
      modalVisible.value = true
    }
    const modalOnOk = (): void => {
      modalVisible.value = false
      modalFormData.value.questionContent = JSON.stringify(modalFormData.value.questionContent)
      const data = JSON.parse(JSON.stringify(modalFormData.value))
      if (modalAction.value === 'add') {
        addExamQuestion({
          values: [data],
          questionCategoryIndex: nowEidtQuestionCategoryIndexForModal.value
        })
      } else {
        value.value[nowEidtQuestionCategoryIndexForModal.value].examQuestions[nowEidtQuestionIndex.value] = data
      }
    }

    return (): JSX.Element => {
      const header = (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '50px', marginBottom: '30px' }}>
          <VerticalLine title='试题' style={{ marginLeft: '-120px' }} />
          {!props.readonly && <AddQuestionCategory v-model:value={value.value} />}
        </div>
      )

      /** 题目 */
      const questionCategoryItems = value.value.map((e, i) => {
        return (
          <div key={i} class={styles['question-item']}>
            <div class={styles['question-item-header']}>
              <div>
                <span>{toChineseNum(i + 1)}、</span>
                {nowEidtQuestionCategoryIndex.value === i ? <Input v-model:value={e.title} style={{ width: '180px' }} /> : e.title}
                {
                  !props.readonly &&
                    <>
                      <EditOutlined style={{ marginLeft: '10px', cursor: 'pointer', display: nowEidtQuestionCategoryIndex.value === i ? 'none' : 'inline' }} onClick={() => {
                        nowEidtQuestionCategoryIndex.value = i
                      }} />
                      <CheckOutlined style={{ marginLeft: '10px', cursor: 'pointer', display: nowEidtQuestionCategoryIndex.value === i ? 'inline' : 'none' }} onClick={() => {
                        nowEidtQuestionCategoryIndex.value = -1
                      }} />
                    </>
                }
              </div>
              {
                !props.readonly &&
                  <div>
                    <Button type='link' size='small' onClick={() => {
                      addQuestion(i)
                    }}>添加考题</Button>
                    <ChooseQuestion onAddExamQuestion={addExamQuestion} questionCategoryIndex={i} />
                    <PopConfirm onConfirm={() => {
                      delQuestionCategory(i)
                    }} title='确定删除该项？'>
                      <Button type='link' size='small' danger>删除</Button>
                    </PopConfirm>
                  </div>
              }

            </div>
            <div class={[styles['question-item-body'], `dragable-area-${e.sort}`]}>
              {
                e.examQuestions.map((e, index) => {
                  return (
                    <QuestionCard
                      key={index}
                      v-model:value={e}
                      index={index}
                      questionCategoryIndex={i}
                      onDelExamQuestion={delExamQuestion}
                      onEditQuestion={editQuestionInModal}
                      readonly={props.readonly}
                    />
                  )
                })
              }
            </div>
          </div>
        )
      })

      const body = value.value.length === 0 ? <Empty description='请添加试题' /> : <div class={styles['question-body']}>{questionCategoryItems}</div>

      return (
        <>
          {header}
          {body}
          <AddQuestionModal
            v-model:show={modalVisible.value}
            title={modalTitle.value}
            action={modalAction.value}
            v-model:formData={modalFormData.value}
            onOk={modalOnOk}
          />
        </>
      )
    }
  }
})
