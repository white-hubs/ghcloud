import { defineComponent, onMounted, reactive, ref } from 'vue'
import { GLayout } from '@/components/common/layout'
import { GPagination } from '@/components/common/pagination'
import { Button, DateRangePicker, Form, FormItem, Input, Select, Table } from '@ghcloud/cube-ui'
import styles from './monitoring.module.less'
import { TaskModal } from './task-modal.tsx'
import { cubeSecurityService } from '@/api/service'
import type { RollCallTask } from '@ghcloud/cube-security-management-service'
import dayjs from 'dayjs'
interface SearchType {
  pageNumber: number;
  pageSize: number;
  callTimePeriod?: string;
  callType?: string;
  taskName: string;
}
export const TaskRecord = defineComponent({
  setup: () => {
    const total = ref<number>(0)
    const search = reactive<SearchType>({
      pageNumber: 1,
      pageSize: 10,
      callTimePeriod: '',
      callType: '',
      taskName: '',
    })
    const tableLoading = ref<boolean>(false)
    const scrollY = ref<number>(400)
    const scrollHandle = (): void => {
      let tableHeight = 0
      const clientHeight = document.getElementById('task-record')?.parentElement?.clientHeight
      if (clientHeight) {
        tableHeight = clientHeight - 200
      }
      scrollY.value = tableHeight
    }
    onMounted(async () => {
      // 设置表格滚动
      scrollHandle()
      window.addEventListener('resize', function () {
        scrollHandle()
      })
    })
    const tableData = ref<RollCallTask[]>([])
    const visibleModal = ref(false)
    const options = ref()
    const status = new Map([
      [0, '已结束'],
      [1, '执行中'],
      [2, '待执行'],
    ])
    const callType = new Map([
      [0, '宿舍'],
      [1, '教室']
    ])
    // 查询任务表格数据===================================================================================================
    // 获取任务表格数据
    const getRollCallTaskPage = async (): Promise<void> => {
      tableLoading.value = true
      try {
        const res = await cubeSecurityService.personRollCallTaskPage(search)
        tableLoading.value = false
        total.value = res.total
        tableData.value = res.records
      } catch {
        tableLoading.value = false
      }
    }
    // 获取人员点名类别枚举
    const gePersonCallType = async (): Promise<void> => {
      tableLoading.value = true
      try {
        options.value = await cubeSecurityService.personCallType()
      } catch {
      }
    }
    onMounted(() => {
      getRollCallTaskPage()
      gePersonCallType()
    })
    const changePage = (page: number, pageSize: number): void => {
      search.pageNumber = page
      search.pageSize = pageSize
      getRollCallTaskPage()
    }
    const changeSize = (current: number, size: number): void => {
      search.pageNumber = 1
      search.pageSize = size
      getRollCallTaskPage()
    }
    const handleSearch = (): void => {
      search.pageNumber = 1
      getRollCallTaskPage()
    }
    const handleReset = (): void => {
      search.pageNumber = 1
      search.callTimePeriod = ''
      search.callType = ''
      search.taskName = ''
      getRollCallTaskPage()
    }
    const currentCode = ref('')
    const handleDetail = (code: string): void => {
      currentCode.value = code
      visibleModal.value = true
    }
    // 表格列名==========================================================================================================
    const recordTableColumns = [
      {
        title: '点名任务编号',
        dataIndex: 'taskCode',
        key: 'taskCode',
        customRender: ({ text }: { text: string; }): string => {
          return text || '-'
        }
      },
      {
        title: '点名任务名称',
        dataIndex: 'taskName',
        key: 'taskName',
        customRender: ({ text }: { text: string; }): string => {
          return text || '-'
        }
      },
      {
        title: '场所名称',
        dataIndex: 'locationName',
        key: 'locationName',
        customRender: ({ text }: { text: string; }): string => {
          return text || '-'
        }
      },
      {
        title: '点名类别',
        dataIndex: 'callType',
        key: 'callType',
        customRender: ({ text }: { text: number; }): string => {
          return callType.get(text) || '-'
        }
      },
      {
        title: '点名时间',
        dataIndex: 'callStartTime',
        key: 'callStartTime',
        customRender: ({ text }: { text: string; }): string => {
          return dayjs(text).format('YYYY-MM-DD HH:mm:ss') || '-'
        }
      },
      {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        customRender: ({ text }: { text: number; }): string => {
          return status.get(text) || '-'
        }
      },
      {
        title: '已点到人数',
        dataIndex: 'attendedCount',
        key: 'attendedCount',
        customRender: ({ text }: { text: string; }): string => {
          return text || '-'
        }
      },
      {
        title: '未点到人数',
        dataIndex: 'unattendedCount',
        key: 'unattendedCount',
        customRender: ({ text }: { text: string; }): string => {
          return text || '-'
        }
      },
      {
        title: '特殊人数',
        dataIndex: 'specialCount',
        key: 'specialCount',
        customRender: ({ text }: { text: string; }): string => {
          return text || '-'
        }
      },
      {
        title: '点名时长',
        dataIndex: 'duration',
        key: 'duration',
        customRender: ({ text }: { text: string; }): string => {
          return text || '-'
        }
      },
      {
        title: '操作',
        dataIndex: 'operate',
        key: 'operate',
        align: 'center',
        customRender: ({ record }: { record: RollCallTask; }): JSX.Element => {
          return <Button type='link' onClick={() => {
            handleDetail(record.taskCode)
          }}>详情</Button>
        }
      },
    ]
    // 布局插槽==========================================================================================================
    const gLayoutSlots = {
      'content-search': (): JSX.Element => {
        return (
          <Form layout='inline'>
            <FormItem label='点名时间'>
              <DateRangePicker v-model:value={search.callTimePeriod} />
            </FormItem>
            <FormItem label='点名类别'>
              <Select field-names={{ label: 'desc', value: 'code' }} allowClear v-model:value={search.callType} options={options.value} style={{ width: '200px' }} />
            </FormItem>
            <FormItem label='点名任务'>
              <Input placeholder='输入任务名称' v-model:value={search.taskName} />
            </FormItem>
            <FormItem>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Button type='primary' onClick={handleSearch}>查询</Button>
                <Button onClick={handleReset}>重置</Button>
              </div>
            </FormItem>
          </Form>
        )
      },
      'content-table': (): JSX.Element => {
        return (
          <>
            <div class={styles['content-right']} id='task-record'>
              <Table
                columns={recordTableColumns}
                data-source={tableData.value}
                loading={tableLoading.value}
                scrollY={scrollY.value}
                rowKey='id'
                pagination={false}
              />
              <div class={styles['table-footer']}>
                <GPagination
                  current={search.pageNumber}
                  pageSize={search.pageSize}
                  total={total.value}
                  onChangePage={changePage}
                  onChangeSize={changeSize}
                />
              </div>
            </div>
          </>
        )
      },
    }
    return (): JSX.Element =>
      <>
        <GLayout title='点名任务记录' showFooter={false} v-slots={gLayoutSlots} />
        {visibleModal.value ? <TaskModal code={currentCode.value} visible={visibleModal.value} onClose={() => {
          visibleModal.value = false
        }} /> : null}
      </>
  }
})
