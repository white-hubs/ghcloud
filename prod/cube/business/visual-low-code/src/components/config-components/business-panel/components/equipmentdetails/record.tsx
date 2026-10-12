import { alarmStatisticsList, getstatus } from '@/apis/business/alarm'
import { getDate } from '@/utils'
import { NTd, NTh, NTr, Pagination, Table } from '@ghcloud/visual-view-ui'
import {
  defineComponent, ref, watch
} from 'vue'
import styles from './styles/record.module.less'
interface AlarmTakeNotesList {
  id: string;
  businessKey: string;
  alarmTime: string;
  alarmTypeName: string;
  alarmLevelName: string;
  alarmEventName: string;
  alarmStatus: string;
  alarmStatusName: string;
}
export default defineComponent({
  name: 'record',
  props: {
    code: {
      type: String,
      default: ''
    },
    id: {
      type: String,
      default: ''
    },
  },
  setup (props) {
    const handlingNum = ref(0)
    const total = ref(0)
    const pagination = ref({
      pageSize: 5,
      pageNumber: 1,
      pageCount: 1,
      total: 0
    })
    const columns = ref([
      {
        title: '序号',
        width: 80,
        align: 'center',
      },
      {
        title: '异常类型',
        align: 'center',
        dataIndex: 'alarmTypeName',
      },
      {
        title: '上报时间',
        align: 'center',
        dataIndex: 'alarmTime',
      },
      {
        title: '异常详情',
        align: 'center',
        dataIndex: 'alarmEventName',
      },
      {
        title: '当前状态',
        align: 'center',
        dataIndex: 'alarmStatusName'
      }
    ])
    const tableSlots = {
      thead: () => {
        return (
          <NTr>
            {columns.value.map((item, index) =>
              <NTh key={index}>{item.title}</NTh>
            )}
          </NTr>
        )
      },
      tbody: () => {
        return (
          <>
            {
          dataSource.value.map((item, index) => {
            return (
              <NTr key={index}>
                <NTd>{index + 1}</NTd>
                <NTd>{item.alarmTypeName}</NTd>
                <NTd><p style={{ margin: '0' }}>{getDate(item.alarmTime, 'YYYY-MM-DD HH:mm:ss')}</p></NTd>
                <NTd>{item.alarmEventName}</NTd>
                <NTd>{item.alarmStatusName}</NTd>
              </NTr>
            )
          })
        }
          </>
        )
      },
    }
    const dataSource = ref<AlarmTakeNotesList[]>([])
    const getTableData = (): void => {
      alarmStatisticsList({ alarmTargetCode: props.id, pageSize: pagination.value.pageSize, pageNumber: pagination.value.pageNumber }).then(res => {
        dataSource.value = res.data.records
        total.value = res.data.total
        pagination.value.pageCount = res.data.pages
        pagination.value.total = res.data.total
      })
      getstatus({ alarmTargetCode: props.code }).then(res => {
        handlingNum.value = res.data.alarmStatusStatistics[1].alarmNum
      })
    }
    const pageChange = (page: number): void => {
      pagination.value.pageNumber = page || 1
      getTableData()
    }
    const pageSizeChange = (pageSize: number): void => {
      pagination.value.pageSize = pageSize
      getTableData()
    }
    watch(() => props.id, () => {
      getTableData()
    })
    return () =>
      <>
        <div class={styles.title}>
          <span>告警总次数: {total.value}次</span>
          <span>处理中: {handlingNum.value}个</span>
          <span>近期异常情况概览: </span>
        </div>
        <Table v-slots={tableSlots} />
        <div class={styles.page}>
          <Pagination v-model:page={pagination.value.pageNumber} pageCount={pagination.value.pageCount} pageSize={pagination.value.pageSize} onPageChange={pageChange} onPageSizeChange={pageSizeChange} />
        </div>
      </>
  }
})
