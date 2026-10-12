import { cubeOuaaService } from '@/api/service'
import type { DeptList } from '@ghcloud/cube-ouaa-service'
import { Select } from '@ghcloud/cube-ui'
import { defineComponent, ref, watch } from 'vue'

/** 部门选择器 */
export const DeptSelect = defineComponent({
  props: ['value', 'width', 'tenant'],
  emits: ['update:value'],
  setup: (props: { value: string; width: string; tenant: string | undefined; }, { emit }) => {
    const options = ref<DeptList[]>([])
    watch(() => props.tenant, async (newValue) => {
      if (newValue) {
        const user = await cubeOuaaService.getUserInfo()
        const lastId = user?.organizations.pop()?.id
        cubeOuaaService.getDeptList({ enabled: true, tenant: props.tenant, ids: [lastId ?? ''] }).then((res: DeptList[]) => {
          options.value = res
        })
      }
    }, { immediate: true })
    return (): JSX.Element =>
      <>
        <Select
          v-model:value={props.value}
          options={options.value}
          placeholder='请选择维护部门'
          field-names={{ label: 'name', value: 'id' }}
          onChange={(e: string) => {
            emit('update:value', e)
          }}
          allowClear
          optionFilterProp='name'
          showSearch
          style={{ width: props.width || '180px' }}
        />
      </>
  }
})
