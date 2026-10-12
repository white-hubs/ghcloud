import { Select, message } from '@ghcloud/cube-ui'
import { computed, defineComponent, onMounted, ref } from 'vue'
import { getPaperQuestionRuleOptionList } from '@/api/paper-question-rule'
import { logger } from '@/logger'

interface OptionItem {
  id: string;
  ruleName: string;
}

interface Props {
  value: { id?: string; name?: string; ruleId?: string; ruleName?: string; }[];
}

export const RandomQuestionRuleSelect = defineComponent({
  props: ['value'],
  emits: ['update:value'],
  setup: (props: Props, { emit }) => {
    const options = ref<OptionItem[]>([])

    const getRuleId = (item: Props['value'][number]): string => {
      return item.ruleId || item.id || ''
    }

    const getRuleName = (item: Props['value'][number]): string => {
      return item.ruleName || item.name || ''
    }

    const isSameRuleList = (
      left: { ruleId: string; ruleName: string; }[],
      right: { ruleId: string; ruleName: string; }[]
    ): boolean => {
      if (left.length !== right.length) {
        return false
      }
      return left.every((item, index) => item.ruleId === right[index].ruleId && item.ruleName === right[index].ruleName)
    }

    const normalizedValue = computed(() => {
      return (props.value ?? []).map((item) => ({
        ruleId: getRuleId(item),
        ruleName: getRuleName(item)
      }))
    })

    const selectedIds = computed(() => normalizedValue.value.map((item) => item.ruleId))

    const selectOptions = computed(() => {
      return options.value.map((item) => ({
        label: item.ruleName,
        value: item.id
      }))
    })

    const handleSelectChange = (ids: string[]): void => {
      const map = new Map(options.value.map((item) => [item.id, item.ruleName]))
      const res = ids.map((id) => ({
        ruleId: id,
        ruleName: map.get(id) || normalizedValue.value.find((item) => item.ruleId === id)?.ruleName || ''
      }))
      if (isSameRuleList(res, normalizedValue.value)) {
        return
      }
      emit('update:value', res)
    }

    onMounted(async () => {
      try {
        const res = await getPaperQuestionRuleOptionList()
        options.value = res.data ?? []
      } catch (error) {
        logger.error(error)
        message.error('随机考题规则加载失败')
      }
    })

    return (): JSX.Element => {
      return (
        <div style={{ width: '100%' }}>
          <Select
            placeholder='请选择随机考题规则'
            options={selectOptions.value}
            value={selectedIds.value}
            onUpdate:value={handleSelectChange}
            mode='multiple'
            style={{ width: '100%' }}
          />
        </div>
      )
    }
  }
})
