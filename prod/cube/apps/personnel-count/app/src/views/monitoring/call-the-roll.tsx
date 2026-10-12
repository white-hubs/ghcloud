import { defineComponent, onMounted, reactive, ref } from 'vue'
import { GLayout } from '@/components/common/layout'
import { GPagination } from '@/components/common/pagination'
import { Button, Form, FormItem, Input, Table, Image } from '@ghcloud/cube-ui'
import styles from './monitoring.module.less'
import { cubeSecurityService } from '@/api/service'
import type { RollCall } from '@ghcloud/cube-security-management-service'
import dayjs from 'dayjs'
interface SearchType {
  pageNumber: number;
  pageSize: number;
  recordCode?: string;
}
export const CallTheRoll = defineComponent({
  setup: () => {
    const total = ref<number>(0)
    const search = reactive<SearchType>({
      pageNumber: 1,
      pageSize: 10,
      recordCode: ''
    })
    const status = new Map([
      [0, '点到'],
      [1, '特殊情况']
    ])
    const taskType = new Map([
      ['0', '宿舍'],
      ['1', '教室']
    ])
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
    const tableData = ref<RollCall[]>([])
    // 查询明细表格数据===================================================================================================
    // 获取明细表格数据
    const getRollCallPage = async (): Promise<void> => {
      tableLoading.value = true
      try {
        const res = await cubeSecurityService.personRollCallPage(search)
        tableLoading.value = false
        total.value = res.total
        tableData.value = res.records
      } catch {
        tableLoading.value = false
      }
    }
    onMounted(() => {
      getRollCallPage()
    })
    const changePage = (page: number, pageSize: number): void => {
      search.pageNumber = page
      search.pageSize = pageSize
      getRollCallPage()
    }
    const changeSize = (current: number, size: number): void => {
      search.pageNumber = 1
      search.pageSize = size
      getRollCallPage()
    }
    const handleSearch = (): void => {
      search.pageNumber = 1
      getRollCallPage()
    }
    const handleReset = (): void => {
      search.pageNumber = 1
      search.recordCode = ''
      getRollCallPage()
    }
    // 表格列名==========================================================================================================
    const recordTableColumns = [
      {
        title: '任务编号',
        dataIndex: 'recordCode',
        key: 'recordCode',
        customRender: ({ text }: { text: string; }): string => {
          return text || '-'
        }
      },
      {
        title: '任务类型',
        dataIndex: 'taskType',
        key: 'taskType',
        customRender: ({ text }: { text: string; }): string => {
          return taskType.get(text) || '-'
        }
      },
      {
        title: '姓名',
        dataIndex: 'personName',
        key: 'personName',
      },
      {
        title: '编号',
        dataIndex: 'indexCode',
        key: 'indexCode',
        customRender: ({ text }: { text: string; }): string => {
          return text || '-'
        }
      },
      {
        title: '证件照片',
        dataIndex: 'facePhoto',
        key: 'facePhoto',
        customRender: ({ record }: { record: RollCall; }): JSX.Element => {
          return <Image src={record.facePhoto} />
        },
      },
      {
        title: '抓拍照片',
        dataIndex: 'capturePhoto',
        key: 'capturePhoto',
        customRender: ({ record }: { record: RollCall; }): JSX.Element => {
          return <Image src={record.capturePhoto} />
        },
      },
      {
        title: '对比相似度',
        dataIndex: 'similarity',
        key: 'similarity',
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
        title: '点到时间',
        dataIndex: 'rollcallTime',
        key: 'rollcallTime',
        customRender: ({ text }: { text: string; }): string => {
          return dayjs(text).format('YYYY-MM-DD HH:mm:ss') || '-'
        }
      },
      {
        title: '所在区域',
        dataIndex: 'areaName',
        key: 'areaName',
      },
      {
        title: '点名设备',
        dataIndex: 'deviceName',
        key: 'deviceName',
      },
    ]
    // 布局插槽==========================================================================================================
    const gLayoutSlots = {
      'content-search': (): JSX.Element => {
        return (
          <Form layout='inline'>
            <FormItem label='任务编号'>
              <Input placeholder='输入任务编号' v-model:value={search.recordCode} />
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
        <GLayout title='人员点到明细' showFooter={false} v-slots={gLayoutSlots} />
      </>
  }
})
