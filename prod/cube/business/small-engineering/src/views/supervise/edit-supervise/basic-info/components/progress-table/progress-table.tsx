import { defineComponent, reactive } from 'vue'
import styles from './progress-table.module.less'
import { Button, PopOver, Table } from '@ghcloud/cube-ui'
import { VerticalLine } from '@ghcloud/generic-component'
import { cubeSmallEngineeringService } from '@/api/server'
import FeedbackModel from '../../../../components/feedback-model'
import type { FeedbackDetailVo } from '@ghcloud/cube-small-engineering-service'
import dayjs from 'dayjs'
export const ProgressTable = defineComponent({
  props: {
    dataSource: {
      type: Array,
      default: () => []
    }
  },

  setup: (props) => {
    const state = reactive<{
      dataSource: unknown[];
      detail: FeedbackDetailVo;
      visible: boolean;
    }>({
      dataSource: [],
      detail: {
        id: '',
        scheduleId: '',
        schedule: 0,
        operationType: '',
        acceptanceResult: '',
        description: '',
        files: '',
        hasProblem: false,
        problemDes: '',
        problemFiles: '',
        problemFileList: []
      },
      visible: false
    })
    const handleInfo = async (id: string): Promise<void> => {
      const result = await cubeSmallEngineeringService.getFeedbackDetail({ id })
      state.detail = result
      state.visible = true
    }
    const columns = [
      {
        title: '反馈时间',
        dataIndex: 'recordTime',
        key: 'recordTime',
        align: 'center',
        customRender: ({ text }: { text: string; }): JSX.Element => {
          const time = text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '--'
          return <PopOver content={time}>{time}</PopOver>
        }
      },
      {
        title: '反馈人',
        dataIndex: 'username',
        key: 'username',
        align: 'center',
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '反馈部门',
        dataIndex: 'depName',
        key: 'depName',
        align: 'center',
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '当前进度',
        dataIndex: 'feedbackContent',
        key: 'feedbackContent',
        align: 'center'
      },
      {
        title: '操作',
        dataIndex: 'operation',
        key: 'operation',
        align: 'center',
        customRender: ({ record }: { record: { id: string; }; }): JSX.Element => {
          return (
            <div>
              <Button type='link' onClick={async () => handleInfo(record.id)}>详情</Button>
            </div>
          )
        }
      },
    ]

    return (): JSX.Element => (
      <div class={styles.container}>
        <VerticalLine title='工程进度' />
        <Table
          scrollY={500}
          style={{
            marginTop: '12px'
          }} size='small' pagination={false} columns={columns} dataSource={props.dataSource}
        />
        <FeedbackModel v-model:visible={state.visible} edit={false} detail={state.detail} />
      </div>
    )
  }
})
