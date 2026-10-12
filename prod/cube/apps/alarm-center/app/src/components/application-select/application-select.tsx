import { cubeOuaaService } from '@/api/service'
import type { Application } from '@ghcloud/cube-ouaa-service'
import { Select } from '@ghcloud/cube-ui'
import { defineComponent, ref } from 'vue'

/** 应用选择器 */
export const ApplicationSelect = defineComponent({
  props: ['value', 'width', 'placeholder'],
  emits: ['update:value'],
  setup: (props: { value: string; width: string; placeholder?: string; }, { emit }) => {
    const options = ref<Application[]>([])
    cubeOuaaService.getTerminalApplications().then((res: Application[]) => {
      options.value = res
    })

    return (): JSX.Element =>
      <>
        <Select
          v-model:value={props.value}
          options={options.value}
          placeholder={props?.placeholder || '请选择应用'}
          field-names={{ label: 'name', value: 'code' }} style={{ width: props.width || '180px' }}
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
