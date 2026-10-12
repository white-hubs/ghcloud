import { defineComponent, onMounted, reactive, ref } from 'vue'
import { Layout } from '@/components/layout/layout'
import { Button, Form, FormItem, Input, message, Page, PopConfirm, PopOver, Switch } from '@ghcloud/cube-ui'
import { AliasTable } from '@ghcloud/generic-component'
import type { BroadcastPlayRulePage } from '@ghcloud/cube-broadcast-center-service'
import { useTableScroll } from '@/hook/use-table-scroll'
import { useRoute, useRouter } from 'vue-router'
import { usePageName } from '@ghcloud/cube-utils'
import { cubeBroadcastService } from '@/api/service'

/** 广播规则列表 */
export const BroadcastCenterRuleList = defineComponent({
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
    const router = useRouter()
    const loading = ref(false)
    const dataSource = ref<BroadcastPlayRulePage[]>([])
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
      const res = await cubeBroadcastService.broadcastPlayRulePage(params)
      dataSource.value = res.records
      pagination.value.total = res.total
      loading.value = false
    }
    const reset = (): void => {
      pagination.value.pageNumber = 1
      formState.keyword = ''
      getBroadcastRecords()
    }
    const operationRecord = async (record: BroadcastPlayRulePage): Promise<void> => {
      router.push({
        path: '/broadcastCenterRuleDetails',
        query: {
          type: 'info',
          id: record.id
        }
      })
    }
    const editRecord = async (record: BroadcastPlayRulePage): Promise<void> => {
      router.push({
        path: '/broadcastCenterRuleDetails',
        query: {
          type: 'edit',
          id: record.id
        }
      })
    }

    const operationDelete = async (record: BroadcastPlayRulePage): Promise<void> => {
      await cubeBroadcastService.deleteBroadcastPlayRule(record.id)
      getBroadcastRecords()
      message.success('删除成功')
    }
    const handleChange = async (record: BroadcastPlayRulePage): Promise<void> => {
      await cubeBroadcastService.broadcastPlayRuleEnabled(record.id, record.enabled)
      message.success('操作成功')
    }
    const openModel = (type: string): void => {
      router.push({
        path: '/broadcastCenterRuleDetails',
        query: {
          type,
        }
      })
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
        title: '规则名称',
        dataIndex: 'name',
        ellipsis: true,
        align: 'center',
        width: 100,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '说明',
        dataIndex: 'remark',
        align: 'center',
        ellipsis: true,
        width: 600,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '开关',
        dataIndex: 'enabled',
        align: 'center',
        customRender: ({ record }: { record: BroadcastPlayRulePage; }): JSX.Element => {
          return <Switch v-model:checked={record.enabled} onChange={() => {
            handleChange(record)
          }} />
        }
      },
      {
        title: '操作',
        dataIndex: 'action',
        ellipsis: true,
        align: 'center',
        width: 180,
        customRender: ({ record }: { record: BroadcastPlayRulePage; }): JSX.Element => {
          return (
            <>
              <Button type='link' size='small' onClick={() => {
                operationRecord(record)
              }}>详情</Button>
              <Button type='link' size='small' onClick={() => {
                editRecord(record)
              }}>编辑</Button>
              {
                !record.defaulted &&
                <PopConfirm title='确认删除该项？' onConfirm={async () => operationDelete(record)}>
                  <Button type='link' size='small' danger>删除</Button>
                </PopConfirm>
              }
            </>
          )
        }
      },
    ]
    onMounted(() => {
      getBroadcastRecords()
    })
    const layoutSlots = {
      'layout-header': (): JSX.Element => {
        return (
          <div>
            <Button class='mr-16' type='primary' onClick={() => {
              openModel('add')
            }}>新增</Button>
          </div>
        )
      },
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
        <Layout title={pageTitle ?? '广播规则'} v-slots={layoutSlots} />
      </>
  }
})
