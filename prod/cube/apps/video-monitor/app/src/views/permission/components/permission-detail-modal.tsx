/**
 * 权限详情弹窗组件
 * 用于显示监控范围或权限归属的完整列表，支持搜索
 */
import { defineComponent, ref, computed, watch } from 'vue'
import { Modal, Input, Space, Tag, Empty } from 'ant-design-vue'
import type { ScopeItem, OwnershipItem } from '@/types/permission'
import { SCOPE_TYPE_LABEL_MAP, SCOPE_TYPE_COLOR_MAP, OWNERSHIP_TYPE_LABEL_MAP, OWNERSHIP_TYPE_COLOR_MAP } from '@/constants/permission'

interface Props {
  visible: boolean
  title: string
  items: ScopeItem[] | OwnershipItem[]
  type: 'scope' | 'ownership'
}

const getScopeTypeLabel = (type: ScopeItem['type']): string => {
  return SCOPE_TYPE_LABEL_MAP[type] || ''
}

const getScopeTypeColor = (type: ScopeItem['type']): string => {
  return SCOPE_TYPE_COLOR_MAP[type] || 'default'
}

const getOwnershipTypeLabel = (type: OwnershipItem['type']): string => {
  return OWNERSHIP_TYPE_LABEL_MAP[type] || ''
}

const getOwnershipTypeColor = (type: OwnershipItem['type']): string => {
  return OWNERSHIP_TYPE_COLOR_MAP[type] || 'default'
}

export const PermissionDetailModal = defineComponent({
  name: 'PermissionDetailModal',
  props: {
    visible: {
      type: Boolean,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    items: {
      type: Array,
      required: true
    },
    type: {
      type: String as () => 'scope' | 'ownership',
      required: true
    }
  },
  emits: ['update:visible', 'close'],
  setup (props: Props, { emit }) {
    const searchKeyword = ref('')

    // 过滤后的列表
    const filteredItems = computed(() => {
      if (!searchKeyword.value.trim()) {
        return props.items
      }
      const keyword = searchKeyword.value.trim().toLowerCase()
      return props.items.filter(item => {
        if (props.type === 'scope') {
          const scopeItem = item as ScopeItem
          const typeLabel = getScopeTypeLabel(scopeItem.type)
          return typeLabel.toLowerCase().includes(keyword) || scopeItem.name.toLowerCase().includes(keyword)
        } else {
          const ownershipItem = item as OwnershipItem
          const typeLabel = getOwnershipTypeLabel(ownershipItem.type)
          return typeLabel.toLowerCase().includes(keyword) || ownershipItem.name.toLowerCase().includes(keyword)
        }
      })
    })

    // 监听 visible 变化，重置搜索关键词
    watch(() => props.visible, (newVal) => {
      if (newVal) {
        searchKeyword.value = ''
      }
    })

    const handleClose = (): void => {
      emit('update:visible', false)
      emit('close')
    }

    const renderTag = (item: ScopeItem | OwnershipItem, index: number) => {
      if (props.type === 'scope') {
        const scopeItem = item as ScopeItem
        return (
          <Tag
            key={`scope-${index}`}
            color={getScopeTypeColor(scopeItem.type)}
            style={{ border: '1px solid', marginBottom: '8px' }}
          >
            {getScopeTypeLabel(scopeItem.type)}：{scopeItem.name}
          </Tag>
        )
      } else {
        const ownershipItem = item as OwnershipItem
        return (
          <Tag
            key={`ownership-${index}`}
            color={getOwnershipTypeColor(ownershipItem.type)}
            style={{ border: '1px solid', marginBottom: '8px' }}
          >
            {getOwnershipTypeLabel(ownershipItem.type)}：{ownershipItem.name}
          </Tag>
        )
      }
    }

    return () => (
      <Modal
        title={props.title}
        open={props.visible}
        onCancel={handleClose}
        footer={null}
        width={600}
      >
        <div style={{ marginBottom: '16px' }}>
          <Input
            placeholder="请输入关键字搜索"
            value={searchKeyword.value}
            onInput={(e: Event) => {
              searchKeyword.value = (e.target as HTMLInputElement).value
            }}
            allowClear
          />
        </div>
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {filteredItems.value.length > 0 ? (
            <Space wrap size={[8, 8]}>
              {filteredItems.value.map((item, index) => renderTag(item, index))}
            </Space>
          ) : (
            <Empty description="暂无数据" />
          )}
        </div>
      </Modal>
    )
  }
})

