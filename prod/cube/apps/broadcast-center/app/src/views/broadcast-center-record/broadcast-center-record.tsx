import { defineComponent, onMounted, reactive, ref } from 'vue'
import { Layout } from '@/components/layout/layout'
import { Button, Form, FormItem, Input, Page, PopOver } from '@ghcloud/cube-ui'
import { AliasTable } from '@ghcloud/generic-component'
import dayjs from 'dayjs'
import type { BroadcastTemplatePage } from '@ghcloud/cube-broadcast-center-service'
import { useTableScroll } from '@/hook/use-table-scroll'
import { useRoute } from 'vue-router'
import { usePageName } from '@ghcloud/cube-utils'
import { cubeBroadcastService } from '@/api/service'

/** 广播记录 */
export const BroadcastCenterRecord = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName()
    const pagination = ref<
      {
        pageSize: number;
        pageNumber: number;
        total?: number;
      }
    >({
      pageSize: 10,
      pageNumber: 1,
      total: 0
    })
    const formState = reactive<{
      keyword: string | undefined;
    }>({
      keyword: undefined,
    })
    const route = useRoute()
    const loading = ref(false)
    const dataSource = ref<BroadcastTemplatePage[]>([])
    const { scrollY } = useTableScroll()
    const tableCode = route.path.replaceAll('/', '')

    const pageChange = (pageNumber: number, pageSize: number): void => {
      pagination.value.pageNumber = pageNumber || 1
      pagination.value.pageSize = pageSize
      getBroadcastRecords()
    }
    const queryForm = (): void => {
      pagination.value.pageNumber = 1
      getBroadcastRecords()
    }
    const getBroadcastRecords = async (): Promise<void> => {
      const params = {
        ...pagination.value,
        ...formState,
      }
      delete params?.total
      loading.value = true
      const res = await cubeBroadcastService.broadcastPlayRecordPage(params)
      dataSource.value = res.records
      pagination.value.total = res.total
      loading.value = false
    }
    const reset = (): void => {
      pagination.value.pageNumber = 1
      formState.keyword = ''
      getBroadcastRecords()
    }
    const columns = [
      {
        title: '序号',
        dataIndex: '',
        ellipsis: true,
        align: 'center',
        width: 70,
        customRender: ({ index }: { index: number; }): JSX.Element => {
          return <PopOver content={index + 1 || '--'}>{index + 1 || '--'}</PopOver>
        }
      },
      {
        title: '广播时间',
        dataIndex: 'broadcastTime',
        ellipsis: true,
        align: 'center',
        width: 100,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          const time = text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : ''
          return <PopOver content={time || '--'}>{time || '--'}</PopOver>
        }
      },
      {
        title: '模板名称',
        dataIndex: 'broadcastTemplateName',
        align: 'center',
        width: 100,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '广播内容',
        dataIndex: 'broadcastPlayContent',
        ellipsis: true,
        align: 'center',
        width: 200,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '广播次数',
        dataIndex: 'broadcastPlayNum',
        ellipsis: true,
        align: 'center',
        width: 100,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '广播终端',
        dataIndex: 'broadcastPlayDevices',
        ellipsis: true,
        align: 'center',
        width: 100,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '操作人',
        dataIndex: 'operatorByName',
        ellipsis: true,
        align: 'center',
        width: 100,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '操作人部门',
        dataIndex: 'operatorByDeptName',
        ellipsis: true,
        align: 'center',
        width: 100,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },

    ]
    onMounted(() => {
      getBroadcastRecords()
    })
    const layoutSlots = {
      'layout-content': (): JSX.Element => {
        return (
          <>
            <Form layout='inline' style={{ margin: '10px 0 0 0' }}>
              <FormItem label='' style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }}>
                <Input style={{ width: '220px' }} placeholder='请输入名称搜索' v-model:value={formState.keyword} />
              </FormItem>
              <FormItem style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }}>
                <Button type='primary' onClick={queryForm}>查询</Button>
                <Button style={{ marginLeft: '10px' }} onClick={reset}>重置</Button>
              </FormItem>
            </Form>
            <AliasTable
              columns={columns}
              loading={loading.value}
              dataSource={dataSource.value}
              pagination={false}
              scrollY={scrollY.value}
              tableCode={tableCode}
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
      },
    }
    return (): JSX.Element =>
      <>
        <Layout title={pageTitle ?? '广播记录'} v-slots={layoutSlots} />
      </>
  }
})
