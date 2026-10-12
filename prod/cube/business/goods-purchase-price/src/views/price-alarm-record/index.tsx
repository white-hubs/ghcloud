import { defineComponent, onMounted, reactive, ref } from 'vue'
import { Layout } from '@/components/layout/layout'
import { Button, Form, FormItem, Input, Page, PopOver, DateRangePicker, TabPane, Tabs } from '@ghcloud/cube-ui'
import { getAlarmPage, getAlarmStat } from '@/api/price-alarm-record'
import type { RecordState, InsertState } from './index.i'
import '@/styles/common.less'
import dayjs from 'dayjs'
import { HandleModal } from './handle-modal'
import { useRoute } from 'vue-router'
import { AliasTable } from '@ghcloud/generic-component'
import { usePageName } from '@ghcloud/cube-utils'
export const PriceAlarmRecord = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName()
    const route = useRoute()
    const tableCode = route.path.replaceAll('/', '')
    const tableCodeHandled = route.path.replaceAll('/', '') + '-Handled'
    const formState = reactive({
      period: '',
      ruleName: '',
      userName: '',
    })
    const columnsHandled = [
      {
        title: '采价预警名称',
        dataIndex: 'ruleName',
        code: 'ruleName',
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '采价人',
        width: 180,
        dataIndex: 'userName',
        code: 'userName',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '所属部门',
        dataIndex: 'deptName',
        code: 'deptName',
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '采价时间',
        dataIndex: 'pricingTime',
        code: 'pricingTime',
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          const time = dayjs(text).format('YYYY-MM-DD HH:mm:ss')
          return <PopOver content={time || '--'}>{time || '--'}</PopOver>
        }
      },
      {
        title: '采价商品',
        dataIndex: 'goodsCategoryName',
        code: 'goodsCategoryName',
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '最高价(元/公斤)',
        dataIndex: 'maxPrice',
        code: 'maxPrice',
        ellipsis: true,
        width: 180,
        customRender: ({ record }: { record: { maxPrice: string; warned: boolean; }; }): JSX.Element => {
          const { maxPrice } = record
          return (
            <>
              <PopOver content={maxPrice || '--'}>
                <span style='color:#ff4d4f;'>
                  {maxPrice ? <span>{maxPrice}</span> : '--'}
                </span>
              </PopOver>
            </>
          )
        }
      },
      {
        title: '中间价(元/公斤)',
        dataIndex: 'midPrice',
        code: 'midPrice',
        ellipsis: true,
        width: 180,
        customRender: ({ record }: { record: { midPrice: string; warned: boolean; }; }): JSX.Element => {
          const { midPrice } = record
          return (
            <>
              <PopOver content={midPrice || '--'}>
                <span style='color:#ff4d4f;'>
                  {midPrice ? <span>{midPrice}</span> : '--'}
                </span>
              </PopOver>
            </>
          )
        }
      },
      {
        title: '最低价(元/公斤)',
        dataIndex: 'minPrice',
        code: 'minPrice',
        ellipsis: true,
        width: 180,
        customRender: ({ record }: { record: { minPrice: string; warned: boolean; }; }): JSX.Element => {
          const { minPrice } = record
          return (
            <>
              <PopOver content={minPrice || '--'}>
                <span style='color:#ff4d4f;'>
                  {minPrice ? <span>{minPrice}</span> : '--'}
                </span>
              </PopOver>
            </>
          )
        }
      },
      {
        title: '异常原因',
        dataIndex: 'priceExpDesc',
        code: 'priceExpDesc',
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      }
    ]
    const columns = [
      {
        title: '采价预警名称',
        dataIndex: 'ruleName',
        code: 'ruleName',
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '采价人',
        width: 180,
        dataIndex: 'userName',
        code: 'userName',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '所属部门',
        dataIndex: 'deptName',
        code: 'deptName',
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '采价时间',
        dataIndex: 'pricingTime',
        code: 'pricingTime',
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          const time = dayjs(text).format('YYYY-MM-DD HH:mm:ss')
          return <PopOver content={time || '--'}>{time || '--'}</PopOver>
        }
      },
      {
        title: '采价商品',
        dataIndex: 'goodsCategoryName',
        code: 'goodsCategoryName',
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '最高价(元/公斤)',
        dataIndex: 'maxPrice',
        code: 'maxPrice',
        ellipsis: true,
        width: 180,
        customRender: ({ record }: { record: { maxPrice: string; warned: boolean; }; }): JSX.Element => {
          const { maxPrice } = record
          return (
            <>
              <PopOver content={maxPrice || '--'}>
                <span style='color:#ff4d4f;'>
                  {maxPrice ? <span>{maxPrice}</span> : '--'}
                </span>
              </PopOver>
            </>
          )
        }
      },
      {
        title: '中间价(元/公斤)',
        dataIndex: 'midPrice',
        code: 'midPrice',
        ellipsis: true,
        width: 180,
        customRender: ({ record }: { record: { midPrice: string; warned: boolean; }; }): JSX.Element => {
          const { midPrice } = record
          return (
            <>
              <PopOver content={midPrice || '--'}>
                <span style='color:#ff4d4f;'>
                  {midPrice ? <span>{midPrice}</span> : '--'}
                </span>
              </PopOver>
            </>
          )
        }
      },
      {
        title: '最低价(元/公斤)',
        dataIndex: 'minPrice',
        code: 'minPrice',
        ellipsis: true,
        width: 180,
        customRender: ({ record }: { record: { minPrice: string; warned: boolean; }; }): JSX.Element => {
          const { minPrice } = record
          return (
            <>
              <PopOver content={minPrice || '--'}>
                <span style='color:#ff4d4f;'>
                  {minPrice ? <span>{minPrice}</span> : '--'}
                </span>
              </PopOver>
            </>
          )
        }
      },
      {
        title: '异常原因',
        dataIndex: 'priceExpDesc',
        code: 'priceExpDesc',
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
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
                handleClick(record)
              }}>处理</Button>
            </>
          )
        }
      }
    ]

    const tabs = ref([
      { title: '待处理', key: '0', value: '' },
      { title: '已处理', key: '1', value: '' },
    ])
    const getAlarmStatic = async (): Promise<void> => {
      const { data } = await getAlarmStat()
      if (data.length > 0) {

        tabs.value = data.map((item: { name: string; code: string; value: string; }) => {
          return {
            title: item.name,
            key: item.code,
            value: item.value,
          }
        })
      }
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
          ruleName: formState.ruleName,
          userName: formState.userName,
          period: formState.period ? formState.period.toString() : '',
          status: ''
        }
        if (activeKey.value !== 'ALL') params.status = activeKey.value
        const res = await getAlarmPage(params)
        if (res.data) {
          const { records, total } = res.data
          dataSource.value = records as RecordState[]
          pagination.value.total = total
        }
        getAlarmStatic()
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
      formState.ruleName = ''
      formState.userName = ''
      formState.period = ''
      queryForm()
    }
    const handleModalRef = ref<{ openTemplat: (id: string) => void; }>()
    const handleClick = (record: RecordState): void => {
      handleModalRef.value?.openTemplat(record.id)
    }
    const activeKey = ref('0')
    const tabChange = (): void => {
      Object.assign(formState, { ...formState, status: activeKey.value })
      getTableData()
    }
    onMounted(async () => {
      await getAlarmStatic()
      activeKey.value = tabs.value[0].key
      getTableData()
    })
    const layoutSlots = {
      'layout-content': (): JSX.Element => {
        return (
          <>
            <Tabs v-model:activeKey={activeKey} onTabChange={tabChange}>
              {
                tabs.value.map((item) => {
                  return (

                    <TabPane key={item.key} tab={item.title + '  ' + item.value}>
                      <Form layout='inline' style={{ margin: '10px 0 ' }}>
                        <FormItem label='预警名称' style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }}>
                          <Input v-model:value={formState.ruleName} placeholder='请输入预警名称' showCount={false} />
                        </FormItem>
                        <FormItem label='' style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }}>
                          <Input v-model:value={formState.userName} placeholder='请输入任务/采价人名称' showCount={false} />
                        </FormItem>
                        <FormItem label='采价时间' style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }}>
                          <DateRangePicker v-model:value={formState.period} />
                        </FormItem>
                        <FormItem style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }}>
                          <Button type='primary' onClick={queryForm}>查询</Button>
                          <Button style={{ marginLeft: '10px' }} onClick={reset}>重置</Button>
                        </FormItem>
                      </Form>
                      <AliasTable
                        rowKey='id'
                        columns={Number(item.key) === 1 ? columnsHandled : columns}
                        loading={loading.value}
                        dataSource={dataSource.value}
                        scrollY={500}
                        scrollX={1000}
                        tableCode={Number(item.key) === 1 ? tableCodeHandled : tableCode}
                        applicationCode={__ENV__.applicationCode}
                      />
                    </TabPane>
                  )
                })
              }
            </Tabs>
            <HandleModal ref={handleModalRef} onChange={() => {
              queryForm()
            }} />
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
