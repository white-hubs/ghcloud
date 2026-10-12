import { computed, defineComponent, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { Layout } from '@/components/layout/layout'
import { Button, Input, Select, Textarea, message } from '@ghcloud/cube-ui'
import { themesList } from '@/api/train'
import { changePaperQuestionRule, createPaperQuestionRule, getPaperQuestionRuleDetail } from '@/api/paper-question-rule'
import { logger } from '@/logger'
import { ExamQuestionTypeEnum, type PaperQuestionRuleItem, type PaperQuestionRuleSaveCommand } from '@/types/paper-question-rule'

interface ThemeOption {
  label: string;
  value: string;
}

interface RuleItemFormRow extends PaperQuestionRuleItem {
  themeIds: string[];
}

const EXAM_TYPE_ROWS: { label: string; type: ExamQuestionTypeEnum; }[] = [
  { label: '单选题', type: ExamQuestionTypeEnum.SINGLE_CHOICE },
  { label: '多选题', type: ExamQuestionTypeEnum.MULTIPLE_CHOICE },
  { label: '判断题', type: ExamQuestionTypeEnum.JUDGE }
]

const createDefaultItem = (type: ExamQuestionTypeEnum): RuleItemFormRow => {
  return {
    examQuestionType: type,
    themeKeywords: '',
    themeIds: [],
    extractCount: undefined,
    perScore: undefined
  }
}

export const PaperQuestionRuleForm = defineComponent({
  setup: () => {
    const { action, id } = useRoute().query
    const isDetail = computed(() => action === 'detail')

    const title = computed(() => {
      let res = '随机考题规则'
      if (action === 'add') {
        res += ' / 新增'
      } else if (action === 'edit') {
        res += ' / 编辑'
      } else {
        res += ' / 详情'
      }
      return res
    })

    const loading = ref(false)
    const saveLoading = ref(false)
    const themeOptions = ref<ThemeOption[]>([])
    const formData = ref({
      ruleName: '',
      passScore: undefined as number | undefined,
      description: '',
      items: EXAM_TYPE_ROWS.map((item) => createDefaultItem(item.type))
    })

    const subtotalMap = computed(() => {
      const result: Record<ExamQuestionTypeEnum, number> = {
        [ExamQuestionTypeEnum.SINGLE_CHOICE]: 0,
        [ExamQuestionTypeEnum.MULTIPLE_CHOICE]: 0,
        [ExamQuestionTypeEnum.JUDGE]: 0
      }
      formData.value.items.forEach((item) => {
        const score = Number(item.extractCount || 0) * Number(item.perScore || 0)
        result[item.examQuestionType] = score
      })
      return result
    })

    const totalScore = computed(() => {
      return subtotalMap.value[ExamQuestionTypeEnum.SINGLE_CHOICE] +
        subtotalMap.value[ExamQuestionTypeEnum.MULTIPLE_CHOICE] +
        subtotalMap.value[ExamQuestionTypeEnum.JUDGE]
    })

    const updateThemeKeywords = (item: RuleItemFormRow): void => {
      item.themeKeywords = item.themeIds.join(',')
    }

    const setNumberField = (item: RuleItemFormRow, key: 'extractCount' | 'perScore', value: string): void => {
      const num = Number(value)
      item[key] = Number.isNaN(num) || num <= 0 ? undefined : Math.floor(num)
    }

    const validate = (): boolean => {
      if (!formData.value.ruleName.trim()) {
        message.error('请输入规则名称')
        return false
      }
      if (!formData.value.passScore || formData.value.passScore <= 0) {
        message.error('请输入及格分数')
        return false
      }
      if (formData.value.passScore > totalScore.value) {
        message.error('及格分数不能大于试卷总分')
        return false
      }
      for (let index = 0; index < formData.value.items.length; index++) {
        const item = formData.value.items[index]
        const hasTheme = item.themeIds.length > 0
        const hasExtractCount = typeof item.extractCount === 'number' && item.extractCount > 0
        const hasPerScore = typeof item.perScore === 'number' && item.perScore > 0
        const isEdited = hasTheme || hasExtractCount || hasPerScore

        if (!isEdited) {
          continue
        }

        if (item.themeIds.length === 0) {
          message.error(`${EXAM_TYPE_ROWS[index].label}请选择题目主题`)
          return false
        }
        if (!item.extractCount || item.extractCount < 1) {
          message.error(`${EXAM_TYPE_ROWS[index].label}请输入抽取题数`)
          return false
        }
        if (!item.perScore || item.perScore < 1) {
          message.error(`${EXAM_TYPE_ROWS[index].label}请输入每题分值`)
          return false
        }
      }
      return true
    }

    const save = async (): Promise<void> => {
      if (!validate()) {
        return
      }
      try {
        saveLoading.value = true
        const params: PaperQuestionRuleSaveCommand = {
          ruleName: formData.value.ruleName.trim(),
          passScore: formData.value.passScore,
          description: formData.value.description.trim(),
          items: formData.value.items
            .filter((item) => {
              const hasTheme = item.themeIds.length > 0
              const hasExtractCount = typeof item.extractCount === 'number' && item.extractCount > 0
              const hasPerScore = typeof item.perScore === 'number' && item.perScore > 0
              return hasTheme || hasExtractCount || hasPerScore
            })
            .map((item) => {
            return {
              themeKeywords: item.themeKeywords,
              examQuestionType: item.examQuestionType,
              extractCount: item.extractCount,
              perScore: item.perScore,
              ...(item.id ? { id: item.id } : {}),
              ...(item.ruleId ? { ruleId: item.ruleId } : {})
            }
            })
        }
        if (action === 'edit' && id) {
          params.id = id as string
        }
        if (action === 'edit') {
          await changePaperQuestionRule(params)
        } else {
          await createPaperQuestionRule(params)
        }
        message.success('操作成功')
        history.back()
      } catch (error) {
        logger.error(error)
      } finally {
        saveLoading.value = false
      }
    }

    const fetchThemes = async (): Promise<void> => {
      const res = await themesList()
      const list = res.data ?? []
      themeOptions.value = list.map((item) => ({
        label: item.name,
        value: item.id
      }))
    }

    const applyDetail = async (): Promise<void> => {
      if (action === 'add' || !id) {
        return
      }
      const res = await getPaperQuestionRuleDetail(id as string)
      const detail = res.data
      if (!detail) {
        return
      }
      const nextItems = EXAM_TYPE_ROWS.map((config) => {
        const target = detail.items?.find((item) => item.examQuestionType === config.type)
        if (!target) {
          return createDefaultItem(config.type)
        }
        const themeIds = (target.themeKeywords || '')
          .split(',')
          .map((themeId) => themeId.trim())
          .filter(Boolean)
        const availableThemeIdSet = new Set(themeOptions.value.map((theme) => theme.value))
        return {
          ...target,
          themeIds: themeIds.filter((themeId) => availableThemeIdSet.has(themeId))
        }
      })
      formData.value = {
        ruleName: detail.ruleName || '',
        passScore: detail.passScore,
        description: detail.description || '',
        items: nextItems
      }
    }

    onMounted(async () => {
      try {
        loading.value = true
        await fetchThemes()
        await applyDetail()
      } catch (error) {
        logger.error(error)
      } finally {
        loading.value = false
      }
    })

    const layoutSlots = {
      'layout-content': (): JSX.Element => {
        return (
          <div style={{ padding: '24px 28px 28px', maxWidth: '1480px', margin: '0 auto' }}>
            <div style={{ marginBottom: '20px', fontWeight: 600, fontSize: '16px' }}>基础信息</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(620px, 1fr) minmax(620px, 1fr)', gap: '16px 28px' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ width: '140px', whiteSpace: 'nowrap', fontSize: '14px' }}><span style={{ color: '#f5222d' }}>* </span>随机试卷规则名称</div>
                <Input
                  v-model:value={formData.value.ruleName}
                  placeholder='请输入随机试卷规则名称'
                  disabled={isDetail.value}
                  showCount={false}
                  style={{ flex: 1, height: '36px' }}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ width: '100px', whiteSpace: 'nowrap', fontSize: '14px' }}><span style={{ color: '#f5222d' }}>* </span>试卷总分</div>
                <Input value={`${totalScore.value || 0}`} placeholder='自动计算试卷总分' disabled showCount={false} style={{ flex: 1, height: '36px' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ width: '140px', whiteSpace: 'nowrap', fontSize: '14px' }}><span style={{ color: '#f5222d' }}>* </span>及格分</div>
                <Input
                  value={formData.value.passScore ? `${formData.value.passScore}` : ''}
                  placeholder='请输入及格分'
                  disabled={isDetail.value}
                  showCount={false}
                  style={{ flex: 1, height: '36px' }}
                  onChange={(event: { target: { value: string; }; }) => {
                    const num = Number(event.target.value)
                    formData.value.passScore = Number.isNaN(num) || num <= 0 ? undefined : Math.floor(num)
                  }}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                <div style={{ width: '100px', whiteSpace: 'nowrap', lineHeight: '36px', fontSize: '14px' }}>规则说明</div>
                <Textarea
                  v-model:value={formData.value.description}
                  placeholder='请输入规则说明'
                  disabled={isDetail.value}
                  maxLength={500}
                  autoSize={{ minRows: 4, maxRows: 4 }}
                  style={{ flex: 1 }}
                />
              </div>
            </div>

            <div style={{ marginTop: '32px', marginBottom: '20px', fontWeight: 600, fontSize: '16px' }}>试题</div>
            {formData.value.items.map((item, index) => {
              return (
                <div key={item.examQuestionType} style={{ width: '100%', display: 'grid', gridTemplateColumns: '96px 1fr 260px 260px 140px', gap: '14px', marginBottom: '16px', alignItems: 'center', padding: '14px 16px', background: '#fafafa', borderRadius: '6px' }}>
                  <div style={{ fontWeight: 500, whiteSpace: 'nowrap', fontSize: '14px' }}>{EXAM_TYPE_ROWS[index].label}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ whiteSpace: 'nowrap' }}>从</span>
                    <Select
                      mode='multiple'
                      placeholder='下拉多选题目主题，框选抽取范围'
                      style={{ width: '100%' }}
                      options={themeOptions.value}
                      disabled={isDetail.value}
                      v-model:value={item.themeIds}
                      onChange={() => {
                        updateThemeKeywords(item)
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ whiteSpace: 'nowrap' }}>抽取</span>
                    <Input
                      value={item.extractCount ? `${item.extractCount}` : ''}
                      disabled={isDetail.value}
                      placeholder='输入题数'
                      showCount={false}
                      style={{ height: '36px' }}
                      onChange={(event: { target: { value: string; }; }) => {
                        setNumberField(item, 'extractCount', event.target.value)
                      }}
                    />
                    <span style={{ whiteSpace: 'nowrap' }}>题</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ whiteSpace: 'nowrap' }}>每题分值</span>
                    <Input
                      value={item.perScore ? `${item.perScore}` : ''}
                      disabled={isDetail.value}
                      placeholder='输入分值'
                      showCount={false}
                      style={{ height: '36px' }}
                      onChange={(event: { target: { value: string; }; }) => {
                        setNumberField(item, 'perScore', event.target.value)
                      }}
                    />
                  </div>
                  <div style={{ textAlign: 'right', color: '#666', fontSize: '14px' }}>小计 <span style={{ color: '#1890ff', fontWeight: 600 }}>{subtotalMap.value[item.examQuestionType] || 0}</span> 分</div>
                </div>
              )
            })}
          </div>
        )
      },
      'footer-page': (): JSX.Element => {
        return (
          <>
            <Button onClick={() => {
              history.back()
            }}>取消</Button>
            {!isDetail.value && <Button type='primary' style={{ marginLeft: '10px' }} loading={saveLoading.value || loading.value} onClick={save}>保存</Button>}
          </>
        )
      }
    }

    return (): JSX.Element => <Layout title={title.value} v-slots={layoutSlots} />
  }
})
