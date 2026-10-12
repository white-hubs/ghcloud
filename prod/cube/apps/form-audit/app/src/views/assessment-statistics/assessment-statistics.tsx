import { cubeFormAuditService } from '@/api/service'
import { CubeLayout } from '@ghcloud/cube-app-design'
import type { AppraisalPeriodType, Department, FormAppraisalStatisticsPeriodVO } from '@ghcloud/cube-form-audit-service'
import { Button, Card, message, RadioGroup, Select, SelectOption, Space, Spin, Table, Tag } from '@ghcloud/cube-ui'
import { usePageName } from '@ghcloud/cube-utils'
import dayjs from 'dayjs'
import { defineComponent, onMounted, reactive, ref, watch } from 'vue'
import styles from './assessment-statistics.module.less'

const PERIOD_OPTIONS = [
  { label: '月度', value: 'MONTHLY' },
  { label: '季度', value: 'QUARTERLY' },
  { label: '半年度', value: 'HALF_YEAR' },
]

const buildYearOptions = (): { label: string; value: number }[] => {
  const current = dayjs().year()
  const list: { label: string; value: number }[] = []
  for (let y = current; y >= current - 5; y -= 1) {
    list.push({ label: `${y}年`, value: y })
  }
  return list
}

export const AssessmentStatistics = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName()
    const loading = ref(false)
    const deptOptions = ref<{ label: string; value: string }[]>([{ label: '全市场总览', value: '' }])
    const yearOptions = buildYearOptions()
    const syncingLoaing = ref(false)
    const syncingText = ref<string>('生成最新数据')
    const currentPreviewGeneratedAt = ref<number | string>()
    const filters = reactive({
      periodType: 'MONTHLY' as AppraisalPeriodType,
      assessmentYear: dayjs().year(),
      departmentId: '',
    })

    const summary = reactive({
      originTotalScore: undefined as number | undefined,
      finalTotalScore: undefined as number | undefined,
      deductScore: undefined as number | undefined,
    })

    const tableRows = ref<FormAppraisalStatisticsPeriodVO[]>([])

    const loadStatistics = async (): Promise<void> => {
      loading.value = true
      try {
        const res = await cubeFormAuditService.getAppraisalRecordStatistics({
          periodType: filters.periodType,
          assessmentYear: filters.assessmentYear,
          responsibleDepartmentId: filters.departmentId ? filters.departmentId : undefined,
        })
        const s = res.summary
        summary.originTotalScore = s?.originTotalScore
        summary.finalTotalScore = s?.finalTotalScore
        summary.deductScore = s?.deductScore
        tableRows.value = Array.isArray(res.records) ? res.records : []
        currentPreviewGeneratedAt.value = res.currentPreviewGeneratedAt  ? dayjs(res.currentPreviewGeneratedAt).format('YYYY-MM-DD HH:mm:ss') : '--'
      } catch {
        summary.originTotalScore = undefined
        summary.finalTotalScore = undefined
        summary.deductScore = undefined
        tableRows.value = []
      } finally {
        loading.value = false
      }
    }

    const loadDeptOptions = async (): Promise<void> => {
      try {
        const rows = await cubeFormAuditService.getOrganizations({
          pageNumber: 1,
          pageSize: 1000,
          name: '',
          enabled: true,
        })
        const list = Array.isArray(rows) ? rows : []
        const mapped = list.map((item: Department) => ({
          label: item.name,
          value: item.id,
        }))
        deptOptions.value = [{ label: '全市场总览', value: '' }, ...mapped]
      } catch {
        // ApiProxy.errorNotify 已提示
      }
    }

    const openScoringList = (row: FormAppraisalStatisticsPeriodVO): void => {
      const q: Record<string, string> = {
        assessmentYear: String(filters.assessmentYear),
        periodType: filters.periodType,
        assessmentPeriod: String(row.assessmentPeriod ?? ''),
      }
      if (filters.departmentId) {
        q.responsibleDepartmentId = filters.departmentId
      }
      const segments = window.location.pathname.split('/')
      segments[segments.length - 1] = 'assessment-scoring'
      const pathname = segments.join('/').replace(/\/{2,}/g, '/')
      const queryString = Object.keys(q)
        .filter((key) => q[key] !== undefined && q[key] !== null && q[key] !== '')
        .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(q[key])}`)
        .join('&')
      const target = `${pathname}${queryString ? `?${queryString}` : ''}`
      history.pushState({ current: location.pathname + location.search }, '', target)
    }

    const formatScore = (v: unknown): string => {
      if (v === undefined || v === null || Number.isNaN(Number(v))) {
        return '--'
      }
      return String(v)
    }

    const columns = [
      {
        title: '考核周期',
        dataIndex: 'periodLabel',
        ellipsis: true,
        align: 'center' as const,
      },
      {
        title: '周期满分',
        dataIndex: 'originTotalScore',
        align: 'center' as const,
        customRender: ({ text }: { text: unknown }): JSX.Element => <>{formatScore(text)}</>,
      },
      {
        title: '实得分',
        dataIndex: 'finalTotalScore',
        align: 'center' as const,
        customRender: ({ text }: { text: unknown }): JSX.Element => <>{formatScore(text)}</>,
      },
      {
        title: '周期扣分',
        dataIndex: 'deductScore',
        align: 'center' as const,
        customRender: ({ text }: { text: unknown }): JSX.Element => {
          const n = Number(text)
          if (text === undefined || text === null || Number.isNaN(n)) {
            return <>--</>
          }
          const display = n > 0 ? `-${n}` : String(n)
          return <Tag color={n > 0 ? 'error' : undefined}>{display}</Tag>
        },
      },
      {
        title: '操作',
        key: 'action',
        width: 140,
        align: 'center' as const,
        customRender: ({ record }: { record: FormAppraisalStatisticsPeriodVO }): JSX.Element => (
          <Button type='link' size='small' onClick={() => openScoringList(record)}>
            查看明细
          </Button>
        ),
      },
    ]

    const handleQuery = (): void => {
      void loadStatistics()
    }

    // 生成最新数据
    const handlelatestData = async (): Promise<void> => {
      if (syncingLoaing.value) {
        return
      }
      syncingLoaing.value = true
      syncingText.value = '生成中...'
      message.info('正在生成最新数据...请稍后刷新查看')
      try {
        const generated = await cubeFormAuditService.generateAppraisalRecordPreview()
        if (generated) {
          message.success('最新数据生成成功，正在刷新列表')
          handleQuery()
        } else {
          message.warning('最新数据生成未完成，请稍后重试')
        }
      } catch {
        message.warning('最新数据仍在生成中，请稍后刷新查看')
      } finally {
        syncingLoaing.value = false
        syncingText.value = '生成最新数据'
      }
    }

    const handleReset = (): void => {
      filters.periodType = 'MONTHLY'
      filters.assessmentYear = dayjs().year()
      filters.departmentId = ''
    }

    watch(
      () => [filters.periodType, filters.assessmentYear, filters.departmentId] as const,
      () => {
        void loadStatistics()
      },
    )

    onMounted(async () => {
      await loadDeptOptions()
      await loadStatistics()
    })

    const labelStyle: Record<string, string> = {
      display: 'inline-block',
      minWidth: '72px',
      marginRight: '8px',
      textAlign: 'right',
      color: 'rgba(0, 0, 0, 0.85)',
    }

    const slots = {
      'layout-content': (): JSX.Element => (
        <div
          style={{
            flex: 1,
            minHeight: 0,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <div class={styles['spin-loading']}>
            <Spin spinning={loading.value}>
            <div
              style={{
                height: '100%',
                flex: 1,
                minHeight: 0,
                width: '100%',
                minWidth: 0,
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
              }}
            >
            <div
              style={{
                flexShrink: 0,
                padding: '16px 0 0',
                margin: '0 0 16px',
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                gap: 16,
                flexWrap: 'wrap',
                boxSizing: 'border-box',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flex: 1,
                  minWidth: 0,
                  alignItems: 'center',
                  gap: 24,
                  flexWrap: 'nowrap',
                  overflowX: 'auto',
                }}
              >
                <Space style={{ flexShrink: 0 }}>
                  <span style={labelStyle}>部门视角</span>
                  <Select
                    v-model:value={filters.departmentId}
                    allowClear
                    placeholder='请选择'
                    style={{ minWidth: 200 }}
                    options={deptOptions.value}
                  />
                </Space>
                <Space style={{ flexShrink: 0 }}>
                  <span style={labelStyle}>年份</span>
                  <Select v-model:value={filters.assessmentYear} style={{ minWidth: 120 }}>
                    {yearOptions.map((o) => (
                      <SelectOption key={o.value} value={o.value}>
                        {o.label}
                      </SelectOption>
                    ))}
                  </Select>
                </Space>
                <Space style={{ flexShrink: 0 }}>
                  <span style={labelStyle}>统计粒度</span>
                  <RadioGroup
                    optionType='button'
                    buttonStyle='solid'
                    options={PERIOD_OPTIONS}
                    value={filters.periodType}
                    onUpdate:value={(v: string) => {
                      filters.periodType = v as AppraisalPeriodType
                    }}
                  />
                </Space>
              </div>
              <Space style={{ flexShrink: 0, marginLeft: 'auto' }}>
                <span style={{marginRight: '16px'}}>上次生成时间：{currentPreviewGeneratedAt.value}</span>
                <Button type='primary' loading={syncingLoaing.value} onClick={handlelatestData}>
                  {syncingText.value}
                </Button>
                <Button type='primary' onClick={handleQuery}>
                  查询
                </Button>
                <Button onClick={handleReset}>重置</Button>
              </Space>
            </div>
            <div
              style={{
                flexShrink: 0,
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 160px), 1fr))',
                columnGap: '24px',
                rowGap: '16px',
                width: '100%',
                maxWidth: '100%',
                marginBottom: '16px',
                boxSizing: 'border-box',
              }}
            >
              <div style={{ minWidth: 0 }}>
                <Card size='small' title='周期总满分'>
                  <div style={{ fontSize: 20, fontWeight: 600 }}>{formatScore(summary.originTotalScore)}</div>
                </Card>
              </div>
              <div style={{ minWidth: 0 }}>
                <Card size='small' title='总实得分'>
                  <div style={{ fontSize: 20, fontWeight: 600 }}>{formatScore(summary.finalTotalScore)}</div>
                </Card>
              </div>
              <div style={{ minWidth: 0 }}>
                <Card size='small' title='总扣分'>
                  <div style={{ fontSize: 20, fontWeight: 600 }}>{formatScore(summary.deductScore)}</div>
                </Card>
              </div>
            </div>
            <div style={{ flex: 1, minHeight: 0, overflow: 'auto', width: '100%' }}>
              <Table
                rowKey={(r: FormAppraisalStatisticsPeriodVO): string =>
                  `${r.assessmentYear ?? ''}-${r.periodType ?? ''}-${r.assessmentPeriod ?? ''}`
                }
                columns={columns}
                dataSource={tableRows.value}
                pagination={false}
              />
            </div>
          </div>
            </Spin>
          </div>
        </div>
      ),
      'footer-page': (): JSX.Element => (
        <div style={{ color: '#999', fontSize: 12, textAlign: 'right', width: '100%', lineHeight: '20px' }}>
          点击「查看明细」进入考核评分列表；记录明细与扣分说明请在考核评分中查看。
        </div>
      ),
    }

    return (): JSX.Element => <CubeLayout title={pageTitle ?? '考核统计'} v-slots={slots} />
  },
})
