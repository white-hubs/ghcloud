import { computed, defineComponent, ref, watch } from 'vue'
import styles from '../test-page-question.module.less'
import type { ExamQuestion } from '@/types/exam-paper'
import { Button, PopConfirm } from '@ghcloud/cube-ui'
import type { QuestionItem } from '@/types/question'

interface Props {
  value: ExamQuestion;
  index: number;
  questionCategoryIndex: number;
  readonly: boolean;
}

export default defineComponent({
  emits: ['delExamQuestion', 'editQuestion'],
  props: ['value', 'index', 'questionCategoryIndex', 'readonly'],
  setup (props: Props, { emit }) {
    const value = ref(props.value)
    watch(() => props.value, () => {
      value.value = props.value
    })
    const del = (): void => {
      emit('delExamQuestion', { questionCategoryIndex: props.questionCategoryIndex, index: props.index })
    }
    const edit = (): void => {
      const params = {
        questionCategoryIndex: props.questionCategoryIndex,
        index: props.index,
        question: value.value
      }
      emit('editQuestion', params)
    }

    const title = computed(() => {
      return `${props.index + 1}、${value.value.name}`
    })

    const questionItems = computed(() => {
      const questionContent: QuestionItem[] = value.value.questionContent ? JSON.parse(value.value.questionContent) : []
      return questionContent.map((e, i) => {
        return <div key={i}>{e.optionID}、{e.optionTitle}</div>
      })
    })

    const answer = computed(() => {
      const questionContent: QuestionItem[] = value.value.questionContent ? JSON.parse(value.value.questionContent) : []
      let res = ''
      questionContent.forEach((e) => {
        e.isRight && (res += e.optionID)
      })
      return res
    })

    return (): JSX.Element =>
      <div class={styles['question-card']}>
        <div class={styles['question-card-header']}>
          <span style={{ maxWidth: '70%' }}>{title.value}</span>
          {
            !props.readonly &&
              <div style={{ width: '30%', textAlign: 'end' }}>
                <Button type='link' size='small' onClick={edit}>编辑</Button>
                <PopConfirm onConfirm={del} title='确定删除该项？'>
                  <Button type='link' size='small' danger>删除</Button>
                </PopConfirm>
              </div>
          }
        </div>
        <div class={styles['question-card-body']}>
          {questionItems.value}
        </div>
        <div class={styles['question-card-foot']}>
          <span>正确答案：{answer.value}</span>
          <span>分数：{value.value.score}分数</span>
          <div>解析：{value.value.answerAnalysis}</div>
        </div>
      </div>
  }
})
