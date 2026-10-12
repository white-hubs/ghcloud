import { defineComponent, reactive } from 'vue'
import { Button, Select, PopOver, Page } from '@ghcloud/cube-ui'
import { useCubeForm, useCubeTable } from '@ghcloud/cube-app-design'
import dayjs from 'dayjs'
import DeviceSelect from './device-select'

export const LineLossList = defineComponent({
  name: 'LineLossList',
  setup: () => {
    // --- Table Logic ---
    const searchParams = reactive({
      pageNumber: 1,
      pageSize: 10,
      total: 0,
      keyword: '',
      period: '',
      inDeviceIds: [] as string[],
      outDeviceIds: [] as string[]
    })

    const mockData = Array.from({ length: 20 }).map((_, index) => ({
      id: index + 1,
      lineName: '101主干电缆（主线）',
      takeOverTime: '2010-10-19 12:00:00',
      inputEnergy: '35,000',
      outputEnergy: index === 4 ? '-' : '34,000', // Match screenshot behavior
      lossRate: index === 4 ? '-' : '2.86%',
    }))

    const columns = [
      {
        title: '线路名称',
        dataIndex: 'lineName',
        align: 'center',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => (
            <PopOver content={text || ''}>{text || '--'}</PopOver>
        ),
      },
      {
        title: '时间',
        dataIndex: 'takeOverTime',
        align: 'center',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
             const time = text && text !== '-' ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : text
             return <PopOver content={time || ''}>{time || '--'}</PopOver>
        },
      },
      {
        title: '输入电量(kWh)',
        dataIndex: 'inputEnergy',
        align: 'center',
        ellipsis: true,
         customRender: ({ text }: { text: string; }): JSX.Element => (
            <PopOver content={text || ''}>{text || '--'}</PopOver>
        ),
      },
      {
        title: '输出电量(kWh)',
        dataIndex: 'outputEnergy',
        align: 'center',
        ellipsis: true,
         customRender: ({ text }: { text: string; }): JSX.Element => (
            <PopOver content={text || ''}>{text || '--'}</PopOver>
        ),
      },
      {
        title: '设备线损率(%)',
        dataIndex: 'lossRate',
        align: 'center',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return (
            <PopOver content={text || ''}>
              {text || '--'}
            </PopOver>
          )
        },
      },
    ]

    const [CubeTable, tableApi] = useCubeTable({
      columns,
      rowKey: 'id',
      scrollY: 400,
      fetchApi: async () => {
         // Mock API delay
         await new Promise(resolve => setTimeout(resolve, 500))
         return {
             total: mockData.length,
             records: mockData.slice((searchParams.pageNumber - 1) * searchParams.pageSize, searchParams.pageNumber * searchParams.pageSize),
         } as any
      },
      fetchLoaded: (data: any) => {
          searchParams.total = data.total
      }
    })
    
    const handlePageChange = (pageNumber: number, pageSize: number) => {
        searchParams.pageNumber = pageNumber
        searchParams.pageSize = pageSize
        tableApi.query()
    }

    const formSchema = [
        {
          component: DeviceSelect,
          label: '输入设备',
          fieldName: 'inDeviceIds',
          defaultValue: [],
          componentProps: {
            placeholder: '请选择输入设备'
          }
        },
        {
          component: DeviceSelect,
          label: '输出设备',
          fieldName: 'outDeviceIds',
          defaultValue: [],
          componentProps: {
            placeholder: '请选择输出设备'
          }
        },
        {
          component: 'RangePicker',
          label: '时间范围',
          fieldName: 'period',
          componentProps: {
            styles: {
              width: '100%'
            },
            valueFormat: 'YYYY-MM-DD',
            allowClear: true,
          }
        },
        {
          component: 'Input',
          label: '',
          fieldName: 'keyword',
          componentProps: {
            placeholder: '线路名称',
          },
        },
      ]
  
      const [CubeForm, formApi] = useCubeForm({
        layout: 'horizontal',
        schema: formSchema,
        showCollapseButton: true,
      syncStateRef: searchParams,
      onHydratedQuery: () => {
        tableApi.query();
      },
        handleSubmit: (data) => {
          searchParams.period = data.period ? (data.period as [string, string]).join(',') : ''
          searchParams.keyword = data.keyword ? data.keyword as string : ''
          searchParams.inDeviceIds = (data.inDeviceIds as string[]) || []
          searchParams.outDeviceIds = (data.outDeviceIds as string[]) || []
          searchParams.pageNumber = 1
          tableApi.query()
        },
        handleReset: () => {
          searchParams.period = ''
          searchParams.keyword = ''
          searchParams.inDeviceIds = []
          searchParams.outDeviceIds = []
          searchParams.pageNumber = 1
          tableApi.query()
        },
      })

    return () => (
        <>
            <div style={{ padding: '0 12px' }}>
                <CubeForm />
                <CubeTable />
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                    <Page
                        current={searchParams.pageNumber}
                        pageSize={searchParams.pageSize}
                        total={searchParams.total}
                        onPageChange={handlePageChange}
                    />
                </div>
            </div>
        </>
    )
  }
})
