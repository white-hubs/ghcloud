import { defineComponent, onMounted, reactive, ref } from 'vue'
import { Layout } from '@/components/layout/layout'
import { Button, Form, FormItem, Input, Page, PopOver, message, AntModal, DateRangePicker, TabPane, Tabs, Switch } from '@ghcloud/cube-ui'
import { getPlanPage, deletePlan, getPlanStat, planEnable } from '@/api/price-plan'
import type { RecordState, InsertState } from './index.i'
import '@/styles/common.less'
import dayjs from 'dayjs'
import { mouthOptions, weekOptions } from '@/hook/common'
import { useRoute } from 'vue-router'
import { AliasTable } from '@ghcloud/generic-component'
import { usePageName } from '@ghcloud/cube-utils'

export const PricePlan = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName()
    const route = useRoute()
    const tableCode = route.path.replaceAll('/', '')
    const formState = reactive({
      name: '',
      period: '',
    })
    const columns = [
      {
        title: '计划名称',
        dataIndex: 'name',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '计划频次',
        dataIndex: 'deviceCode',
        ellipsis: true,
        customRender: ({ record }: { record: Record<string, string>; }): JSX.Element => {
          const { publishTypeName, publishType, publishPeriod, publishTime } = record
          let periodTxt = publishPeriod
          if (publishType === 'EVERY_WEEK') periodTxt = weekOptions.value.find(e => e.value === publishPeriod)?.label ?? '--'
          if (publishType === 'EVERY_MONTH') periodTxt = mouthOptions.value.find(e => e.value === publishPeriod)?.label ?? '--'
          const text = `${publishTypeName} ${periodTxt} ${publishTime}`
          return (
            <>
              <PopOver content={text || '--'}>{text || '--'}</PopOver>
            </>
          )
        }
      },
      {
        title: '创建人',
        dataIndex: 'createUserName',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '创建时间',
        dataIndex: 'createTime',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          const time = dayjs(text).format('YYYY-MM-DD HH:mm:ss')
          return <PopOver content={time || '--'}>{time || '--'}</PopOver>
        }
      },
      {
        title: '状态',
        align: 'center',
        dataIndex: 'enabled',
        customRender: ({ record }: { record: RecordState; }): JSX.Element => {
          return (
            <>
              <Switch v-model:checked={record.enabled} checked-children='启用' un-checked-children='禁用' onChange={async (e) => changeStatus(e, record.id)} />
            </>
          )
        }
      },
      {
        title: '操作',
        dataIndex: 'action',
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
        // return
        await planEnable({
          id,
          enable,
        })
        message.success('操作成功')
        getTableData()
      } catch {
        getTableData()
      }
    }
    const tabs = ref([
      { title: '执行中', key: 'EXEC', value: '' },
      { title: '已结束', key: 'OVER', value: '' },
      { title: '已停用', key: 'STOP', value: '' },
      { title: '全部', key: 'ALL', value: '' },

    ])
    const getPlanStatic = async (): Promise<void> => {
      const { data } = await getPlanStat()

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
          period: formState.period ? formState.period.toString() : '',
          status: ''
        }
        if (activeKey.value !== 'ALL') params.status = activeKey.value
        const res = await getPlanPage(params)
        if (res.data) {
          const { records, total } = res.data
          dataSource.value = records as RecordState[]
          pagination.value.total = total
        }
        getPlanStatic()
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
      formState.period = ''
      queryForm()
    }

    const delRow = (record: RecordState): void => {
      AntModal.confirm({
        centered: true,
        content: '确定要删除该项?',
        async onOk () {
          await deletePlan({ id: record.id })
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
      history.pushState({ current: location.pathname + location.search }, '', '/portal/goods-purchase-price/plan-detail?action=add')
    }
    const toDetail = (record: RecordState, type: 'detail' | 'edit' | 'copy'): void => {
      history.pushState({ current: location.pathname + location.search }, '',
        `/portal/goods-purchase-price/plan-detail?id=${record.id}&action=${type}`)
    }
    const activeKey = ref('EXEC')
    const tabChange = (): void => {
      Object.assign(formState, { ...formState, status: activeKey.value })
      getTableData()
    }
    onMounted(async () => {
      await getPlanStatic()
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
                        <FormItem label='计划' style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }}>
                          <Input v-model:value={formState.name} placeholder='请输入计划名称' showCount={false} />
                        </FormItem>
                        <FormItem label='创建时间' style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }}>
                          <DateRangePicker v-model:value={formState.period} />
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
                        tableCode={tableCode + '-' + item.key}
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
