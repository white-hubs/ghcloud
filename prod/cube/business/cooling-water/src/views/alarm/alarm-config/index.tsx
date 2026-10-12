import { defineComponent, onMounted, reactive, ref } from 'vue'
import { GLayout } from '@/components/common/layout'
import { Button, Table, Switch, Form, FormItem, Input, Select, message } from '@ghcloud/cube-ui'
import { getAlarmRulesList, getAlarmLevels, handleEnabledAlarmRules } from '@/api/alarm'
import { GPagination } from '@/components/common/pagination'
import { getCurrentApplication } from '@/utils/auth'
import { logger } from '@/logger'
export const AlarmConfig = defineComponent({
  setup: () => {
    const timeUnitObj: Record<string, string> = {
      MONTH: '月',
      DAY: '天',
      HOUR: '小时',
      MINUTE: '分钟',
      SECOND: '秒',
    }
    const state = reactive({
      dataSource: [],
      loading: false,
      searchParams: {
        pageNumber: 1,
        pageSize: 10,
        keyword: '',
        alarmLevelId: null,
        total: 0
      }
    })
    const alarmLevelOptions = ref<Record<string, string>[]>([])
    const columns = [
      {
        dataIndex: 'name',
        title: '预警规则名称',
      },
      {
        dataIndex: 'alarmLevelName',
        title: '报警级别',
      },
      {
        dataIndex: 'repeatTime',
        title: '去重周期',
        customRender: ({ text, record }: { text: string;record: Record<string, string>; }): string => {
          return text + timeUnitObj[record.repeatTimeUnit] || '--'
        },
      },
      {
        dataIndex: 'estimatedHandlerTime',
        title: '处理时限',
        customRender: ({ text, record }: { text: string;record: Record<string, string>; }): string => {
          return text + timeUnitObj[record.estimatedHandlerUnit] || '--'
        },
      },
      {
        dataIndex: 'remark',
        title: '说明',
      },
      {
        dataIndex: 'enabled',
        title: '开关',
        customRender: ({ record }: { record: Record<string, string | boolean>; }): JSX.Element => {
          return <Switch v-model:value={record.enabled} checkedChildren='启用' unCheckedChildren='禁用' onChange={(val) => {
            handleSwitch(val, record)
          }} />
        }
      },
      {
        dataIndex: 'action',
        title: '操作',
        width: 300,
        customRender: ({ record }: { record: Record<string, string>; }): JSX.Element => {
          logger.info(record)
          return (
            <>
              <Button type='link'>详情</Button>
              <Button type='link'>编辑</Button>
              <Button type='link' danger>删除</Button>
            </>
          )
        },
      },
    ]
    const handleSwitch = async (val: boolean, record: Record<string, string | boolean>): Promise<void> => {
      try {
        await handleEnabledAlarmRules({ enabled: val, id: record.id })
        message.success('操作成功')
        getList()
      } catch {
        record.enable = !val
      }
    }
    const getAlarmLevelsOptions = async (): Promise<void> => {
      const { data } = await getAlarmLevels()
      alarmLevelOptions.value = data
    }
    const getList = async (): Promise<void> => {
      state.loading = true
      try {
        const params: Record<string, string | number | null> = {
          ...state.searchParams,
          applicationCode: getCurrentApplication().code ?? 'ELECTRICMANAGE',
        }
        const { data } = await getAlarmRulesList(params)
        state.dataSource = data.records
        state.searchParams.total = data.total
      } catch {
      } finally {
        state.loading = false
      }
    }
    const changePage = (page: number, pageSize: number): void => {
      state.searchParams.pageNumber = page
      state.searchParams.pageSize = pageSize
      getList()
    }
    const handleSearch = (): void => {
      state.searchParams.pageNumber = 1
      getList()
    }
    const handleReset = (): void => {
      state.searchParams.pageNumber = 1
      state.searchParams.keyword = ''
      state.searchParams.alarmLevelId = null
    }
    const handleClick = (): void => {
      history.pushState({}, '', '/portal/cooling-water/alarm-rule-edit')
    }
    onMounted(() => {
      getList()
      getAlarmLevelsOptions()
    })
    const layoutSlots = {
      'header-btn': (): JSX.Element => {
        return (<Button type='primary' onClick={handleClick}>新增</Button>)
      },
      'content-search': (): JSX.Element => {
        return (
          <div class='content-search'>
            <Form layout='inline'>
              <FormItem>
                <Input placeholder='请输入规则名称' v-model:value={state.searchParams.keyword} />
              </FormItem>
              <FormItem style={{ width: '200px' }}>
                <Select placeholder='请选择报警级别' options={alarmLevelOptions.value} fieldNames={{ label: 'name', value: 'name' }} v-model:value={state.searchParams.alarmLevelId} allowClear />
              </FormItem>
              <FormItem>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Button type='primary' onClick={handleSearch}>查询</Button>
                  <Button onClick={handleReset}>重置</Button>
                </div>
              </FormItem>
            </Form>
          </div>
        )
      },
      'content-table': (): JSX.Element => {
        return (
          <Table
            dataSource={state.dataSource}
            columns={columns}
            loading={state.loading}
            pagination={false}
          />
        )
      },
      'footer-page': (): JSX.Element => {
        return (
          <>
            <GPagination
              current={state.searchParams.pageNumber}
              pageSize={state.searchParams.pageSize}
              total={state.searchParams.total ?? 0}
              onChange={changePage}
            />
          </>
        )
      },
    }
    return (): JSX.Element => (
      <GLayout title='报警规则' v-slots={layoutSlots} />
    )
  }
})
