import { defineComponent, onMounted, reactive } from 'vue'
import { Select } from 'ant-design-vue'
import { cubeOuaaService } from '../../../api/service'
import type { DeptList } from '@ghcloud/cube-ouaa-service'

// 部门下拉数据全局缓存，避免同一页面多个 DeptSelect 重复请求
const deptOptionsCache: Record<string, { options: DeptList[]; loaded: boolean; loading: boolean; }> = {}
const getDeptCacheKey = (filterEnabled: boolean): string => {
  const tenant = JSON.parse(sessionStorage.getItem('GH-NowEnterprise') ?? '{}')
  return `enabled:${filterEnabled}:${tenant?.code ?? 'default'}`
}

export const DeptSelect = defineComponent({
  props: {
    value: {
      type: String || Array || undefined,
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
      options: DeptList[];
    }>({
      options: []
    })

    const fetchDeptOptionsWithCache = async (): Promise<void> => {
      const cacheKey = getDeptCacheKey(props.filterEnabled)
      const cache = deptOptionsCache[cacheKey]

      // 命中缓存
      if (cache?.loaded) {
        state.options = cache.options
        return
      }

      // 初始化缓存
      if (!deptOptionsCache[cacheKey]) {
        deptOptionsCache[cacheKey] = { options: [], loaded: false, loading: false }
      }
      const currentCache = deptOptionsCache[cacheKey]

      // 已有其他实例在加载，等待其完成后复用结果
      if (currentCache.loading) {
        while (currentCache.loading) {
          await new Promise(resolve => setTimeout(resolve, 50))
        }
        state.options = currentCache.options
        return
      }

      // 当前实例发起加载
      currentCache.loading = true
      try {
        const options = await cubeOuaaService.getDeptList({ enabled: props.filterEnabled })
        currentCache.options = options
        currentCache.loaded = true
        state.options = options
      } finally {
        currentCache.loading = false
      }
    }

    onMounted(async () => {
      await fetchDeptOptionsWithCache()
    })
    const handleFilterOption = (input: string, option: unknown): boolean => {
      const optionNode = option as DeptList
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
        }} v-model:value={props.value} placeholder='请选择部门' show-search={props.showSearch} filterOption={props.showSearch ? handleFilterOption : undefined} onUpdate:value={(value) => {
          emit('update:value', value)
        }}
      />
    )
  }
})
