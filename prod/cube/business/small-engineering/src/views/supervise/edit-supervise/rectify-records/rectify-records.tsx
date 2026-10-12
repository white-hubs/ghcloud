import { defineComponent, onMounted, reactive } from 'vue'
import { VerticalLine } from '@ghcloud/generic-component'
import { Button, PopOver, Table } from '@ghcloud/cube-ui'
import { cubeSmallEngineeringService } from '@/api/server'
import { useRoute } from 'vue-router'
import { GPagination } from '@/components/common/pagination'
import styles from './rectify-records.module.less'
import type { FaultListType } from '@ghcloud/cube-risk-management-service'
import dayjs from 'dayjs'
import type { ProjectReformVO } from '@ghcloud/cube-small-engineering-service'

const statusText = {
  SUBMIT: '提交',
  UNDO: '撤销',
  REPEAT: '重新提交',
  APPROVAL: '审批',
  BACK: '撤回',
  COPY: '抄送',
  REJECT: '驳回',
  FINISHED: '完成',
}
export const RectifyRecords = defineComponent({
  setup: () => {
    const route = useRoute()
    const state = reactive<{
      dataSource: ProjectReformVO[];
      params: {
        pageNumber: number;
        pageSize: number;
        projectScheduleId: string;
        businessType: string;
        processInstanceIds: string;
        total: number;
      };
    }>({
      dataSource: [],
      params: {
        pageNumber: 1,
        pageSize: 10,
        projectScheduleId: '',
        businessType: 'PROJECT_REFORM',
        processInstanceIds: '',
        total: 0,
      }
    })
    const handleDetails = (record: FaultListType): void => {
      history.pushState({}, '', `/portal/stream-engine-render/index?businessType=${record.businessType}&processInstanceId=${record.processInstanceId}&currentTaskId${record.currentTaskId}=&status=${record.status}&type=detail&title=排查记录`)
    }
    const columns = [
      {
        title: '编号',
        dataIndex: 'reformNum',
        key: 'reformNum',
        align: 'center'
      },
      {
        title: '名称',
        dataIndex: 'instanceName',
        key: 'instanceName',
        align: 'center'
      },
      {
        title: '时间',
        dataIndex: 'createTime',
        key: 'createTime',
        align: 'center',
        customRender: ({ text }: { text: string; }): JSX.Element => {
          const time = text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '--'
          return <PopOver content={time}>{time}</PopOver>
        }
      },
      {
        title: '发起人',
        dataIndex: 'startUserName',
        key: 'startUserName',
        align: 'center'
      },
      {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        align: 'center',
        customRender: ({ text }: { text: keyof typeof statusText; }): JSX.Element=> {
          const value = statusText[text] || '处理中'
          return <PopOver content={value}>{value}</PopOver>
        }
      },
      {
        title: '操作',
        dataIndex: 'operation',
        key: 'operation',
        align: 'center',
        customRender: ({ record }: { record: FaultListType; }): JSX.Element => {
          return (
            <Button
              type='link' onClick={
                () => {
                  handleDetails(record)
                }
              }
            >详情
            </Button>
          )
        }
      },
    ]
    const getList = async (): Promise<void> => {
      state.params.projectScheduleId = route.query.id as string
      const result = await cubeSmallEngineeringService.getProjectReformList(state.params)
      state.params.total = result.total
      state.dataSource = result.records
    }

    onMounted(() => {
      getList()
    })

    const handleChange = (pageNumber: number, pageSize: number): void => {
      state.params.pageNumber = pageNumber
      state.params.pageSize = pageSize
      getList()
    }

    return (): JSX.Element => (
      <div>
        <VerticalLine title='整改记录' />
        <Table
          style={{
            marginTop: '12px'
          }} columns={columns} size='small' dataSource={state.dataSource}
        />
        <div class={styles.pagination}>
          <GPagination total={state.params.total} pageSize={state.params.pageSize} current={state.params.pageNumber} onChange={handleChange} />
        </div>
      </div>
    )
  }
})
