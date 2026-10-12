import { defineComponent, reactive, onMounted } from 'vue'
import { GLayout } from '@/components/common/layout'
import { GPagination } from '@/components/common/pagination'
import { Form, FormItem, Button, Input, PopConfirm, Tooltip, message } from '@ghcloud/cube-ui'
import { getDefiniteTimeSwitchList, deleteDefiniteTimeSwitch } from '@/apis/index'
import dayjs from 'dayjs'
import styles from './index.module.less'
import { AliasTable } from '@ghcloud/generic-component'
export const DefineTimeSwitch = defineComponent({
  setup: () => {
    const state = reactive<{
      loading: boolean;
      dataSource: unknown[];
      scrollY: number;
      searchParams: {
        pageSize: number;
        pageNumber: number;
        total: number;
        planName: string;
      };
    }>({
      loading: false,
      dataSource: [],
      scrollY: 500,
      searchParams: {
        pageSize: 10,
        pageNumber: 1,
        total: 0,
        planName: ''
      }
    })
    const getList = async (): Promise<void> => {
      try {
        state.loading = true
        const params = {
          ...state.searchParams
        }
        const { data } = await getDefiniteTimeSwitchList(params)
        state.dataSource = data.records
        state.searchParams.total = data.total
      } catch (error) {
      } finally {
        state.loading = false
      }
    }
    const columns = [
      {
        title: '计划名称',
        dataIndex: 'planName',
        key: 'planName',
        ellipsis: true,
        customRender: ({ text }: { text: string; }) => {
          return (
            <Tooltip title={text} placement='top'>
              <span>{text}</span>
            </Tooltip>
          )
        }
      },

      {
        title: '计划开始时间',
        dataIndex: 'planStartTime',
        key: 'planStartTime',
        ellipsis: true,
        customRender: ({ text }: { text: number; }) => {
          return (
            <Tooltip title={text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '--'} placement='top'>
              <span>{text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '--'}</span>
            </Tooltip>
          )
        }
      },
      {
        title: '计划结束时间',
        dataIndex: 'planEndTime',
        key: 'planEndTime',
        ellipsis: true,
        customRender: ({ text }: { text: number; }) => {
          return (
            <Tooltip title={text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '--'} placement='top'>
              <span>{text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '--'}</span>
            </Tooltip>
          )
        }
      },
      {
        title: '开屏时间',
        dataIndex: 'openTime',
        key: 'openTime',
      },
      {
        title: '计划关闭时间',
        dataIndex: 'closeTime',
        key: 'closeTime',
      },
      {
        title: '控制设备数',
        dataIndex: 'deviceTotal',
        key: 'deviceTotal',
      },
      {
        title: '是否启用',
        dataIndex: 'isEnable',
        key: 'isEnable',
        customRender: ({ text }: { text: number; }) => {
          return text ? '启用' : '禁用'
        }
      },
      {
        title: '操作',
        dataIndex: 'action',
        key: 'action',
        customRender: ({ record }: { record: { id: string; }; }) =>
          <>
            <Button type='link' onClick={() => { handleInfo(record.id) }}>详情</Button>
            <Button type='link' onClick={() => { handleEdit(record.id) }}>编辑</Button>
            <PopConfirm
              title='是否确认删除?'
              ok-text='确定'
              cancel-text='取消'
              onConfirm={() => {
                handleDelete(record.id)
              }}
            >
              <Button type='text' danger>删除</Button>
            </PopConfirm>
          </>
      }
    ]
    const handleDelete = async (id: string): Promise<void> => {
      await deleteDefiniteTimeSwitch(id)
      message.success('删除成功!')
      getList()
    }
    const handleInfo = (id: string): void => {
      const target = `/portal/info-publish/define-time-switch-edit?type=info&id=${id}`
      history.pushState({ current: location.pathname + location.search }, '', target)
    }
    const handleEdit = (id: string): void => {
      const target = `/portal/info-publish/define-time-switch-edit?type=edit&id=${id}`
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
      state.searchParams.planName = ''
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
      const target = '/portal/info-publish/define-time-switch-edit?type=add'
      history.pushState({ current: location.pathname + location.search }, '', target)
    }
    const options = [{
      label: '设备1',
      value: '1'
    }]
    const layoutSlots = {
      'header-btn': () => {
        return <Button type='primary' onClick={handleAdd}>新增</Button>
      },
      'content-search': () => {
        return (
          <Form layout='inline'>
            <FormItem>
              <Input style={{ width: '180px' }} placeholder='计划名称' options={options} v-model:value={state.searchParams.planName} />
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
            <AliasTable columns={columns} rowKey='id' scrollX={0} loading={state.loading} tableCode='DEFINE_TIME_SWITCH' applicationCode='INFORMATION_PUBLISH' dataSource={state.dataSource} pagination={false} scrollY={500} />
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
    return () => <GLayout title='定时开关' v-slots={layoutSlots} />
  }
})
