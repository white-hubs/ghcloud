import { cubeFormAuditService } from '@/api/service'
import type { AppraisalPeriodType, FormAppraisalRulePageVO } from '@ghcloud/cube-form-audit-service'
import { CubeLayout, DeptSelect, useCubeForm, useCubeTable } from '@ghcloud/cube-app-design'
import { Button, message, Page, PopConfirm, PopOver, Switch } from '@ghcloud/cube-ui'
import { usePageName } from '@ghcloud/cube-utils'
import { defineComponent, reactive } from 'vue'
import { useRoute } from 'vue-router'
import { appraisalPeriodTypeOptions, getAppraisalPeriodTypeLabel } from './assessment-rule-enums'
import styles from './assessment-rules.module.less'

/** 考核规则 */
export const AssessmentRules = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName()
    const route = useRoute()
    const tableCode = route.path.replaceAll('/', '')

    const page = reactive({
      pageNumber: 1,
      pageSize: 10,
      total: 0,
    })

    const searchFormSchema = [
      {
        component: 'Input',
        label: '规则名称',
        fieldName: 'ruleName',
        componentProps: {
          placeholder: '请输入规则名称',
          allowClear: true,
        },
      },
      {
        component: 'Select',
        label: '考核周期',
        fieldName: 'periodType',
        componentProps: {
          allowClear: true,
          placeholder: '全部',
          options: appraisalPeriodTypeOptions,
        },
      },
      {
        component: DeptSelect,
        label: '责任部门',
        fieldName: 'responsibleDepartmentId',
      },
      {
        component: 'Select',
        label: '启用状态',
        fieldName: 'enabled',
        componentProps: {
          allowClear: true,
          placeholder: '全部',
          options: [
            { label: '启用', value: true },
            { label: '禁用', value: false },
          ],
        },
      },
    ]

    const [CubeForm, formApi] = useCubeForm({
      layout: 'horizontal',
      handleSubmit: () => {
        page.pageNumber = 1
        tableApi.query()
      },
      handleReset: () => {
        page.pageNumber = 1
        tableApi.query()
      },
      schema: searchFormSchema,
      showCollapseButton: true,
    })

    const handleSwitch = async (enable: boolean, record: FormAppraisalRulePageVO): Promise<void> => {
      if (record.id === undefined || record.id === null || record.id === '') {
        message.error('规则ID缺失')
        return
      }
      const prev = !enable
      try {
        await cubeFormAuditService.updateAssessmentRuleEnable({ id: String(record.id), enable })
        message.success('操作成功')
      } catch (e) {
        record.enabled = prev
        message.error(e instanceof Error ? e.message : '操作失败')
      }
    }

    const openCreate = (): void => {
      history.pushState({ current: location.pathname + location.search }, '', '/portal/form-audit/assessment-rules/add')
    }

    const openDetail = (record: FormAppraisalRulePageVO): void => {
      history.pushState({ current: location.pathname + location.search }, '', `/portal/form-audit/assessment-rules/detail/${String(record.id)}`)
    }

    const openEdit = (record: FormAppraisalRulePageVO): void => {
      history.pushState({ current: location.pathname + location.search }, '', `/portal/form-audit/assessment-rules/edit/${String(record.id)}`)
    }

    const tryDelete = async (record: FormAppraisalRulePageVO): Promise<void> => {
      if (record.id === undefined || record.id === null || record.id === '') {
        message.error('规则ID缺失')
        return
      }
      if (record.enabled) {
        message.warning('启用中的规则不可删除，请先禁用')
        return
      }
      if (record.inUse) {
        message.error('规则正在使用中')
        return
      }
      try {
        await cubeFormAuditService.deleteAssessmentRule(String(record.id))
        message.success('删除成功')
        tableApi.query()
      } catch (e) {
        message.error(e instanceof Error ? e.message : '删除失败')
      }
    }

    const columns = [
      {
        title: '规则名称',
        dataIndex: 'name',
        ellipsis: true,
        align: 'center' as const,
        customRender: ({ text }: { text: string }): JSX.Element => (
          <PopOver content={text || ''}>{text || '--'}</PopOver>
        ),
      },
      {
        title: '检查项目',
        dataIndex: 'inspectionItem',
        ellipsis: true,
        align: 'center' as const,
        customRender: ({ text }: { text: string }): JSX.Element => (
          <PopOver content={text || ''}>{text || '--'}</PopOver>
        ),
      },
      {
        title: '考核周期',
        dataIndex: 'periodType',
        ellipsis: true,
        align: 'center' as const,
        customRender: ({ text }: { text: AppraisalPeriodType }): JSX.Element => {
          const label = getAppraisalPeriodTypeLabel(text)
          return <PopOver content={label}>{label}</PopOver>
        },
      },
      {
        title: '总分值',
        dataIndex: 'totalScore',
        ellipsis: true,
        align: 'center' as const,
        customRender: ({ text }: { text: number }): JSX.Element => (
          <PopOver content={String(text ?? '')}>{text ?? '--'}</PopOver>
        ),
      },
      {
        title: '抽查分值',
        dataIndex: 'spotCheckScore',
        ellipsis: true,
        align: 'center' as const,
        customRender: ({ text }: { text: number }): JSX.Element => (
          <PopOver content={String(text ?? '')}>{text ?? '--'}</PopOver>
        ),
      },
      {
        title: '检查分值',
        dataIndex: 'inspectionScore',
        ellipsis: true,
        align: 'center' as const,
        customRender: ({ text }: { text: number }): JSX.Element => (
          <PopOver content={String(text ?? '')}>{text ?? '--'}</PopOver>
        ),
      },
      {
        title: '责任部门',
        dataIndex: 'responsibleDepartmentNames',
        ellipsis: true,
        align: 'center' as const,
        customRender: ({ text }: { text: string }): JSX.Element => (
          <PopOver content={text || ''}>{text || '--'}</PopOver>
        ),
      },
      {
        title: '开关',
        dataIndex: 'enabled',
        ellipsis: true,
        fixed: 'right' as const,
        align: 'center' as const,
        customRender: ({ record }: { record: FormAppraisalRulePageVO }): JSX.Element => (
          <Switch
            v-model:value={record.enabled}
            checkedChildren='启用'
            unCheckedChildren='禁用'
            onChange={(val: boolean) => {
              handleSwitch(val, record)
            }}
          />
        ),
      },
      {
        title: '操作',
        dataIndex: 'action',
        width: 220,
        fixed: 'right' as const,
        align: 'center' as const,
        customRender: ({ record }: { record: FormAppraisalRulePageVO }): JSX.Element => {
          const canPopDelete = !record.enabled && !record.inUse
          return (
            <>
              <Button type='link' size='small' onClick={() => openDetail(record)}>
                详情
              </Button>
              <Button type='link' size='small' onClick={() => openEdit(record)}>
                编辑
              </Button>
              {canPopDelete ? (
                <PopConfirm title='确认删除该规则？' onConfirm={() => tryDelete(record)}>
                  <Button type='link' size='small' danger>
                    删除
                  </Button>
                </PopConfirm>
              ) : (
                <span
                  title={record.enabled ? '请先禁用后再删除' : record.inUse ? '规则正在使用中' : ''}
                  style={{ display: 'inline-block' }}
                >
                  <Button type='link' size='small' danger disabled>
                    删除
                  </Button>
                </span>
              )}
            </>
          )
        },
      },
    ]

    const [CubeTable, tableApi] = useCubeTable({
      columns,
      tableCode,
      rowKey: 'id',
      fetchApi: async () => {
        const ruleName = formApi.formValues.ruleName as string | undefined
        const periodType = formApi.formValues.periodType as AppraisalPeriodType | undefined
        const responsibleDepartmentIdRaw = formApi.formValues.responsibleDepartmentId as string | undefined
        const enabled = (formApi.formValues.enabled == null ? undefined : formApi.formValues.enabled) as boolean | undefined 
        return cubeFormAuditService.getAssessmentRulePage({
          pageNumber: page.pageNumber,
          pageSize: page.pageSize,
          keyword: ruleName?.trim() || undefined,
          periodType: periodType || undefined,
          responsibleDepartmentId:
            responsibleDepartmentIdRaw !== undefined &&
            responsibleDepartmentIdRaw !== null &&
            String(responsibleDepartmentIdRaw).trim() !== ''
              ? String(responsibleDepartmentIdRaw)
              : undefined,
          enabled,
        })
      },
      fetchLoaded: (data) => {
        page.total = data.total
      },
    })

    const handleChange = (pageNumber: number, pageSize: number): void => {
      page.pageNumber = pageNumber
      page.pageSize = pageSize
      tableApi.query()
    }

    const slots = {
      'layout-header': (): JSX.Element => (
        <div class={styles['layout-header-item']}>
          <Button type='primary' onClick={openCreate}>
            新增
          </Button>
        </div>
      ),
      'layout-content': (): JSX.Element => (
        <>
          <CubeForm />
          <CubeTable />
        </>
      ),
      'footer-page': (): JSX.Element => (
        <Page
          v-show={page.total > 0}
          current={page.pageNumber}
          pageSize={page.pageSize}
          total={page.total}
          onPageChange={handleChange}
        />
      ),
    }

    return (): JSX.Element => (
      <>
        <CubeLayout title={pageTitle ?? '考核规则'} v-slots={slots} />
      </>
    )
  },
})
