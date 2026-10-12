import { computed, defineComponent, onMounted, ref } from 'vue'
import { Layout } from '@/components/layout/layout'
import { Button, Page, PopOver, Table } from '@ghcloud/cube-ui'
import { useRoute } from 'vue-router'
import { DynamicFormRender } from '@ghcloud/dynamic-form-render'
import type { DynamicFormRenderOptionProps } from '@ghcloud/dynamic-form-render/src/dynamic-form-render-props'
import type { FormExpose } from '@ghcloud/cube-ui/src/components/form/form'
import type { InsertState, RecordState } from './index.i'
import { getCategoryTree, getRecordPage } from '@/api/price-record'
import '@/styles/common.less'
import { VerticalLine } from '@ghcloud/generic-component'
import dayjs from 'dayjs'

export const Detail = defineComponent({
  setup: () => {
    const { action, searchVal, recordVal } = useRoute().query
    const goBack = (): void => {
      history.back()
    }

    const title = computed(() => {
      return '采价记录详情'
    })
    const dynamicFormRenderRef = ref<{ formRef: FormExpose; }>()
    const options = computed(() => {
      const res: DynamicFormRenderOptionProps[] = [
        { title: '品类名称', key: 'goodsCategoryName', width: 46, componentName: 'TextInput', required: true },
        { title: '最高均价', key: 'maxPriceAvg', width: 46, componentName: 'TextInput', required: true },
        { title: '中间均价', key: 'midPriceAvg', width: 46, componentName: 'TextInput', required: true },
        { title: '最低均价', key: 'minPriceAvg', width: 46, componentName: 'TextInput', required: true },
      ]
      if (action === 'detail') {
        res.forEach(e => {
          e.readonly = true
        })
      }
      return res
    })
    const formData = ref<InsertState>({
      goodsCategoryName: '',
      maxPriceAvg: '',
      midPriceAvg: '',
      minPriceAvg: '',
    })
    const categoryOptions = ref([])
    const getCategoryOption = async (): Promise<void> => {
      const { data } = await getCategoryTree({})
      categoryOptions.value = data
    }
    const init = ref(false)
    onMounted(async () => {
      getCategoryOption()
      getTableData()
      if (recordVal) {
        formData.value = JSON.parse(recordVal as string)
      }
      init.value = true
    })
    const columns = [
      {
        title: '采价时间',
        dataIndex: 'goodsCategoryName',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          const time = dayjs(text).format('YYYY-MM-DD HH:mm:ss')
          return <PopOver content={time || '--'}>{time || '--'}</PopOver>
        }
      },
      {
        title: '商品名称',
        dataIndex: 'goodsCategoryName',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '最高价（元/公斤）',
        dataIndex: 'maxPrice',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '中间价(元/公斤)',
        dataIndex: 'midPrice',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '最低价（元/公斤）',
        dataIndex: 'minPrice',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '采价产地',
        dataIndex: 'goodsCategoryName',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '采价来源',
        dataIndex: 'goodsCategoryName',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '采价人',
        dataIndex: 'goodsCategoryName',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '采价任务',
        dataIndex: 'goodsCategoryName',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
    ]

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
          taskId: '',
          period: searchVal ? JSON.parse(searchVal as string).period : '',
          goodsCategoryId: searchVal ? JSON.parse(searchVal as string).goodsCategoryId : ''
        }
        const res = await getRecordPage(params)
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

    const layoutSlots = {
      'layout-content': (): JSX.Element => {
        if (!init) {
          return <></>
        }
        return (
          <>
            <DynamicFormRender
              formOptions={options.value}
              labelWidth='150px'
              v-model:formData={formData.value}
              ref={dynamicFormRenderRef}
              style={{ margin: '20px' }}
            />
            <VerticalLine style='margin: 10px 0;' title='采价记录' />
            <Table
              rowKey='id'
              columns={columns}
              loading={loading.value}
              dataSource={dataSource.value}
              pagination={false} size='small'
              scrollY={500}
            />
            <div class='page-right'>
              <Page
                v-model:current={pagination.value.pageNumber}
                v-model:pageSize={pagination.value.pageSize}
                v-model:total={pagination.value.total}
                onPageChange={pageChange}
              />
            </div>

          </>
        )
      },
      'footer-page': (): JSX.Element => {
        return (
          <>
            <Button onClick={goBack}>返回</Button>
          </>
        )
      }
    }
    return (): JSX.Element => <Layout title={title.value} v-slots={layoutSlots} />
  }
})
