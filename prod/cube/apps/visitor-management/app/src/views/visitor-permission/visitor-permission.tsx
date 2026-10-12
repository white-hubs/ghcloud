
import { defineComponent, onMounted, reactive, ref } from 'vue'
import { Layout } from '@/components/layout/layout'
import { Button, Form, FormItem, Input, Page, PopConfirm, PopOver, Table, message } from '@ghcloud/cube-ui'
import { useTableScroll } from '@/hook/use-table-scroll'
import { usePageName } from '@/hook/use-page-name'
import { cubeVisitorManagementService } from '@/api/service'
import dayjs from 'dayjs'
import type { TimeListState } from '@ghcloud/cube-visitor-management-service'

/** 访客权限设置 */
export const VisitorPermission = defineComponent({
  setup: () => {
    const { title: pageTitle } = usePageName()
    const formState = reactive<{ area: string | string[]; keyword: string; }>({
      area: [],
      keyword: ''
    })

    const columns = [
      {
        title: '访问区域',
        dataIndex: 'areaName',
        ellipsis: true,
        width: 180,
        fixed: 'left',
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '关联设备数',
        dataIndex: 'deviceNumber',
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '访问时间设置',
        dataIndex: 'visitPeriods',
        ellipsis: true,
        width: 260,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          let textVal = null
          try {
            const periods = JSON.parse(text) as { period: string; timeList: TimeListState[]; }[]
            textVal = periods.length
              ? periods.map(p => {
                let date = p.period ?? ''
                if (p.period && p.period.includes(',')) {
                  date = p.period.split(',').join('至')
                }
                const time = p.timeList?.map(t => {
                  if (t.timeStr && t.timeStr !== undefined) {
                    return `${t.timeStr}【可访问数量: ${t.totalNumber}】`
                  } else {
                    return ''
                  }
                }).join(', ')
                return `${date} ${time}`
              })
              : ''
          } catch {
            textVal = text
          }
          return <PopOver content={textVal || '--'}>{textVal || '--'}</PopOver>
        }
      },
      {
        title: '创建人',
        dataIndex: 'createUserName',
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '创建时间',
        dataIndex: 'createTime',
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          const time = text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '--'
          return <PopOver content={time}>{time}</PopOver>
        }
      },
      {
        title: '操作',
        dataIndex: 'action',
        width: 180,
        ellipsis: true,
        customRender: ({ record }: { record: { areaId: string; id: string; }; }): JSX.Element => {
          return (
            <>
              <Button type='link' size='small' onClick={() => {
                editRow(record)
              }}>编辑</Button>
              <PopConfirm title='确认删除该项？' onConfirm={() => {
                delRow(record)
              }}>
                <Button type='link' size='small' danger>删除</Button>
              </PopConfirm>
            </>
          )
        }
      }
    ]

    const loading = ref(false)
    const dataSource = ref<unknown[]>([])
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
          // areaIds: formState.area ?? [],
          keyword: formState.keyword
        }
        const res = await cubeVisitorManagementService.getLampAreaPage(params)
        if (res) {
          dataSource.value = res.records
          pagination.value.total = res.total
        }
      } catch (error) {
        message.error((error as { errorMessage: string; })?.errorMessage ?? '网络异常')
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
      formState.area = []
      formState.keyword = ''
      queryForm()
    }
    const editRow = (record: { areaId: string; id: string; }): void => {
      history.pushState({ current: location.pathname + location.search }, '', `/portal/visitor-management/visitor-area-form?areaId=${record.areaId}&id=${record.id}&action=edit`)
    }
    const add = (): void => {
      history.pushState({ current: location.pathname + location.search }, '', '/portal/visitor-management/visitor-area-form?action=add')
    }
    const delRow = async (record: { areaId: string; }): Promise<void> => {
      try {
        await cubeVisitorManagementService.delLampArea(record.areaId)
        message.success('操作成功')
        reset()
      } catch (error) {
        message.error((error as { errorMessage: string; })?.errorMessage ?? '操作失败')
      }
    }
    const { scrollY } = useTableScroll()

    onMounted(() => {
      getTableData()
    })

    const layoutSlots = {
      'layout-header': (): JSX.Element => {
        return (
          <>
            <div>
              <Button class='mr-16px' type='primary' onClick={add}>新增</Button>
            </div>
          </>
        )
      },
      'layout-content': (): JSX.Element => {
        return (
          <>
            <Form layout='inline' style={{ margin: '10px 0 0 0' }}>
              <FormItem label='区域名称' style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }}>
                <Input v-model:value={formState.keyword} placeholder='请输入区域名称' showCount={false} />
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
        <Layout title={pageTitle ?? '访客权限设置'} v-slots={layoutSlots} />
      </>
  }
})
