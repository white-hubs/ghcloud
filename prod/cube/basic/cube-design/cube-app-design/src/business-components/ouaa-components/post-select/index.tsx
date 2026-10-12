import { defineComponent, onMounted, reactive } from 'vue'
import { Select } from 'ant-design-vue'
import { cubeOuaaService } from '../../../api/service'
import type { PositionItem } from '@ghcloud/cube-ouaa-service'

// 岗位下拉数据全局缓存，避免多个 PostSelect 重复请求
const postOptionsCache: Record<string, { options: PositionItem[]; loaded: boolean; loading: boolean; }> = {}
const getPostCacheKey = (filterEnabled: boolean): string => {
  const tenant = JSON.parse(sessionStorage.getItem('GH-NowEnterprise') ?? '{}')
  return `enabled:${filterEnabled}:${tenant?.code ?? 'default'}`
}

export const PostSelect = defineComponent({
  props: {
    value: {
      type: String || Array,
      default: undefined
    },
    multiple: {
      type: Boolean,
      default: false
    },
    filterEnabled: {
      type: Boolean,
      default: true
    },
    showSearch: {
      type: Boolean,
      default: true
    },
    maxTagCount: {
      type: Number,
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:value', 'change'],
  setup: (props, { emit }) => {
    const state = reactive<{
      options: PositionItem[];
    }>({
      options: []
    })

    const fetchPostOptionsWithCache = async (): Promise<void> => {
      const cacheKey = getPostCacheKey(props.filterEnabled)
      const cache = postOptionsCache[cacheKey]

      if (cache?.loaded) {
        state.options = cache.options
        return
      }

      if (!postOptionsCache[cacheKey]) {
        postOptionsCache[cacheKey] = { options: [], loaded: false, loading: false }
      }
      const currentCache = postOptionsCache[cacheKey]

      if (currentCache.loading) {
        while (currentCache.loading) {
          await new Promise(resolve => setTimeout(resolve, 50))
        }
        state.options = currentCache.options
        return
      }

      currentCache.loading = true
      try {
        const options = await cubeOuaaService.getPositionList({ enabled: props.filterEnabled })
        currentCache.options = options
        currentCache.loaded = true
        state.options = options
      } finally {
        currentCache.loading = false
      }
    }

    onMounted(async () => {
      await fetchPostOptionsWithCache()
    })
    const handleFilterOption = (input: string, option: unknown): boolean => {
      const optionNode = option as PositionItem
      return optionNode.name.toLowerCase().includes(input.toLowerCase())
    }
    return (): JSX.Element => (
      <Select
        {...props}
        disabled={props.disabled}
        mode={props.multiple ? 'multiple' : undefined} allowClear onChange={(value: unknown, option: unknown) => {
          emit('change', value, option)
        }} options={state.options} fieldNames={{
          label: 'name',
          value: 'id'
        }} v-model:value={props.value} placeholder='请选择岗位' show-search={props.showSearch} filterOption={props.showSearch ? handleFilterOption : undefined} onUpdate:value={(value) => {
          emit('update:value', value)
        }}
      />
    )
  }
})
