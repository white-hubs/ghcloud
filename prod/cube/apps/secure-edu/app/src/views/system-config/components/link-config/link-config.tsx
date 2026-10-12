
import { defineComponent, onMounted, reactive, ref } from 'vue'
import { Layout } from '@/components/layout/layout'
import { Button, Form, FormItem, Input, Page, PopOver, Switch, Table, message } from '@ghcloud/cube-ui'
import { useTableScroll } from '@/hook/use-table-scroll'
import { logger } from '@/logger'
import useClipboard from 'vue-clipboard3'
import { cubeSecureEduHeadQuartersService } from '@/api/server'
import { authStore } from '@/api/auth-store'

interface Props {
  type: 'CULTIVATE_TASK' | 'EXAM_TASK' ;
}

/** 培训、考试 PC外链 汇总页面 */
export const LinkConfig = defineComponent({
  props: ['type'],
  setup: (props: Props) => {
    const { toClipboard } = useClipboard()
    const pageTitle = props.type === 'CULTIVATE_TASK' ? '培训链接' : '考试链接'
    const formState = reactive({
      keyword: ''
    })
    const copy = async (text: string): Promise<void> => {
      try {
        await toClipboard(text) // 实现复制
        message.success('复制成功')
      } catch {
        message.error('复制失败')
      }
    }

    const columns = [
      {
        title: '序号',
        width: 70,
        align: 'center',
        customRender: ({ index }: { index: number; }): string => `${index + 1}`
      },
      {
        title: '市场名称',
        dataIndex: 'marketName',
        width: 250,
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: pageTitle,
        ellipsis: true,
        dataIndex: 'id',
        customRender: ({ record }: { record: { id: number;marketTenant: number; }; }): JSX.Element => {
          const url = `${window.location.origin}/apps/secure-edu/app/outside-link-${props.type === 'CULTIVATE_TASK' ? 'train' : 'exam'}?id=${record.id}&headTenant=${authStore.tenant}&marketTenant=${record.marketTenant}`
          return <Button type='link' onClick={async () => copy(url)}>{url}</Button>
        }
      },
      {
        title: '是否启用',
        dataIndex: 'marketName',
        width: 250,
        ellipsis: true,
        customRender: ({ record }: { record: { enabled: boolean;id: string; }; }): JSX.Element => {
          return <Switch v-model:value={record.enabled} onChange={(value: boolean) => {
            changeEnable(record.id, value)
          }} />
        }
      },
    ]

    const loading = ref(false)
    const dataSource = ref<unknown[]>([])
    const pagination = ref({
      pageSize: 10,
      pageNumber: 1,
      total: 0
    })

    const { scrollYAxis } = useTableScroll()

    const getTableData = async (): Promise<void> => {
      try {
        loading.value = true
        const { records, total } = await cubeSecureEduHeadQuartersService.getMarketTaskUrlPage({
          pageNumber: pagination.value.pageNumber,
          pageSize: pagination.value.pageSize,
          ...formState,
          taskType: props.type
        })

        dataSource.value = records
        pagination.value.total = total
      } catch (error) {
        logger.error(error)
      } finally {
        loading.value = false
      }
    }

    const pageChange = (pageNumber: number, pageSize: number): void => {
      pagination.value.pageNumber = pageNumber || 1
      pagination.value.pageSize = pageSize
      getTableData()
    }

    const queryForm = (): void => {
      pagination.value.pageNumber = 1
      getTableData()
    }
    const reset = (): void => {
      formState.keyword = ''
      queryForm()
    }

    const changeEnable = async (id: string, enabled: boolean): Promise<void> => {
      try {
        message.loading('操作中')
        await cubeSecureEduHeadQuartersService.changeMarketPCLinkEnable(id, enabled)
        message.destroy()
        message.success('操作成功')
      } catch {
        message.destroy()
      } finally {
        getTableData()
      }
    }

    onMounted(() => {
      getTableData()
    })

    const layoutSlots = {
      'layout-content': (): JSX.Element => {
        return (
          <>
            <Form layout='inline' style={{ margin: '10px 0' }}>
              <FormItem style={{ paddingRight: 0 }}>
                <Input v-model:value={formState.keyword} placeholder='市场名称' showCount={false} />
              </FormItem>
              <FormItem>
                <Button type='primary' onClick={queryForm}>查询</Button>
                <Button style={{ marginLeft: '10px' }} onClick={reset}>重置</Button>
              </FormItem>
            </Form>
            <Table columns={columns} loading={loading.value} dataSource={dataSource.value} pagination={false} size='small' scrollY={scrollYAxis.value} />
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
      }
    }
    return (): JSX.Element => <Layout title={pageTitle} v-slots={layoutSlots} />
  }
})
