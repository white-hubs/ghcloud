import { defineComponent, onMounted, reactive, ref } from 'vue'
import { Layout } from '@/components/layout/layout'
import { Button, Form, FormItem, Select, Empty, TreeSelect } from '@ghcloud/cube-ui'
import { getAverageTrend, getCategoryTree } from '@/api/price-trend'
import '@/styles/common.less'
import { Bar } from '@/components/chart/bar'
import { TimeGroup } from './time-group/time-group'
import { message } from 'ant-design-vue/es'
import { usePageName } from '@ghcloud/cube-utils'

export const PriceTrend = defineComponent({
  setup: () => {
    interface GoodsCategoryType {
      label: string; value: string | number;
    }
    const { pageTitle } = usePageName()
    const formState = reactive<{
      goodsCategoryIds: GoodsCategoryType[];
      period: string;
      statType: string;
      formState: string;
    }>({
      goodsCategoryIds: [],
      period: '',
      statType: 'WEEK',
      formState: ''
    })
    const timeVlaue = ref()
    const loading = ref(false)
    const pagination = ref({
      pageSize: 10,
      pageNumber: 1,
      total: 0
    })
    const statTypeOptions = ref([
      { label: '按周', value: 'WEEK' },
      { label: '按月', value: 'MONTH' },
    ])
    const trendbar = ref()
    const legendData = ref<string[]>([])
    const trendXdata = ref([])
    const trendYdata = ref<echarts.SeriesOption[]>([])

    const getTableData = async (): Promise<void> => {
      formState.period = timeVlaue.value.preiod
      if (!formState.goodsCategoryIds.length) return
      try {
        loading.value = true
        const params = {
          goodsCategoryIds: formState.goodsCategoryIds.map((item: { value: string | number; }) => item.value),
          period: formState.period ? formState.period.toString() : '',
          statType: formState.statType
        }
        const { data } = await getAverageTrend(params)
        legendData.value = []
        trendXdata.value = []
        trendYdata.value = []
        if (Array.isArray(data) && data.length > 0) {

          trendXdata.value = trendXdata.value = data[0].map((item: { date: string; }) => item.date)
          legendData.value = data.map((item: { goodsCategoryName: string; }[]) => item[0].goodsCategoryName)
          data.forEach((item) => {
            const examData: echarts.SeriesOption = {
              name: item[0].goodsCategoryName,
              type: 'line',

              data: item.map((res: { midPriceAvg: number; }) => res.midPriceAvg),
              symbol: 'none',
              showSymbol: false,
              smooth: true
            }
            trendYdata.value.push(examData)
          })
        }

        trendbar.value.render()
      } catch {
      } finally {
        loading.value = false
      }
    }
    const queryForm = (): void => {
      pagination.value.pageNumber = 1
      getTableData()
    }
    const reset = (): void => {
      formState.goodsCategoryIds = [{ label: categoryOptions.value[0].name, value: categoryOptions.value[0].id }] as GoodsCategoryType[]
      formState.statType = ''
      formState.period = ''
      timeVlaue.value = null
      queryForm()
    }
    const categoryOptions = ref<{ name: string; id: string; }[]>([])
    const getCategoryOption = async (): Promise<void> => {
      const { data } = await getCategoryTree({})
      categoryOptions.value = data
      formState.goodsCategoryIds = [{ label: data[0].name, value: data[0].id }] as GoodsCategoryType[]
    }
    const selectHandle = (): void => {
      if (formState.goodsCategoryIds.length > 6) {
        message.warn('最多可以选择6个商品品类')
        formState.goodsCategoryIds.splice(-1, 1)
      }
      queryForm()
    }
    const changeHandle = (): void => {
      if (!formState.goodsCategoryIds.length) {
        formState.goodsCategoryIds = [{ label: categoryOptions.value[0].name, value: categoryOptions.value[0].id }] as GoodsCategoryType[]
      }
      queryForm()
    }
    onMounted(async () => {
      await getCategoryOption()
      queryForm()
    })
    const layoutSlots = {
      'layout-content': (): JSX.Element => {
        return (
          <>
            <Form layout='inline' style={{ margin: '10px 0 ' }}>
              <FormItem label='商品品类' style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }}>
                <TreeSelect
                  onSelect={() => {
                    selectHandle()
                  }}
                  onChange={() => {
                    changeHandle()
                  }}
                  v-model:value={formState.goodsCategoryIds} treeData={categoryOptions.value}
                  treeCheckStrictly fieldNames={{ label: 'name', value: 'id', children: 'children' }} placeholder='请选择商品品类'
                  style='width: 150px'
                  allowclear
                  showSearch treeNodeFilterProp='name'
                />
              </FormItem>
              <FormItem label='统计维度' style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }}>
                <Select
                  onChange={() => {
                    queryForm()
                  }} v-model:value={formState.statType} options={statTypeOptions.value}
                  placeholder='请选择统计维度' style='width:80px;'
                  allowClear
                />
              </FormItem>
              <FormItem label='' style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }}>
                <TimeGroup onChange={() => {
                  queryForm()
                }} v-model:value={timeVlaue.value} />
              </FormItem>
              <FormItem style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }}>
                <Button type='primary' onClick={() => {
                  queryForm()
                }}>查询</Button>
                <Button style={{ marginLeft: '10px' }} onClick={() => {
                  reset()
                }}>重置</Button>
              </FormItem>
            </Form>
            {
              trendXdata.value.length === 0 || trendYdata.value.length === 0
                ? <Empty />
                : <Bar
                  ref={trendbar}
                  legend={{
                    data: legendData.value
                  }}
                  Xdata={trendXdata.value}
                  ydata={trendYdata.value}
                  yAxis={{ type: 'value', name: '元', nameTextStyle: { padding: [0, 40, 5, 0] } }}
                />
            }

          </>
        )
      },
    }
    return (): JSX.Element =>
      <>
        <Layout title={pageTitle} v-slots={layoutSlots} />
      </>
  }
})
