import { defineComponent, ref, onMounted } from 'vue'
import { Table, Button, Input, Spin, Select, Popover } from 'ant-design-vue'
import styles from './project-task.module.less'
import { cubeZDDataVizService } from '@/api/service'
import { type TaskPageVO, TaskStatus } from '@ghcloud/cube-zhongda-heshun-service/src/data-viz-dto'
import { taskDetailModal } from '../../../../task-detail-modal/task-detail-modal'
import type { ColumnsType } from 'ant-design-vue/es/table'
import NoData from "@/components/businessPanel/public/noData.vue";
import { closeProjectDetailModal } from '../../../project-detail-modal'
import { modalManager } from '@/pages/widget/modal/modal-manager'
import { closeProjectModal } from '../../../../project-modal/project-modal'

interface Props {
  info: Record<string, unknown>;
  projectId?: string | number;
}

export const ProjectTask = defineComponent({
  props: ['info', 'projectId'],
  setup: (props: Props) => {
    // 表格列定义
    const columns: ColumnsType = [
      {
        title: '序号',
        dataIndex: 'index',
        width: '80px',
        customRender: ({ index }: { index: number; }): number => index + 1
      },
      {
        title: '任务名称',
        dataIndex: 'taskName',
        ellipsis: true,
        align: 'center',
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <Popover content={text || '--'}>{text || '--'}</Popover>
        }
      },
      {
        title: '任务类型',
        dataIndex: 'taskTypeName',
        ellipsis: true,
        align: 'center',
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <Popover content={text || '--'}>{text || '--'}</Popover>
        }
      },
      {
        title: '任务区域',
        dataIndex: 'taskAreaName',
        ellipsis: true,
        align: 'center',
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <Popover content={text || '--'}>{text || '--'}</Popover>
        }
      },
      {
        title: '任务时限',
        dataIndex: 'taskTimeLimitConfigStr',
        ellipsis: true,
        align: 'center',
        customRender: ({ record }: { record: TaskPageVO; }): JSX.Element => {
          const obj = typeof record?.taskTimeLimitConfigStr === 'string' ? JSON.parse(record?.taskTimeLimitConfigStr || '{}') : record?.taskTimeLimitConfigStr
          const textVal = `${obj?.day || 0}天${obj?.hour || 0}小时${obj?.minute || 0}分`
          return <Popover content={textVal || '--'}>{textVal || '--'}</Popover>
        }
      },
      {
        title: '项目负责人',
        dataIndex: 'projectLeaderName',
        ellipsis: true,
        align: 'center',
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <Popover content={text || '--'}>{text || '--'}</Popover>
        }
      },
      {
        title: '执行小组长',
        dataIndex: 'executorName',
        ellipsis: true,
        align: 'center',
        customRender: ({ record }: { record: TaskPageVO; }): JSX.Element => {
          let label = ''
          switch (record?.notificationType) {
            case 'GROUP':
              label = `小组-${record?.notificationGroupName ?? ''}`
              break;
            case 'DEPT':
              label = `部门-${record?.notificationDeptName ?? ''}`
              break;
            case 'POST':
              label = `岗位-${record?.notificationPostName ?? ''}`
              break;
            case 'ROLE':
              label = `角色-${record?.notificationRoleName ?? ''}`
              break;
            default:
              label = '--'
          }
          return <Popover content={label || '--'}>{label || '--'}</Popover>
        }
      },
      {
        title: '状态',
        dataIndex: 'status',
        ellipsis: true,
        align: 'center',
        customRender: ({ text }: { text: string; }): JSX.Element => {
          const status = statusOptions.value.find((item) => item.value === text)
          return <Popover content={status.label || '--'}>
            <span style={{ color: status.color }}>{status.label || '--'}</span>
          </Popover>
        }
      },
      {
        title: '操作',
        dataIndex: 'action',
        width: '100px',
        customRender: ({ record }: { record: unknown; }): JSX.Element => {
          return <Button type="link" size="small" onClick={async () => handleViewDetail(record)}>详情</Button>
        }
      }
    ]
    const statusOptions = ref<{ label: string; value: string; color: string; }[]>([
      { label: '全部', value: '', color: '#d9d9d9' },
      { label: '待接收', value: TaskStatus.WAIT_RECEIVE, color: '#1890ff' },
      { label: '待执行', value: TaskStatus.WAIT_EXECUTE, color: '#1890ff' },
      { label: '执行中', value: TaskStatus.EXECUTING, color: '#faad14' },
      { label: '已结束', value: TaskStatus.FINISHED, color: '#52c41a' },
      { label: '已终止', value: TaskStatus.TERMINATED, color: '#faad14' },
      { label: '已过期', value: TaskStatus.EXPIRED, color: '#faad14' },
    ])
    const dataSource = ref<TaskPageVO[]>([])
    const loading = ref<boolean>(false)
    const searchForm = ref({
      keyword: '',
      status: '',
      projectId: props.info?.id
    })

    const handleViewDetail = async (record: TaskPageVO): Promise<void> => {
      modalManager.clearStack()
      closeProjectDetailModal()
      await taskDetailModal.open({
        title: record.taskName || '任务详情',
        taskData: {
          ...record
        }
      })
    }
    // 搜索
    const handleSearch = (): void => {
      fetchData()
    }

    // 重置
    const handleReset = (): void => {
      searchForm.value = {
        keyword: '',
        status: '',
        projectId: props.info?.id
      }
      fetchData()
    }

    // 获取数据
    const fetchData = async (): Promise<void> => {
      loading.value = true
      try {
        const res = await cubeZDDataVizService.getProjectTaskList({
          keyword: searchForm.value.keyword,
          status: searchForm.value.status as TaskStatus,
          projectId: (searchForm.value.projectId || '') as string,
        })
        dataSource.value = res
      } catch {
      } finally {
        setTimeout(()=>{
          loading.value = false
        }, 500)
      }
    }

    onMounted(() => {
      fetchData()
    })

    return (): JSX.Element => (
      <div class={styles['task-container']}>
        <div class={styles['task-content']}>
          <div class={styles['search-form']}>
            <div class={styles['form-item']}>
              <span class={styles['label']}>状态</span>
              <Select
                v-model:value={searchForm.value.status}
                options={statusOptions.value}
                placeholder="全部"
                class={styles['select']}
                notFoundContent={'暂无数据'}
              />
            </div>
            <div class={styles['form-item']}>
              <span class={styles['label']}>任务查询</span>
              <Input
                v-model:value={searchForm.value.keyword}
                placeholder="任务名称"
                class={styles['input']}
              />
            </div>
            <div class={styles['form-buttons']}>
              <Button type="primary" onClick={handleSearch}>查询</Button>
              <Button onClick={handleReset}>重置</Button>
            </div>
          </div>

          <Spin spinning={loading.value}>
            <div class={styles['table-container']}>
              <Table
                columns={columns}
                dataSource={dataSource.value}
                rowKey="id"
                scroll={{ y: 350 }}
                pagination={{
                  showSizeChanger: true,
                  total: dataSource.value.length,
                  showTotal: (total) => `共 ${total} 条`,
                  defaultCurrent: 1,
                  defaultPageSize: 10,
                  locale: {
                    jump_to: '跳转到',
                    page: '页',
                    items_per_page: '条/页'
                  }
                }}
                locale={{ emptyText: <NoData /> }}
                class={styles['task-table']}
              />
            </div>
          </Spin>
        </div>
      </div>
    )
  }
})