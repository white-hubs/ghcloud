import { defineComponent, onMounted, reactive, ref, type VNode } from 'vue'
import { CubeLayout, useCubeForm, useCubeTable } from '@ghcloud/cube-app-design'
import { usePageName } from '@ghcloud/cube-utils'
import { Button, Page, PopOver } from '@ghcloud/cube-ui'
import { cubeElectricVehicleService, cubeMdataService } from '@/api/service'
import type { RiskSourceLedgerVO } from '@ghcloud/cube-risk-management-service'
import { useRouter } from 'vue-router'
import { CarType } from '../electric-vehicle-ledger/type'
interface SearchParamsType {
  pageNumber: number;
  pageSize: number;
  total: number;
  keyword: string | undefined;
  areaId: string | undefined;
  electronMobileType: string | undefined;
}

export const ViolationStatistics = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName()
    const router = useRouter()
    const searchParams = reactive<SearchParamsType>({
      pageNumber: 1,
      pageSize: 10,
      total: 100,
      keyword: undefined,
      areaId: undefined,
      electronMobileType: undefined,
    })
    const columns = [
      {
        title: '序号',
        dataIndex: 'index',
        width: 60,
        align: 'center',
        customRender: ({ index }: { index: string; }): string => {
          return index + 1
        }
      },
      {
        title: '名称',
        dataIndex: 'name',
        defaultVisible: true,
        align: 'center',
        customRender: ({ text }: { text: string; }): VNode=> {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },

      {
        title: '车牌号',
        dataIndex: 'plateNumber',
        defaultVisible: true,
        align: 'center',
        customRender: ({ text }: { text: string; }): VNode => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '分类',
        dataIndex: 'electronMobileType',
        defaultVisible: true,
        align: 'center',
        customRender: ({ text }: { text: string; }): VNode=> {
          return <PopOver content={CarType.get(text) || '--'}>{CarType.get(text) || '--'}</PopOver>
        }
      },
      {
        title: '所在区域',
        dataIndex: 'areaName',
        defaultVisible: true,
        align: 'center',
        customRender: ({ text }: { text: string; }): VNode=> {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '关联档位',
        dataIndex: 'stallName',
        align: 'center',
        customRender: ({ text }: { text: string; }): VNode => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '关联现场点',
        dataIndex: 'sitePointName',
        align: 'center',
        customRender: ({ text }: { text: string; }): VNode=> {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '详细位置',
        dataIndex: 'attribute',
        align: 'center',
        customRender: ({ text }: { text: string; }): VNode => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '违停次数',
        dataIndex: 'parkingNum',
        defaultVisible: true,
        align: 'center',
        customRender: ({ text }: { text: string; }): VNode => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '最近一次违停次数',
        dataIndex: 'lastParkingInspectItem',
        defaultVisible: true,
        align: 'center',
        customRender: ({ text }: { text: string; }): VNode => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '违规充电次数',
        dataIndex: 'chargeNum',
        align: 'center',
        customRender: ({ text }: { text: string; }): VNode => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '最近一次违规充电次数',
        dataIndex: 'lastChargeInspectItem',
        align: 'center',
        customRender: ({ text }: { text: string; }): VNode=> {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '操作',
        dataIndex: 'action',
        align: 'center',
        defaultVisible: true,
        width: 200,
        customRender: ({ record }: { record: RiskSourceLedgerVO; }): VNode=> {
          return (
            <>
              <Button type='link' size='small' onClick={() => {
                detailsRow(record)
              }}>详情</Button>
            </>
          )
        }
      },
    ]
    const carTypeOptions = [
      {
        label: '全部',
        value: ''
      },
      {
        label: '电动单车',
        value: 'BICYCLE'
      },
      {
        label: '电动三轮车',
        value: 'TRICYCLE'
      },
      {
        label: '电动四轮车',
        value: 'FOUR_WHEELED'
      }
    ]
    const formSchema = ref([
      {
        component: 'Select',
        label: '电动车分类',
        fieldName: 'electronMobileType',
        defaultValue: '',
        componentProps: {
          options: carTypeOptions,
          buttonStyle: 'solid',
          optionType: 'button',
          onChange: (value: string): void => {
            searchParams.pageNumber = 1
            searchParams.electronMobileType = value
            tableApi.query()
          }
        },
      },
      {
        component: 'Cascader',
        label: '所在区域',
        fieldName: 'areaId',
        defaultValue: '',
        componentProps: {
        },
      },
      {
        component: 'Input',
        label: '',
        fieldName: 'keyword',
        componentProps: {
          placeholder: '编号、名称、型号、使用人、车牌号'
        }
      },
    ])
    const [CubeTable, tableApi] = useCubeTable({
      columns,
      tableCode: 'Violation_Statistics',
      rowKey: 'id',
      fetchApi: async () => {
        return cubeElectricVehicleService.genElectronMobileStatPage({
          ...searchParams
        })
      },
      fetchLoaded: (data) => {
        searchParams.total = data.total
      }
    })
    const [CubeForm, formApi] = useCubeForm({
      layout: 'horizontal',
      handleSubmit: (data) => {
        searchParams.pageNumber = 1
        searchParams.keyword = data.keyword ? data.keyword as string : ''
        tableApi.query()
      },
      handleReset: () => {
        searchParams.pageNumber = 1
        searchParams.keyword = ''
        searchParams.areaId = ''
        searchParams.electronMobileType = ''
        tableApi.query()
      },
      schema: formSchema.value,
      showCollapseButton: true,
      syncStateRef: searchParams,
      onHydratedQuery: () => {
        tableApi.query();
      },
    })
    // 详情
    const detailsRow = async (record: RiskSourceLedgerVO): Promise<void> => {
      router.push({
        path: '/violation-statistics-details',
        query: {
          id: record.id,
        }
      })
    }
    // 分页
    const handleChange = (pageNumber: number, pageSize: number): void => {
      searchParams.pageNumber = pageNumber
      searchParams.pageSize = pageSize
      tableApi.query()
    }
    const slots = {
      'layout-content': (): VNode => {
        return (
          <div>
            <CubeForm />
            <CubeTable />
          </div>
        )
      },
      'footer-page': (): VNode=> {
        return (
          <Page
            current={searchParams.pageNumber}
            pageSize={searchParams.pageSize}
            total={searchParams.total}
            onPageChange={handleChange}
          />
        )
      },
    }
    // 获取区域数据
    const getAreaData = async (): Promise<void> => {
      const res = await cubeMdataService.getAreaTree()
      const schema = {
        component: 'Cascader',
        label: '所在区域',
        fieldName: 'areaId',
        defaultValue: '',
        componentProps: {
          options: res,
          placeholder: '请选择',
          allowClear: true,
          fieldNames: { label: 'name', value: 'id' },
          onChange: (value: string[]): void=> {
            searchParams.areaId = value[value.length - 1]
            tableApi.query()
          }
        }
      }
      formApi.updateFieldSchema(schema)
    }
    onMounted(async () => {
      getAreaData()
    })
    return (): VNode => (
      <>
        <CubeLayout title={pageTitle} v-slots={slots} />
      </>
    )
  }
})
