import { cubeOuaaService } from '@/api/service'
import type { DeptList } from '@ghcloud/cube-ouaa-service'
import { Select } from 'ant-design-vue'
import { defineComponent, ref } from 'vue'

/** 部门下拉框 */
export const DeptSelect = defineComponent({
  props: ['value', 'width', 'placeholder', 'params'],
  emits: ['update:value'],
  setup: (props: { value: string; width: string; placeholder?: string; params?: Record<string, unknown>; }, { emit }) => {
    const options = ref([])
    cubeOuaaService.getDeptList({ enabled: true }).then((res: DeptList[]) => {
      options.value = res?.map(item => {
        return {
          name: item.name,
          id: item.id
        }
      })
    })

    return (): JSX.Element=>
      <>
        <Select
          v-model:value={props.value}
          options={options.value}
          placeholder={props?.placeholder || '请选择部门'}
          field-names={{ label: 'name', value: 'id' }}
          style={{ width: props.width || '180px' }}
          onChange={(e: string) => {
            emit('update:value', e)
          }}
          allowClear
          optionFilterProp='name'
          showSearch
          notFoundContent={'暂无数据'}
        />
      </>
  }
})
