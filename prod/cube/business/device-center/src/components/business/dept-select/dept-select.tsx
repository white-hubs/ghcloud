import { cubeOuaaService } from '@/api/service'
import type { DeptList } from '@ghcloud/cube-ouaa-service'
import { Select } from '@ghcloud/cube-ui'
import { defineComponent, ref } from 'vue'

/** 部门选择器 */
export const DeptSelect = defineComponent({
  props: ['value', 'width'],
  emits: ['update:value'],
  setup: (props: { value: string; width: string; }, { emit }) => {
    const options = ref<DeptList[]>([])
    cubeOuaaService.getDeptList().then((res: DeptList[]) => {
      options.value = res
    })

    return (): JSX.Element=>
      <>
        <Select
          v-model:value={props.value}
          options={options.value}
          placeholder='请选择维护部门'
          field-names={{ label: 'name', value: 'id' }} style={{ width: props.width || '180px' }}
          onChange={(e: string) => {
            emit('update:value', e)
          }}
          allowClear
          optionFilterProp='name'
          showSearch
        />
      </>
  }
})
