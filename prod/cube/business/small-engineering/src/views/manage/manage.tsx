import { Button, DateRangePicker, Form, FormItem, Input, message, Page, PopOver, Skeleton, Space, type ColumnType } from '@ghcloud/cube-ui'
import { Layout, AliasTable } from '@ghcloud/generic-component'
import { computed, defineComponent, onMounted, reactive, ref } from 'vue'
import styles from './manage.module.less'
import { cubeSmallEngineeringService } from '@/api/server'
import { tableExportExcel, usePageName } from '@ghcloud/cube-utils'
import dayjs from 'dayjs'
import { appFunctionCodes } from '@/permission/index'
import { hasPermission } from '@ghcloud/cube-permission-codes'
enum QueryScoped {
  ALL = 'ALL',
  /** 请示中 */
  APPLYING = 'APPLYING',
  /** 签约中 */
  SIGNING = 'SIGNING',
  /** 进行中 */
  UNDERWAY = 'UNDERWAY',
  /** 已完成 */
  COMPLETED = 'COMPLETED',
  /** 待验收 */
  WAIT_ACCEPT = 'WAIT_ACCEPT'
}

export const Manage = defineComponent({
  setup () {
    const { pageTitle } = usePageName()
    const loading = ref(false)
    const countLoading = ref(false)
    const excelLoading = ref(false)
    const permission = appFunctionCodes.projectManage

    const tableScroll = ref({
      scrollY: 500
    })
    const statistics = reactive({
      total: 0,
      apply: 0,
      signing: 0,
      underway: 0,
      completed: 0,
      waitAccept: 0
    })
    const formState = reactive({
      period: ['', ''],
      keyword: '',
      queryScoped: QueryScoped.ALL
    })
    const pagination = ref({
      pageSize: 10,
      pageNumber: 1,
      total: 0,
    })
    const dataSource = ref<Record<string, string | number>[]>([])
    function getFlowStatusText (text: string): string {
      const result: Record<string, string> = {
        PASS: '通过',
        FINISHED: '完成',
        ACTIVE: '处理中',
        REJECT: '拒绝',
        UNDO: '撤销'
      }
      return result[text] ?? '--'
    }

    function statusText (status: QueryScoped): string {
      switch (status) {
        case QueryScoped.ALL:
          return ''
        case QueryScoped.APPLYING:
          return '请示中'
        case QueryScoped.SIGNING:
          return '签约中'
        case QueryScoped.UNDERWAY:
          return '进行中'
        case QueryScoped.WAIT_ACCEPT:
          return '待验收'
        case QueryScoped.COMPLETED:
          return '已完成'
        default:
          return '--'
      }
    }
    const columns = computed(() => {
      let res: ColumnType[] = []
      const columnsUnderway: ColumnType[] = [
        {
          title: '编号',
          dataIndex: 'projectNum',
          ellipsis: true,
          customRender: ({ text }: { text: string; }): JSX.Element => {
            return <PopOver content={text || '--'}>{text || '--'}</PopOver>
          }
        },
        {
          title: '小散工程名称',
          dataIndex: 'projectName',
          ellipsis: true,
          customRender: ({ text }: { text: string; }): JSX.Element => {
            return <PopOver content={text || '--'}>{text || '--'}</PopOver>
          }
        },
        {
          title: '乙方',
          dataIndex: 'partyB',
          ellipsis: true,
          customRender: ({ text }: { text: string; }): JSX.Element => {
            return <PopOver content={text || '--'}>{text || '--'}</PopOver>
          }
        },
        {
          title: '完成时限',
          dataIndex: 'completionTime',
          ellipsis: true,
          customRender: ({ text }: { text: string; }): JSX.Element => {
            const time = text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '--'
            return <PopOver content={time}>{time}</PopOver>
          }
        },
        {
          title: '监管部门',
          dataIndex: 'depName',
          ellipsis: true,
          customRender: ({ text }: { text: string; }): JSX.Element => {
            return <PopOver content={text || '--'}>{text || '--'}</PopOver>
          }
        },
        {
          title: '监管负责人',
          dataIndex: 'superviseUserName',
          ellipsis: true,
          customRender: ({ text }: { text: string; }): JSX.Element => {
            return <PopOver content={text || '--'}>{text || '--'}</PopOver>
          }
        },
        {
          title: '完成进度情况',
          dataIndex: 'schedule',
          ellipsis: true,
          customRender: ({ text }: { text: string; }): JSX.Element => {
            const schedule = (text ?? 0) + '%'
            return <PopOver content={schedule}>{schedule}</PopOver>
          }
        }
      ]
      const columnsApplying: ColumnType[] = [
        {
          title: '编号',
          dataIndex: 'applyNum',
          ellipsis: true,
          customRender: ({ text }: { text: string; }): JSX.Element => {
            return <PopOver content={text || '--'}>{text || '--'}</PopOver>
          }
        },
        {
          title: '申请名称',
          dataIndex: 'instanceName',
          ellipsis: true,
          customRender: ({ text }: { text: string; }): JSX.Element => {
            return <PopOver content={text || '--'}>{text || '--'}</PopOver>
          }
        },
        {
          title: '小散工程名称',
          dataIndex: 'projectName',
          ellipsis: true,
          customRender: ({ text }: { text: string; }): JSX.Element => {
            return <PopOver content={text || '--'}>{text || '--'}</PopOver>
          }
        },
        {
          title: '发起人',
          dataIndex: 'startUserName',
          ellipsis: true,
          customRender: ({ text }: { text: string; }): JSX.Element => {
            return <PopOver content={text || '--'}>{text || '--'}</PopOver>
          }
        },
        {
          title: '发起部门',
          dataIndex: 'organizationName',
          ellipsis: true,
          customRender: ({ record }: { record: { startUserInfo: { organizationName: string; }; }; }): JSX.Element => {
            return <PopOver content={record.startUserInfo.organizationName || '--'}>{record.startUserInfo.organizationName || '--'}</PopOver>
          }
        },
        {
          title: '发起时间',
          dataIndex: 'createTime',
          ellipsis: true,
          customRender: ({ text }: { text: string; }): JSX.Element => {
            const time = text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '--'
            return <PopOver content={time}>{time}</PopOver>
          }
        },
        {
          title: '处理状态',
          dataIndex: 'status',
          ellipsis: true,
          customRender: ({ text }: { text: string; }): JSX.Element => {
            return <PopOver content={getFlowStatusText(text)}>{getFlowStatusText(text)}</PopOver>
          }
        },
        {
          title: '处理进度',
          dataIndex: 'activeNodeName',
          ellipsis: true,
          customRender: ({ text }: { text: string; }): JSX.Element => {
            return <PopOver content={text || '--'}>{text || '--'}</PopOver>
          }
        }
      ]
      if (formState.queryScoped === QueryScoped.ALL) {
        res = [
          {
            title: '编号',
            dataIndex: 'projectNum',
            ellipsis: true,
            customRender: ({ text }: { text: string; }): JSX.Element => {
              return <PopOver content={text || '--'}>{text || '--'}</PopOver>
            }
          },
          {
            title: '小散工程名称',
            dataIndex: 'projectName',
            ellipsis: true,
            customRender: ({ text }: { text: string; }): JSX.Element => {
              return <PopOver content={text || '--'}>{text || '--'}</PopOver>
            }
          },
          {
            title: '工程时间',
            dataIndex: 'completionTime',
            ellipsis: true,
            customRender: ({ text }: { text: string; }): JSX.Element => {
              const time = text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '--'
              return <PopOver content={time}>{time}</PopOver>
            }
          },
          {
            title: '施工方',
            dataIndex: 'partyB',
            ellipsis: true,
            customRender: ({ text }: { text: string; }): JSX.Element => {
              return <PopOver content={text || '--'}>{text || '--'}</PopOver>
            }
          },
          {
            title: '工程阶段',
            dataIndex: 'status',
            ellipsis: true,
            customRender: ({ text }: { text: QueryScoped; }): JSX.Element => {
              const res = statusText(text)
              return <PopOver content={res}>{res}</PopOver>
            }
          }
        ]
      } else if (formState.queryScoped === QueryScoped.APPLYING) {
        res = columnsApplying
      } else if (formState.queryScoped === QueryScoped.SIGNING) {
        res = columnsApplying
        res.splice(3, 0, {
          title: '乙方',
          dataIndex: 'partyB',
          ellipsis: true,
          customRender: ({ text }: { text: string; }) => {
            return <PopOver content={text || '--'}>{text || '--'}</PopOver>
          }
        })
      } else if (formState.queryScoped === QueryScoped.UNDERWAY) {
        res = columnsUnderway
      } else if (formState.queryScoped === QueryScoped.WAIT_ACCEPT) {
        res = [...columnsUnderway, {
          title: '验收人',
          dataIndex: 'acceptanceUserName',
          ellipsis: true,
          customRender: ({ text }: { text: string; }): JSX.Element => {
            return <PopOver content={text || '--'}>{text || '--'}</PopOver>
          }
        }]
      } else if (formState.queryScoped === QueryScoped.COMPLETED) {
        res = [...columnsUnderway, {
          title: '验收人',
          dataIndex: 'acceptanceUserName',
          ellipsis: true,
          customRender: ({ text }: { text: string; }): JSX.Element=> {
            return <PopOver content={text || '--'}>{text || '--'}</PopOver>
          }
        },
        {
          title: '验收时间',
          dataIndex: 'acceptanceTime',
          ellipsis: true,
          customRender: ({ text }: { text: string; }): JSX.Element => {
            const time = text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '--'
            return <PopOver content={time}>{time}</PopOver>
          }
        },
        {
          title: '验收结果',
          dataIndex: 'acceptanceResult',
          ellipsis: true,
          customRender: ({ text }: { text: string; }): JSX.Element => {
            const acceptanceResult = text === 'QUALIFIED' ? '合格' : '不合格'
            return <PopOver content={acceptanceResult}>{acceptanceResult}</PopOver>
          }
        }]
      }

      res.push({
        title: '操作',
        align: 'center',
        dataIndex: 'action',
        width: 100,
        ellipsis: true,
        customRender: ({ record }: { record: Record<string, string>; }) => {
          return (
            <Button
              type='link' size='small' onClick={() => {
                if (formState.queryScoped === QueryScoped.ALL) {
                  history.pushState({}, '', `/portal/small-engineering/manage-detail?id=${record.id}`)
                } else if ([QueryScoped.APPLYING, QueryScoped.SIGNING].includes(formState.queryScoped)) {
                  history.pushState({}, '', `/portal/stream-engine-render/index?businessType=PROJECT_SIGN_CONTRACT&appName=small-engineering&processInstanceId=${record.processInstanceId}&currentTaskId=&status=ACTIVE&type=detail&title=工程审批`)
                } else {
                  history.pushState({}, '', `/portal/small-engineering/edit-supervise?id=${record.id}`)
                }
              }}
            >详情
            </Button>
          )
        }
      })
      return res
    })
    const submitTime = computed(() => {
      if (formState.period && formState.period[0] && formState.period[1]) {
        return `${formState.period[0] + ' 00:00:00'},${formState.period[1] + ' 23:59:59'}`
      }
      return undefined
    })
    async function getCount (): Promise<void> {
      try {
        countLoading.value = true
        const res = await cubeSmallEngineeringService.projectStatistics({
          keyword: formState.keyword || undefined,
          period: submitTime.value
        })
        statistics.total = res.total ?? 0
        statistics.apply = res.apply ?? 0
        statistics.signing = res.signing ?? 0
        statistics.underway = res.underway ?? 0
        statistics.waitAccept = res.waitAccept ?? 0
        statistics.completed = res.completed ?? 0
      } finally {
        setTimeout(() => {
          countLoading.value = false
        }, 1000)
      }
    }
    async function getData (queryCount = true): Promise<void> {
      queryCount && getCount()

      try {
        loading.value = true
        if (formState.queryScoped === QueryScoped.ALL) {
          const res = await cubeSmallEngineeringService.getProjectNodeList({
            pageNumber: pagination.value.pageNumber,
            pageSize: pagination.value.pageSize,
            keyword: formState.keyword || undefined,
            period: submitTime.value
          })
          dataSource.value = res.records as unknown as Record<string, string | number>[]
          pagination.value.total = res.total
        } else if ([QueryScoped.UNDERWAY, QueryScoped.WAIT_ACCEPT, QueryScoped.COMPLETED].includes(formState.queryScoped)) {
          const res = await cubeSmallEngineeringService.projectScheduleList({
            pageNumber: pagination.value.pageNumber,
            pageSize: pagination.value.pageSize,
            status: formState.queryScoped,
            keyword: formState.keyword || undefined,
            period: submitTime.value
          })
          dataSource.value = res.records as unknown as Record<string, string | number>[]
          pagination.value.total = res.total
        } else {
          const res = await cubeSmallEngineeringService.getProjectApplyList({
            pageNumber: pagination.value.pageNumber,
            pageSize: pagination.value.pageSize,
            status: 'ACTIVE',
            businessType: formState.queryScoped === QueryScoped.APPLYING ? 'PROJECT_APPLY' : 'PROJECT_SIGN_CONTRACT',
            keyword: formState.keyword || undefined,
            submitTime: submitTime.value
          })
          dataSource.value = res.records as unknown as Record<string, string | number>[]
          pagination.value.total = res.total
        }
      } catch {
        message.error('获取列表数据失败')
      } finally {
        loading.value = false
      }
    }

    function changeQueryScoped (scoped: QueryScoped): void {
      formState.queryScoped = scoped
      getData(false)
    }

    function pageChange (pageNumber: number, pageSize: number): void {
      pagination.value.pageNumber = pageNumber || 1
      pagination.value.pageSize = pageSize
      getData()
    }

    async function downloadExcel (): Promise<void> {
      try {
        excelLoading.value = true
        const pageNumber = 1
        let firstPage
        if (formState.queryScoped === QueryScoped.ALL) {
          firstPage = await cubeSmallEngineeringService.getProjectNodeList({
            pageSize: 100,
            pageNumber,
            keyword: formState.keyword || undefined,
            period: submitTime.value
          })
        } else if ([QueryScoped.APPLYING, QueryScoped.SIGNING].includes(formState.queryScoped)) {
          firstPage = await cubeSmallEngineeringService.getProjectApplyList({
            pageSize: 100,
            pageNumber,
            status: 'ACTIVE',
            businessType: formState.queryScoped === QueryScoped.APPLYING ? 'PROJECT_APPLY' : 'PROJECT_SIGN_CONTRACT',
            keyword: formState.keyword || undefined,
            submitTime: submitTime.value
          })
        } else {
          firstPage = await cubeSmallEngineeringService.projectScheduleList({
            pageSize: 100,
            pageNumber,
            status: formState.queryScoped,
            keyword: formState.keyword || undefined,
            period: submitTime.value
          })
        }
        const dataList: Record<number, Record<string, string | number>[]> = {
          1: firstPage.records as unknown as Record<string, string | number>[]
        }
        if (firstPage.pages > 1) {
          const task = []
          for (let i = 2; i <= firstPage.pages; i++) {
            if (formState.queryScoped === QueryScoped.ALL) {
              task.push(
                cubeSmallEngineeringService.getProjectNodeList({
                  pageSize: 100,
                  pageNumber: i,
                  keyword: formState.keyword || undefined,
                  period: submitTime.value
                }).then(res => {
                  dataList[i] = res.records as unknown as Record<string, string | number>[]
                })
              )
            } else if ([QueryScoped.APPLYING, QueryScoped.SIGNING].includes(formState.queryScoped)) {
              task.push(
                cubeSmallEngineeringService.getProjectApplyList({
                  pageSize: 100,
                  pageNumber: i,
                  status: 'ACTIVE',
                  businessType: formState.queryScoped === QueryScoped.APPLYING ? 'PROJECT_APPLY' : 'PROJECT_SIGN_CONTRACT',
                  keyword: formState.keyword || undefined,
                  submitTime: submitTime.value
                }).then(res => {
                  dataList[i] = res.records as unknown as Record<string, string | number>[]
                })
              )
            } else {
              task.push(
                cubeSmallEngineeringService.projectScheduleList({
                  pageSize: 100,
                  pageNumber: i,
                  status: formState.queryScoped,
                  keyword: formState.keyword || undefined,
                  period: submitTime.value
                }).then(res => {
                  dataList[i] = res.records as unknown as Record<string, string | number>[]
                })
              )
            }
          }
          await Promise.all(task)
        }
        const excelColumns = columns.value.map(e => {
          return {
            header: e.title as string,
            key: e.dataIndex as string
          }
        })
        const excelRows = []
        for (let i = 1; i <= firstPage.pages; i++) {
          excelRows.push(...dataList[i].map(e => {
            if (formState.queryScoped === QueryScoped.ALL) {
              return {
                ...e,
                completionTime: e.completionTime ? dayjs(e.completionTime).format('YYYY-MM-DD HH:mm:ss') : '--',
                status: statusText(e.status as QueryScoped)
              }
            } else if ([QueryScoped.UNDERWAY, QueryScoped.WAIT_ACCEPT, QueryScoped.COMPLETED].includes(formState.queryScoped)) {
              return {
                ...e,
                completionTime: e.completionTime ? dayjs(e.completionTime).format('YYYY-MM-DD HH:mm:ss') : '--',
                schedule: (e.schedule ?? 0) + '%',
                superviseUserName: e.superviseUserName || '--',
                acceptanceResult: e.acceptanceResult === 'QUALIFIED' ? '合格' : '不合格',
                acceptanceTime: e.acceptanceTime ? dayjs(e.acceptanceTime).format('YYYY-MM-DD HH:mm:ss') : '--',
              }
            } else {
              return {
                ...e,
                createTime: e.createTime ? dayjs(e.createTime).format('YYYY-MM-DD HH:mm:ss') : '--',
                startUserName: e.startUserName || '--',
                status: getFlowStatusText(e.status as string),
                organizationName: e.startUserInfo ? ((e.startUserInfo as unknown as { organizationName: string; }).organizationName || '--') : '--'
              }
            }
          }))
        }
        if (excelRows.length === 0) {
          message.warning('当前检索条件下暂无数据')
          return
        }
        await tableExportExcel({
          fileName: `小散工程${statusText(formState.queryScoped)}`,
          columns: excelColumns.slice(0, excelColumns.length - 1),
          dataSource: excelRows
        })
      } catch (error) {

        message.error('导出失败')
      } finally {
        setTimeout(() => {
          excelLoading.value = false
        }, 1000)
      }
    }
    const DataPanel = (): JSX.Element => {
      return (
        <>
          <div class={`${styles['data-item']} ${styles['data-item-first']}`} onClick={() => {
            changeQueryScoped(QueryScoped.ALL)
          }}>
            <span class={styles.title}>小散工程</span>
            <span class={styles.value}>{statistics.total}</span>
          </div>
          <div class={styles['data-item']} onClick={() => {
            changeQueryScoped(QueryScoped.APPLYING)
          }}>
            <span class={styles.title}>请示</span>
            <span class={styles.value}>{statistics.apply}</span>
          </div>
          <div class={styles['data-item']} onClick={() => {
            changeQueryScoped(QueryScoped.SIGNING)
          }}>
            <span class={styles.title}>签约</span>
            <span class={styles.value}>{statistics.signing}</span>
          </div>
          <div class={styles['data-item']} onClick={() => {
            changeQueryScoped(QueryScoped.UNDERWAY)
          }}>
            <span class={styles.title}>进行中</span>
            <span class={styles.value}>{statistics.underway}</span>
          </div>
          <div class={styles['data-item']} onClick={() => {
            changeQueryScoped(QueryScoped.WAIT_ACCEPT)
          }}>
            <span class={styles.title}>待验收</span>
            <span class={styles.value}>{statistics.waitAccept}</span>
          </div>
          <div class={styles['data-item']} onClick={() => {
            changeQueryScoped(QueryScoped.COMPLETED)
          }}>
            <span class={styles.title}>已完成</span>
            <span class={styles.value}>{statistics.completed}</span>
          </div>
        </>
      )
    }

    function reset (): void {
      pagination.value.pageNumber = 1
      formState.keyword = ''
      formState.period = ['', '']
      getData()
    }
    const layoutSlots = {
      'layout-header': (): JSX.Element => {
        return <>{hasPermission(permission.download)&&<Button type='primary' onClick={downloadExcel} loading={excelLoading.value}>导出</Button>}</>
      },
      'layout-content': (): JSX.Element => {
        return (
          <>
            <div class={styles['data-panel']}>
              <div class={styles['data-items']}>
                {countLoading.value ? <Skeleton paragraph={{ rows: 1 }} active /> : <DataPanel />}
              </div>
              <Form layout='inline' style={{ maxWidth: '60%', display: 'flex', flexFlow: 'nowrap' }}>
                <FormItem style='max-width:45%'>
                  <DateRangePicker v-model:value={formState.period} />
                </FormItem>
                <FormItem>
                  <Input v-model:value={formState.keyword} placeholder='请输入工程名称、负责人、施工方' style='width:270px' showCount={false} />
                </FormItem>
                <FormItem style='max-width:20%'>
                  <Space>
                    <Button type='primary' onClick={getData}>查询</Button>
                    <Button onClick={reset}>重置</Button>
                  </Space>
                </FormItem>
              </Form>
            </div>
            <AliasTable
              columns={columns.value}
              loading={loading.value}
              tableCode='MANAGE'
              applicationCode='SMALLENFINEERING'
              dataSource={dataSource.value}
              pagination={false}
              scrollY={tableScroll.value.scrollY}
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

    onMounted(async () => {
      const layoutDom = document.querySelector('.small-engineering')
      if (layoutDom) {
        tableScroll.value.scrollY = layoutDom.clientHeight - 150
      }
      getData()
    })

    return (): JSX.Element => <Layout title={pageTitle} class='small-engineering' v-slots={layoutSlots} />
  }
})
