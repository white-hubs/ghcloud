import { Empty, List } from 'vant'
import { defineComponent } from 'vue'
import { ExamListItem } from '@/views/secure-exam/components/exam-list-item'
/** 关联考试页面 */
export const TaskExam = defineComponent({
  props: {
    exam: {
      type: Object,
      default: () => {}
    },
  },
  setup: (props) => {

    return (): JSX.Element =>
      <>
        <div class='course-file-list' style={{ overflowY: 'scroll', marginBottom: '80px' }}>
          <List
            finished-text={props.exam?.id ? '' : '暂无更多数据'}
          >
            {
              (props.exam && props.exam?.id) && (
                // props.exam.map((item: ExamType) => {
                <ExamListItem examProp={props.exam} key={props.exam.id} />
                // })
              )
            }
            {(!props.exam?.id) && <Empty description='暂无数据' />}
          </List>
        </div>
      </>
  }
})
