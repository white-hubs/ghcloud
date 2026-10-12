import { defineComponent, onMounted, reactive, computed } from 'vue'
import { Layout } from '@/components/layout/layout'
import { queryParameter, usePageName } from '@ghcloud/cube-utils'
import { Button, Form, FormItem, message, PopOver, Page, Select, RadioButton, DateRangePicker } from '@ghcloud/cube-ui'
import { AliasTable } from '@ghcloud/generic-component'
import RadioGroup from '@ghcloud/cube-ui/src/components/radio-group/radio-group'
import { cubeMaintainService } from "../../api/service"
import type { FaultListType } from '@ghcloud/cube-maintain-service'
import dayjs from 'dayjs'

interface RepairData {
  dataSource: FaultListType[];
  loading: boolean;
  searchState: {
    status?: string | null;
    submitTime: string[];
    type: string;
  };
  page: {
    pageSize: number;
    pageNumber: number;
    total: number;
  };
}

export const RepairList = defineComponent({
  setup () {
    const { pageTitle } = usePageName()
    // const flowCode = "OUTSOURCE_REPAIR"
    const flowCode = JSON.parse(sessionStorage.getItem('GH-currentApplication') ?? '').code

    const state = reactive<RepairData>({
      dataSource: [],
      loading: false,
      searchState: {
        submitTime: [],
        type: "ALL",
        status: null
      },
      page: {
        pageSize: 10,
        pageNumber: 1,
        total: 0
      }
    })

    const options = [
      { value: "ACTIVE", label: "处理中" },
      { value: "REJECT", label: "驳回" },
      { value: "UNDO", label: "撤销" },
      { value: "FINISHED", label: "完成" },
    ]

    const supportFilterStatus = ["ALL", "SUBMIT", "SERVED"]
    const supportedFilter = computed(() => supportFilterStatus.includes(state.searchState.type))

    onMounted(() => {
      Object.assign(state.searchState, queryParameter.getQuery())
      getTableList()
    })

    const getTableList = async (): Promise<void> => {
      try {
        state.loading = true
        const result = await cubeMaintainService.repairApplyPersonal({
          ...state.searchState,
          submitTime: state.searchState.submitTime ? state.searchState.submitTime.join(',') : '',
          businessType: flowCode,
          pageNumber: state.page.pageNumber,
          pageSize: state.page.pageSize
        })
        state.dataSource = result.records
        state.page.total = result.total
      } catch {
        message.error('查询失败')
      } finally {
        state.loading = false
      }
    }

    const pageChange = (page: number, pageSize: number): void => {
      state.page.pageNumber = page
      state.page.pageSize = pageSize
      getTableList()
    }

    const handleSearch = (): void => {
      state.page.pageNumber = 1
      getTableList()
    }

    const handleReset = (): void => {
      state.searchState.type = "ALL"
      state.searchState.submitTime = []
      state.searchState.status = null
      getTableList()
      queryParameter.setAddressQuery({
        ...state.searchState
      })
    }

    const goDetail = (row: FaultListType): void => {
      const { processInstanceId, currentTaskId, status } = row
      const target = `/portal/stream-engine-render/index?businessType=${flowCode}&processInstanceId=${processInstanceId}&currentTaskId=${currentTaskId}&status=${status}&type=detail&title=委外维修单`
      history.pushState(history.state, '', target)
    }

    const addFlow = (): void => {
      history.pushState({}, '', `/portal/stream-engine-render/index?businessType=${flowCode}&appName=OUTSOURCE_REPAIR&type=add&title=委外维修单`)
    }

    const copyLink = (row: FaultListType): void => {
      const { processInstanceId } = row
      const baseUrl = `${window.location.origin}/streamengineH5/dynamic-table`
      const token = JSON.parse(sessionStorage.getItem("GH-Token") || '{}').access_token
      const tenant = JSON.parse(sessionStorage.getItem("GH-NowEnterprise") || '{}').code
      const url = `${baseUrl}?processId=${processInstanceId}&processType=HANDLING&access_token=${token}&tenant=${tenant}`

      const input = document.createElement('input')
      input.value = url
      document.body.appendChild(input)
      input.select()
      document.execCommand('Copy')
      document.body.removeChild(input)
      message.success('链接已复制到剪贴板')
    }

    const handleTypeChange = (value: string): void => {
      state.searchState.type = value
      getTableList()
      queryParameter.setAddressQuery({
        ...state.searchState
      })
    }

    const changePicker = (data: string[]): void => {
      state.searchState.submitTime = data
      getTableList()
    }

    const statusText = (str: string): string => {
      const statusMap = new Map([
        ["SUBMIT", "提交"],
        ["UNDO", "撤销"],
        ["REPEAT", "重新提交"],
        ["APPROVAL", "审批"],
        ["BACK", "撤回"],
        ["COPY", "抄送"],
        ["REJECT", "驳回"],
        ["FINISHED", "完成"],
      ])
      return statusMap.get(str) || "处理中"
    }

    const columns = [
      {
        title: "编号",
        dataIndex: "code",
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return (
            <PopOver content={text || ""}>
              {text || "--"}
            </PopOver>
          )
        },
      },
      {
        dataIndex: "instanceName",
        title: "表单名称",
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return (
            <PopOver content={text || ""}>
              {text || "--"}
            </PopOver>
          )
        },
      },
      {
        dataIndex: "objName",
        title: "委外对象",
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return (
            <PopOver content={text || ""}>
              {text || "--"}
            </PopOver>
          )
        },
      },
      {
        title: "发起时间",
        dataIndex: "submitedTime",
        key: "submitedTime",
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return (
            <PopOver content={text || ''}>
              {text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '-'}
            </PopOver>
          )
        },
      },
      {
        title: "发起人",
        dataIndex: "startUserName",
        key: "startUserName",
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return (
            <PopOver content={text || ""}>
              {text || "--"}
            </PopOver>
          )
        },
      },
      {
        title: "处理状态",
        dataIndex: "status",
        key: "status",
        customRender: ({ text }: { text: string; }): JSX.Element => {
          const res = text ? statusText(text) : "-"
          return (
            <PopOver content={res}>
              {res}
            </PopOver>
          )
        },
      },
      {
        title: "处理进度",
        dataIndex: "activeNodeName",
        key: "activeNodeName",
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return (
            <PopOver content={text || ""}>
              {text || "--"}
            </PopOver>
          )
        },
      },
      {
        title: "处理结果",
        dataIndex: "handleResult",
        key: "handleResult",
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return (
            <PopOver content={text || ""}>
              {text || "--"}
            </PopOver>
          )
        },
      },
      {
        title: "操作",
        dataIndex: "action",
        customRender: ({ record }: { record: FaultListType; }): JSX.Element => {
          const btn = [
            <Button
              style={{ padding: '4px' }}
              type="link"
              onClick={() => goDetail(record)}
            >
              详情
            </Button>
          ]

          if (record.activeNodeAssignee === "381496") {
            btn.push(
              <Button
                style={{ padding: '4px' }}
                type="link"
                onClick={() => copyLink(record)}
              >
                生成审批链接
              </Button>
            )
          }

          return <div>{btn}</div>
        },
      },
    ]

    const layoutSlots = {
      'layout-header': (): JSX.Element => {
        return (
          <Button type="primary" onClick={addFlow}>新增</Button>
        )
      },
      'layout-content': (): JSX.Element => {
        return (
          <div>
            <Form layout="inline" style={{ margin: '10px 0 0 0' }}>
              <FormItem style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }}>
                <RadioGroup
                  v-model:value={state.searchState.type}
                  style="margin-right: 10px"
                  onChange={handleTypeChange}
                  button-style="solid"
                >
                  <RadioButton value="ALL">全部</RadioButton>
                  <RadioButton value="WAITING">待我处理</RadioButton>
                  <RadioButton value="SUBMIT">我发起的</RadioButton>
                  <RadioButton value="SERVED">抄送给我</RadioButton>
                  <RadioButton value="PROCESSED">已处理</RadioButton>
                </RadioGroup>
              </FormItem>
              <FormItem
                style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }}
                label="状态"
                v-show={supportedFilter.value}
              >
                <Select
                  v-model:value={state.searchState.status}
                  allowClear
                  placeholder="请选择"
                  style="width: 180px"
                  options={options}
                />
              </FormItem>
              <FormItem style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }}>
                <DateRangePicker
                  showTime
                  onChangePicker={changePicker}
                  v-model:value={state.searchState.submitTime}
                />
              </FormItem>
              <FormItem style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }}>
                <Button type="primary" onClick={handleSearch}>查询</Button>
                <Button style={{ marginLeft: '10px' }} onClick={handleReset}>重置</Button>
              </FormItem>
            </Form>
            <AliasTable
              rowKey="id"
              dataSource={state.dataSource}
              columns={columns}
              loading={state.loading}
              applicationCode="OUTSOURCE_REPAIR"
              tableCode="PROBLEMS_LIST"
            />
          </div>
        )
      },
      'footer-page': (): JSX.Element => {
        return (
          <Page
            v-show={state.page.total > 0}
            v-model:current={state.page.pageNumber}
            v-model:pageSize={state.page.pageSize}
            v-model:total={state.page.total}
            onPageChange={pageChange}
          />
        )
      }
    }

    return (): JSX.Element => (
      <Layout v-slots={layoutSlots} title={pageTitle} />
    )
  }
})