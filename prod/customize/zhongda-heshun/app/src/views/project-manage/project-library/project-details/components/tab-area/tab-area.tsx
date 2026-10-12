import { defineComponent, reactive, onMounted, ref } from 'vue'
import { PopOver, Table } from '@ghcloud/cube-ui'
import { cubeZhongdaHeshunService } from '@/api/service'
import type { ProjectAreaVO } from '@ghcloud/cube-zhongda-heshun-service'
import { useTableScroll } from '@/hook/use-table-scroll'
interface Props {
  projectId: string;
}
export const TabProjectArea = defineComponent({
  name: 'TabProjectArea',
  props: {
    projectId: {
      type: String,
      required: true
    }
  },
  setup: (props: Props) => {
    const { scrollY } = useTableScroll()

    const page = reactive({
      pageNumber: 1,
      pageSize: 1000,
      total: 0,
    })
    const tableData = ref<ProjectAreaVO[]>([])
    const loading = ref(false)
    onMounted(() => {
      getData()
    })
    const columns = [
      {
        title: '区域',
        dataIndex: 'areaName',
        ellipsis: true,
        align: 'center',
        customRender: ({ text }: { text: string; }): JSX.Element=> {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '详情',
        dataIndex: 'areaDetail',
        ellipsis: true,
        align: 'center',
        customRender: ({ text }: { text: string; }): JSX.Element=> {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      }
    ]
    const getData = async (): Promise<void> => {
      loading.value = true
      try {
        const params = {
          pageNumber: page.pageNumber,
          pageSize: page.pageSize,
          projectId: props.projectId as string ?? '-',
        }
        const data = await cubeZhongdaHeshunService.getProjectAreaPage(params)
        page.total = data.total
        tableData.value = data.records
      } finally {
        loading.value = false
      }
    }

    return (): JSX.Element => (
      <Table columns={columns} dataSource={tableData.value} loading={loading.value} scrollY={scrollY.value - 80} pagination={false}></Table>

    )
  }
})