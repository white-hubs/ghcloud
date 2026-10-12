import { logger } from '../logger'
import { Button, Select } from '@ghcloud/cube-ui'
import { computed, defineComponent, onMounted, ref, watch } from 'vue'
import { RoleCheckModal } from '../role-check-modal/role-check-modal'


interface Props {
  title: string;
  multiple: boolean;
  value: { id: string; name: string; }[];
}

export const RolePickerInput = defineComponent({
  props: ['title', 'multiple', 'value'],
  emits: ['update:value', 'change'],
  setup (props: Props, { emit, expose }) {
    const rolePickerModalRef = ref<{ openModal: () => void; }>()
    const openModal = (): void => {
      rolePickerModalRef.value?.openModal()
    }

    const selectModelValue = ref<string[]>([])
    const selectValue = ref<{ id: string; name: string; }[]>([])
    const selectOptions = computed(() => {
      return selectValue.value.map(e => {
        return { label: e.name, value: e.id }
      })
    })
    const unwatch = ref(false)
    watch(() => props.value, (): void => {
      // if (unwatch.value) {
      //   return
      // }
      selectModelValue.value = props.value.map(e => { return e.id })
      selectValue.value = props.value ?? []
    }, { deep: true })

    const selectUpdate = (): void => {
      selectValue.value = selectValue.value.filter(e => selectModelValue.value.find(ele => e.id === ele))
      unwatch.value = true
      setTimeout(() => { unwatch.value = false }, 0)
      emit('update:value', selectValue.value)
      emit('change', selectValue.value)
    }

    const onUpdateValue = (values: { id: string; name: string; }[]): void => {
      selectValue.value = values
      selectModelValue.value = values.map(e => { return e.id })
      unwatch.value = true
      setTimeout(() => { unwatch.value = false }, 0)
      emit('update:value', selectValue.value)
      emit('change', selectValue.value)
    }

    onMounted(() => {
      if (props.value) {
        selectModelValue.value = props.value.map(e => { return e.id })
        selectValue.value = props.value
      }
    })

    expose({
      openModal
    })

    return () => <>
      <div style={{ display: 'flex' }}>
        <Select
          placeholder={`请${props.title ?? '选择角色'}`}
          open={false}
          showArrow={false}
          options={selectOptions.value}
          v-model:value={selectModelValue.value}
          allowClear={false} mode='multiple'
          onChange={selectUpdate}
        />
        <Button type={'primary'} onClick={openModal}>{props.title ?? '选择角色'}</Button>
      </div>
      <RoleCheckModal
        ref={rolePickerModalRef}
        value={selectValue.value}
        onUpdate:value={onUpdateValue}
        title={props.title ?? '选择角色'}
        multiple={props.multiple}
      />
    </>
  }
})
