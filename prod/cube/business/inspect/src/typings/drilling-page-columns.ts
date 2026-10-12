import { Tag, type TableColumnsType } from 'ant-design-vue'
import { h } from 'vue'
import dayjs from 'dayjs'
// 报修记录
export const statisticsRepairColumns: TableColumnsType = [
  {
    title: '提交时间',
    dataIndex: 'submitTime',
    ellipsis: true,
    align: 'center',
    customRender: ({ text }) => {
      return text || '-'
    }
  },
  {
    title: '故障单名称',
    dataIndex: 'name',
    ellipsis: true,
    align: 'center',
    customRender: ({ text }) => {
      return text || '-'
    }
  },
  {
    title: '故障设备',
    dataIndex: 'equipment',
    ellipsis: true,
    align: 'center',
    customRender: ({ text }) => {
      return text || '-'
    }
  },
  {
    title: '故障来源',
    dataIndex: 'source',
    ellipsis: true,
    align: 'center',
    customRender: ({ text }) => {
      return text === 'MANUAL_SUBMISSION' ? '手动提交' : '系统生成'
    }
  },
  {
    title: '提交人',
    dataIndex: 'submitStaff',
    ellipsis: true,
    align: 'center',
    customRender: ({ text }) => {
      return text || '-'
    }
  },

  {
    title: '状态',
    dataIndex: 'state',
    ellipsis: true,
    align: 'center',
    customRender: ({ text }) => {
      if (text === 'WAITING_FOR_CONFIRM') {
        return [
          h(Tag, { content: '待确认', color: 'default' }, { default: () => '待确认' as string || '--' })
        ]
      } else if (text === 'CONFIRMED') {
        return [
          h(Tag, { content: '已确认', color: 'warning' }, { default: () => '已确认' as string || '--' })
        ]
      } else {
        return [
          h(Tag, { content: '已结束', color: 'success' }, { default: () => '已结束' as string || '--' })
        ]
      }
    }
  },
  {
    title: '处理结果',
    dataIndex: 'result',
    ellipsis: true,
    align: 'center',
    customRender: ({ text }) => {
      if (text === 'UNRESOLVED') {
        return [
          h(Tag, { content: '未解决', color: 'warning' }, { default: () => text as string || '--' })
        ]
      } else {
        return [
          h(Tag, { content: '已解决', color: 'success' }, { default: () => text as string || '--' })
        ]
      }
    }
  },
]
// 不匹配项 -------
export const statisticsMismatchingColumns: TableColumnsType = [
  {
    title: '巡检项名称',
    dataIndex: 'name',
    ellipsis: true,
    align: 'center',
  },
  {
    title: '巡检对象',
    dataIndex: 'inspectionObj',
    ellipsis: true,
    align: 'center',
    customRender: ({ text }) => {
      return text || '-'
    }
  },
  {
    title: '巡检项内容',
    dataIndex: 'content',
    ellipsis: true,
    align: 'center',
    customRender: ({ text }) => {
      return text || '-'
    }
  },
  {
    title: '巡检结果',
    dataIndex: 'result',
    ellipsis: true,
    align: 'center',
    customRender: ({ text }) => {
      return text || '-'
    }
  },
  {
    title: '上报结果',
    dataIndex: 'reportResult',
    ellipsis: true,
    align: 'center',
    customRender: ({ text }) => {
      return text || '-'
    }
  },
  {
    title: '稽查结果',
    dataIndex: 'checkResult',
    ellipsis: true,
    align: 'center',
    customRender: ({ text }) => {
      return text || '-'
    }
  },
  {
    title: '任务负责人',
    dataIndex: 'principal',
    ellipsis: true,
    align: 'center',
    customRender: ({ text }) => {
      return text || '-'
    }
  },
  {
    title: '稽查人',
    dataIndex: 'checkPerson',
    ellipsis: true,
    align: 'center',
    customRender: ({ text }) => {
      return text || '-'
    }
  },
]
// 隐患记录
export const statisticShiddenDangerColumns: TableColumnsType = [
  {
    title: '提交时间',
    dataIndex: 'submitTime',
    ellipsis: true,
    align: 'center',
    customRender: ({ text }) => {
      return text || '-'
    }
  },
  {
    title: '隐患单名称',
    dataIndex: 'name',
    ellipsis: true,
    align: 'center',
    customRender: ({ text }) => {
      return text || '-'
    }
  },
  {
    title: '隐患对象',
    dataIndex: 'hiddenDangerObj',
    ellipsis: true,
    align: 'center',
    customRender: ({ text }) => {
      return text || '-'
    }
  },
  {
    title: '隐患来源',
    dataIndex: 'source',
    ellipsis: true,
    align: 'center',
    customRender: ({ text }) => {
      return text || '-'
    }
  },
  {
    title: '隐患分类',
    dataIndex: 'classify',
    ellipsis: true,
    align: 'center',
    customRender: ({ text }) => {
      return text || '-'
    }
  },
  {
    title: '隐患程度',
    dataIndex: 'levelName',
    ellipsis: true,
    align: 'center',
    customRender: ({ text }) => {
      return text || '-'
    }
  },
  {
    title: '提交人',
    dataIndex: 'submitter',
    ellipsis: true,
    align: 'center',
    customRender: ({ text }) => {
      return text || '-'
    }
  },
  {
    title: '状态',
    dataIndex: 'state',
    ellipsis: true,
    align: 'center',
    customRender: ({ text }) => {
      if (text === 'WAITING_FOR_CONFIRM') {
        return [
          h(Tag, { content: '待确认', color: 'default' }, { default: () => text as string || '--' })
        ]
      } else if (text === 'CONFIRMED') {
        return [
          h(Tag, { content: '已确认', color: 'warning' }, { default: () => text as string || '--' })
        ]
      } else {
        return [
          h(Tag, { content: '已结束', color: 'success' }, { default: () => text as string || '--' })
        ]
      }
    }
  },
  {
    title: '处理结果',
    dataIndex: 'result',
    ellipsis: true,
    align: 'center',
    customRender: ({ text }) => {
      if (text === 'UNRESOLVED') {
        return [
          h(Tag, { content: '未解决', color: 'warning' }, { default: () => text as string || '--' })
        ]
      } else {
        return [
          h(Tag, { content: '已解决', color: 'success' }, { default: () => text as string || '--' })
        ]
      }
    }
  },
]
// 任务记录
export const departmentTasksColumns: TableColumnsType = [
  {
    title: '名称',
    dataIndex: 'taskName',
    ellipsis: true,
    align: 'center',
    customRender: ({ text }) => {
      return text || '-'
    }
  },
  {
    title: '巡检类型',
    dataIndex: 'inspectionType',
    ellipsis: true,
    align: 'center',
    customRender: ({ text }) => {
      return text || '-'
    }
  },
  {
    title: '任务类型',
    dataIndex: 'taskType',
    ellipsis: true,
    align: 'center',
    customRender: ({ text }) => {
      return text || '-'
    }
  },
  {
    title: '责任人/部门',
    dataIndex: 'dutyOfficer',
    ellipsis: true,
    align: 'center',
    customRender: ({ text }) => {
      return text || '-'
    }
  },
  {
    title: '发布时间',
    dataIndex: 'publishTime',
    ellipsis: true,
    align: 'center',
    customRender: ({ text }) => {
      return text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '-'
    }
  },
  {
    title: '任务时限',
    dataIndex: 'taskTimeLimitStr',
    ellipsis: true,
    align: 'center',
    customRender: ({ text }) => {
      return text || '-'
    }
  },
  {
    title: '巡检对象数',
    dataIndex: 'objNum',
    ellipsis: true,
    align: 'center',
    customRender: ({ text }) => {
      return text || '-'
    }
  },
  {
    title: '进度',
    dataIndex: 'progress',
    ellipsis: true,
    align: 'center',
    customRender: ({ text }) => {
      return text || '-'
    }
  },
  {
    title: '状态',
    dataIndex: 'state',
    ellipsis: true,
    align: 'center',
    customRender: ({ text }) => {
      return text || '-'
    }
  },
]
// 巡检记录
export const inspectionRecordsColumns: TableColumnsType = [
  {
    title: '发布时间',
    dataIndex: 'releaseTime',
    ellipsis: true,
    align: 'center',
    customRender: ({ text }) => {
      return text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '-'
    }
  },
  {
    title: '巡检对象名称',
    dataIndex: 'objName',
    ellipsis: true,
    align: 'center',
    customRender: ({ text }) => {
      return text || '-'
    }
  },
  {
    title: '任务名称',
    dataIndex: 'taskName',
    ellipsis: true,
    align: 'center',
    customRender: ({ text }) => {
      return text || '-'
    }
  },
  {
    title: '巡检人员',
    dataIndex: 'inspectionStaff',
    ellipsis: true,
    align: 'center',
    customRender: ({ text }) => {
      return text || '-'
    }
  },
  {
    title: '稽查人员',
    dataIndex: 'checkStaff',
    ellipsis: true,
    align: 'center',
    customRender: ({ text }) => {
      return text || '-'
    }
  },
  {
    title: '状态',
    dataIndex: 'state',
    ellipsis: true,
    align: 'center',
    customRender: ({ text }) => {
      return text || '-'
    }
  },
  {
    title: '巡检时间',
    dataIndex: 'inspectionTime',
    ellipsis: true,
    align: 'center',
    customRender: ({ text }) => {
      return text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '-'
    }
  },
  {
    title: '结果',
    dataIndex: 'result',
    ellipsis: true,
    align: 'center',
    customRender: ({ text }) => {
      return text || '-'
    }
  },
]
