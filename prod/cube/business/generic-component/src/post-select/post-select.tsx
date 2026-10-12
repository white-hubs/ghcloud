import { cubeOuaaService } from '../api/service'
import type { PositionItem } from '@ghcloud/cube-ouaa-service'
import { Select } from '@ghcloud/cube-ui'
import { defineComponent, ref, watch } from 'vue'

/** 根据部门id查询岗位 选择器 */
export const PostSelect = defineComponent({
  props: ['value', 'width', 'deptId', 'mode'],
  emits: ['update:value'],
  setup: (props: { value: string; deptId: string; mode?: string; width?: string; }, { emit }) => {
    const options = ref<unknown[]>([])
    watch(() => props.deptId, (val) => {
      cubeOuaaService.getPositionList({ enabled: true }).then((res: PositionItem[]) => {
        options.value = res
      })
    }, { deep: true, immediate: true })
    return () =>
      <>
        <Select
          v-model:value={props.value}
          options={options.value}
          placeholder='请选择岗位'
          field-names={{ label: 'name', value: 'id' }} style={{ width: props.width ?? '180px' }}
          onChange={(e: string) => {
            emit('update:value', e)
          }}
          mode={props.mode ?? ''}
          allowClear
        />
      </>
  }
})
