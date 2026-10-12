import { Button, Form, FormItem, Input, Page, PopOver, Table } from '@ghcloud/cube-ui'
import { defineComponent, onMounted, reactive, ref, watch } from 'vue'
import '@/styles/log.less'
import { Layout } from '@/components/layout/layout'
import Select from '@ghcloud/cube-ui/src/components/select/select'
import { storeToRefs } from 'pinia'
import { getTenant, getToken } from '@/tools'
import { storeLog } from '@/pinia-store/log'
import { WSMessage, type MessageContent } from '@/utils/socket'

export const Log = defineComponent({
  setup: () => {
    let iotSocket: WSMessage | null = null

    const log = storeLog()
    const { logList } = storeToRefs(log)

    const dataSource = ref<MessageContent[]>(logList.value)
    const tableData = ref<MessageContent[]>([])

    watch(() => logList.value, () => {
      dataSource.value = logList.value
      pagination.value.total = dataSource.value.length
      getList(pagination.value.pageNumber)
    }, { deep: true })

    const messageMsg = (message: MessageContent): void => {
      switch (message.msgType) {
        case 'logSwitch':
          message.expireTime && log.setExpireTime(message.expireTime)
          break
        case 'log':
          log.setLogList(message)
          break
        default:
          break
      }
    }

    onMounted(() => {
      initWebSocketMsg()
      iotSocket?.onmessage(messageMsg)
      pagination.value.pageNumber = 1
      getList(pagination.value.pageNumber)
    })
    const initWebSocketMsg = async (): Promise<void> => {
      const token = getToken()
      const tenant = getTenant()
      iotSocket = new WSMessage({
        accessToken: token || '',
        tenant: tenant as unknown as number,
        terminal: 'iot-configure'
      })
      storeLog().setWS(iotSocket)
    }
    const switchHandle = (): void => {
      iotSocket?.onsend(JSON.stringify({
        msgType: 'logSwitch',
        msgHeader: '',
        msgContent: {
          level: searchState.level,
          logSwitch: searchState.logSwitch ? 'ON' : 'OFF',
          packageName: searchState.packageName
        }
      }))
    }
    /** 表格数据 */
    const searchState = reactive({
      level: 'ERROR',
      packageName: '',
      logSwitch: true,
    })
    const searchState2 = reactive({
      packageName: '',
    })
    const levelOptions = reactive([
      { label: '调试', value: 'DEBUG' },
      { label: '异常', value: 'ERROR' },
      { label: '重要', value: 'INFO' },
      { label: '停止', value: 'OFF' },
      // {label: '全部', value:'ALL'},
      // {label: '跟踪', value:'TRACE'},
    ])
    const getLevalName = (value: string): string => {
      const level = levelOptions.filter(item => item.value === value)
      return level.length > 0 ? level[0].label : value
    }
    const getList = (pageNumber: number) => {
      const list = dataSource.value.filter(item => item.msg.toString().toLocaleLowerCase().includes(searchState2.packageName.toLocaleLowerCase()))
      const data = getNeedArr(list, pagination.value.pageSize)
      tableData.value = data[pageNumber - 1] as MessageContent[]
      pagination.value.total = list.length
    }
    const query = (): void => {
      pagination.value.pageNumber = 1
      getList(pagination.value.pageNumber)
    }
    const reset = (): void => {
      searchState2.packageName = ''
      getList(pagination.value.pageNumber)
    }
    const pagination = ref({
      pageSize: 10,
      pageNumber: 1,
      total: logList.value.length
    })
    const pageChange = (pageNumber: number, pageSize: number): void => {
      pagination.value.pageNumber = pageNumber || 1
      pagination.value.pageSize = pageSize
      getList(pagination.value.pageNumber)
    }
    const getNeedArr = (array: MessageContent[], size: number): unknown[] => {
      const length = array.length
      if (!length || !size || size < 1) {
        return []
      }
      let index = 0 // 用来表示切割元素的范围start
      let resIndex = 0 // 用来递增表示输出数组的下标
      const result = new Array(Math.ceil(length / size))
      while (index < length) {
        result[resIndex++] = array.slice(index, (index += size))
      }
      return result
    }
    const columns = [
      {
        title: '序号',
        width: 70,
        align: 'center',
        customRender: ({ index }: { index: number; }): JSX.Element | string => `${index + 1}`
      },
      {
        title: '级别',
        dataIndex: 'level',
        width: 100,
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          const name = getLevalName(text)
          return <PopOver content={name || '--'}>{name || '--'}</PopOver>
        }
      },
      {
        title: '详情',
        dataIndex: 'msg',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '时间',
        dataIndex: 'nowTime',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
    ]
    const layoutRightSlots = {
      'layout-search': (): JSX.Element => {
        return (
          <>
            <Form layout='inline'>
              <FormItem label='日志查询：' style={{ marginRight: '0px' }}>
                <Input v-model:value={searchState2.packageName} style={{ width: '250px' }} placeholder='包名、关键字' showCount={false} onChange={query} />
              </FormItem>
              <FormItem style={{ marginRight: '0px' }}>
                <Button type='primary' onClick={query}>查询</Button>
                <Button onClick={reset}>重置</Button>
              </FormItem>
            </Form>
            <div style={{ border: '1px dashed #1890ff', width: '620px', padding: '15px 10px 0', marginBottom: '15px' }}>
              <Form layout='inline'>
                <FormItem label='日志设置：' style={{ padding: '0px', marginRight: '0px' }} />
                <FormItem label='' style={{ marginRight: '0px' }}>
                  <Select v-model:value={searchState.level} style={{ width: '140px' }} placeholder='请选择级别' options={levelOptions} />
                </FormItem>
                <FormItem label='包名' style={{ marginRight: '0px' }}>
                  <Input v-model:value={searchState.packageName} placeholder='请输入包名' showCount={false} />
                </FormItem>
                <FormItem style={{ marginRight: '0px' }}>
                  <Button type='primary' onClick={switchHandle}>设置</Button>
                </FormItem>
              </Form>
            </div>
          </>
        )
      },
      'layout-content': (): JSX.Element => {
        return (
          <>
            <Table
              columns={columns}
              dataSource={tableData.value}
              scrollY='500'
              size='small'
              pagination={false}
            />
          </>
        )
      },
      'footer-page': (): JSX.Element=> {
        return (
          <>
            {/* <span>共 {pagination.value.total} 条数据</span> */}
            <Page
              class='pagePosition'
              v-model:current={pagination.value.pageNumber}
              v-model:pageSize={pagination.value.pageSize}
              v-model:total={pagination.value.total}
              // showSizeChanger={false}
              onPageChange={pageChange}
            />
          </>
        )
      },
    }
    return (): JSX.Element =>
      <>
        <Layout title='日志管理' v-slots={layoutRightSlots} />
      </>
  }
})
