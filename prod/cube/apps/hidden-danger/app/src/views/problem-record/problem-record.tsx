import { defineComponent, onMounted, reactive, watch } from 'vue'
import styles from './index.module.less'
import { Layout } from '@/components/layout/layout'
import { tableExportExcel, usePageName } from '@ghcloud/cube-utils'
import { Button, Form, FormItem, message, PopOver, DateRangePicker, Page, Select, Space } from '@ghcloud/cube-ui'
import { cubeMaintainService } from '@/api/service'
import { AliasTable } from '@ghcloud/generic-component'
import type { FaultListType } from '@ghcloud/cube-maintain-service'
import { goStreamPage } from '@/utils'
import dayjs from 'dayjs'
interface StateVo {
  dataSource: FaultListType[];
  loading: boolean;
  exportLoading: boolean;
  searchState: {
    status: string;
    submitTime: string;
  };
  page: {
    pageSize: number;
    pageNumber: number;
    total: number;
  };
}// 设备实例列表 - 查询

export const ProblemRecord = defineComponent({
  // 组件的setup函数
  setup: () => {
    // 使用usePageName函数获取页面名称
    const { pageTitle } = usePageName()
    const businessType = 'HIDDENDANGER'

    const state = reactive<StateVo>({
      exportLoading: false,
      dataSource: [],
      searchState: {
        status: '',
        submitTime: '',
      },
      loading: false,
      page: {
        pageSize: 10,
        pageNumber: 1,
        total: 0
      },
    })
    const statusOptions = [
      { value: 'ACTIVE', label: '处理中' },
      { value: 'REJECT', label: '驳回' },
      { value: 'UNDO', label: '撤销' },
      { value: 'FINISHED', label: '完成' },
    ]

    const getDataList = async (): Promise<void> => {
      try {
        state.loading = true
        const result = await cubeMaintainService.getHiddenPage({
          businessType,
          ...state.searchState,
          ...state.page
        })
        state.dataSource = result.records
        state.page.total = result.total
      } catch (error) {
        const { errorMessage } = (error as { toJSON: () => { errorMessage: string; }; }).toJSON()
        message.error(errorMessage || '请求失败')
      } finally {
        state.loading = false
      }
    }
    const pageChange = (page: number, pageSize: number): void => {
      state.page.pageNumber = page
      state.page.pageSize = pageSize
      getDataList()
    }
    onMounted(() => {
      getDataList()
    })
    const handleSearch = (): void => {
      state.page.pageNumber = 1
      getDataList()
    }
    const handleReset = (): void => {
      state.searchState.status = ''
      state.searchState.submitTime = ''
      state.page.pageNumber = 1
      getDataList()
    }

    watch(() => state.searchState.status, () => {
      getDataList()
    })

    const handleCreate = (): void => {
      const pathParams = {
        businessType,
        type: 'add',
        title: pageTitle
      }
      goStreamPage(pathParams)
    }
    const handleInfo = (record: FaultListType): void => {
      const pathParams = {
        businessType,
        type: 'info',
        title: pageTitle,
        id: record.processInstanceId,
        currentTaskId: record.currentTaskId,
        status: record.status,
      }
      goStreamPage(pathParams)
    }
    const columns = [
      {
        title: '编号',
        dataIndex: 'code',
        ellipsis: true,
        width: 150,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return (
            <PopOver content={text || ''}>
              {text || '--'}
            </PopOver>
          )
        },
      },
      {
        title: '发起时间',
        dataIndex: 'submitedTime',
        ellipsis: true,
        width: 200,
        defaultVisible: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          const time = dayjs(text).format('YYYY-MM-DD HH:mm:ss')
          return (
            <PopOver content={time || ''}>
              {time || '--'}
            </PopOver>
          )
        },
      },
      {
        dataIndex: 'instanceName',
        title: '隐患单名称',
        width: 200,
        defaultVisible: true,
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
        dataIndex: 'hiddenObjName',
        title: '隐患对象',
        defaultVisible: true,
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
        dataIndex: 'hiddenType',
        title: '隐患类型',
        defaultVisible: true,
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
        dataIndex: 'urgencyLevel',
        title: '紧急程度',
        defaultVisible: true,
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return (
            <PopOver
              content={text || '--'}
            >
              {text || '--'}
            </PopOver>
          )
        },
      },
      {
        title: '发起人',
        dataIndex: 'startUserName',
        defaultVisible: true,
        key: 'startUserName',
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return (
            <PopOver
              content={text || '--'}
            >
              {text || '--'}
            </PopOver>
          )
        },
      },
      {
        title: '处理状态',
        dataIndex: 'status',
        defaultVisible: true,
        key: 'status',
        customRender: ({ text }: { text: string; }): JSX.Element => {
          const statusName = statusOptions.find((item: { value: string; }) => item.value === text)?.label ?? '--'
          return (
            <PopOver
              content={statusName || '--'}
            >
              {statusName || '--'}
            </PopOver>
          )
        },
      },
      {
        title: '处理进度',
        dataIndex: 'activeNodeName',
        defaultVisible: true,
        key: 'activeNodeName',
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return (
            <PopOver
              content={text || '--'}
            >
              {text || '--'}
            </PopOver>
          )
        },
      },
      {
        title: '处理结果',
        dataIndex: 'result',
        defaultVisible: true,
        key: 'result',
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return (
            <PopOver
              content={text || '--'}
            >
              {text || '--'}
            </PopOver>
          )
        },
      },
      {
        dataIndex: 'action',
        title: '操作',
        customRender: ({ record }: { record: FaultListType; }): JSX.Element => {
          return (
            <a
              onClick={() => { handleInfo(record) }}
            >详情
            </a>

          )
        }
      },
    ]
    const getAllData = async (): Promise<unknown[]> => {
      const params = {
        pageSize: 100,
        businessType,
        ...state.searchState
      }
      let currentPage = 1
      let totalPages = 1
      let allData: unknown[] = []
      while (currentPage <= totalPages) {
        const { records, pages } = await cubeMaintainService.getHiddenPage({ ...params, pageNumber: currentPage })
        const handleRecords = records.map(item => {
          return {
            ...item,
            submitedTime: dayjs(item.submitedTime).format('YYYY-MM-DD HH:mm:ss')
          }
        })
        allData = [...allData, ...handleRecords]
        currentPage++
        totalPages = pages
      }
      return allData
    }
    const handleExport = async (): Promise<void> => {
      try {
        state.exportLoading = true
        const dataSource = await getAllData()
        const exportColumns = columns.slice(0, columns.length - 1).map((item) => {
          return {
            header: item.title,
            key: item.dataIndex,
          }
        })
        await tableExportExcel(
          {
            dataSource,
            columns: exportColumns,
            fileName: '隐患单'
          }
        )
      } finally {
        state.exportLoading = false
      }
    }
    const layoutSlots = {
      'layout-header': (): JSX.Element => {
        return (
          <Space>
            <Button
              type='primary' onClick={handleCreate}
            >新增
            </Button>
            <Button
              type='primary' onClick={handleExport}
              loading={state.exportLoading}
            >导出
            </Button>
          </Space>

        )
      },
      'layout-content': (): JSX.Element => {
        return (
          <div class={styles.content}>
            <Form layout='inline' style={{ margin: '10px 0 0 0' }}>
              <FormItem style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }} label='状态'>
                <Select
                  v-model:value={state.searchState.status}
                  options={statusOptions}
                  style={{ width: '180px' }}
                />
              </FormItem>
              <FormItem style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }} label='发起时间'>
                <DateRangePicker v-model:value={state.searchState.submitTime} />
              </FormItem>
              <FormItem style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }}>
                <Button type='primary' onClick={handleSearch}>查询</Button>
                <Button style={{ marginLeft: '10px' }} onClick={handleReset}>重置</Button>
              </FormItem>
            </Form>
            <AliasTable
              rowKey='id'
              dataSource={state.dataSource}
              columns={columns}
              loading={state.loading}
              applicationCode={businessType}
              tableCode='PROBLEMS_RECORDS'
            />
          </div>
        )
      },
      'footer-page': (): JSX.Element => {
        return (
          <Page
            v-show={state.page.total > 0}
            v-model:current={state.page.pageNumber}
            v-model:pageSize={state.page.pageSize}
            v-model:total={state.page.total}
            onPageChange={pageChange}
          />
        )
      }
    }
    return (): JSX.Element => (
      <Layout v-slots={layoutSlots} class={styles.container} title={pageTitle} />
    )
  }
})
