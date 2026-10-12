import { defineComponent, onMounted, reactive, ref } from 'vue'
import { Layout } from '@/components/layout/layout'
import { Button, Form, FormItem, Page, PopConfirm, PopOver, message } from '@ghcloud/cube-ui'
import { useTableScroll } from '@/hook/use-table-scroll'
import { TenantSelect } from '@/components/business/tenant-select/tenant-select'
import { usePageName } from '@ghcloud/cube-utils'
import type { CompanyVO } from '@ghcloud/cube-operating-room-service'
import dayjs from 'dayjs'
import { cubeOperatingRoomService } from '@/api/service'
import { AliasTable } from '@ghcloud/generic-component'
import { useRoute, useRouter } from 'vue-router'
import { storeDetection } from '@/store/detection'

/** 报告设置 */
export const ReportSet = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName()
    const route = useRoute()
    const tableCode = route.path.replaceAll('/', '')
    const router = useRouter()
    const detectionStore = storeDetection()

    const formState = reactive<Record<string, string | undefined>>({
      tenantId: undefined,
      tenantName: '',
    })
    const columns = [
      {
        title: '受检单位',
        dataIndex: 'tenantName',
        width: 180,
        ellipsis: true,
        fixed: 'left',
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '校准期',
        dataIndex: 'calibrationExpireTime',
        width: 180,
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          const time = text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : ''
          return <PopOver content={time || '--'}>{time || '--'}</PopOver>
        }
      },
      {
        title: '检测公司',
        dataIndex: 'detectionCompany',
        width: 180,
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '检测地址',
        dataIndex: 'detectionAddress',
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '检测电话',
        dataIndex: 'detectionPhone',
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '操作',
        dataIndex: 'action',
        ellipsis: true,
        width: 180,
        customRender: ({ record }: { record: CompanyVO; }): JSX.Element => {
          return (
            <>
              <Button type='link' onClick={() => {
                handleEdit(record)
              }}>编辑</Button>
              <PopConfirm
                title='是否确认删除?'
                ok-text='确定'
                cancel-text='取消'
                onConfirm={() => {
                  handleDel(record)
                }}
              >
                <Button type='link' danger>删除</Button>
              </PopConfirm>

            </>
          )
        }
      }
    ]

    const loading = ref(false)
    const dataSource = ref<CompanyVO[]>([])
    const pagination = ref({
      pageSize: 10,
      pageNumber: 1,
      total: 0
    })
    const getTableData = async (): Promise<void> => {
      try {
        loading.value = true
        const params = {
          pageNumber: pagination.value.pageNumber,
          pageSize: pagination.value.pageSize,
          tenantId: formState.tenantId ?? '',
        }
        const res = await cubeOperatingRoomService.getCompanyPage(params)
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
      Object.keys(formState).forEach(key => {
        formState[key as string] = undefined
      })
      queryForm()
    }
    const { scrollY } = useTableScroll()
    const handleEdit = (row: CompanyVO): void => {
      detectionStore.company = row
      router.push({
        path: '/report-set-info',
        query: {
          tenantId: row.tenantId
        }
      })
    }
    const handleDel = async (record: CompanyVO): Promise<void> => {
      try {
        if (record.tenantId) {
          await cubeOperatingRoomService.deleteCompany({
            tenantId: record.tenantId
          })
          message.success('删除成功')
          queryForm()
        }
      } catch {
      }
    }
    const tenantChange = (tenant: { label: string; value: string; }): void => {
      formState.tenantName = tenant.label
    }
    onMounted(() => {
      queryForm()
    })

    const layoutSlots = {
      'layout-content': (): JSX.Element => {
        return (
          <>
            <Form layout='inline' style={{ margin: '10px 0 0 0' }}>
              <FormItem label='受检单位' style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }}>
                <TenantSelect v-model:value={formState.tenantId} width='180px' selectFirst={false} onChange={tenantChange} placeholder='请选择受检单位' />
              </FormItem>
              <FormItem style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }}>
                <Button type='primary' onClick={queryForm}>查询</Button>
                <Button style={{ marginLeft: '10px' }} onClick={reset}>重置</Button>
              </FormItem>
            </Form>
            <AliasTable
              rowKey='id'
              dataSource={dataSource.value}
              columns={columns}
              loading={loading.value}
              pagination={false}
              tableCode={tableCode}
              applicationCode={__ENV__.applicationCode}
              scrollY={scrollY.value}
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
      }
    }
    return (): JSX.Element =>
      <>
        <Layout title={pageTitle ?? '报告设置'} v-slots={layoutSlots} />
      </>
  }
})
