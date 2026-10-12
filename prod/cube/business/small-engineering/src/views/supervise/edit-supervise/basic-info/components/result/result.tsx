import { defineComponent, reactive } from 'vue'
import { Button, PopOver, Table } from '@ghcloud/cube-ui'
import { VerticalLine } from '@ghcloud/generic-component'
import { cubeSmallEngineeringService } from '@/api/server'
import CheckAcceptModal from '../../../../components/check-accept-model'
import type { FeedbackDetailVo } from '@ghcloud/cube-small-engineering-service'
import dayjs from 'dayjs'
export const Result = defineComponent({
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
        title: '验收时间',
        dataIndex: 'recordTime',
        key: 'recordTime',
        align: 'center',
        customRender: ({ text }: { text: string; }): JSX.Element => {
          const time = text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '--'
          return <PopOver content={time}>{time}</PopOver>
        }
      },
      {
        title: '验收人',
        dataIndex: 'username',
        key: 'username',
        align: 'center',
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '验收部门',
        dataIndex: 'depName',
        key: 'depName',
        align: 'center',
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '验收结果',
        dataIndex: 'checkAcceptContent',
        key: 'checkAcceptContent',
        align: 'center',
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
      <div style={{
        marginTop: '12px'
      }}
      >
        <VerticalLine title='工程结果' />
        <Table
          scrollY={500}
          style={{
            marginTop: '12px'
          }} pagination={false} size='small' columns={columns} dataSource={props.dataSource}
        />
        <CheckAcceptModal edit={false} v-model:visible={state.visible} detail={state.detail} />
      </div>
    )
  }
})
