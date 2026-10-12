import { defineComponent, onMounted, reactive } from 'vue'
import styles from './execute-progress.module.less'
import { Button, PopOver, Table } from '@ghcloud/cube-ui'
import { cubeDailyInspectionService } from '@/api/server'
import { useRoute } from 'vue-router'
import { type InspectTaskRate, type TaskRateResult } from '@ghcloud/cube-daily-inspection-service'

export const ExecuteProgress = defineComponent({
  setup: () => {
    const route = useRoute()
    const state = reactive<{
      details: InspectTaskRate;
      dataSource: TaskRateResult[];
      params: {
        pageNumber: number;
        pageSize: number;
        targetId: string;
        temporary: string;
        total: number;
      };
    }>({
      details: {
        repairCount: 0,
        targetAllNum: 0,
        repairNum: 0,
        waitTargetNum: 0,
        completedTargetNum: 0,
        errTargetNum: 0,
        taskRateResults: [],
        recordTaskResultList: []
      },
      dataSource: [],
      params: {
        pageNumber: 1,
        pageSize: 10,
        targetId: '',
        temporary: '0',
        total: 0,
      }
    })
    const inspectColumns = [
      {
        dataIndex: 'targetName',
        title: '巡检对象名称',
        align: 'center',
        slots: {
          customRender: 'targetName',
        },
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return (
            <PopOver content={text || ''}>
              {text || '--'}
            </PopOver>
          )
        },
      },
      {
        dataIndex: 'targetCategory',
        title: '巡检对象类',
        align: 'center',
        slots: {
          customRender: 'targetCategory',
        },
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          const obj: Record<string, string> = {
            DEVICE: '设备',
            STALL: '档位',
            PROPERTY: ' 资产',
            SITE_POINT: '现场点',
            RISK_SOURCE: '风险源',
          }
          return (
            <PopOver content={obj[text] ? obj[text] : '--'}>
              {obj[text] ? obj[text] : '--'}
            </PopOver>
          )
        },
      },
      {
        dataIndex: 'status',
        title: '状态',
        align: 'center',
        slots: {
          customRender: 'status',
        },
        ellipsis: true,
        customRender: ({ text }: { text: string; }): string => {
          if (text === 'EXECUTING') {
            return '待巡检'
          } else if (text === 'OVER') {
            return '已巡检'
          } else if (text === 'EXPIRE') {
            return '已过期'
          } else if (text === 'STOP') {
            return '已终止'
          } else if (text === 'CONFIRM') {
            return '待确认'
          } else if (text === 'SPLIT') {
            return '待拆解'
          } else if (text === 'ACCEPT') {
            return '待接收'
          } else if (text === 'OVERTIME') {
            return '超时完成'
          } else {
            return '--'
          }
        },
      },
      {
        dataIndex: 'itemName',
        title: '巡检项',
        align: 'center',
        slots: {
          customRender: 'itemName',
        },
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return (
            <PopOver content={text || ''}>
              {text || '--'}
            </PopOver>
          )
        },
      },

      {
        dataIndex: 'result',
        title: '巡检结果',
        align: 'center',
        slots: {
          customRender: 'result',
        },
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element | string => {
          switch (text) {
            case 'ABNORMAL':
              return <span class='abnormal'>异常</span>
            case 'NORMAL':
              return <span class='normal'>正常</span>
            default:
              return '--'
          }
        },
      },
      {
        dataIndex: 'nickname',
        title: '执行人',
        align: 'center',
        slots: {
          customRender: 'nickname',
        },
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return (
            <PopOver content={text || ''}>
              {text || '--'}
            </PopOver>
          )
        },
      },
      {
        dataIndex: 'action',
        title: '操作',
        align: 'center',
        slots: {
          customRender: 'action',
        },
        ellipsis: true,
        customRender: ({ record }: { record: Record<string, string>; }): JSX.Element => {
          return (
            <Button
              type='link' size='small' onClick={() => {
                history.pushState({}, '', `/portal/daily-inspection/inspect-record-info?id=${record.id}`)
              }}
            >查看巡检记录
            </Button>
          )
        }
      },

    ]
    const columns = [
      {
        dataIndex: 'taskName',
        title: '任务名称',
        align: 'center',
        slots: {
          customRender: 'taskName',
        },
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return (
            <PopOver content={text || ''}>
              {text || '--'}
            </PopOver>
          )
        },
      },
      {
        dataIndex: 'targetAllNum',
        title: '巡检对象',
        align: 'center',
        slots: {
          customRender: 'targetAllNum',
        },
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return (
            <PopOver content={text || ''}>
              {text || '--'}
            </PopOver>
          )
        },
      },
      {
        dataIndex: 'receiveNames',
        title: '执行人',
        align: 'center',
        slots: {
          customRender: 'receiveNames',
        },
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return (
            <PopOver content={text || ''}>
              {text || '--'}
            </PopOver>
          )
        },
      },
      {
        dataIndex: 'rate',
        title: '进度',
        align: 'center',
        slots: {
          customRender: 'rate',
        },
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return (
            <PopOver content={text || ''}>
              {text + '%'}
            </PopOver>
          )
        },
      },
      {
        dataIndex: 'status',
        title: '状态',
        align: 'center',
        slots: {
          customRender: 'status',
        },
        ellipsis: true,
        customRender: ({ text }: { text: string; }): string => {
          if (text === 'EXECUTING') {
            return '待巡检'
          } else if (text === 'OVER') {
            return '已巡检'
          } else if (text === 'EXPIRE') {
            return '已过期'
          } else if (text === 'STOP') {
            return '已终止'
          } else if (text === 'CONFIRM') {
            return '待确认'
          } else if (text === 'SPLIT') {
            return '待拆解'
          } else if (text === 'ACCEPT') {
            return '待接收'
          } else if (text === 'OVERTIME') {
            return '超时完成'
          } else {
            return '--'
          }
        },
      },
    ]
    onMounted(() => {
      getDetails()
    })
    const getDetails = async (): Promise<void> => {
      const result = await cubeDailyInspectionService.getInspectTaskRate({
        id: route.query.id as string
      })
      state.details = result
    }
    return (): JSX.Element => (
      <div class={styles.container}>
        <div class={styles.title}>任务执行进度</div>

        <Table
          style={{
            marginTop: '12px'
          }} columns={columns} size='small' pagination={false} dataSource={state.details.taskRateResults}
        />
        <div class={styles.titleTips}>
          <div>对象总数：{state.details.targetAllNum}次</div>
          <div>待巡检对象数：{state.details.waitTargetNum}项</div>
          <div>已巡检对象数：{state.details.completedTargetNum}项</div>
          <div>结果异常对象数：{state.details.errTargetNum}项</div>
        </div>
        <Table
          style={{
            marginTop: '6px'
          }} columns={inspectColumns} size='small' pagination={false} dataSource={state.details.recordTaskResultList}
        />
      </div>
    )
  }
})
