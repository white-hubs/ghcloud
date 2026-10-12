import { defineComponent, onMounted, reactive, ref } from 'vue'
import { Layout } from '@/components/layout/layout'
import { Button, DateRangePicker, Form, FormItem, Input, Page, PopOver, Table, message } from '@ghcloud/cube-ui'
import { useTableScroll } from '@/hook/use-table-scroll'
import { usePageName } from '@/hook/use-page-name'
import { cubeVisitorManagementService } from '@/api/service'
import dayjs from 'dayjs'
import { ReservationCodeModel } from './components/reservation-code-modal'

/** 预约记录 */
export const ReservationRecord = defineComponent({
  setup: () => {
    const { title: pageTitle } = usePageName()
    const formState = reactive({
      name: '',
      phone: '',
      area: [],
      period: [],
    })
    const reservationCodeModelRef = ref<{ openModal: (id?: number) => void; }>()
    const detailRow = (record: { id: number; }): void => {
      reservationCodeModelRef.value?.openModal(record.id)
    }

    const statusOptions = ref([
      { label: '待审核', value: '0' },
      { label: '预约', value: '1' },
      { label: '在访', value: '2' },
      { label: '离访', value: '3' },
      { label: '预约取消', value: '4' },
    ])
    const color: Record<string, string> = {
      0: '#02A7F0',
      1: '#1890ff',
      2: '#00ba8b',
      3: '#7F7F7F',
      4: '#f50',
    }
    const columns = [
      {
        title: '区域',
        dataIndex: 'areaName',
        ellipsis: true,
        width: 180,
        fixed: 'left',
        customRender: ({ text }: { text: string; }): JSX.Element=> {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '预约日期',
        dataIndex: 'dayStr',
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '预约时段',
        dataIndex: 'timeStr',
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '预约人姓名',
        dataIndex: 'name',
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '预约人手机号',
        dataIndex: 'phone',
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
        title: '状态',
        dataIndex: 'status',
        width: 180,
        ellipsis: true,
        customRender: ({ text }: { text: number; }): JSX.Element => {
          const textVal = text ? statusOptions.value.find(s => Number(s.value) === text)?.label : ''
          return (
            <PopOver content={textVal || '--'}>
              <span style={{ color: color[text] }}>{textVal || '--'}</span>
            </PopOver>
          )
        }
      },
      {
        title: '操作',
        dataIndex: 'action',
        width: 180,
        ellipsis: true,
        customRender: ({ record }: { record: { id: number; }; }): JSX.Element => {
          return (
            <>
              <Button type='link' size='small' onClick={() => {
                detailRow(record)
              }}>查看预约码</Button>
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
          name: formState.name,
          phone: formState.phone,
          areaIds: formState.area ? formState.area.join('-') : '',
          period: formState.period ? formState.period.join(',') : formState.period,
        }
        const res = await cubeVisitorManagementService.getReservationRecordPage(params)
        if (res) {
          const { records, total } = res
          dataSource.value = records
          pagination.value.total = total
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
      formState.name = ''
      formState.phone = ''
      formState.area = []
      formState.period = []
      queryForm()
    }
    const { scrollY } = useTableScroll()

    onMounted(() => {
      getTableData()
    })

    const layoutSlots = {
      'layout-content': (): JSX.Element => {
        return (
          <>
            <Form layout='inline' style={{ margin: '10px 0 0 0' }}>
              {/* <FormItem style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }} label='区域'>
                <AreaCascaderSelect v-model:value={formState.area} style='width:180px' placeholder='请选择区域' />
              </FormItem> */}
              <FormItem style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }} label='预约日期'>
                <DateRangePicker v-model:value={formState.period} allowClear={false} />
              </FormItem>
              <FormItem label='预约人' style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }}>
                <Input v-model:value={formState.name} placeholder='请输入姓名' showCount={false} />
              </FormItem>
              <FormItem style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }}>
                <Input v-model:value={formState.phone} placeholder='请输入手机号' showCount={false} />
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
        <Layout title={pageTitle ?? '预约记录'} v-slots={layoutSlots} />
        <ReservationCodeModel ref={reservationCodeModelRef} />
      </>
  }
})
