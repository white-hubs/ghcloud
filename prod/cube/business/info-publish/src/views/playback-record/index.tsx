import { defineComponent, reactive, onMounted } from 'vue'
import { GLayout } from '@/components/common/layout'
import { GPagination } from '@/components/common/pagination'
import { Form, FormItem, Input, Button } from '@ghcloud/cube-ui'
import { getPlaybackRecord } from '@/apis/index'
import { AliasTable } from '@ghcloud/generic-component'
import dayjs from 'dayjs'
export const PlaybackRecord = defineComponent({
  setup: () => {
    const state = reactive<{
      loading: boolean;
      dataSource: unknown[];
      searchParams: {
        pageSize: number;
        pageNumber: number;
        total: number;
        keyword: string;
      };
    }>({
      loading: false,
      dataSource: [],
      searchParams: {
        pageSize: 10,
        pageNumber: 1,
        total: 0,
        keyword: ''
      }
    })
    const getList = async (): Promise<void> => {
      try {
        state.loading = true
        const params = {
          ...state.searchParams
        }
        const { data } = await getPlaybackRecord(params)
        state.dataSource = data.records
        state.searchParams.total = data.total
      } catch (error) {
      } finally {
        state.loading = false
      }
    }
    const columns = [
      {
        title: '节目单名称',
        dataIndex: 'itemName',
        key: 'itemName',
        align: 'center'
      },
      {
        title: '开始日期',
        dataIndex: 'startTime',
        key: 'startTime',
        align: 'center',
        customRender: ({ text }: { text: number; }) => {
          return text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : ''
        }
      },
      {
        title: '结束日期',
        dataIndex: 'stopTime',
        key: 'stopTime',
        align: 'center',
        customRender: ({ text }: { text: number; }) => {
          return text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : ''
        }
      },
      {
        title: '播放终端',
        dataIndex: 'clientName',
        key: 'clientName',
        align: 'center',
      },
    ]
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
      state.searchParams.keyword = ''
      state.searchParams.pageNumber = 1
      getList()
    }
    onMounted(() => {
      getList()
    })
    const layoutSlots = {
      'content-search': () => {
        return (
          <Form layout='inline'>
            <FormItem label='名称'>
              <Input placeholder='请输入名称' v-model:value={state.searchParams.keyword} />
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
        return <AliasTable columns={columns} rowKey='id' scrollX={0} loading={state.loading} tableCode='PLAYBACK_RECORD' applicationCode='INFORMATION_PUBLISH' dataSource={state.dataSource} pagination={false} scrollY={500} />
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
    return () => <GLayout title='播放记录' v-slots={layoutSlots} />
  }
})
