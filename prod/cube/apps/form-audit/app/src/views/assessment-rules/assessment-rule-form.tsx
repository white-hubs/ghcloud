import { cubeFormAuditService } from '@/api/service'
import type {
  AppraisalPeriodType,
  AssessmentRuleItemVO,
  Department,
  SpotCheckItemVO,
} from '@ghcloud/cube-form-audit-service'
import { CubeLayout } from '@ghcloud/cube-app-design'
import { Button, Form, FormItem, Input, InputNumber, Select, Space, TreeSelect, message, type FormExpose } from '@ghcloud/cube-ui'
import { usePageName } from '@ghcloud/cube-utils'
import { defineComponent, reactive, ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { PlusOutlined } from '@ant-design/icons-vue'
import { AssessmentRuleConditionCard } from './assessment-rule-condition-card'
import { applyFormAppraisalRuleDetailToFormState, buildFormAppraisalRuleSaveCommand } from './assessment-rule-api-map'
import { appraisalPeriodTypeOptions, CHECK_SOURCE_KIND } from './assessment-rule-enums'
import { createDefaultRuleItem, defaultRuleItemName } from './assessment-rule-model'
import { validateRangeSequence } from './assessment-rule-range-validate'
import styles from './assessment-rule-form.module.less'

type RuleFormMode = 'add' | 'edit' | 'detail'

/** 责任部门多选，未选时为 `[]` */
type AssessmentRuleFormState = {
  name: string
  itemContent: string
  formGroupId: string | undefined
  periodType: AppraisalPeriodType | undefined
  organizationIds: string[]
  totalScore: number
  spotCheckTotalScore: number
  inspectionTotalScore: number
  enable: boolean
  spotCheckList: SpotCheckItemVO[]
  inspectionList: SpotCheckItemVO[]
}

interface OptionItem {
  label: string;
  value: string;
}

interface FormGroupListNode {
  id: string;
  name: string;
  parentId?: string;
  children?: FormGroupListNode[];
}

interface FormGroupTreeOption {
  label: string;
  value: string;
  children?: FormGroupTreeOption[];
  disabled?: boolean;
}

const modeLabelMap = new Map<RuleFormMode, string>([
  ['add', '新增考核规则'],
  ['edit', '编辑考核规则'],
  ['detail', '考核规则详情'],
])

const defaultItem = (): SpotCheckItemVO => ({
  sourceKey: '',
  sourceRefCode: '',
  sourceRefName: '',
  sourceType: 'SPOT_CHECK',
  content: '',
  standardDescription: '',
  itemDescription: '',
  standardCodes: '',
  ruleItems: [createDefaultRuleItem(0)],
})

const defaultSpotCheckItem = (): SpotCheckItemVO => ({
  ...defaultItem(),
  sourceType: 'SPOT_CHECK',
})

const defaultInspectionItem = (): SpotCheckItemVO => ({
  ...defaultItem(),
  sourceType: 'INSPECTION',
})

/** 与条件卡片中计分规则标题展示一致：有名称用名称，否则为计分规则1、计分规则2… */
function getRuleItemDisplayName(rule: AssessmentRuleItemVO, index: number): string {
  const trimmed = rule.itemName?.trim()
  return trimmed ? trimmed : defaultRuleItemName(index)
}

function validateRuleLists(spotCheckList: SpotCheckItemVO[], inspectionList: SpotCheckItemVO[]): string | null {
  if (spotCheckList.length === 0 && inspectionList.length === 0) {
    return '抽查分值和检查分值至少填写一组条件'
  }

  const checkOne = (list: SpotCheckItemVO[], blockName: string): string | null => {
    for (let i = 0; i < list.length; i++) {
      const it = list[i]
      if (!it.checkSourceKind) {
        return `${blockName}第 ${i + 1} 条请选择来源`
      }
      if (!it.sourceKey) {
        return `${blockName}第 ${i + 1} 条请选择底稿`
      }
      const rules = it.ruleItems ?? []
      if (rules.length === 0) {
        return `${blockName}第 ${i + 1} 条请至少保留一条计分规则`
      }
      for (let j = 0; j < rules.length; j++) {
        const r = rules[j]
        const ruleLabel = getRuleItemDisplayName(r, j)
        if (!r.methodCode) {
          return `${blockName}第 ${i + 1} 条「${ruleLabel}」请选择方式`
        }
        if (it.checkSourceKind === CHECK_SOURCE_KIND.FORM && !r.formFieldId) {
          return `${blockName}第 ${i + 1} 条「${ruleLabel}」请选择字段`
        }
        if (!r.ranges?.length) {
          return `${blockName}第 ${i + 1} 条「${ruleLabel}」请至少保留一个区间`
        }
        for (let k = 0; k < r.ranges.length; k++) {
          const row = r.ranges[k]
          if (row.start === null || row.end === null || row.score === null) {
            return `${blockName}第 ${i + 1} 条「${ruleLabel}」的区间 ${k + 1} 请填写起始、结束与分数`
          }
        }
        const rangeErr = validateRangeSequence(r.ranges)
        if (rangeErr) {
          return `${blockName}第 ${i + 1} 条「${ruleLabel}」：${rangeErr}`
        }
      }
    }
    return null
  }

  if (spotCheckList.length > 0) {
    const spotErr = checkOne(spotCheckList, '抽查分值')
    if (spotErr) {
      return spotErr
    }
  }
  if (inspectionList.length > 0) {
    return checkOne(inspectionList, '检查分值')
  }
  return null
}

export const AssessmentRuleForm = defineComponent({
  setup: () => {
    const route = useRoute()
    const router = useRouter()
    const { pageTitle } = usePageName()

    const formRef = ref<FormExpose>()
    const saveLoading = ref(false)

    const mode = computed<RuleFormMode>(() => {
      const name = String(route.name ?? '')
      if (name.includes('add')) return 'add'
      if (name.includes('edit')) return 'edit'
      return 'detail'
    })

    const isDetail = computed(() => mode.value === 'detail')

    const formState = reactive<AssessmentRuleFormState>({
      name: '',
      itemContent: '',
      formGroupId: undefined,
      periodType: undefined,
      organizationIds: [],
      totalScore: 0,
      spotCheckTotalScore: 0,
      inspectionTotalScore: 0,
      enable: true,
      spotCheckList: [defaultSpotCheckItem()],
      inspectionList: [defaultInspectionItem()],
    })

    const title = computed(() => {
      return `${modeLabelMap.get(mode.value) ?? ''}${pageTitle ? `-${pageTitle}` : ''}`
    })

    const responsibleDeptOptions = ref<{ label: string; value: string }[]>([])
    const formGroupOptions = ref<FormGroupTreeOption[]>([])
    const deptListLoading = ref(false)
    const formGroupLoading = ref(false)

    const loadResponsibleDepartments = async (): Promise<void> => {
      deptListLoading.value = true
      try {
        const list = await cubeFormAuditService.getOrganizations({
          pageNumber: 1,
          pageSize: 1000,
          name: '',
          enabled: true,
        })
        const rows = Array.isArray(list) ? list : []
        responsibleDeptOptions.value = rows.map((d: Department) => ({
          label: d.name,
          value: d.id,
        }))
      } catch {
        // ApiProxy.errorNotify 已提示
      } finally {
        deptListLoading.value = false
      }
    }

    const isLeafNode = (node: FormGroupListNode): boolean => !Array.isArray(node.children) || node.children.length === 0

    const buildGroupTreeOptions = (nodes: FormGroupListNode[]): FormGroupTreeOption[] => {
      return nodes.flatMap((node) => {
        if (node.id === '0') {
          const rootChildren = Array.isArray(node.children) ? buildGroupTreeOptions(node.children) : []
          return rootChildren
        }
        const children = Array.isArray(node.children) ? buildGroupTreeOptions(node.children) : []
        return [{
          label: node.name,
          value: node.id,
          children,
          disabled: !isLeafNode(node),
        }]
      })
    }

    const loadFormGroups = async (): Promise<void> => {
      formGroupLoading.value = true
      try {
        const list = await cubeFormAuditService.getFlowGroupTree({ keyword: '' })
        const rows: FormGroupListNode[] = Array.isArray(list) ? list : []
        formGroupOptions.value = buildGroupTreeOptions(rows)
      } finally {
        formGroupLoading.value = false
      }
    }

    watch(
      () => [formState.totalScore, formState.spotCheckTotalScore],
      () => {
        formState.inspectionTotalScore = Math.max(0, Number(formState.totalScore ?? 0) - Number(formState.spotCheckTotalScore ?? 0))
      },
      { immediate: true },
    )

    const refreshFromDetail = async (id: string): Promise<void> => {
      const detail = await cubeFormAuditService.getAssessmentRuleDetail(id)
      applyFormAppraisalRuleDetailToFormState(formState, detail)
    }

    onMounted(async () => {
      await Promise.all([loadResponsibleDepartments(), loadFormGroups()])
      const id = route.params.id ? String(route.params.id) : ''
      if (!id || mode.value === 'add') return
      try {
        await refreshFromDetail(id)
      } catch {
        message.error('获取详情失败')
      }
    })

    const onCancel = (): void => {
      // router.replace({ path: '/assessment-rules' })
      router.back()
    }

    const onAddCondition = (): void => {
      if (isDetail.value) return
      formState.spotCheckList.push(defaultSpotCheckItem())
    }

    const onRemoveCondition = (index: number): void => {
      if (isDetail.value) return
      formState.spotCheckList.splice(index, 1)
    }

    const onAddInspectionCondition = (): void => {
      if (isDetail.value) return
      formState.inspectionList.push(defaultInspectionItem())
    }

    const onRemoveInspectionCondition = (index: number): void => {
      if (isDetail.value) return
      formState.inspectionList.splice(index, 1)
    }

    const rules = {
      name: [{ required: true, message: '请输入规则名称' }],
      itemContent: [{ required: true, message: '请输入检查项目' }],
      formGroupId: [{ required: true, message: '请选择表单分组' }],
      periodType: [{ required: true, message: '请选择考核周期' }],
      organizationIds: [{ required: true, message: '请选择责任部门' }],
      totalScore: [{ required: true, message: '请输入总分值' }],
      spotCheckTotalScore: [{ required: true, message: '请输入抽查分值' }],
      inspectionTotalScore: [{ required: true, message: '请输入检查分值' }],
    }

    const onSubmit = async (): Promise<void> => {
      if (isDetail.value) return
      try {
        await formRef.value?.validate([
          'name',
          'itemContent',
          'formGroupId',
          'periodType',
          'organizationIds',
          'totalScore',
          'spotCheckTotalScore',
          'inspectionTotalScore',
        ])
      } catch {
        return
      }

      const ruleErr = validateRuleLists(formState.spotCheckList, formState.inspectionList)
      if (ruleErr) {
        message.warning(ruleErr)
        return
      }

      saveLoading.value = true
      try {
        const payload = buildFormAppraisalRuleSaveCommand(formState, {
          mode: mode.value === 'add' ? 'add' : 'edit',
          ...(mode.value !== 'add' && route.params.id ? { ruleId: String(route.params.id) } : {}),
        })

        await (mode.value === 'add'
          ? cubeFormAuditService.createAssessmentRule(payload)
          : (() => {
            const id = route.params.id ? String(route.params.id) : ''
            if (!id) throw new Error('缺少规则ID')
            return cubeFormAuditService.updateAssessmentRule(id, payload)
          })())

        message.success('保存成功')
        router.push({ path: '/assessment-rules' })
      } catch (e) {
        message.error(e instanceof Error ? e.message : '保存失败')
      } finally {
        saveLoading.value = false
      }
    }

    return (): JSX.Element => (
      <CubeLayout title={title.value} v-slots={{
        'layout-content': (): JSX.Element => (
          <div class={styles['edit-content']}>
            <Form model={formState} ref={formRef} rules={rules} label-col={{ style: { width: '100px' } }}>
              <div class={styles['section-title']}>基础信息</div>
              <div class={styles['form-grid']}>
                <FormItem label='规则名称' name='name'>
                  <Input v-model:value={formState.name} placeholder='请输入规则名称' disabled={isDetail.value} />
                </FormItem>

                <FormItem label='检查项目' name='itemContent'>
                  <Input v-model:value={formState.itemContent} placeholder='请输入检查项目' disabled={isDetail.value} />
                </FormItem>

                <FormItem label='考核周期' name='periodType'>
                  <Select
                    v-model:value={formState.periodType}
                    placeholder='请选择考核周期'
                    disabled={isDetail.value}
                    options={appraisalPeriodTypeOptions}
                    allowClear={false}
                  />
                </FormItem>

                <FormItem label='责任部门' name='organizationIds'>
                  <Select
                    v-model:value={formState.organizationIds}
                    mode='multiple'
                    placeholder='请选择责任部门'
                    disabled={isDetail.value || deptListLoading.value}
                    options={responsibleDeptOptions.value}
                    allowClear
                    filterOption={(input: string, option: OptionItem | undefined) =>
                      (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                    />
                </FormItem>

                <FormItem label='表单分组' name='formGroupId'>
                  <TreeSelect
                    v-model:value={formState.formGroupId}
                    placeholder='请选择表单分组'
                    disabled={isDetail.value || formGroupLoading.value}
                    treeData={formGroupOptions.value}
                    allowClear
                    showSearch
                    treeNodeFilterProp='label'
                  />
                </FormItem>
              </div>
              <div class={styles['section-title']}>评分规则</div>

              <FormItem label='总分值' name='totalScore' class={styles['form-grid']}>
                <InputNumber
                  v-model:value={formState.totalScore}
                  min={0}
                  max={999}
                  precision={0}
                  placeholder='0-999'
                  status=''
                  disabled={isDetail.value}
                />
              </FormItem>

              <div class={styles['form-grid']}>
                <FormItem label='抽查分值' name='spotCheckTotalScore'>
                  <InputNumber
                    v-model:value={formState.spotCheckTotalScore}
                    min={0}
                    max={999}
                    precision={0}
                    placeholder='0-999'
                    status=''
                    disabled={isDetail.value}
                  />
                </FormItem>

                <div class={styles['button-flex']}>
                  <Button type='dashed' onClick={onAddCondition} disabled={isDetail.value}>
                    <PlusOutlined /> 添加新条件
                  </Button>
                </div>
              </div>

              {formState.spotCheckList.map((it, idx) => (
                <div key={`spot-${idx}-${it.id ?? ''}`} class={styles['condition-card']}>
                  <div class={styles['condition-delete']}>
                    <Button type='link' size='small' onClick={() => onRemoveCondition(idx)} disabled={isDetail.value}>
                      删除
                    </Button>
                  </div>
                  <AssessmentRuleConditionCard variant='spot' item={it} disabled={isDetail.value} />
                </div>
              ))}

              <div class={styles['form-grid']}>
                <FormItem label='检查分值' name='inspectionTotalScore'>
                  <InputNumber
                    v-model:value={formState.inspectionTotalScore}
                    min={0}
                    max={999}
                    precision={0}
                    placeholder='0-999'
                    status=''
                    disabled={isDetail.value}
                    style={{ width: '50%' }}
                  />
                </FormItem>
                <div class={styles['button-flex']}>
                  <Button type='dashed' onClick={onAddInspectionCondition} disabled={isDetail.value}>
                    <PlusOutlined /> 添加新条件
                  </Button>
                </div>
              </div>
              {formState.inspectionList.map((it, idx) => (
                <div key={`insp-${idx}-${it.id ?? ''}`} class={styles['condition-card']}>
                  <div class={styles['condition-delete']}>
                    <Button type='link' size='small' onClick={() => onRemoveInspectionCondition(idx)} disabled={isDetail.value}>
                      删除
                    </Button>
                  </div>
                  <AssessmentRuleConditionCard variant='inspection' item={it} disabled={isDetail.value} />
                </div>
              ))}
            </Form>
          </div>
        ),
        'footer-page': (): JSX.Element => (
          <Space>
            <Button onClick={onCancel}>取消</Button>
            {!isDetail.value && (
              <Button type='primary' loading={saveLoading.value} onClick={onSubmit}>
                保存
              </Button>
            )}
          </Space>
        ),
      }} />
    )
  },
})
