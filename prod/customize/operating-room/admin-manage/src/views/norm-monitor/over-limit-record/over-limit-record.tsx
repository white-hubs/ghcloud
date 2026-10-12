
import { defineComponent, onMounted, reactive, ref } from 'vue'
import { Layout } from '@/components/layout/layout'
import { Button, DateRangePicker, Form, FormItem, Page, PopOver, Select, Table, message } from '@ghcloud/cube-ui'
import { useTableScroll } from '@/hook/use-table-scroll'
import { TenantSelect } from '@/components/business/tenant-select/tenant-select'
import { usePageName } from '@/hook/use-page-name'
import dayjs from 'dayjs'
import { LimitInfoModal } from './limit-info-modal'
import { cubeMessageCenterService } from '@/api/service'
import type { MsgRecordPageVO } from '@ghcloud/cube-message-center-service/src/types'
// import { useRoute } from 'vue-router'

/** 超限提醒记录 */
export const OverLimitRecord = defineComponent({
  setup: () => {
    const { title: pageTitle } = usePageName()
    // const { type, businessId, id, tenant } = useRoute().query as { type: string; businessId: string; id: string; tenant: string; }
    const formState = reactive<{
      period: number[] | undefined;
      tenant: string | undefined;
      status: undefined;
    }>({
      tenant: undefined,
      status: undefined,
      period: []
    })

    const msgStatusOptions = [
      {
        label: '未读',
        value: false,
        color: 'rgb(0 0 0 / 85%)'
      },
      {
        label: '已读',
        value: true,
        color: '#d9d9d9'
      }
    ]
    const columns = [
      {
        title: '消息内容',
        dataIndex: 'msgContent',
        ellipsis: true,
        width: 600,
        fixed: 'left',
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '所属医院',
        dataIndex: 'sourceTenantName',
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string; }): JSX.Element=> {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '通知时间',
        dataIndex: 'sendTime',
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string; }): JSX.Element=> {
          const time = text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : ''
          return <PopOver content={time || '--'}>{time || '--'}</PopOver>
        }
      },
      {
        title: '消息状态',
        dataIndex: 'hasRead',
        ellipsis: true,
        width: 120,
        customRender: ({ text }: { text: boolean; }): JSX.Element => {
          const cur = msgStatusOptions.find(s => s.value === text)
          return <PopOver content={cur?.label ?? '--'}><span style={{ color: cur?.color ?? 'inherit' }}>{cur?.label || '--'}</span></PopOver>
        }
      },
      {
        title: '操作',
        dataIndex: 'action',
        ellipsis: true,
        width: 120,
        customRender: ({ record }: { record: MsgRecordPageVO; }): JSX.Element => {
          return (
            <>
              <Button type='link' onClick={() => {
                handleInfo(record)
              }} style={{ paddingLeft: 0, paddingRight: 0 }}>详情</Button>
            </>
          )
        }
      }
    ]

    const loading = ref(false)
    const dataSource = ref<MsgRecordPageVO[]>([])
    const pagination = ref({
      pageSize: 10,
      pageNumber: 1,
      total: 0
    })
    const getTableData = async (): Promise<void> => {
      try {
        loading.value = true
        const res = await cubeMessageCenterService.getMsgRecordsPage({
          applicationCode: __ENV__.applicationCode,
          sendStatus: formState.status ?? undefined,
          sourceTenant: formState.tenant ?? '',
          period: formState.period?.length ? formState.period.join(',') : '',
          pageSize: pagination.value.pageSize,
          pageNumber: pagination.value.pageNumber
        })
        if (res) {
          const { records, total } = res
          dataSource.value = records
          pagination.value.total = total
        }
      } catch {
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
      formState.tenant = undefined
      formState.status = undefined
      formState.period = undefined
      dataSource.value = []
      queryForm()
    }
    onMounted(() => {
      queryForm()
      // if (type === 'detail' && businessId && id) {
      //   if (tenant) formState.tenant = tenant
      //   limitModalRef.value?.openModal({ id: id as unknown as number, businessId })
      // }
    })
    const { scrollY } = useTableScroll()

    const limitModalRef = ref<{ openModal: (row: MsgRecordPageVO) => void; }>()
    const handleInfo = (row: MsgRecordPageVO): void => {
      limitModalRef.value?.openModal(row)
    }

    const layoutSlots = {
      'layout-content': (): JSX.Element => {
        return (
          <>
            <Form layout='inline' style={{ margin: '10px 0 0 0' }}>
              <FormItem label='通知时间' style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }}>
                <DateRangePicker v-model:value={formState.period} />
              </FormItem>
              <FormItem label='所属医院' style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }}>
                <TenantSelect v-model:value={formState.tenant} width='180px' selectFirst={false} />
              </FormItem>
              <FormItem label='消息状态' style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }}>
                <Select options={msgStatusOptions} v-model:value={formState.status} placeholder='请选择状态' style={{ width: '180px' }} />
              </FormItem>
              <FormItem style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }}>
                <Button type='primary' onClick={queryForm}>查询</Button>
                <Button style={{ marginLeft: '10px' }} onClick={reset}>重置</Button>
              </FormItem>
            </Form>
            <Table columns={columns} loading={loading.value} dataSource={dataSource.value} pagination={false} size='small' scrollY={scrollY.value} />
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
    return (): JSX.Element =>
      <>
        <Layout title={pageTitle ?? '超限提醒记录'} v-slots={layoutSlots} />
        <LimitInfoModal ref={limitModalRef} tenant={formState.tenant ?? ''} />
      </>
  }
})
