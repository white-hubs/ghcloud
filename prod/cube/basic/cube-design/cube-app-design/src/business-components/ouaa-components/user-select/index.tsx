import { defineComponent, onMounted, reactive } from 'vue'
import { Select } from 'ant-design-vue'
import { cubeOuaaService } from '../../../api/service'
import type { PersonItem, UserDTO } from '@ghcloud/cube-ouaa-service'
/**
 * 人员选择组件
 */

interface OptionItem {
  id: string; name: string;
}

// 全局缓存，避免同一页面多个 UserSelect 重复请求人员列表
const globalUserOptionsCache: Record<string, { options: OptionItem[]; loaded: boolean; loading: boolean; }> = {}

const getCacheKey = (filterEnabled: boolean): string => {
  const tenant = JSON.parse(sessionStorage.getItem('GH-NowEnterprise') ?? '{}')
  return `enabled:${filterEnabled}:${tenant?.code ?? 'default'}`
}

export const UserSelect = defineComponent({
  props: {
    value: {
      type: String || Array,
      default: null
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
    },
    allowClear: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:value', 'change'],
  setup: (props, { emit }) => {
    const state = reactive<{ options: OptionItem[]; loading: boolean; }>({ options: [], loading: false })
    const idSet = new Set<string>()

    const toOptionItemsFromStaff = (records: PersonItem[]): OptionItem[] => {
      return records.map(r => ({ id: r.id, name: r.name }))
    }
    const toOptionItemsFromDTO = (records: UserDTO[]): OptionItem[] => {
      return records.map(r => ({ id: String(r.id ?? ''), name: String(r.name ?? '') }))
    }

    const appendOptions = (items: OptionItem[]): void => {
      const filtered = items.filter(i => {
        if (!i.id) return false
        if (idSet.has(i.id)) return false
        idSet.add(i.id)
        return true
      })
      if (filtered.length > 0) {
        state.options = [...state.options, ...filtered]
      }
    }

    // 获取（并缓存）全量人员列表
    const fetchAllUsersWithCache = async (): Promise<void> => {
      const cacheKey = getCacheKey(props.filterEnabled)
      // 如果已有缓存数据，直接使用
      const cache = globalUserOptionsCache[cacheKey]
      if (cache?.loaded && cache.options.length) {
        state.options = cache.options
        return
      }

      // 初始化缓存对象
      if (!globalUserOptionsCache[cacheKey]) {
        globalUserOptionsCache[cacheKey] = { options: [], loaded: false, loading: false }
      }
      const currentCache = globalUserOptionsCache[cacheKey]

      // 如果已经有其他实例在加载，轮询等待加载完成
      if (currentCache.loading) {
        state.loading = true
        // 简单轮询等待，数据量不大时足够；如果后续需要可换成事件/Promise 机制
        while (currentCache.loading) {

          await new Promise(resolve => setTimeout(resolve, 50))
        }
        state.loading = false
        state.options = currentCache.options
        return
      }

      // 当前实例发起加载
      currentCache.loading = true
      state.loading = true
      try {
        const pageSize = 200
        const first = await cubeOuaaService.getStaffPage({ pageSize, pageNumber: 1, enabled: props.filterEnabled })
        const localOptions: OptionItem[] = []
        const localIdSet = new Set<string>()

        const appendToLocal = (items: OptionItem[]): void => {
          items.forEach(i => {
            if (!i.id) return
            if (localIdSet.has(i.id)) return
            localIdSet.add(i.id)
            localOptions.push(i)
          })
        }

        appendToLocal(toOptionItemsFromStaff(first.records))
        const totalPages = first.pages
        const queue: number[] = []
        for (let p = 2; p <= totalPages; p++) queue.push(p)
        const batchSize = 3
        for (let i = 0; i < queue.length; i += batchSize) {
          const batch = queue.slice(i, i + batchSize)
          const results = await Promise.all(batch.map(async pageNumber => cubeOuaaService.getStaffPage({ pageSize, pageNumber, enabled: props.filterEnabled })))
          results.forEach(res => appendToLocal(toOptionItemsFromStaff(res.records)))
        }

        // 更新缓存 & 当前实例状态
        currentCache.options = localOptions
        currentCache.loaded = true
        state.options = localOptions
      } finally {
        currentCache.loading = false
        state.loading = false
      }
    }

    const normalizeSelectedIds = (val: string | string[] | null): string[] => {
      if (!val) return []
      return Array.isArray(val) ? val.map(v => String(v)) : [String(val)]
    }

    onMounted(async () => {
      const selectedIds = normalizeSelectedIds(props.value as unknown as string | string[] | null)
      if (selectedIds.length > 0) {
        const selected = await cubeOuaaService.getTenantUserList({ userIds: selectedIds }, 'post')
        appendOptions(toOptionItemsFromDTO(selected))
      }
      await fetchAllUsersWithCache()
    })
    const handleFilterOption = (input: string, option: unknown): boolean => {
      const optionNode = option as OptionItem
      return optionNode.name.toLowerCase().includes(input.toLowerCase())
    }
    return (): JSX.Element => (
      <Select
        {...props}
        disabled={props.disabled}
        mode={props.multiple ? 'multiple' : undefined} placeholder='请选择人员' onChange={(value: unknown, option: unknown) => {
          emit('change', value, option)
        }} options={state.options} fieldNames={{
          label: 'name',
          value: 'id'
        }} v-model:value={props.value} show-search={props.showSearch} filterOption={props.showSearch ? handleFilterOption : undefined} loading={state.loading} onUpdate:value={(value) => {
          emit('update:value', value)
        }}
      />
    )
  }
})
