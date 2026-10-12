import { defineComponent, onMounted, reactive, ref } from 'vue'
import { Button, Page, PopConfirm, PopOver } from '@ghcloud/cube-ui'
import { usePageName } from '@ghcloud/cube-utils'
import { useRoute, useRouter } from 'vue-router'
import dayjs from 'dayjs'
import { cubeAnnouncementService } from '@/api/service'
import { CubeLayout, useCubeForm, useCubeTable } from '@ghcloud/cube-app-design'
import type { Key } from '@ghcloud/cube-ui/src/components/table/table'
/** 公告管理 */
export const NoticeManage = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName()
    const pagination = ref<
      {
        pageSize: number;
        pageNumber: number;
        total?: number;
      }
    >({
      pageSize: 10,
      pageNumber: 1,
      total: 0
    })
    const formState = reactive<{
      type: string;
      level: string;
      keyword: string;
      period: string;
    }>({
      type: '',
      level: '',
      keyword: '',
      period: '',
    })
    const route = useRoute()
    const router = useRouter()
    const tableCode = route.path.replaceAll('/', '')
    const selectedKeys = ref<Key[]>([])
    const hasReadOptions = ref<{
      value: string;
      label: string;
    }[]>([])
    const levelOptions = ref<{
      value: string;
      label: string;
    }[]>([])
    const pageChange = (pageNumber: number, pageSize: number): void => {
      pagination.value.pageNumber = pageNumber || 1
      pagination.value.pageSize = pageSize
    }

    const operationRecord = async (data: Record<string, string>): Promise<void> => {
      router.push({
        path: '/bulletinManageAdd',
        query: {
          id: data.id,
          type: 'details'
        }
      })
    }
    const addNotice = async (): Promise<void> => {
      router.push({
        path: '/bulletinManageAdd',
        query: {
          type: 'add'
        }
      })
    }

    /**
     * 表单配置
     */
    const formSchema = [
      {
        component: 'Select',
        label: '公告类型',
        fieldName: 'type',
        componentProps: {
          options: hasReadOptions.value,
        },
      },
      {
        component: 'Select',
        label: '公告级别',
        fieldName: 'level',
        componentProps: {
          options: levelOptions.value
        }
      },
      {
        component: 'RangePicker',
        label: '公告时间',
        fieldName: 'period',
        componentProps: {
          valueFormat: 'YYYY-MM-DD'
        }
      },
      {
        component: 'Input',
        label: '',
        fieldName: 'keyword',
        componentProps: {
          placeholder: '名称'
        }
      },
    ]

    const columns = [
      {
        title: '公告时间',
        dataIndex: 'noticeTime',
        align: 'center',
        customRender: ({ text }: { text: string; }): JSX.Element => {
          const time = text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : ''
          return <PopOver content={time || '--'}>{time || '--'}</PopOver>
        }
      },
      {
        title: '公告标题',
        dataIndex: 'title',
        ellipsis: true,
        align: 'center',
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '公告级别',
        dataIndex: 'levelName',
        ellipsis: true,
        align: 'center',
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '公告人',
        dataIndex: 'createBy',
        ellipsis: true,
        align: 'center',
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '操作',
        dataIndex: 'action',
        ellipsis: true,
        align: 'center',
        width: 220,
        customRender: ({ record }: { record: Record<string, string>; }): JSX.Element => {
          return (
            <>
              <Button type='link' size='small' onClick={() => {
                operationRecord(record)
              }}>详情</Button>
              <PopConfirm title='确认删除该项？' onConfirm={async () => deleteRecord(record)}>
                <Button type='link' danger size='small'>删除</Button>
              </PopConfirm>
              <Button type='link' size='small' onClick={() => {
                isHide(record, 'status')
              }}>{record.status === 'DISPLAY' ? '隐藏' : '显示'}</Button>
              <Button type='link' size='small' onClick={() => {
                isHide(record, 'top')
              }}>{record.isTopping === '0' ? '置顶' : '取消置顶'}</Button>
            </>
          )
        }
      },
    ]

    const [CubeTable, tableApi] = useCubeTable({
      columns,
      tableCode,
      rowSelection: 'checkbox',
      rowKey: 'id',
      rowSelectionChange: (selectedRowKeys) => {
        selectedKeys.value = selectedRowKeys
      },
      fetchApi: async () => {
        const params = {
          ...pagination.value,
          ...formState,
        }
        delete params?.total
        return cubeAnnouncementService.listAnnouncement(params)
      },
      fetchLoaded: (data) => {
        pagination.value.total = data.total
      }
    })
    const isHide = async (data: Record<string, string>, type: string): Promise<void> => {
      const params = {
        id: data.id,
        isTopping: false,
        status: ''
      }
      if (type === 'status') {
        params.isTopping = data.isTopping !== '0'
        params.status = data.status === 'DISPLAY' ? 'HIDE' : 'DISPLAY'
      } else {
        params.isTopping = data.isTopping === '0'
        params.status = data.status
      }
      await cubeAnnouncementService.updateHideTop([params])
      tableApi.query()
    }
    const deleteRecord = async (data: Record<string, string>): Promise<void> => {
      await cubeAnnouncementService.noticeInfoBatch(data.id)
      tableApi.query()
    }

    const deleteBathRecord = async (): Promise<void> => {
      await cubeAnnouncementService.noticeInfoDeleteBatch(selectedKeys.value.join(','))
      tableApi.query()
      selectedKeys.value.length = 0
    }
    const [CubeForm, formApi] = useCubeForm({
      layout: 'horizontal',
      handleSubmit: (data) => {
        formState.keyword = data.keyword as string || ''
        formState.period = data.period as string || ''
        formState.level = data.level as string || ''
        formState.type = data.type as string || ''
        tableApi.query()
      },
      handleReset: () => {
        formState.keyword = ''
        formState.period = ''
        formState.level = ''
        formState.type = ''
        pagination.value.pageNumber = 1
        tableApi.query()
      },
      schema: formSchema,
      showCollapseButton: true
    })

    const getNoticeType = async (): Promise<void> => {
      const res = await cubeAnnouncementService.noticeType()
      hasReadOptions.value = res.map(e => {
        return {
          value: e.id,
          label: e.typeName
        }
      })
      const schema = {
        component: 'Select',
        label: '公告类型',
        fieldName: 'type',
        componentProps: {
          options: hasReadOptions.value,
        },
      }
      formApi.updateFieldSchema(schema)
    }
    const getNoticeLevel = async (): Promise<void> => {
      const res = await cubeAnnouncementService.noticeLevel()
      levelOptions.value = res.map(e => {
        return {
          value: e.code,
          label: e.name
        }
      })
      const schema = {
        component: 'Select',
        label: '公告级别',
        fieldName: 'level',
        componentProps: {
          options: levelOptions.value,
        }
      }
      formApi.updateFieldSchema(schema)
    }

    onMounted(async () => {
      await getNoticeType()
      await getNoticeLevel()
    })
    const layoutSlots = {
      'layout-header': (): JSX.Element => {
        return <Button type='primary' onClick={addNotice}>新增</Button>
      },
      'layout-content': (): JSX.Element => {
        return (
          <>
            <CubeForm />
            <CubeTable />
          </>
        )
      },
      'footer-btn': (): JSX.Element => {
        return (
          <div>
            已选{selectedKeys.value.length}项
            <PopConfirm title='确认删除该项？' onConfirm={deleteBathRecord}>
              <Button
                style={{ marginLeft: '10px' }}
                disabled={selectedKeys.value.length === 0} type='primary'
              >删除
              </Button>
            </PopConfirm>
          </div>
        )
      },
      'footer-page': (): JSX.Element => {
        return (
          <Page
            v-model:current={pagination.value.pageNumber}
            v-model:pageSize={pagination.value.pageSize}
            v-model:total={pagination.value.total}
            onPageChange={pageChange}
          />
        )
      },
    }
    return (): JSX.Element =>
      <>
        <CubeLayout title={pageTitle ?? '公告管理'} v-slots={layoutSlots} />
      </>
  }
})
