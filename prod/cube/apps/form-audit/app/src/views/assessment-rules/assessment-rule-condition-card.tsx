import { computed, defineComponent, onBeforeUnmount, type PropType, ref, watch } from 'vue'
import { Space } from 'ant-design-vue'
import { MinusOutlined, PlusOutlined } from '@ant-design/icons-vue'
import type {
  AssessmentRuleItemVO,
  CheckSourceKind,
  InspectPlanDraftOptionVO,
  MaintenancePlanDraftOptionVO,
  SpotCheckItemVO,
} from '@ghcloud/cube-form-audit-service'
import { Button, Cascader, FormItem, Input, InputNumber, message, Select, Spin, Textarea, Tooltip } from '@ghcloud/cube-ui'
import { cubeFormAuditService } from '@/api/service'
import { debounce } from '@/utils'
import { CHECK_SOURCE_KIND, checkSourceKindOptions, getMethodOptionsBySourceKind } from './assessment-rule-enums'
import { mapFormJsonToCascaderOptions, type FormFieldCascaderOption } from './assessment-rule-form-fields'
import { createDefaultRange, createDefaultRuleItem, defaultRuleItemName } from './assessment-rule-model'
import styles from './assessment-rule-form.module.less'

const FORM_DRAFT_PAGE_SIZE = 20
const FORM_DRAFT_SEARCH_DEBOUNCE_MS = 300

/** 底稿下拉：表单来源需携带 businessType → 保存时 `sourceRefCode` */
type DraftSelectOption = { label: string; value: string; sourceRefCode?: string }

type Variant = 'spot' | 'inspection'

const variantLabels: Record<Variant, { source: string; content: string; standard: string }> = {
  spot: { source: '抽查来源', content: '抽查内容', standard: '评分标准' },
  inspection: { source: '检查来源', content: '检查内容', standard: '评分标准' },
}

export const AssessmentRuleConditionCard = defineComponent({
  name: 'AssessmentRuleConditionCard',
  props: {
    variant: { type: String as PropType<Variant>, required: true },
    item: { type: Object as PropType<SpotCheckItemVO>, required: true },
    disabled: { type: Boolean, default: false },
  },
  setup(props) {
    const draftOptions = ref<DraftSelectOption[]>([])
    const fieldOptions = ref<FormFieldCascaderOption[]>([])
    const fieldOptionsLoading = ref(false)
    const draftLoading = ref(false)
    const draftPageNumber = ref(1)
    const draftHasMore = ref(true)
    const draftKeyword = ref('')

    /** 底稿未选时传 undefined，以便展示 placeholder（模型里可能为 ''） */
    const draftSelectValue = computed((): string | undefined => {
      const t = props.item.sourceKey?.trim()
      return t === undefined || t === '' ? undefined : t
    })

    const draftOptionsWithSelected = computed((): DraftSelectOption[] => {
      const base = draftOptions.value
      const key = props.item.sourceKey?.trim()
      if (key === undefined || key === '' || base.some((o) => o.value === key)) {
        return base
      }
      const name = props.item.sourceRefName?.trim()
      return [
        {
          label: name !== undefined && name !== '' ? name : '已选底稿',
          value: key,
          sourceRefCode: props.item.sourceRefCode ?? '',
        },
        ...base,
      ]
    })

    const ensureRuleItems = (): void => {
      if (!props.item.ruleItems || props.item.ruleItems.length === 0) {
        props.item.ruleItems = [createDefaultRuleItem(0)]
      }
    }

    const onRuleItemNameBlur = (rule: AssessmentRuleItemVO, ruleIdx: number): void => {
      if (!rule.itemName?.trim()) {
        rule.itemName = defaultRuleItemName(ruleIdx)
      }
    }

    const mergeDraftOptions = (isReset: boolean, mapped: DraftSelectOption[]): void => {
      if (isReset) {
        draftOptions.value = mapped
      } else {
        const seen = new Set(draftOptions.value.map((o) => o.value))
        for (const o of mapped) {
          if (!seen.has(o.value)) {
            seen.add(o.value)
            draftOptions.value.push(o)
          }
        }
      }
    }

    const fetchDraftOptionsPage = async (isReset: boolean): Promise<void> => {
      const kind = props.item.checkSourceKind
      if (!kind) {
        return
      }
      if (draftLoading.value) {
        return
      }
      draftLoading.value = true
      try {
        if (isReset) {
          draftPageNumber.value = 1
          draftOptions.value = []
        }
        const pageNum = draftPageNumber.value
        const kw = draftKeyword.value.trim()

        let records: unknown[] = []
        let total: number | undefined

        if (kind === CHECK_SOURCE_KIND.FORM) {
          const res = await cubeFormAuditService.getBusinessFormFlowPageList({
            pageNumber: pageNum,
            pageSize: FORM_DRAFT_PAGE_SIZE,
            keyword: kw || undefined,
        })
          records = res.records ?? []
          total = res.total
          const mapped = (records as { id?: string; name?: string; businessType?: string }[]).map((r) => ({
            label: String(r.name ?? ''),
            value: String(r.id ?? ''),
            sourceRefCode: String(r.businessType ?? ''),
          }))
          mergeDraftOptions(isReset, mapped)
        } else if (kind === CHECK_SOURCE_KIND.INSPECTION) {
          const res = await cubeFormAuditService.getInspectPlanPageV2({
            pageNumber: pageNum,
            pageSize: FORM_DRAFT_PAGE_SIZE,
            keyword: kw || undefined,
          })
          records = res.records ?? []
          total = res.total
          const mapped = (records as InspectPlanDraftOptionVO[]).map((r) => ({
            label: r.planName ?? r.name ?? String(r.id ?? ''),
            value: String(r.id ?? ''),
          }))
          mergeDraftOptions(isReset, mapped)
        } else {
          const res = await cubeFormAuditService.getMaintenancePlanSelectPage({
            pageNumber: pageNum,
            pageSize: FORM_DRAFT_PAGE_SIZE,
            maintenancePlanName: kw || undefined,
          })
          records = res.records ?? []
          total = res.total
          const mapped = (records as MaintenancePlanDraftOptionVO[]).map((r) => ({
            label: r.maintenancePlanName ?? r.name ?? String(r.id ?? ''),
            value: String(r.id ?? ''),
          }))
          mergeDraftOptions(isReset, mapped)
        }

        const totalNum = Number(total ?? 0)
        draftHasMore.value = draftOptions.value.length < totalNum
        if ((records?.length ?? 0) > 0) {
          draftPageNumber.value = pageNum + 1
        }
      } finally {
        draftLoading.value = false
      }
    }

    const debouncedDraftSearch = debounce((raw: string) => {
      draftKeyword.value = raw
      fetchDraftOptionsPage(true).catch(() => undefined)
    }, FORM_DRAFT_SEARCH_DEBOUNCE_MS)

    const onDraftPopupScroll = (e: Event): void => {
      const target = e.target as HTMLElement
      if (
        draftLoading.value ||
        !draftHasMore.value ||
        target.scrollTop + target.clientHeight < target.scrollHeight - 20
      ) {
        return
      }
      fetchDraftOptionsPage(false).catch(() => undefined)
    }

    const loadDrafts = async (): Promise<void> => {
      const kind = props.item.checkSourceKind
      if (!kind) {
        draftOptions.value = []
        return
      }
      debouncedDraftSearch.cancel()
      draftKeyword.value = ''
      await fetchDraftOptionsPage(true)
    }

    const upsertSelectedDraftOption = (option: DraftSelectOption): void => {
      const key = option.value.trim()
      if (!key) {
        return
      }
      const idx = draftOptions.value.findIndex((o) => o.value === key)
      if (idx >= 0) {
        draftOptions.value[idx] = {
          ...draftOptions.value[idx],
          ...option,
        }
      } else {
        draftOptions.value.unshift(option)
      }
    }

    const ensureSelectedDraftOption = async (): Promise<void> => {
      const kind = props.item.checkSourceKind
      const key = props.item.sourceKey?.trim() ?? ''
      if (!kind || !key) {
        return
      }
      const existing = draftOptions.value.find((o) => o.value === key)
      const hasUsableLabel = existing?.label?.trim() || props.item.sourceRefName?.trim()
      if (hasUsableLabel) {
        return
      }
      try {
        if (kind === CHECK_SOURCE_KIND.FORM) {
          // FORM 场景由 loadFields 复用 getFormFlowById 结果补齐，避免重复请求
          const fallbackLabel = props.item.sourceRefName?.trim() || '已选底稿'
          upsertSelectedDraftOption({ label: fallbackLabel, value: key, sourceRefCode: props.item.sourceRefCode ?? '' })
          props.item.sourceRefName = fallbackLabel
          return
        }
        if (kind === CHECK_SOURCE_KIND.INSPECTION) {
          const res = await cubeFormAuditService.getInspectPlanPageV2({
            pageNumber: 1,
            pageSize: FORM_DRAFT_PAGE_SIZE,
            keyword: key,
          })
          const found = (res.records ?? []).find((r) => String(r.id ?? '') === key)
          if (found) {
            const label = found.planName ?? found.name ?? '已选底稿'
            upsertSelectedDraftOption({ label, value: key })
            props.item.sourceRefName = label
            return
          }
        } else {
          const res = await cubeFormAuditService.getMaintenancePlanSelectPage({
            pageNumber: 1,
            pageSize: FORM_DRAFT_PAGE_SIZE,
            maintenancePlanName: key,
          })
          const found = (res.records ?? []).find((r) => String(r.id ?? '') === key)
          if (found) {
            const label = found.maintenancePlanName ?? found.name ?? '已选底稿'
            upsertSelectedDraftOption({ label, value: key })
            props.item.sourceRefName = label
            return
          }
        }
      } catch {
        // ignore: keep fallback label
      }
      upsertSelectedDraftOption({ label: '已选底稿', value: key, sourceRefCode: props.item.sourceRefCode ?? '' })
    }

    onBeforeUnmount(() => {
      debouncedDraftSearch.cancel()
    })

    /** 同一条件组内多条计分规则时，仅保留靠前规则上的重复表单字段（与后端保存的 fieldKey 一致） */
    const dedupeRuleFormFieldsKeepingFirst = (): void => {
      const items = props.item.ruleItems ?? []
      const seen = new Set<string>()
      for (const r of items) {
        const raw = r.formFieldId
        if (raw === undefined || raw === null || String(raw).trim() === '') {
          continue
        }
        const key = String(raw)
        if (seen.has(key)) {
          delete r.formFieldId
        } else {
          seen.add(key)
        }
      }
    }

    const findFieldPathById = (options: FormFieldCascaderOption[], fieldId: string): string[] | undefined => {
      for (const option of options) {
        if (option.value === fieldId) {
          return [option.value]
        }
        if (option.children && option.children.length > 0) {
          const childPath = findFieldPathById(option.children, fieldId)
          if (childPath) {
            return [option.value, ...childPath]
          }
        }
      }
      return undefined
    }

    /** 表单来源下，当前计分规则可选字段（排除已被其它规则占用的字段，保留本行当前值） */
    const getFieldSelectOptions = (ruleIdx: number): FormFieldCascaderOption[] => {
      const items = props.item.ruleItems ?? []
      const current = items[ruleIdx]
      const taken = new Set<string>()
      for (let i = 0; i < items.length; i++) {
        if (i === ruleIdx) {
          continue
        }
        const fid = items[i]?.formFieldId
        if (fid !== undefined && fid !== null && String(fid).trim() !== '') {
          taken.add(String(fid))
        }
      }
      const cur = current?.formFieldId !== undefined && current?.formFieldId !== null ? String(current.formFieldId) : ''

      const filterOptions = (options: FormFieldCascaderOption[]): FormFieldCascaderOption[] => {
        const out: FormFieldCascaderOption[] = []
        for (const option of options) {
          const children = option.children ? filterOptions(option.children) : undefined
          const keepSelf = !taken.has(option.value) || (cur !== '' && option.value === cur)
          if (!keepSelf && (!children || children.length === 0)) {
            continue
          }
          out.push({
            ...option,
            ...(children && children.length > 0 ? { children } : {}),
            ...(!keepSelf ? { disabled: true } : {}),
          })
        }
        return out
      }

      return filterOptions(fieldOptions.value)
    }

    const isFieldTakenByOtherRules = (ruleIdx: number, fieldId: string): boolean => {
      const items = props.item.ruleItems ?? []
      for (let i = 0; i < items.length; i++) {
        if (i === ruleIdx) {
          continue
        }
        const selectedFieldId = items[i]?.formFieldId
        if (selectedFieldId !== undefined && selectedFieldId !== null && String(selectedFieldId).trim() === fieldId) {
          return true
        }
      }
      return false
    }

    /** 仅「来源=表单」且已选底稿时拉取字段；用序号丢弃过期并发请求，避免重复写入与重复请求 */
    let loadFieldsRequestSeq = 0
    const loadFields = async (): Promise<void> => {
      if (props.item.checkSourceKind !== CHECK_SOURCE_KIND.FORM) {
        fieldOptions.value = []
        fieldOptionsLoading.value = false
        return
      }
      const sourceId = props.item.sourceKey?.trim() ?? ''
      if (!sourceId) {
        fieldOptions.value = []
        fieldOptionsLoading.value = false
        return
      }
      const seq = loadFieldsRequestSeq + 1
      loadFieldsRequestSeq = seq
      fieldOptionsLoading.value = true
      try {
        const detail = await cubeFormAuditService.getFormFlowById(sourceId)
        if (seq !== loadFieldsRequestSeq) {
          return
        }
        // 复用字段详情请求，补齐下拉回显的 label/sourceRefCode，避免额外再请求一次
        const label = String(detail.name ?? '').trim() || (props.item.sourceRefName?.trim() || '已选底稿')
        const sourceRefCode = String(detail.businessType ?? '').trim()
        props.item.sourceRefName = label
        props.item.sourceRefCode = sourceRefCode
        upsertSelectedDraftOption({ label, value: sourceId, sourceRefCode })
        fieldOptions.value = mapFormJsonToCascaderOptions(detail.formJson)
        dedupeRuleFormFieldsKeepingFirst()
      } catch (error) {
        if (seq === loadFieldsRequestSeq) {
          fieldOptions.value = []
        }
      } finally {
        if (seq === loadFieldsRequestSeq) {
          fieldOptionsLoading.value = false
        }
      }
    }

    watch(
      () => props.item.checkSourceKind,
      () => {
        loadDrafts()
          .then(() => ensureSelectedDraftOption())
          .catch(() => undefined)
      },
      { immediate: true },
    )

    watch(
      () => [props.item.checkSourceKind, props.item.sourceKey] as const,
      () => {
        loadFields().catch(() => undefined)
      },
      { immediate: true, flush: 'post' },
    )

    const onSourceKindChange = (v: CheckSourceKind): void => {
      props.item.checkSourceKind = v
      props.item.sourceKey = ''
      props.item.sourceRefCode = ''
      props.item.sourceRefName = ''
      ensureRuleItems()
      props.item.ruleItems?.forEach((r) => {
        delete r.formFieldId
        r.methodCode = ''
      })
    }

    const onDraftChange = (v: string | undefined): void => {
      props.item.sourceKey = v ?? ''
      if (v === undefined || v === null || String(v).trim() === '') {
        props.item.sourceRefCode = ''
        props.item.sourceRefName = ''
      } else {
        const key = String(v)
        const found = draftOptionsWithSelected.value.find((o) => o.value === key)
        props.item.sourceRefName = found?.label ?? key
        props.item.sourceRefCode = found?.sourceRefCode ?? ''
      }
      if (props.item.checkSourceKind === CHECK_SOURCE_KIND.FORM) {
        ensureRuleItems()
        props.item.ruleItems?.forEach((r) => {
          delete r.formFieldId
        })
      }
    }

    const addRuleItem = (): void => {
      ensureRuleItems()
      const nextIndex = props.item.ruleItems?.length ?? 0
      props.item.ruleItems?.push(createDefaultRuleItem(nextIndex))
    }

    const removeRuleItem = (ruleIdx: number): void => {
      ensureRuleItems()
      if (!props.item.ruleItems || props.item.ruleItems.length <= 1) {
        return
      }
      props.item.ruleItems.splice(ruleIdx, 1)
    }

    const addRange = (ruleIdx: number): void => {
      ensureRuleItems()
      const rule = props.item.ruleItems?.[ruleIdx]
      if (!rule) {
        return
      }
      rule.ranges.push(createDefaultRange())
    }

    const removeRange = (ruleIdx: number, rangeIdx: number): void => {
      ensureRuleItems()
      const rule = props.item.ruleItems?.[ruleIdx]
      if (!rule || rule.ranges.length <= 1) {
        const row = rule?.ranges[rangeIdx]
        if (row) {
          row.start = null
          row.end = null
          row.score = null
        }
        return
      }
      rule.ranges.splice(rangeIdx, 1)
    }

    return (): JSX.Element => {
      const { variant, item, disabled } = props
      const labels = variantLabels[variant]
      ensureRuleItems()
      /** 未选来源时不要回退为「表单」，否则会出现未选表单仍展示字段下拉、并误触发加载逻辑 */
      const kind = item.checkSourceKind
      const methodOptions = getMethodOptionsBySourceKind(kind)
      const showFieldSelect = kind === CHECK_SOURCE_KIND.FORM

      return (
        <div class={styles['condition-card-body']}>
          <div class={styles['form-grid']}>
            <FormItem label={labels.source}>
              <Space class={styles['source-row']} size={12}>
                <Select
                  class={styles['source-select']}
                  value={item.checkSourceKind}
                  placeholder='请选择来源'
                  disabled={disabled}
                  options={checkSourceKindOptions}
                  onUpdate:value={(v: CheckSourceKind) => onSourceKindChange(v)}
                />
                <Spin
                  spinning={draftLoading.value && draftOptions.value.length === 0}
                  class={styles['source-draft-spin']}
                >
                  <Select
                    class={styles['draft-select']}
                    value={draftSelectValue.value}
                    placeholder='请选择底稿'
                    disabled={disabled}
                    options={draftOptionsWithSelected.value}
                    allowClear
                    showSearch
                    filterOption={false}
                    onSearch={(v: string) => {
                      debouncedDraftSearch(v ?? '')
                    }}
                    onPopupScroll={onDraftPopupScroll}
                    onUpdate:value={(v: string | undefined) => {
                      onDraftChange(v)
                    }}
                  />
                </Spin>
              </Space>
            </FormItem>
          </div>

          <FormItem label={labels.content} class={styles['form-grid']}>
            <Textarea v-model:value={item.content} placeholder='请输入' rows={3} disabled={disabled} />
          </FormItem>

          <FormItem label={labels.standard} class={styles['form-grid']}>
            <Textarea v-model:value={item.standardDescription} placeholder='请输入' rows={3} disabled={disabled} />
          </FormItem>

          <div class={styles['rule-items-wrap']}>
            {item.ruleItems?.map((rule, ruleIdx) => (
              <div key={ruleIdx} class={styles['rule-item-block']}>
                <div class={styles['rule-item-head']}>
                  <Space size={8}>
                    <span class={styles['rule-item-title']}>计分规则：</span>
                    <Input
                      value={rule.itemName ?? ''}
                      placeholder='请输入计分规则名称'
                      disabled={disabled}
                      onUpdate:value={(v: string) => {
                        rule.itemName = v
                      }}
                      onBlur={() => {
                        onRuleItemNameBlur(rule, ruleIdx)
                      }}
                    />
                  </Space>
                  {!disabled && (item.ruleItems?.length ?? 0) > 1 && (
                    <Button type='link' size='small' onClick={() => removeRuleItem(ruleIdx)}>
                      删除规则
                    </Button>
                  )}
                </div>

                <div class={styles['rule-item-controls-row']}>
                  <Space class={styles['source-row']} size={12}>
                    {showFieldSelect && (
                      <Spin spinning={fieldOptionsLoading.value} size='small'>
                        <Cascader
                          class={styles['field-select']}
                          value={rule.formFieldId?.trim() ? findFieldPathById(fieldOptions.value, rule.formFieldId) : undefined}
                          placeholder='选择字段'
                          disabled={disabled}
                          options={getFieldSelectOptions(ruleIdx)}
                          allowClear
                          onUpdate:value={(v: string[] | undefined) => {
                            if (v === undefined || v.length === 0) {
                              delete rule.formFieldId
                            } else {
                              const selectedFieldId = String(v[v.length - 1])
                              if (isFieldTakenByOtherRules(ruleIdx, selectedFieldId)) {
                                message.warning('该字段已被其它计分规则选择，请重新选择')
                                return
                              }
                              rule.formFieldId = selectedFieldId
                            }
                          }}
                        />
                      </Spin>
                    )}
                    <Select
                      class={styles['method-select']}
                      value={rule.methodCode || undefined}
                      placeholder='请选择方式'
                      disabled={disabled}
                      options={methodOptions}
                      allowClear
                      onUpdate:value={(v: string) => {
                        rule.methodCode = v ?? ''
                      }}
                    />
                  </Space>
                </div>

                <div class={styles['range-table']}>
                  <div class={styles['range-header']}>
                    <span>起始（大于等于）</span>
                    <span>结束（小于）</span>
                    <span>扣分数</span>
                    <span class={styles['range-actions']} />
                  </div>
                  {rule.ranges.map((row, rangeIdx) => {
                    const isLastRange = rangeIdx === rule.ranges.length - 1
                    return (
                      <div key={rangeIdx} class={styles['range-row']}>
                        <InputNumber
                          class={styles['range-input']}
                          v-model:value={row.start}
                          min={0}
                          precision={0}
                          placeholder='起始'
                          status=''
                          disabled={disabled}
                        />
                        <InputNumber
                          class={styles['range-input']}
                          v-model:value={row.end}
                          min={0}
                          precision={0}
                          placeholder='结束'
                          status=''
                          disabled={disabled}
                        />
                        <InputNumber
                          class={styles['range-input']}
                          v-model:value={row.score}
                          min={0}
                          precision={2}
                          placeholder='分数'
                          status=''
                          disabled={disabled}
                        />
                        <div class={styles['range-actions']}>
                        {!disabled && isLastRange && (
                            <Tooltip title="添加区间">
                              <Button
                                type='text'
                                size='small'
                                onClick={() => addRange(ruleIdx)}
                              >
                                <PlusOutlined />
                              </Button>
                            </Tooltip>
                          )}
                          {!disabled && (
                            <Tooltip title="删除区间">
                              <Button
                                type="text"
                                size="small"
                                danger
                                onClick={() => removeRange(ruleIdx, rangeIdx)}
                              >
                                <MinusOutlined />
                              </Button>
                            </Tooltip>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}

            {!disabled && (
              <Button type='dashed' block class={styles['add-rule-btn']} onClick={addRuleItem}>
                <PlusOutlined /> 添加计分规则
              </Button>
            )}
          </div>
        </div>
      )
    }
  },
})
