import { defineComponent, reactive, onMounted } from 'vue'
import { GLayout } from '@/components/common/layout'
import { GPagination } from '@/components/common/pagination'
import { Form, FormItem, Button, Input, Tooltip, Select } from '@ghcloud/cube-ui'
import { getSendShowList } from '@/apis/index'
import dayjs from 'dayjs'
import styles from './index.module.less'
import { AliasTable } from '@ghcloud/generic-component'
export interface Terminal {
  terminalId: string;
  terminalName: string;
}

export interface SendDetailsMap {
  programName: string;
  beginDate: number;
  endDate: number;
  beginTime: string;
  endTime: string;
  priority: string;
  terminals: Terminal[];
  executionCycle: string[];
}
export const SendShowList = defineComponent({
  setup: () => {
    const state = reactive<{
      loading: boolean;
      dataSource: unknown[];
      scrollY: number;
      searchParams: {
        pageSize: number;
        pageNumber: number;
        total: number;
        sendStatus: string;
        taskName: string;
      };
    }>({
      loading: false,
      dataSource: [],
      scrollY: 500,
      searchParams: {
        pageSize: 10,
        pageNumber: 1,
        total: 0,
        sendStatus: '',
        taskName: ''
      }
    })
    const getList = async (): Promise<void> => {
      try {
        state.loading = true
        const params = {
          ...state.searchParams,
          applicationCode: 'INFORMATION_PUBLISH',
          taskType: 'sendProgramToTerminal'
        }
        const { data } = await getSendShowList(params)
        state.dataSource = data.records
        state.searchParams.total = data.total
      } catch (error) {
      } finally {
        state.loading = false
      }
    }
    const columns = [
      {
        title: '发送节目',
        dataIndex: 'sendDetailsMap',
        key: 'sendDetailsMap',
        ellipsis: true,
        customRender: ({ text }: { text: SendDetailsMap ; }) => {
          return (
            <Tooltip title={text.programName} placement='top'>
              <span>{text.programName}</span>
            </Tooltip>
          )
        }
      },

      {
        title: '计划播放时间',
        dataIndex: 'sendDetailsMap',
        key: 'sendDetailsMap',
        width: 400,
        customRender: ({ text }: { text: SendDetailsMap ; }) => {
          return (
            <div class={styles['play-time']}>
              <div>日期：{dayjs(text.beginDate).format('YYYY-MM-DD')}~{dayjs(text.endDate).format('YYYY-MM-DD')}</div>
              <div>星期：{(text.executionCycle).map((item, index) => {
                return <span key={item}>{`星期${item}`}{index !== (text.executionCycle.length - 1) ? '、' : ''}</span>
              })}
              </div>
              <div>时间：{text.beginTime}~{text.endTime}</div>
              <div>优先级：{text.priority === '0' ? '普通发送' : '插播'}</div>
            </div>
          )
        }
      },
      {
        title: '发送终端',
        dataIndex: 'sendDetailsMap',
        key: 'sendDetailsMap',
        ellipsis: true,
        customRender: ({ text }: { text: SendDetailsMap ; }) => {
          return (
            <Tooltip title={text.terminals.length} placement='top'>
              <span>{text.terminals.length}个</span>
            </Tooltip>
          )
        }
      },
      {
        title: '发送结果',
        dataIndex: 'sendResult',
        key: 'sendResult',
      },
      {
        title: '操作',
        dataIndex: 'action',
        key: 'action',
        customRender: ({ record }: { record: { id: string; }; }) =>
          <>
            <Button type='link' onClick={() => { handleInfo(record.id) }}>详情</Button>
          </>
      }
    ]

    const handleInfo = (id: string): void => {
      const target = `/portal/info-publish/send-show-edit?type=info&id=${id}`
      history.pushState({ current: location.pathname + location.search }, '', target)
    }
    const changePage = (pageNumber: number, pageSize: number): void => {
      state.searchParams.pageNumber = pageNumber
      state.searchParams.pageSize = pageSize
      getList()
    }
    const handleSearch = (): void => {
      state.searchParams.pageNumber = 1
      getList()
    }
    const handleReset = (): void => {
      state.searchParams.taskName = ''
      state.searchParams.sendStatus = ''
      state.searchParams.pageNumber = 1
      getList()
    }
    onMounted(() => {
      getScrollY()
      getList()
    })
    const getScrollY = (): void => {
      const content = document.querySelector('.layout-table')
      if (!content) {
        state.scrollY = 500
        return
      }
      state.scrollY = content.clientHeight - 50
    }
    const handleAdd = (): void => {
      const target = '/portal/info-publish/send-show-edit?type=add'
      history.pushState({ current: location.pathname + location.search }, '', target)
    }
    const options = [{
      label: '发送成功',
      value: '0'
    },
    {
      label: '发送失败',
      value: '1'
    }]
    const layoutSlots = {
      'header-btn': () => {
        return <Button type='primary' onClick={handleAdd}>新增</Button>
      },
      'content-search': () => {
        return (
          <Form layout='inline'>
            <FormItem label='发送节目'>
              <Input style={{ width: '180px' }} placeholder='发送节目' options={options} v-model:value={state.searchParams.taskName} />
            </FormItem>
            <FormItem label='发送结果'>
              <Select style={{ width: '180px' }} allowClear options={options} v-model:value={state.searchParams.sendStatus} />
            </FormItem>
            <FormItem>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Button type='primary' onClick={handleSearch}>查询</Button>
                <Button onClick={handleReset}>重置</Button>
              </div>
            </FormItem>
          </Form>
        )
      },
      'content-table': () => {
        return (
          <div class={styles.table}>
            <AliasTable columns={columns} rowKey='id' scrollX={0} loading={state.loading} tableCode='SEND_SHOW_LIST' applicationCode='INFORMATION_PUBLISH' dataSource={state.dataSource} pagination={false} scrollY={500} />
          </div>
        )
      },
      'footer-page': () => {
        return (
          <GPagination
            current={state.searchParams.pageNumber}
            pageSize={state.searchParams.pageSize}
            total={state.searchParams.total ?? 0}
            onChange={changePage}
          />
        )
      }
    }
    return () => <GLayout title='发送节目' v-slots={layoutSlots} />
  }
})
