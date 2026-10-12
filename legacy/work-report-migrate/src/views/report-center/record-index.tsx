import { defineComponent, onMounted, reactive, ref, watch } from 'vue'
import { Layout } from '@ghcloud/generic-component'
import { Button, Page, PopOver, Table } from '@ghcloud/cube-ui'
import './index.less'
import { useRoute } from 'vue-router'
import { getReportCenterPage} from '@/api/work-report/index'
import dayjs from 'dayjs'

export const RecordIndex = defineComponent({
  setup: () => {
    const statusText = (str: string) => {
      const statusMap = new Map([
        ["SUBMIT", "提交"],
        ["UNDO", "撤销"],
        ["REPEAT", "重新提交"],
        ["APPROVAL", "审批"],
        ["BACK", "撤回"],
        ["COPY", "抄送"],
        ["REJECT", "驳回"],
        ["FINISHED", "完成"],
      ]);
      return statusMap.get(str) || "处理中";
    };
    const columns = [
      {
        title: '编号',
        dataIndex: 'formNo',
        ellipsis: true,
        width: '120px',
        fixed: 'left',
        customRender: ({ text }: { text: string; }) => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '申请名称',
        dataIndex: 'instanceName',
        ellipsis: true,
        width: '120px',
        customRender: ({ text }: { text: string; }) => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '发起人',
        dataIndex: 'startUserName',
        ellipsis: true,
        width: '120px',
        customRender: ({ text }: { text: string; }) => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '发起部门',
        dataIndex: 'startUserInfo',
        ellipsis: true,
        width: '120px',
        customRender: ({ text }: { text: {organizationName: string;}}) => {
          const val = text.organizationName ? text.organizationName : "";
          return <PopOver content={val || '--'}>{val || '--'}</PopOver>
        }
      },
      {
        title: '发起时间',
        dataIndex: 'submitedTime',
        ellipsis: true,
        width: '120px',
        customRender: ({ text }: { text: string; }) => {
          const val = text ? dayjs(text).format("YYYY-MM-DD HH:mm:ss") : "-";
          return <PopOver content={val || '--'}>{val || '--'}</PopOver>
        }
      },
      {
        title: '处理状态',
        dataIndex: 'status',
        ellipsis: true,
        width: '120px',
        customRender: ({ text }: { text: string; }) => {
          const val = text ? statusText(text) : "";
          return <PopOver content={val || '--'}>{val || '--'}</PopOver>
        }
      },
      {
        title: '处理进度',
        dataIndex: 'activeNodeName',
        ellipsis: true,
        width: '120px',
        customRender: ({ text }: { text: string; }) => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        dataIndex: 'action',
        title: '操作',
        width: '120px',
        customRender: ({ record }: { record: Record<string, string>; }) => {
          return (
            <>
              <Button type='link' onClick={() => { handleDetail(record) }}>详情</Button>
            </>
          )
        }
      },
    ]
    const dataSource = ref<unknown[]>([])

    const handleDetail = (record: Record<string, string>): void => {
      const target = `/portal/stream-engine-render/index?businessType=REPORT&processInstanceId=${record.processInstanceId}&type=detail&title=工作汇报&appName=工作汇报`
      history.pushState({ current: location.pathname + location.search }, '', decodeURIComponent(target))
    }
    const state = reactive({
      loading: false,
      exportLoading: false,
      pendingVisible: false,
      handlerVisible: false,
      searchParams: {
        pageNumber: 1,
        pageSize: 10,
        total: 0
      },
      selectRow: '',

    })
    const getTableData = async (): Promise<void> => {
      state.loading = true
      try {
        const params = {
          ...state.searchParams,
          ...searchVal.value,
        }
        const data = await getReportCenterPage(params);
        dataSource.value = data.records
        state.searchParams.total = data.total
      } catch (error) {
      } finally {
        state.loading = false
      }
    }
    const changePage = async (page: number, pageSize: number): Promise<void> => {
      state.searchParams.pageNumber = page
      state.searchParams.pageSize = pageSize
      await getTableData()
    }
    const route = useRoute()
    const searchVal = ref()
    watch(() => route,async () => {
      if (route.query.searchValue) {
        searchVal.value  = JSON.parse(route.query.searchValue as string)
      }
      await getTableData()
    }, { deep: true, immediate: true })

    const scrollY = ref(500)

    const layoutSlots = {
      'layout-content': () => {
        return (
          <>
            <Table
              dataSource={dataSource.value}
              columns={columns}
              loading={state.loading}
              pagination={false}
              size='middle' scrollX={1000} scrollY={scrollY.value}
            />
          </>
        )
      },
      'footer-page': () => {
        return (
          <div class="footer-content">
            <Page
              v-model:current={state.searchParams.pageNumber}
              v-model:pageSize={state.searchParams.pageSize}
              v-model:total={state.searchParams.total}
              onPageChange={changePage}
            />
            <Button onClick={() => {history.back()}}>返回</Button>
          </div>
        )
      }
    }
    return () =>
      <>
        <Layout title='汇报中心' v-slots={layoutSlots} />
      </>
  }
})
