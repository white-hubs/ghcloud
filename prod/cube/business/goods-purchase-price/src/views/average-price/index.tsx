import { defineComponent, onMounted, reactive, ref } from 'vue'
import { Layout } from '@/components/layout/layout'
import { Button, Form, FormItem, Page, PopOver, message, TreeSelect } from '@ghcloud/cube-ui'
import { exportCompare, getAveragePage, getCategoryTree } from '@/api/average-price'
import type { RecordState, InsertState } from './index.i'
import '@/styles/common.less'
import { AliasTable, TimeGroup } from '@ghcloud/generic-component'
import { useRoute } from 'vue-router'
import { usePageName } from '@ghcloud/cube-utils'
export const AveragePrice = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName()
    const route = useRoute()
    const tableCode = route.path.replaceAll('/', '')
    const formState = reactive({
      goodsCategoryIds: [],
      period: '',
    })
    const timeValue = ref()
    const columns = [
      {
        title: '品类名称',
        dataIndex: 'goodsCategoryName',
        code: 'goodsCategoryName',
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '来货量',
        dataIndex: 'incomingQuantity',
        code: 'incomingQuantity',
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '最高均价(元/公斤)',
        dataIndex: 'maxPriceAvg',
        code: 'maxPriceAvg',
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '环比增长',
        dataIndex: 'qoqMaxPrice',
        code: 'qoqMaxPrice',
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return (
            <>
              <PopOver content={text || '--'}>
                {text ? <span style={{ color: Number(text) > 0 ? '#ff4d4f' : '#1677ff' }}>{text + '%'}</span> : '--'}
              </PopOver>
            </>
          )
        }
      },
      {
        title: '同比增长',
        dataIndex: 'yoyMaxPrice',
        code: 'yoyMaxPrice',
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return (
            <>
              <PopOver content={text || '--'}>
                {text ? <span style={{ color: Number(text) > 0 ? '#ff4d4f' : '#1677ff' }}>{text + '%'}</span> : '--'}
              </PopOver>
            </>
          )
        }
      },
      {
        title: '中间均价(元/公斤)',
        dataIndex: 'midPriceAvg',
        code: 'midPriceAvg',
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '环比增长',
        dataIndex: 'qoqMidPrice',
        code: 'qoqMidPrice',
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return (
            <>
              <PopOver content={text || '--'}>
                {text ? <span style={{ color: Number(text) > 0 ? '#ff4d4f' : '#1677ff' }}>{text + '%'}</span> : '--'}
              </PopOver>
            </>
          )
        }
      },
      {
        title: '同比增长',
        dataIndex: 'yoyMidPrice',
        code: 'yoyMidPrice',
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return (
            <>
              <PopOver content={text || '--'}>
                {text ? <span style={{ color: Number(text) > 0 ? '#ff4d4f' : '#1677ff' }}>{text + '%'}</span> : '--'}
              </PopOver>
            </>
          )
        }
      },
      {
        title: '最低均价(元/公斤)',
        dataIndex: 'minPriceAvg',
        code: 'minPriceAvg',
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '环比增长',
        dataIndex: 'qoqMinPrice',
        code: 'qoqMinPrice',
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return (
            <>
              <PopOver content={text || '--'}>
                {text ? <span style={{ color: Number(text) > 0 ? '#ff4d4f' : '#1677ff' }}>{text + '%'}</span> : '--'}
              </PopOver>
            </>
          )
        }
      },
      {
        title: '同比增长',
        dataIndex: 'yoyMinPrice',
        code: 'yoyMinPrice',
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return (
            <>
              <PopOver content={text || '--'}>
                {text ? <span style={{ color: Number(text) > 0 ? '#ff4d4f' : '#1677ff' }}>{text + '%'}</span> : '--'}
              </PopOver>
            </>
          )
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
              }}>采价记录</Button>
            </>
          )
        }
      }
    ]
    const loading = ref(false)
    const dataSource = ref<RecordState[]>([])
    const pagination = ref({
      pageSize: 10,
      pageNumber: 1,
      total: 0
    })

    const getTableData = async (): Promise<void> => {
      formState.period = timeValue.value.preiod
      try {
        loading.value = true
        const params = {
          pageNumber: pagination.value.pageNumber,
          pageSize: pagination.value.pageSize,
          goodsCategoryIds: formState.goodsCategoryIds.map((item: { value: string; }) => item.value),
          period: formState.period ? formState.period.toString() : '',
        }
        const res = await getAveragePage(params)
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
      formState.goodsCategoryIds = []
      timeValue.value = ''
      queryForm()
    }
    const exportHandle = (): void => {
      exportCompare(formState).then(res => {
        const { data } = res
        const link = document.createElement('a')
        const blob = new Blob([data as BlobPart], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        })
        link.style.display = 'none'
        link.href = URL.createObjectURL(blob)
        link.setAttribute('download', '商品均价.xlsx')
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }).catch(() => {
        message.warn('未查询到数据，无法导出')
      })
    }
    const toDetail = (record: RecordState, type: 'detail' | 'edit' | 'copy'): void => {
      history.pushState({ current: location.pathname + location.search }, '',
        `/portal/goods-purchase-price/average-detail?action=${type}&searchVal=${JSON.stringify(formState)}&recordVal=${JSON.stringify(record)}`)
    }
    const categoryOptions = ref([])
    const getCategoryOption = async (): Promise<void> => {
      const { data } = await getCategoryTree({})
      categoryOptions.value = data
    }
    onMounted(() => {
      getCategoryOption()
      getTableData()
    })
    const layoutSlots = {
      'layout-header': (): JSX.Element => {
        return (
          <>
            <div>
              <Button type='primary' onClick={exportHandle}>导出</Button>
            </div>
          </>
        )
      },
      'layout-content': (): JSX.Element => {
        return (
          <>
            <Form layout='inline' style={{ margin: '10px 0 ' }}>
              <FormItem label='商品品类' style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }}>
                <TreeSelect
                  style='width: 150px;' v-model:value={formState.goodsCategoryIds} treeData={categoryOptions.value}
                  showSearch treeNodeFilterProp='name'
                  treeCheckStrictly fieldNames={{ label: 'name', value: 'id', children: 'children' }} placeholder='请选择商品品类' allowclear
                />
              </FormItem>
              <FormItem label='' style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }}>
                <TimeGroup onChange={() => {
                  queryForm()
                }} v-model:value={timeValue.value} />
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
              tableCode={tableCode}
              scrollY={500}
              scrollX={1000}
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
      <Layout title={pageTitle} v-slots={layoutSlots} />
  }
})
