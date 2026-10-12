import { defineComponent, onMounted, reactive } from 'vue'
import styles from './patrol-records.module.less'
import { Button, Table } from '@ghcloud/cube-ui'
import { cubeDailyInspectionService } from '@/api/server'
import { GPagination } from '@/components/common/pagination'
import { useRoute } from 'vue-router'
import type { ArchivesDetail, DetailRecordPage } from '@ghcloud/cube-daily-inspection-service'
import dayjs from 'dayjs'
const resultStatus = {
  NORMAL: '正常',
  ABNORMAL: '异常',
}
const taskStatus = {
  SPLIT: '待拆解',
  ACCEPT: '待接收',
  EXECUTING: '进行中',
  OVER: '已完成',
  EXPIRE: '已过期',
  STOP: '已终止',
}
export const PatrolRecords = defineComponent({
  setup: () => {
    const route = useRoute()
    const state = reactive<{
      details: ArchivesDetail;
      dataSource: DetailRecordPage[];
      params: {
        pageNumber: number;
        pageSize: number;
        targetId: string;
        temporary: string;
        total: number;
        businessType: 'SMALL_ENGINEERING';
      };
    }>({
      details: {
        id: '',
        targetId: '',
        targetName: '',
        targetCategory: '',
        areaName: '',
        organizationName: '',
        time: 0,
        result: '',
        dailyNum: 0,
        dailyErrNum: 0,
        dailyList: [],
        temporaryNum: 0,
        temporaryErrNum: 0,
        temporaryList: []
      },
      dataSource: [],
      params: {
        pageNumber: 1,
        pageSize: 10,
        targetId: '',
        temporary: '0',
        total: 0,
        businessType: 'SMALL_ENGINEERING'
      }
    })
    const getDetails = async (): Promise<void> => {
      const result = await cubeDailyInspectionService.getInspectArchivesDetail({
        targetId: route.query.id as string,
        businessType: state.params.businessType
      })
      state.details = result
    }

    const getList = async (): Promise<void> => {
      state.params.targetId = route.query.id as string
      const result = await cubeDailyInspectionService.detailRecordPage(state.params)
      state.params.total = result.total
      state.dataSource = result.records
    }
    const handleDetails = (record: DetailRecordPage): void => {
      history.pushState({}, '', `/portal/small-engineering/engineering-patrol-record-info?id=${record.id}`)
    }
    const columns = [
      {
        title: '巡查时间',
        dataIndex: 'time',
        key: 'time',
        align: 'center',
        customRender: ({ text }: { text: number; }): string => {
          return dayjs(text).format('YYYY-MM-DD HH:mm:ss')
        }
      },
      {
        title: '巡查人',
        dataIndex: 'username',
        key: 'username',
        align: 'center'
      },
      {
        title: '巡查部门',
        dataIndex: 'organizationName',
        key: 'organizationName',
        align: 'center'
      },
      {
        title: '任务状态',
        dataIndex: 'status',
        key: 'status',
        align: 'center',
        customRender: ({ text }: { text: keyof typeof taskStatus; }): string => {
          return taskStatus[text]
        }
      },
      {
        title: '巡查任务结果',
        dataIndex: 'result',
        key: 'result',
        align: 'center',
        customRender: ({ text }: { text: keyof typeof resultStatus; }): string => {
          return resultStatus[text]
        }
      },
      {
        title: '所属任务',
        dataIndex: 'taskName',
        key: 'taskName',
        align: 'center'
      },
      {
        title: '操作',
        dataIndex: 'operation',
        key: 'operation',
        align: 'center',
        customRender: ({ record }: { record: DetailRecordPage; }): JSX.Element => {
          return (
            <Button type='link' onClick={() => {
              handleDetails(record)
            }}>详情</Button>
          )
        }
      },
    ]
    onMounted(() => {
      getList()
      getDetails()
    })

    const handleChange = (pageNumber: number, pageSize: number): void => {
      state.params.pageNumber = pageNumber
      state.params.pageSize = pageSize
      getList()
    }

    return (): JSX.Element => (
      <div class={styles.container}>
        <div class={styles.titleTips}>
          <div>巡查次数：{state.details.dailyNum}次</div>
          <div>巡检发现异常：{state.details.dailyErrNum}项</div>
        </div>
        <Table
          style={{
            marginTop: '12px'
          }} columns={columns} size='small' pagination={false} dataSource={state.dataSource}
        />
        <div class={styles.pagination}>
          <GPagination total={state.params.total} pageSize={state.params.pageSize} current={state.params.pageNumber} onChange={handleChange} />
        </div>
      </div>
    )
  }
})
