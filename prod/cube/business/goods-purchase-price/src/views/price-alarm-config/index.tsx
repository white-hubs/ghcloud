import { defineComponent, onMounted, reactive, ref } from 'vue'
import { Layout } from '@/components/layout/layout'
import { AntModal, Button, Form, FormItem, Input, Page, PopOver, Switch, message } from '@ghcloud/cube-ui'
import { deleteAlarm, getAlarmPage, planEnable } from '@/api/price-alarm-config'
import type { RecordState, InsertState } from './index.i'
import '@/styles/common.less'
import { useRoute } from 'vue-router'
import { AliasTable } from '@ghcloud/generic-component'
import { usePageName } from '@ghcloud/cube-utils'
export const PriceAlarmConfig = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName()
    const route = useRoute()
    const tableCode = route.path.replaceAll('/', '')
    const formState = reactive({
      groupName: '',
    })
    const columns = [
      {
        title: '采价预警名称',
        dataIndex: 'groupName',
        code: 'groupName',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '商品品类',
        dataIndex: 'categories',
        code: 'categories',
        ellipsis: true,
        customRender: ({ record }: { record: { categories: []; }; }): JSX.Element => {
          const text = record.categories.length > 0 ? record.categories.toString() : ''
          return (
            <>
              <PopOver content={text || '--'}>{text || '--'}</PopOver>
            </>
          )
        }
      },
      {
        title: '说明',
        dataIndex: 'remark',
        code: 'remark',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '状态',
        dataIndex: 'status',
        code: 'status',
        key: 'status',
        align: 'center',
        ellipsis: true,
        customRender: ({ record }: { record: RecordState; }): JSX.Element => {
          return (
            <>
              <Switch v-model:checked={record.status} checked-children='启用' un-checked-children='禁用' onChange={async (e) => changeStatus(e, record.id)} />
            </>
          )
        }
      },
      {
        title: '操作',
        dataIndex: 'action',
        code: 'action',
        width: 220,
        customRender: ({ record }: { record: RecordState & InsertState & { secretKey: string; }; }): JSX.Element => {
          return (
            <>
              <Button type='link' size='small' onClick={() => {
                toDetail(record, 'detail')
              }}>详情</Button>
              <Button type='link' size='small' onClick={() => {
                toDetail(record, 'copy')
              }}>复制</Button>
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

    // 状态开关
    const changeStatus = async (enable: boolean, id: string): Promise<void> => {
      try {
        await planEnable({
          id,
          status: enable,
        })
        message.success('操作成功')
        getTableData()
      } catch {
        getTableData()
      }
    }

    const delRow = (record: RecordState): void => {
      AntModal.confirm({
        centered: true,
        content: '确定要删除该项?',
        async onOk () {
          await deleteAlarm({ id: record.id })
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
      history.pushState({ current: location.pathname + location.search }, '', '/portal/goods-purchase-price/alarm-config-detail?action=add')
    }
    const toDetail = (record: RecordState, type: 'detail' | 'edit' | 'copy'): void => {
      history.pushState({ current: location.pathname + location.search }, '',
        `/portal/goods-purchase-price/alarm-config-detail?id=${record.id}&action=${type}`)
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
          groupName: formState.groupName,
        }
        const res = await getAlarmPage(params)
        if (res.data) {
          const { records, total } = res.data
          dataSource.value = records as RecordState[]
          pagination.value.total = total
        }
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
      formState.groupName = ''
      queryForm()
    }
    onMounted(() => {
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
            <Form layout='inline' style={{ margin: '10px 0 ' }}>
              <FormItem label='规则名称' style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }}>
                <Input v-model:value={formState.groupName} placeholder='请输入规则名称' showCount={false} />
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
