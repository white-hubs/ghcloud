import { defineComponent, ref, watch, type PropType } from 'vue'
import { DeptSelect } from '../dept-select'
import { PostSelect } from '../post-select'
import { RoleSelect } from '../role-select'
import { UserSelect } from '../user-select'
import styles from './index.module.less'
import { ReceiveTypeOptions } from './constant'
import { Select } from 'ant-design-vue'

type ReceiveType = 'USER' | 'DEPARTMENT' | 'POST' | 'ROLE'
interface ReceiveItem {
  type: ReceiveType;
  value: string;
}

export const UserFusionSelect = defineComponent({
  props: {
    value: {
      type: Array as PropType<ReceiveItem[]>,
      default: () => []
    },
    typeValue: {
      type: Object as PropType<{ type: string; ids: string[]; }>,
      default: () => ({ type: 'USER', ids: [] })
    },
  },
  emits: ['update:value', 'update:typeValue'],
  setup: (props, { emit, expose }) => {
    const type = ref<ReceiveType>('USER')
    const idsByType = ref<Record<ReceiveType, string[]>>({ USER: [], DEPARTMENT: [], POST: [], ROLE: [] })

    const buildRecordFromItems = (items: ReceiveItem[]): Record<ReceiveType, string[]> => {
      const record: Record<ReceiveType, string[]> = { USER: [], DEPARTMENT: [], POST: [], ROLE: [] }
      items.forEach(({ type, value }) => {
        record[type].push(value)
      })
      return record
    }
    const buildItemsFromRecord = (record: Record<ReceiveType, string[]>): ReceiveItem[] => {
      const out: ReceiveItem[] = []
      ;(['USER', 'DEPT', 'POST', 'ROLE'] as ReceiveType[]).forEach((t) => {
        (record[t] ?? []).forEach((v) => out.push({ type: t, value: v }))
      })
      return out
    }

    // 初始化优先从 typeValue 获取
    if (props.typeValue?.ids?.length) {
      type.value = (props.typeValue.type as ReceiveType) ?? 'USER'
      idsByType.value = { ...idsByType.value, [type.value]: props.typeValue.ids }
    } else {
      idsByType.value = buildRecordFromItems(props.value)
    }
    // 监听两种输入格式，保持内部状态同步
    watch(() => props.value, (val) => {
      idsByType.value = buildRecordFromItems(val || [])
    })
    watch(() => props.typeValue, (val) => {
      if (!val) return
      type.value = (val.type as ReceiveType) ?? 'USER'
      idsByType.value = { ...idsByType.value, [type.value]: val.ids ?? [] }
    }, { deep: true })

    const updateTypeValues = (t: ReceiveType, values: string[]): void => {
      idsByType.value = { ...idsByType.value, [t]: values }
      const merged = buildItemsFromRecord(idsByType.value)
      emit('update:value', merged)
      emit('update:typeValue', { type: t, ids: values })
    }

    const checkFormData = async (): Promise<unknown> => {
      const currentIds = idsByType.value[type.value] ?? []
      if (!currentIds || currentIds.length === 0) {
        return Promise.reject('请至少选择一个对象')
      }
      return Promise.resolve(true)
    }

    expose({
      checkFormData,
    })

    return (): JSX.Element => (
      <div class={styles.container}>
        <Select
          v-model:value={type.value}
          onUpdate:value={(v) => {
            type.value = v as ReceiveType
            emit('update:typeValue', { type: type.value, ids: idsByType.value[type.value] ?? [] })
          }}
          style={{ width: '100px' }}
          options={ReceiveTypeOptions}
          placeholder='请选人员'
          allowClear
        />
        <div class={styles.selectContainer}>
          {
            type.value === 'USER' &&
            <UserSelect
              multiple v-model:value={idsByType.value.USER} onUpdate:value={(v: string[]) => {
                updateTypeValues('USER', v)
              }}
            />
          }
          {
            type.value === 'DEPARTMENT' &&
            <DeptSelect
              multiple
              v-model:value={idsByType.value.DEPARTMENT} onUpdate:value={(v: string[]) => {
                updateTypeValues('DEPARTMENT', v)
              }}
            />
          }
          {
            type.value === 'POST' &&
            <PostSelect
              multiple
              v-model:value={idsByType.value.POST} onUpdate:value={(v: string[]) => {
                updateTypeValues('POST', v)
              }}
            />
          }
          {
            type.value === 'ROLE' &&
            <RoleSelect
              multiple
              v-model:value={idsByType.value.ROLE} onUpdate:value={(v: string[]) => {
                updateTypeValues('ROLE', v)
              }}
            />
          }
        </div>
      </div>
    )
  }
})
