import { storeCache } from '@/store/cache'
import { Select } from '@ghcloud/cube-ui'
import { computed, defineComponent } from 'vue'

interface Props {
  value: string;
  placeholder: string;
  readonly: boolean;
  width: string;
}

/** 部门选择 */
export const DeptSelect = defineComponent({
  props: ['value', 'placeholder', 'readonly', 'width'],
  emits: ['update:value', 'change'],
  setup (props: Props, { emit }) {
    const cacheStore = storeCache()

    const deptOptions = computed(() => (cacheStore.deptList ?? []))

    const select = computed(() => props.value)
    return (): JSX.Element =>
      <Select
        placeholder={props.placeholder ?? '请选择'}
        options={deptOptions.value}
        v-model:value={select.value}
        onChange={(val: string, item: unknown) => {
          emit('update:value', val)
          emit('change', item)
        }}
        disabled={props.readonly}
        getPopupContainer={(e: { parentNode: HTMLElement; }) => e.parentNode}
        style={{ width: props.width || '240px' }}
        fieldNames={{ label: 'name', value: 'id' }}
      />
  }
})
