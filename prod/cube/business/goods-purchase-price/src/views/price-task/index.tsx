import { defineComponent, onMounted, reactive, ref } from 'vue'
import { Layout } from '@/components/layout/layout'
import { Button, Form, FormItem, Input, Page, PopOver, message, AntModal, TabPane, Tabs, Tag } from '@ghcloud/cube-ui'
import { getTaskPage, deleteTask, getTaskStat } from '@/api/price-task'
import { type RecordState, type InsertState, StatusOptions } from './index.i'
import '@/styles/common.less'
import dayjs from 'dayjs'
import { useRoute } from 'vue-router'
import { AliasTable } from '@ghcloud/generic-component'
import { usePageName } from '@ghcloud/cube-utils'

export const PriceTask = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName()
    const route = useRoute()
    const tableCode = route.path.replaceAll('/', '')
    const formState = reactive({
      name: '',
    })
    const columns = [
      {
        title: '任务名称',
        dataIndex: 'name',
        code: 'name',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '采价商品',
        dataIndex: 'goodsCategoryList',
        code: 'goodsCategoryList',
        ellipsis: true,
        customRender: ({ record }: { record: { goodsCategoryList: []; }; }): JSX.Element => {
          const { goodsCategoryList } = record
          const categorys = goodsCategoryList ? goodsCategoryList.map((item: { name: string; }) => {
            return item.name
          }) : []
          const text = categorys.length > 0 ? categorys.join(',') : ''
          return (
            <>
              <PopOver content={text || '--'}>{text || '--'}</PopOver>
            </>
          )
        }
      },
      {
        title: '采价人',
        dataIndex: 'userList',
        code: 'userList',
        ellipsis: true,
        customRender: ({ record }: { record: { userList: []; }; }): JSX.Element => {
          const { userList } = record
          const users = userList ? userList.map((item: { userName: string; }) => {
            return item.userName
          }) : []
          const text = users.length > 0 ? users.join(',') : ''
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '任务来源',
        dataIndex: 'taskFrom',
        code: 'taskFrom',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '创建人',
        dataIndex: 'createUserName',
        code: 'createUserName',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '任务状态',
        dataIndex: 'status',
        code: 'status',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          const curState = StatusOptions.find(e => e.value === text)
          return (
            <>
              <PopOver content={curState?.label || '--'}>
                {curState?.label ? <Tag color={curState?.color}>{curState?.label}</Tag> : '--'}
              </PopOver>
            </>
          )
        }
      },
      {
        title: '创建时间',
        dataIndex: 'createTime',
        code: 'createTime',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          const time = dayjs(text).format('YYYY-MM-DD HH:mm:ss')
          return <PopOver content={time || '--'}>{time || '--'}</PopOver>
        }
      },
      {
        title: '操作',
        dataIndex: 'action',
        code: 'action',
        width: 180,
        customRender: ({ record }: { record: RecordState & InsertState & { secretKey: string; }; }): JSX.Element => {
          return (
            <>
              <Button type='link' size='small' onClick={() => {
                toDetail(record, 'detail')
              }}>详情</Button>
              <Button type='link' size='small' onClick={() => {
                toDetail(record, 'edit')
              }}>编辑</Button>
              <Button type='link' size='small' danger onClick={() => {
                delRow(record)
              }}>删除</Button>
            </>
          )
        }
      }
    ]

    const tabs = ref([
      { title: '执行中', key: 'EXEC', value: '' },
    ])
    const getTaskStatic = async (): Promise<void> => {
      const { data } = await getTaskStat()

      tabs.value = data.map((item: { name: string; code: string; value: string; }) => {
        return {
          title: item.name,
          key: item.code,
          value: item.value,
        }
      })
    }

    const loading = ref(false)
    const dataSource = ref<RecordState[]>([])
    const pagination = ref({
      pageSize: 10,
      pageNumber: 1,
      total: 0
    })

    const getTableData = async (): Promise<void> => {
      try {
        loading.value = true
        const params = {
          pageNumber: pagination.value.pageNumber,
          pageSize: pagination.value.pageSize,
          name: formState.name,
          status: ''
        }
        if (activeKey.value !== 'ALL') params.status = activeKey.value
        const res = await getTaskPage(params)
        if (res.data) {
          const { records, total } = res.data
          dataSource.value = records as RecordState[]
          pagination.value.total = total
        }
        getTaskStatic()
      } catch {
      } finally {
        loading.value = false
      }
    }

    const pageChange = (pageNumber: number, pageSize: number): void => {
      pagination.value.pageNumber = pageNumber || 1
      pagination.value.pageSize = pageSize
      getTableData()
    }

    const queryForm = (): void => {
      pagination.value.pageNumber = 1
      getTableData()
    }
    const reset = (): void => {
      formState.name = ''
      queryForm()
    }

    const delRow = (record: RecordState): void => {
      AntModal.confirm({
        centered: true,
        content: '确定要删除该项?',
        async onOk () {
          await deleteTask({ id: record.id })
          AntModal.destroyAll()
          message.success('操作成功')
          getTableData()
        },
        onCancel () {
          AntModal.destroyAll()
        }
      })
    }
    const add = (): void => {
      history.pushState({ current: location.pathname + location.search }, '', '/portal/goods-purchase-price/task-detail?action=add')
    }
    const toDetail = (record: RecordState, type: 'detail' | 'edit' | 'copy'): void => {
      history.pushState({ current: location.pathname + location.search }, '',
        `/portal/goods-purchase-price/task-detail?id=${record.id}&action=${type}`)
    }
    const activeKey = ref('EXEC')
    const tabChange = (): void => {
      Object.assign(formState, { ...formState, status: activeKey.value })
      getTableData()
    }
    onMounted(async () => {
      await getTaskStatic()
      activeKey.value = tabs.value[0].key
      getTableData()
    })
    const layoutSlots = {
      'layout-header': (): JSX.Element => {
        return (
          <>
            <div>
              <Button type='primary' onClick={add}>添加</Button>
            </div>
          </>
        )
      },
      'layout-content': (): JSX.Element => {
        return (
          <>
            <Tabs v-model:activeKey={activeKey} onTabChange={tabChange}>
              {
                tabs.value.map((item) => {
                  return (

                    <TabPane key={item.key} tab={item.title + '  ' + item.value}>
                      <Form layout='inline' style={{ margin: '10px 0 ' }}>
                        <FormItem label='任务' style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }}>
                          <Input v-model:value={formState.name} placeholder='请输入任务名称' showCount={false} />
                        </FormItem>
                        <FormItem style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }}>
                          <Button type='primary' onClick={queryForm}>查询</Button>
                          <Button style={{ marginLeft: '10px' }} onClick={reset}>重置</Button>
                        </FormItem>
                      </Form>
                      <AliasTable
                        rowKey='id'
                        columns={columns}
                        loading={loading.value}
                        dataSource={dataSource.value}
                        scrollY={500}
                        tableCode={tableCode}
                        applicationCode={__ENV__.applicationCode}
                      />
                    </TabPane>
                  )
                })
              }

            </Tabs>
          </>
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
      }
    }
    return (): JSX.Element =>
      <>
        <Layout title={pageTitle} v-slots={layoutSlots} />
      </>
  }
})
