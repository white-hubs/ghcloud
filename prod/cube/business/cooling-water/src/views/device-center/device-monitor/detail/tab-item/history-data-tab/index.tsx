import { defineComponent, ref, reactive } from 'vue'
import styles from './index.module.less'
import { Form, FormItem, DatePicker, RadioGroup, Button, Tabs, TabPane, Table } from '@ghcloud/cube-ui'
import { getLocalAssetsFile } from '@/utils/common'
import { LineCharts } from '@/components/chart/line-charts'

export const HistoryDataTab = defineComponent({
  setup: () => {
    const downImage = getLocalAssetsFile('down.png')
    const timeOptions = [
      { label: '年', value: 'year' },
      { label: '月', value: 'month' },
      { label: '日', value: 'date' }
    ]
    const state = reactive({
      dataSource: []
    })
    const columns = [{
      title: '采集时间',
      dataIndex: 'time',
      key: 'time',
      align: 'center'
    },
    {
      title: '控制面板',
      dataIndex: 'deviceName',
      key: 'deviceName',
      align: 'center'
    },
    {
      title: '水流开关',
      dataIndex: 'genreName',
      key: 'gearCogenreNamede',
      align: 'center'
    },
    {
      title: '制冷电磁阀',
      dataIndex: 'status',
      key: 'status',
      align: 'center'
    },
    {
      title: '报警器',
      dataIndex: 'gearPositionCode',
      key: 'gearPositionCode',
      align: 'center'
    },
    {
      title: '汰泡温度',
      dataIndex: 'area',
      key: 'area',
      align: 'center'
    },
    {
      title: '汰泡水温',
      dataIndex: 'area',
      key: 'area',
      align: 'center'
    }
    ]
    const contentItem = (): JSX.Element => {
      return (
        <div class={styles['content-item']}>
          <div>累计费用（元）</div>
          <div class={styles['content-value']}>
            <span class={styles['content-count']}>3234.09</span>
            <div class={styles.ratio}>
              <div class={styles['ratio-value']}>
                <span>环比</span>
                <div class={styles.value}>
                  <img src={downImage} alt='' />
                  <span>5.4%</span>
                </div>
              </div>
              <div class={styles['ratio-value']}>
                <span>环比</span>
                <div class={styles.value}>
                  <img src={downImage} alt='' />
                  <span>5.4%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }
    const dateCheck = ref('year')
    const activeTab = ref(0)
    return (): JSX.Element => (
      <div class={styles['history-data']}>
        <div class={styles['search-bar']}>
          <Form layout='inline'>
            <FormItem>
              <RadioGroup v-model:value={dateCheck.value} options={timeOptions} buttonStyle='solid' />
            </FormItem>
            <FormItem label='时间选择'>
              <DatePicker picker='date' class={styles['input-item']} />
            </FormItem>
            <FormItem>
              <Button type='primary'>搜索</Button>
            </FormItem>
          </Form>
        </div>
        <div class={styles.content}>
          {contentItem()}
          {contentItem()}
          {contentItem()}
        </div>
        <div class={styles.title}>
          温度趋势
        </div>
        <div class={styles.chart}>
          <LineCharts />
        </div>
        <div class={styles['tab-table']}>
          <Tabs v-model:activeKey={activeTab.value}>
            <TabPane key={0} tab='温度采集明细'>
              <Table
                dataSource={state.dataSource}
                columns={columns}
                pagination={false}
                size='small'
                scrollY={500}
              />
            </TabPane>
            <TabPane key={1} tab='数据统计明细'>
              <div>
                2222
              </div>
            </TabPane>
          </Tabs>
        </div>
      </div>
    )
  }
})
